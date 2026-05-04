#!/usr/bin/env python3
"""Refresh Arquivo.pt preservation coverage for the 127 core Público URLs.

Checks both the global Arquivo.pt index (``/wayback/cdx``) and the ArchivePageNow
collection (``/save/now/cdx``). For URLs missing in both, submits them to
ArchivePageNow and polls until a replay becomes available in the ``now``
collection.

Outputs a dated TSV report in ``reports/`` that can be consumed by
``attach_arquivo_pt_urls.py``.
"""

from __future__ import annotations

import csv
from datetime import datetime, timezone
import json
from pathlib import Path
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
CORPUS_CORE_PATH = ROOT / "assets" / "data" / "corpus_core.json"
REPORTS_DIR = ROOT / "reports"

GLOBAL_CDX = "https://arquivo.pt/wayback/cdx"
NOW_CDX = "https://arquivo.pt/save/now/cdx"
NOW_RECORD = "https://arquivo.pt/save/now/record/mp_/"

USER_AGENT = "desperdicio.pt archive refresh/1.0"
REQUEST_TIMEOUT = 30
SUBMIT_TIMEOUT = 45
POLL_INTERVAL_SECONDS = 5
POLL_ROUNDS = 18


def today_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d")


def load_items() -> list[dict[str, Any]]:
    payload = json.loads(CORPUS_CORE_PATH.read_text(encoding="utf-8"))
    return payload.get("items") or []


def parse_ndjson(text: str) -> list[dict[str, Any]]:
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def fetch_text(endpoint: str, params: dict[str, Any] | None = None, timeout: int = REQUEST_TIMEOUT, max_bytes: int | None = None) -> str:
    query = f"?{urlencode(params)}" if params else ""
    request = Request(f"{endpoint}{query}", headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=timeout) as response:
            payload = response.read() if max_bytes is None else response.read(max_bytes)
            return payload.decode("utf-8", errors="replace")
    except (HTTPError, URLError):
        return ""


def fetch_cdx(endpoint: str, url: str, limit: int = 25) -> list[dict[str, Any]]:
    text = fetch_text(endpoint, params={"url": url, "output": "json", "limit": limit})
    return parse_ndjson(text)


def best_capture(records: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not records:
        return None

    def rank(record: dict[str, Any]) -> tuple[int, str]:
        status = str(record.get("status") or "")
        is_html_200 = 1 if status == "200" else 0
        timestamp = str(record.get("timestamp") or "")
        return (is_html_200, timestamp)

    return sorted(records, key=rank, reverse=True)[0]


def build_global_replay(record: dict[str, Any]) -> str:
    return f"https://arquivo.pt/wayback/{record['timestamp']}/{record['url']}"


def build_now_replay(record: dict[str, Any]) -> str:
    return f"https://arquivo.pt/save/now/{record['timestamp']}/{record['url']}"


def trigger_archive_now(url: str) -> bool:
    payload = fetch_text(NOW_RECORD + url, timeout=SUBMIT_TIMEOUT, max_bytes=4096)
    return bool(payload)


def assess_url(url: str) -> dict[str, Any]:
    global_records = fetch_cdx(GLOBAL_CDX, url)
    now_records = fetch_cdx(NOW_CDX, url)
    global_best = best_capture(global_records)
    now_best = best_capture(now_records)

    if global_best:
        return {
            "collection": "wayback",
            "status": "already_archived_global",
            "timestamp": str(global_best.get("timestamp") or ""),
            "replay_url": build_global_replay(global_best),
            "global_count": len(global_records),
            "now_count": len(now_records),
        }

    if now_best:
        return {
            "collection": "now",
            "status": "already_archived_now",
            "timestamp": str(now_best.get("timestamp") or ""),
            "replay_url": build_now_replay(now_best),
            "global_count": len(global_records),
            "now_count": len(now_records),
        }

    return {
        "collection": "",
        "status": "missing",
        "timestamp": "",
        "replay_url": "",
        "global_count": 0,
        "now_count": 0,
    }


def write_report(rows: list[dict[str, Any]]) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / f"arquivo-pt-submissoes-{today_stamp()}.tsv"
    fieldnames = [
        "article_id",
        "published_at",
        "url",
        "status",
        "detail",
        "collection",
        "timestamp",
        "replay_url",
        "global_count",
        "now_count",
        "submission_attempted",
    ]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    return path


def main() -> None:
    items = load_items()
    report_rows: list[dict[str, Any]] = []
    missing: list[dict[str, Any]] = []

    print(f"Checking {len(items)} core URLs against Arquivo.pt...")
    for index, item in enumerate(items, start=1):
        url = str(item.get("url") or "").strip()
        if not url:
            continue

        result = assess_url(url)
        row = {
            "article_id": item.get("article_id") or "",
            "published_at": item.get("published_at") or "",
            "url": url,
            "status": result["status"],
            "detail": "initial_check",
            "collection": result["collection"],
            "timestamp": result["timestamp"],
            "replay_url": result["replay_url"],
            "global_count": result["global_count"],
            "now_count": result["now_count"],
            "submission_attempted": "no",
        }
        report_rows.append(row)
        if result["status"] == "missing":
            missing.append(row)
        if index % 10 == 0 or index == len(items):
            print(f"  assessed {index}/{len(items)}")
        time.sleep(0.15)

    print(f"Initially missing: {len(missing)}")

    if missing:
        print("Submitting missing URLs to ArchivePageNow...")
        for index, row in enumerate(missing, start=1):
            ok = trigger_archive_now(row["url"])
            row["submission_attempted"] = "yes"
            row["detail"] = "submitted_to_archivepagenow" if ok else "submission_failed"
            print(f"  submitted {index}/{len(missing)} ok={ok}")
            time.sleep(0.6)

        unresolved = [row for row in missing if row["detail"] != "submission_failed"]
        for round_idx in range(1, POLL_ROUNDS + 1):
            if not unresolved:
                break
            print(f"Polling ArchivePageNow round {round_idx}/{POLL_ROUNDS} for {len(unresolved)} URLs...")
            time.sleep(POLL_INTERVAL_SECONDS)

            next_unresolved: list[dict[str, Any]] = []
            for row in unresolved:
                now_records = fetch_cdx(NOW_CDX, row["url"], limit=10)
                now_best = best_capture(now_records)
                if now_best:
                    row["status"] = "submitted_to_archivepagenow"
                    row["detail"] = "captured_in_now_collection"
                    row["collection"] = "now"
                    row["timestamp"] = str(now_best.get("timestamp") or "")
                    row["replay_url"] = build_now_replay(now_best)
                    row["now_count"] = len(now_records)
                else:
                    next_unresolved.append(row)
                time.sleep(0.15)
            unresolved = next_unresolved

        for row in unresolved:
            row["status"] = "submitted_pending"
            row["detail"] = "not_visible_in_now_collection_yet"

    report_path = write_report(report_rows)

    status_counts: dict[str, int] = {}
    for row in report_rows:
        status_counts[row["status"]] = status_counts.get(row["status"], 0) + 1

    print(f"Report written to {report_path.relative_to(ROOT)}")
    for status in sorted(status_counts):
        print(f"  {status}: {status_counts[status]}")


if __name__ == "__main__":
    main()
