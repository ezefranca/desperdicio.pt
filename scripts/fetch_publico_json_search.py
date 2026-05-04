#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import random
import sqlite3
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

OUT_DIR = Path("data-sources")
DB_PATH = OUT_DIR / "publico_live.sqlite"
CHECKPOINT_PATH = OUT_DIR / "publico_checkpoint.json"

BASE = "https://www.publico.pt"
SEARCH_ENDPOINT = f"{BASE}/api/list/search"

QUERIES = [
    "desperdício alimentar",
    "desperdicio alimentar",  # sem acento (vale a pena)
    "desperdício de alimentos",
    "desperdicio de alimentos",
    "perdas e desperdício alimentar",
    "desperdício de comida",
    "food waste",
    "food loss and waste",
]

HTTP_TIMEOUT_SEC = 25
MAX_RETRIES = 7
BACKOFF_BASE_SEC = 1.2
BACKOFF_MAX_SEC = 25.0
SLEEP_BETWEEN_REQUESTS_SEC = 0.6
MAX_PAGES_PER_QUERY = 8000  # cap de segurança

UA = "DesPerdicoResearchBot/1.0 (+contact: you@example.com)"


def ensure_out_dir() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def load_checkpoint() -> Dict[str, Any]:
    if CHECKPOINT_PATH.exists():
        return json.loads(CHECKPOINT_PATH.read_text(encoding="utf-8"))
    return {"pages": {}, "last_run_utc": ""}


def save_checkpoint(cp: Dict[str, Any]) -> None:
    cp["last_run_utc"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    CHECKPOINT_PATH.write_text(json.dumps(cp, ensure_ascii=False, indent=2), encoding="utf-8")


def backoff_sleep(attempt: int) -> None:
    base = min(BACKOFF_MAX_SEC, BACKOFF_BASE_SEC * (2 ** attempt))
    jitter = random.uniform(0.0, 0.35 * base)
    time.sleep(base + jitter)


def request_json(url: str, params: Dict[str, Any]) -> Optional[Any]:
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(
                url,
                params=params,
                timeout=HTTP_TIMEOUT_SEC,
                headers={
                    "accept": "application/json,text/plain,*/*",
                    "user-agent": UA,
                },
            )
            if r.status_code == 200:
                try:
                    return r.json()
                except Exception:
                    pass
            elif r.status_code in (429, 500, 502, 503, 504):
                pass
            else:
                if attempt >= 2:
                    return None
        except requests.RequestException:
            pass

        backoff_sleep(attempt)

    return None


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            page INTEGER NOT NULL,
            fetched_at_utc TEXT NOT NULL,

            -- campos do payload Público (best-effort)
            titulo TEXT,
            titulo_noticia TEXT,
            descricao TEXT,
            lead TEXT,

            full_url TEXT NOT NULL,
            rubrica TEXT,
            rubrica_url TEXT,

            data TEXT,
            data_actualizacao TEXT,

            is_opinion INTEGER,
            is_clube_p INTEGER,
            is_exclusive INTEGER,

            multimedia_principal TEXT,

            autores_json TEXT,
            tags_json TEXT,

            raw_json TEXT NOT NULL,

            UNIQUE(full_url) ON CONFLICT IGNORE
        );
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_items_query ON items(query);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_items_data ON items(data);")
    conn.commit()


def normalize_date(s: Any) -> str:
    # o payload está a mandar "0001-01-01T00:00:00" em casos
    if not s:
        return ""
    s = str(s)
    if s.startswith("0001-01-01"):
        return ""
    return s


def parse_items(data: Any) -> List[Dict[str, Any]]:
    # No teu snippet, é diretamente uma LISTA de dicts
    if isinstance(data, list):
        return [x for x in data if isinstance(x, dict)]
    # fallback se o formato mudar
    if isinstance(data, dict):
        for key in ("items", "results", "data"):
            v = data.get(key)
            if isinstance(v, list):
                return [x for x in v if isinstance(x, dict)]
    return []


def insert_items(conn: sqlite3.Connection, query: str, page: int, items: List[Dict[str, Any]]) -> int:
    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    cur = conn.cursor()
    inserted = 0

    for it in items:
        full_url = it.get("fullUrl") or it.get("url") or ""
        if not full_url:
            continue

        row = (
            query,
            page,
            now,

            it.get("titulo") or "",
            it.get("tituloNoticia") or "",

            it.get("descricao") or "",
            it.get("lead") or "",

            full_url,
            it.get("rubrica") or "",
            it.get("rubricUrl") or "",

            normalize_date(it.get("data")),
            normalize_date(it.get("dataActualizacao")),

            1 if it.get("isOpinion") else 0,
            1 if it.get("isClubeP") else 0,
            1 if it.get("isExclusive") else 0,

            it.get("multimediaPrincipal") or "",

            json.dumps(it.get("autores") or [], ensure_ascii=False),
            json.dumps(it.get("tags") or [], ensure_ascii=False),

            json.dumps(it, ensure_ascii=False),
        )

        cur.execute("""
            INSERT OR IGNORE INTO items (
                query, page, fetched_at_utc,
                titulo, titulo_noticia, descricao, lead,
                full_url, rubrica, rubrica_url,
                data, data_actualizacao,
                is_opinion, is_clube_p, is_exclusive,
                multimedia_principal,
                autores_json, tags_json,
                raw_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, row)

        if cur.rowcount == 1:
            inserted += 1

    conn.commit()
    return inserted


def fetch_query(conn: sqlite3.Connection, cp: Dict[str, Any], query: str) -> None:
    pages_map = cp.setdefault("pages", {})
    start_page = int(pages_map.get(query, 1))

    for page in range(start_page, MAX_PAGES_PER_QUERY + 1):
        params = {"query": query, "page": page}
        data = request_json(SEARCH_ENDPOINT, params=params)

        if data is None:
            pages_map[query] = page
            save_checkpoint(cp)
            print(f"[WARN] Falha no JSON. Query='{query}' guardada em page={page}.")
            return

        items = parse_items(data)
        if not items:
            pages_map[query] = 1
            save_checkpoint(cp)
            print(f"[OK] Query concluída: '{query}' (terminou em page={page})")
            return

        ins = insert_items(conn, query, page, items)
        print(f"[FETCH] query='{query}' page={page} items={len(items)} inserted={ins}")

        pages_map[query] = page + 1
        save_checkpoint(cp)
        time.sleep(SLEEP_BETWEEN_REQUESTS_SEC)


def main() -> int:
    ensure_out_dir()
    cp = load_checkpoint()

    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)
        for q in QUERIES:
            print(f"\n=== Público search JSON: query='{q}' ===")
            fetch_query(conn, cp, q)

        print(f"\n[DONE] DB: {DB_PATH}")
        print(f"[DONE] Checkpoint: {CHECKPOINT_PATH}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
