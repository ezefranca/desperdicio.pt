#!/usr/bin/env python3
"""Build a normalized inventory of delivery URLs referenced by the project.

The inventory is focused on validation work:
- direct Público URLs that may need preservation
- direct Arquivo.pt replay/search URLs that must load
- internal desperdicio.pt URLs that should resolve in production
- other external references exposed by the delivery
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"

SEED_FILES = [
    ROOT / "index.html",
    ROOT / "privacidade.html",
    ROOT / "termos.html",
    ROOT / "descricao.txt",
    ROOT / "video.txt",
    ROOT / "README.md",
    ROOT / "DOCUMENTACAO-PT-PT.md",
    ROOT / "llms.txt",
    ROOT / "robots.txt",
    ROOT / "sitemap.xml",
]

SCAN_DIRS = [
    ROOT / "metodologia",
    ROOT / "assets",
]

SCAN_SUFFIXES = {
    ".html",
    ".txt",
    ".md",
    ".xml",
    ".json",
    ".js",
    ".css",
}

URL_PATTERN = re.compile(r"https?://[^\s\"'<>`]+")
PUBLICO_HOSTS = {"publico.pt", "www.publico.pt"}
ARQUIVO_HOSTS = {"arquivo.pt", "www.arquivo.pt"}
INTERNAL_HOSTS = {"desperdicio.pt", "www.desperdicio.pt"}


def utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def scan_files() -> list[Path]:
    files = [path for path in SEED_FILES if path.exists()]
    for base in SCAN_DIRS:
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.is_file() and path.suffix.lower() in SCAN_SUFFIXES:
                files.append(path)
    return sorted(set(files))


def normalize_url(url: str) -> str:
    value = url.strip()
    while value and value[-1] in {".", ",", ";", ":"}:
        value = value[:-1]
    return value


def category_for_host(host: str) -> str:
    if host in PUBLICO_HOSTS:
        return "publico_live"
    if host in ARQUIVO_HOSTS:
        return "arquivo"
    if host in INTERNAL_HOSTS:
        return "internal"
    return "external"


def string_urls_from_json(value: object) -> list[str]:
    matches: list[str] = []
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith(("http://", "https://")):
            matches.append(stripped)
        return matches
    if isinstance(value, list):
        for item in value:
            matches.extend(string_urls_from_json(item))
        return matches
    if isinstance(value, dict):
        for item in value.values():
            matches.extend(string_urls_from_json(item))
        return matches
    return matches


def extract_urls(path: Path, text: str) -> list[str]:
    if path.suffix.lower() == ".json":
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            return []
        return string_urls_from_json(payload)
    return [normalize_url(match) for match in URL_PATTERN.findall(text)]


def collect_urls(files: Iterable[Path]) -> dict[str, dict[str, object]]:
    inventory: dict[str, dict[str, object]] = {}
    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue

        for match in extract_urls(path, text):
            url = normalize_url(match)
            if "{" in url or "}" in url:
                continue
            parsed = urlparse(url)
            host = parsed.netloc.lower()
            if not host:
                continue

            entry = inventory.setdefault(
                url,
                {
                    "url": url,
                    "host": host,
                    "category": category_for_host(host),
                    "sources": [],
                },
            )
            sources: list[str] = entry["sources"]  # type: ignore[assignment]
            rel = str(path.relative_to(ROOT))
            if rel not in sources:
                sources.append(rel)
    return inventory


def sorted_entries(entries: Iterable[dict[str, object]]) -> list[dict[str, object]]:
    return sorted(entries, key=lambda item: str(item.get("url") or ""))


def write_outputs(inventory: dict[str, dict[str, object]]) -> tuple[Path, Path]:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    json_path = REPORTS_DIR / f"project-url-inventory-{stamp}.json"
    txt_path = REPORTS_DIR / f"project-url-inventory-{stamp}.txt"

    buckets: dict[str, list[dict[str, object]]] = defaultdict(list)
    for entry in inventory.values():
        buckets[str(entry["category"])].append(entry)

    payload = {
        "generated_at": utc_iso(),
        "root": str(ROOT),
        "counts": {key: len(value) for key, value in sorted(buckets.items())},
        "categories": {key: sorted_entries(value) for key, value in sorted(buckets.items())},
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"generated_at\t{payload['generated_at']}",
        f"publico_live\t{payload['counts'].get('publico_live', 0)}",
        f"arquivo\t{payload['counts'].get('arquivo', 0)}",
        f"internal\t{payload['counts'].get('internal', 0)}",
        f"external\t{payload['counts'].get('external', 0)}",
        "",
    ]
    for bucket_name in ("publico_live", "arquivo", "internal", "external"):
        lines.append(f"[{bucket_name}]")
        for entry in sorted_entries(buckets.get(bucket_name, [])):
            sources = ", ".join(entry.get("sources") or [])
            lines.append(f"{entry['url']}\t{sources}")
        lines.append("")
    txt_path.write_text("\n".join(lines), encoding="utf-8")
    return json_path, txt_path


def main() -> None:
    files = scan_files()
    inventory = collect_urls(files)
    json_path, txt_path = write_outputs(inventory)
    counts = json.loads(json_path.read_text(encoding="utf-8"))["counts"]
    print(f"Scanned files: {len(files)}")
    print(
        "Inventory counts:",
        f"publico_live={counts.get('publico_live', 0)}",
        f"arquivo={counts.get('arquivo', 0)}",
        f"internal={counts.get('internal', 0)}",
        f"external={counts.get('external', 0)}",
    )
    print(f"Wrote {json_path.relative_to(ROOT)}")
    print(f"Wrote {txt_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
