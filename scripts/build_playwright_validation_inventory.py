#!/usr/bin/env python3
"""Build a Playwright-oriented validation inventory for final QA."""

from __future__ import annotations

import csv
from datetime import datetime, timezone
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
PROJECT_INVENTORY_GLOB = "project-url-inventory-*.json"
CAPTURE_REPORT_GLOB = "project-publico-archive-status-*.tsv"


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d")


def latest_path(glob_pattern: str) -> Path:
    candidates = sorted(REPORTS_DIR.glob(glob_pattern))
    if not candidates:
        raise FileNotFoundError(f"No files matched {glob_pattern} in reports/")
    return candidates[-1]


def load_project_inventory() -> dict:
    path = latest_path(PROJECT_INVENTORY_GLOB)
    return json.loads(path.read_text(encoding="utf-8"))


def load_capture_replays() -> list[str]:
    path = latest_path(CAPTURE_REPORT_GLOB)
    with path.open(newline="", encoding="utf-8") as fh:
        rows = csv.DictReader(fh, delimiter="\t")
        urls = []
        for row in rows:
            replay_url = str(row.get("replay_url") or "").strip()
            if replay_url:
                urls.append(replay_url)
    return sorted(set(urls))


def write_inventory(payload: dict) -> Path:
    path = REPORTS_DIR / f"playwright-validation-inventory-{utc_stamp()}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def main() -> None:
    project_inventory = load_project_inventory()
    categories = project_inventory.get("categories") or {}

    publico_live = [row["url"] for row in categories.get("publico_live", []) if row.get("url")]
    arquivo_project = [row["url"] for row in categories.get("arquivo", []) if row.get("url")]
    arquivo_captured = load_capture_replays()
    arquivo_all = sorted(set(arquivo_project + arquivo_captured))

    payload = {
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source_inventory": str(latest_path(PROJECT_INVENTORY_GLOB).relative_to(ROOT)),
        "source_capture_report": str(latest_path(CAPTURE_REPORT_GLOB).relative_to(ROOT)),
        "categories": {
            "publico_live": [{"url": url} for url in sorted(set(publico_live))],
            "arquivo_project": [{"url": url} for url in sorted(set(arquivo_project))],
            "arquivo_captured": [{"url": url} for url in arquivo_captured],
            "arquivo_all": [{"url": url} for url in arquivo_all],
        },
        "counts": {
            "publico_live": len(set(publico_live)),
            "arquivo_project": len(set(arquivo_project)),
            "arquivo_captured": len(arquivo_captured),
            "arquivo_all": len(arquivo_all),
        },
    }
    output_path = write_inventory(payload)
    print(f"Wrote {output_path.relative_to(ROOT)}")
    print(
        "Counts:",
        f"publico_live={payload['counts']['publico_live']}",
        f"arquivo_project={payload['counts']['arquivo_project']}",
        f"arquivo_captured={payload['counts']['arquivo_captured']}",
        f"arquivo_all={payload['counts']['arquivo_all']}",
    )


if __name__ == "__main__":
    main()
