#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import argparse
import email.utils
import hashlib
import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DEFAULT_DB = Path("data-sources/publico_live.sqlite")
DEFAULT_OUT_DIR = Path("assets/data")
DEFAULT_TABLE = "article_details"

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def sha1_text(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def read_file_bytes(p: Path) -> bytes:
    return p.read_bytes()

def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8")
    path.write_bytes(data)

def normalize_url(url: str) -> str:
    if not url:
        return ""
    u = url.strip()
    # remove fragment
    u = u.split("#", 1)[0]
    # trim trailing slash (but keep https://domain/)
    if len(u) > 10 and u.endswith("/"):
        u = u[:-1]
    # collapse whitespace
    u = re.sub(r"\s+", "", u)
    return u

def safe_int(v: Any) -> Optional[int]:
    try:
        if v is None:
            return None
        return int(v)
    except Exception:
        return None

def safe_str(v: Any) -> Optional[str]:
    if v is None:
        return None
    s = str(v).strip()
    return s if s != "" else None


def normalize_date(v: Any) -> Optional[str]:
    s = safe_str(v)
    if not s:
        return None

    try:
        dt = email.utils.parsedate_to_datetime(s)
    except Exception:
        dt = None

    if dt is not None:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return f"{s}T00:00:00Z"

    if re.match(r"^\d{4}-\d{2}-\d{2}T", s):
        return s

    return s

def get_cols(conn: sqlite3.Connection, table: str) -> List[str]:
    return [r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]

def pick_first(cols: List[str], candidates: List[str]) -> Optional[str]:
    lower = {c.lower(): c for c in cols}
    for cand in candidates:
        if cand.lower() in lower:
            return lower[cand.lower()]
    return None

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", type=str, default=str(DEFAULT_DB), help="Path para sqlite")
    ap.add_argument("--table", type=str, default=DEFAULT_TABLE, help="Tabela (default: article_details)")
    ap.add_argument("--out-dir", type=str, default=str(DEFAULT_OUT_DIR), help="Pasta de saída (default: assets/data)")
    ap.add_argument("--limit", type=int, default=0, help="Limite de rows (0 = sem limite)")
    args = ap.parse_args()

    db_path = Path(args.db)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not db_path.exists():
        raise SystemExit(f"DB não existe: {db_path}")

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    try:
        table = args.table
        cols = get_cols(conn, table)
        if not cols:
            raise SystemExit(f"Tabela não encontrada ou vazia: {table}")

        # mapear colunas esperadas (com fallback)
        col_url = pick_first(cols, ["full_url", "url", "share_url", "link"])
        col_title = pick_first(cols, ["title", "titulo", "tituloNoticia", "titulo_noticia"])
        col_date = pick_first(cols, ["published_at", "data", "date", "data_publicacao"])
        col_query = pick_first(cols, ["query", "search_query", "source_query"])
        col_label = pick_first(cols, ["relevance_label", "label"])
        col_score = pick_first(cols, ["relevance_score", "score"])
        col_wc = pick_first(cols, ["word_count"])
        col_text = pick_first(cols, ["text_content", "texto", "text", "content", "body_text", "body", "html"])

        # montar SELECT dinâmico preservando tudo o que existe
        select_cols = []
        for c in cols:
            select_cols.append(c)
        select_sql = ", ".join([f'"{c}"' for c in select_cols])

        limit_sql = f" LIMIT {int(args.limit)}" if args.limit and args.limit > 0 else ""

        rows = conn.execute(f'SELECT {select_sql} FROM "{table}"{limit_sql};').fetchall()
        print(f"[OK] rows lidas: {len(rows)}")

        items: List[Dict[str, Any]] = []
        url_seen: Dict[str, str] = {}

        for r in rows:
            raw_url = safe_str(r[col_url]) if col_url else None
            norm_url = normalize_url(raw_url or "")
            article_id = sha1_text("article|" + norm_url) if norm_url else sha1_text("article|__missing_url__|" + sha1_text(json.dumps(dict(r), ensure_ascii=False, sort_keys=True)))

            # opcional: detectar colisões de URL -> mesmo id (ok)
            if norm_url:
                prev = url_seen.get(norm_url)
                if prev and prev != article_id:
                    # improvável, mas guardamos
                    pass
                url_seen[norm_url] = article_id

            # Export canônico: mantém TODAS as colunas originais em "raw"
            raw_all = {k: r[k] for k in r.keys()}

            item = {
                "schema": "desperdico.article.v1",
                "article_id": article_id,
                "url": norm_url if norm_url else None,
                "title": safe_str(r[col_title]) if col_title else None,
                "published_at": normalize_date(r[col_date]) if col_date else None,
                "query": safe_str(r[col_query]) if col_query else None,
                "relevance_label": safe_str(r[col_label]) if col_label else None,
                "relevance_score": safe_int(r[col_score]) if col_score else None,
                "word_count": safe_int(r[col_wc]) if col_wc else None,
                "text_content": safe_str(r[col_text]) if col_text else None,
                "raw": raw_all,
            }
            items.append(item)

        corpus = {
            "schema": "desperdico.corpus.v1",
            "created_at": now_utc_iso(),
            "source": {
                "db_path": str(db_path),
                "table": table,
                "row_count": len(items),
                "columns": cols,
            },
            "items": items,
        }

        corpus_path = out_dir / "corpus.json"
        write_json(corpus_path, corpus)

        corpus_sha = sha256_bytes(read_file_bytes(corpus_path))
        print(f"[DONE] {corpus_path} sha256={corpus_sha}")

        provenance = {
            "schema": "desperdico.provenance.v1",
            "created_at": now_utc_iso(),
            "step": "export_corpus",
            "inputs": [
                {
                    "kind": "sqlite",
                    "path": str(db_path),
                    "table": table,
                    "note": "Fonte canônica do corpus exportado",
                }
            ],
            "outputs": [
                {
                    "kind": "json",
                    "path": str(corpus_path),
                    "sha256": corpus_sha,
                    "schema": "desperdico.corpus.v1",
                }
            ],
            "environment": {
                "python": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
                "platform": os.uname().sysname if hasattr(os, "uname") else None,
            },
        }

        prov_path = out_dir / "provenance_export_corpus.json"
        write_json(prov_path, provenance)
        prov_sha = sha256_bytes(read_file_bytes(prov_path))
        print(f"[DONE] {prov_path} sha256={prov_sha}")

    finally:
        conn.close()

if __name__ == "__main__":
    main()
