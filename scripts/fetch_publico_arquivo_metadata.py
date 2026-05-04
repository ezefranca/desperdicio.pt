#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Fetch resilient metadata from Arquivo.pt textsearch, restricted to Público domain,
using multiple query variants (PT-PT, PT-BR, EN), chunked by year, with retries,
checkpoint resume, dedup, and SQLite storage + optional CSV export.

Requires: Python 3.10+
pip install requests
"""

from __future__ import annotations

import csv
import json
import random
import sqlite3
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests


# ----------------------- CONFIG -----------------------

API_ENDPOINT = "https://arquivo.pt/textsearch"

# For Público, historically you might see subdomains/paths vary.
# Start strict: www.publico.pt
# If you later want to expand, add other domains and run again.
SITE_FILTERS = [
    "www.publico.pt",
    # Optional: uncomment if you observe many missing results:
    # "publico.pt",
    # "www.publico.pt/*",  # depends on how Arquivo.pt interprets siteSearch; keep off unless verified
]

# Time range
START_YEAR = 1996
END_YEAR = 2025  # inclusive end year for loops; set 2025 to cover up to end of 2025
# If you want up to end of 2024 only, set END_YEAR = 2024

MAX_ITEMS_PER_PAGE = 100  # commonly used
SLEEP_BETWEEN_REQUESTS_SEC = 0.9  # be nice to the API

# Retry policy
HTTP_TIMEOUT_SEC = 25
MAX_RETRIES = 7
BACKOFF_BASE_SEC = 1.2
BACKOFF_MAX_SEC = 30.0

# Output
OUT_DIR = Path("data-sources")
DB_PATH = OUT_DIR / "arquivo_publico_desperdico.sqlite"
CHECKPOINT_PATH = OUT_DIR / "checkpoint.json"
CSV_EXPORT_PATH = OUT_DIR / "metadata_export.csv"

# Safety: cap pages per (query, year, site) to avoid accidental infinite loops
MAX_PAGES_PER_SLICE = 500  # 500 * 100 = 50k items per slice

# -------------------- QUERY SET -----------------------
# Keep this set tight enough to avoid overwhelming noise, but broad enough to capture coverage.
# You can tune after a first run by looking at term yields and precision.
QUERIES: List[str] = [
    # PT-PT common
    "desperdício alimentar",
    "desperdício de alimentos",
    "perdas e desperdício alimentar",
    "redução do desperdício alimentar",
    "combate ao desperdício alimentar",
    "sobras de comida",
    "aproveitamento de sobras",
    # PT-BR variants (sometimes appear in copied press releases or Brazilian coverage)
    "desperdício de comida",
    "desperdício de alimentos no varejo",
    "perdas e desperdício de alimentos",
    # EN
    "food waste",
    "food loss and waste",
    "food loss",
    # Hybrid / acronyms
    "FLW",  # Food Loss and Waste
    # Policy-ish phrases that sometimes appear
    "Banco Alimentar desperdício",
    "redistribuição alimentar",
]

# Optional: you can add quoted phrases to increase precision, but it may reduce recall.
# Example: "\"desperdício alimentar\""


# ----------------------- TYPES ------------------------

@dataclass(frozen=True)
class SliceKey:
    site: str
    query: str
    year: int


@dataclass
class Progress:
    # Maps a slice to next offset to request
    offsets: Dict[str, int]
    # Last run timestamp
    last_run_utc: str

    def get_offset(self, key: SliceKey) -> int:
        return self.offsets.get(self._key_str(key), 0)

    def set_offset(self, key: SliceKey, offset: int) -> None:
        self.offsets[self._key_str(key)] = offset

    @staticmethod
    def _key_str(key: SliceKey) -> str:
        return f"{key.site}|||{key.year}|||{key.query}"


# ---------------------- HELPERS -----------------------

def year_range_to_from_to(year: int) -> Tuple[str, str]:
    # Arquivo.pt uses yyyymmddhhmmss
    start = f"{year}0101000000"
    end = f"{year}1231235959"
    return start, end


def ensure_out_dir() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def load_checkpoint() -> Progress:
    if CHECKPOINT_PATH.exists():
        data = json.loads(CHECKPOINT_PATH.read_text(encoding="utf-8"))
        return Progress(
            offsets=data.get("offsets", {}),
            last_run_utc=data.get("last_run_utc", ""),
        )
    return Progress(offsets={}, last_run_utc="")


def save_checkpoint(p: Progress) -> None:
    payload = {
        "offsets": p.offsets,
        "last_run_utc": datetime.utcnow().isoformat(timespec="seconds") + "Z",
    }
    CHECKPOINT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def backoff_sleep(attempt: int) -> None:
    # Exponential backoff with jitter
    base = min(BACKOFF_MAX_SEC, BACKOFF_BASE_SEC * (2 ** attempt))
    jitter = random.uniform(0.0, 0.35 * base)
    time.sleep(base + jitter)


def request_json(params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(API_ENDPOINT, params=params, timeout=HTTP_TIMEOUT_SEC)
            if r.status_code == 200:
                try:
                    return r.json()
                except Exception:
                    # Malformed JSON (rare). Retry.
                    pass
            elif r.status_code in (429, 500, 502, 503, 504):
                # Rate limit or transient server errors: retry with backoff
                pass
            else:
                # Non-retryable in most cases; still do a couple retries
                if attempt >= 2:
                    return None
        except requests.RequestException:
            pass

        backoff_sleep(attempt)

    return None


# ---------------------- STORAGE -----------------------

def init_db(conn: sqlite3.Connection) -> None:
    conn.execute("""
        PRAGMA journal_mode=WAL;
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            query TEXT NOT NULL,
            year INTEGER NOT NULL,

            title TEXT,
            original_url TEXT NOT NULL,
            tstamp TEXT NOT NULL,
            link_to_archive TEXT,
            link_to_extracted_text TEXT,
            snippet TEXT,

            fetched_at_utc TEXT NOT NULL,

            UNIQUE(original_url, tstamp) ON CONFLICT IGNORE
        );
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_items_year ON items(year);
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_items_query ON items(query);
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_items_site ON items(site);
    """)
    conn.commit()


def insert_items(
    conn: sqlite3.Connection,
    key: SliceKey,
    items: List[Dict[str, Any]],
) -> int:
    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    inserted = 0

    cur = conn.cursor()
    for it in items:
        title = it.get("title") or ""
        original_url = it.get("originalURL") or ""
        tstamp = it.get("tstamp") or ""
        link_to_archive = it.get("linkToArchive") or ""
        link_to_extracted_text = it.get("linkToExtractedText") or ""
        snippet = it.get("snippet") or ""

        if not original_url or not tstamp:
            continue

        cur.execute("""
            INSERT OR IGNORE INTO items (
                site, query, year,
                title, original_url, tstamp,
                link_to_archive, link_to_extracted_text, snippet,
                fetched_at_utc
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            key.site, key.query, key.year,
            title, original_url, tstamp,
            link_to_archive, link_to_extracted_text, snippet,
            now
        ))
        if cur.rowcount == 1:
            inserted += 1

    conn.commit()
    return inserted


