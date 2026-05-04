#!/usr/bin/env python3
"""Capture all direct Público URLs referenced by the project in ArchivePageNow.

This script intentionally favors a guaranteed fresh replay URL over a lighter
lookup-only flow. Each direct Público URL in the project inventory is submitted
to ArchivePageNow and the returned replay timestamp is parsed from the response.
"""

from __future__ import annotations

import csv
from datetime import datetime, timezone
import json
from html import unescape
from pathlib import Path
import re
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
INVENTORY_GLOB = "project-url-inventory-*.json"
NOW_RECORD = "https://arquivo.pt/save/now/record/mp_/"

USER_AGENT = "desperdicio.pt project archive capture/1.0"
REQUEST_TIMEOUT = 60
REQUEST_RETRIES = 4
REQUEST_SLEEP_SECONDS = 0.8
RETRY_BACKOFF_SECONDS = 2.0

TIMESTAMP_PATTERN = re.compile(r'wbinfo\.timestamp\s*=\s*"(\d{14})"')
TITLE_PATTERN = re.compile(r"<title>(.*?)</title>", flags=re.IGNORECASE | re.DOTALL)


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d")


def latest_inventory() -> Path:
    candidates = sorted(REPORTS_DIR.glob(INVENTORY_GLOB))
    if not candidates:
        raise FileNotFoundError("No project-url-inventory-*.json found in reports/")
    return candidates[-1]


def load_publico_urls(path: Path) -> list[str]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload.get("categories", {}).get("publico_live") or []
    urls = []
    for row in rows:
        url = str(row.get("url") or "").strip()
        if url:
            urls.append(url)
    return sorted(set(urls))


def extract_title(html: str) -> str:
    match = TITLE_PATTERN.search(html)
    if not match:
        return ""
    return re.sub(r"\s+", " ", unescape(match.group(1))).strip()


def capture_now(url: str) -> dict[str, Any]:
    endpoint = NOW_RECORD + url
    last_error = ""
    for attempt in range(1, REQUEST_RETRIES + 1):
        request = Request(endpoint, headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(request, timeout=REQUEST_TIMEOUT) as response:
                html = response.read().decode("utf-8", errors="replace")
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = repr(exc)
            if attempt == REQUEST_RETRIES:
                break
            time.sleep(RETRY_BACKOFF_SECONDS * attempt)
            continue

        timestamp_match = TIMESTAMP_PATTERN.search(html)
        if timestamp_match:
            timestamp = timestamp_match.group(1)
            return {
                "status": "captured_now",
                "timestamp": timestamp,
                "replay_url": f"https://arquivo.pt/save/now/{timestamp}/{url}",
                "capture_url": endpoint,
                "title": extract_title(html),
                "detail": "timestamp_parsed_from_record",
            }

        last_error = "timestamp_not_found_in_response"
        if attempt == REQUEST_RETRIES:
            break
        time.sleep(RETRY_BACKOFF_SECONDS * attempt)

    return {
        "status": "capture_failed",
        "timestamp": "",
        "replay_url": "",
        "capture_url": endpoint,
        "title": "",
        "detail": last_error or "unknown_error",
    }


def write_report(rows: list[dict[str, Any]]) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / f"project-publico-archive-status-{utc_stamp()}.tsv"
    fieldnames = [
        "url",
        "status",
        "detail",
        "timestamp",
        "replay_url",
        "capture_url",
        "title",
    ]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    return path


def main() -> None:
    inventory_path = latest_inventory()
    urls = load_publico_urls(inventory_path)
    print(f"Using inventory: {inventory_path.relative_to(ROOT)}")
    print(f"Capturing {len(urls)} direct project Público URLs in ArchivePageNow")

    rows = []
    for index, url in enumerate(urls, start=1):
        result = capture_now(url)
        rows.append(
            {
                "url": url,
                "status": result["status"],
                "detail": result["detail"],
                "timestamp": result["timestamp"],
                "replay_url": result["replay_url"],
                "capture_url": result["capture_url"],
                "title": result["title"],
            }
        )
        print(f"{index}/{len(urls)}\t{result['status']}\t{url}")
        time.sleep(REQUEST_SLEEP_SECONDS)

    report_path = write_report(rows)
    failed = sum(1 for row in rows if not row["replay_url"])
    print(f"Wrote {report_path.relative_to(ROOT)}")
    print(f"Capture failures: {failed}")


if __name__ == "__main__":
    main()