def export_csv(conn: sqlite3.Connection, csv_path: Path) -> None:
    rows = conn.execute("""
        SELECT
            site, query, year,
            title, original_url, tstamp,
            link_to_archive, link_to_extracted_text, snippet,
            fetched_at_utc
        FROM items
        ORDER BY year ASC, tstamp ASC;
    """).fetchall()

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "site", "query", "year",
            "title", "original_url", "tstamp",
            "link_to_archive", "link_to_extracted_text", "snippet",
            "fetched_at_utc"
        ])
        w.writerows(rows)


# -------------------- CORE LOOP -----------------------

def fetch_slice(conn: sqlite3.Connection, progress: Progress, key: SliceKey) -> None:
    from_ts, to_ts = year_range_to_from_to(key.year)
    offset = progress.get_offset(key)
    pages = 0
    total_inserted = 0

    while True:
        params = {
            "q": key.query,
            "siteSearch": key.site,
            "from": from_ts,
            "to": to_ts,
            "maxItems": MAX_ITEMS_PER_PAGE,
            "offset": offset,
        }

        data = request_json(params)
        if data is None:
            # Persist offset so we can resume later, then stop this slice.
            progress.set_offset(key, offset)
            save_checkpoint(progress)
            print(f"[WARN] Falha ao obter JSON. Slice pausado em offset={offset}. ({key.site}, {key.year}, {key.query})")
            return

        items = data.get("response_items") or []
        if not items:
            # Finished this slice
            progress.set_offset(key, 0)
            save_checkpoint(progress)
            if pages > 0:
                print(f"[OK] Slice concluído: {key.site} | {key.year} | {key.query} | inserted={total_inserted} | pages={pages}")
            return

        inserted = insert_items(conn, key, items)
        total_inserted += inserted
        pages += 1

        print(f"[FETCH] site={key.site} year={key.year} offset={offset} q='{key.query}' items={len(items)} inserted={inserted} total_inserted_slice={total_inserted}")

        # Next page
        offset += MAX_ITEMS_PER_PAGE
        progress.set_offset(key, offset)
        save_checkpoint(progress)

        # Safety caps
        if pages >= MAX_PAGES_PER_SLICE:
            print(f"[WARN] MAX_PAGES_PER_SLICE atingido. Slice interrompido para segurança: {key.site} | {key.year} | {key.query}")
            return

        time.sleep(SLEEP_BETWEEN_REQUESTS_SEC)


def main() -> int:
    ensure_out_dir()
    progress = load_checkpoint()

    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)

        total_slices = len(SITE_FILTERS) * len(QUERIES) * (END_YEAR - START_YEAR + 1)
        slice_i = 0

        for site in SITE_FILTERS:
            for year in range(START_YEAR, END_YEAR + 1):
                for q in QUERIES:
                    slice_i += 1
                    key = SliceKey(site=site, query=q, year=year)
                    next_offset = progress.get_offset(key)
                    status = "resume" if next_offset else "start"
                    print(f"\n=== [{slice_i}/{total_slices}] {status} slice: site={site} year={year} q='{q}' offset={next_offset} ===")
                    fetch_slice(conn, progress, key)

        print("\n[EXPORT] A exportar CSV…")
        export_csv(conn, CSV_EXPORT_PATH)
        print(f"[DONE] DB: {DB_PATH}")
        print(f"[DONE] CSV: {CSV_EXPORT_PATH}")
        print(f"[DONE] Checkpoint: {CHECKPOINT_PATH}")
        return 0

    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
