#!/usr/bin/env python3
"""Attach Arquivo.pt replay URLs to project datasets from a TSV report.

Also derives a lean ``corpus_core.json`` for jury-facing/runtime usage.
"""

from __future__ import annotations

import csv
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
CORPUS_PATH = ROOT / "assets" / "data" / "corpus.json"
CORPUS_CORE_PATH = ROOT / "assets" / "data" / "corpus_core.json"
TARGETS = [
    CORPUS_PATH,
    ROOT / "assets" / "data" / "featured.json",
    ROOT / "assets" / "data" / "storyline_bundled_full.json",
    ROOT / "assets" / "data" / "storyline_bundled.json",
    ROOT / "assets" / "data" / "storyline.json",
]

PERIODS = [
    {"id": "2011-2016", "label": "2011-2016", "label_short": "2011-16", "start": 2011, "end": 2016},
    {"id": "2017-2020", "label": "2017-2020", "label_short": "2017-20", "start": 2017, "end": 2020},
    {"id": "2021-2026", "label": "2021-2026", "label_short": "2021-26", "start": 2021, "end": 2026},
]

LINGUISTIC_TERMS = [
    {"term": "emissões", "patterns": [r"\bemiss(?:ão|ões)\b", r"\bgases com efeito de estufa\b"]},
    {"term": "cadeia", "patterns": [r"\bcadeia(?:s)?\b", r"\bcadeia de abastecimento\b", r"\bcadeia alimentar\b"]},
    {"term": "economia circular", "patterns": [r"\beconomia circular\b", r"\bcircular\b"]},
    {"term": "validade", "patterns": [r"\bvalidade\b", r"\bconsumir de prefer[eê]ncia\b", r"\bconsumir at[eé]\b"]},
    {"term": "supermercados", "patterns": [r"\bsupermercad(?:o|os)\b", r"\bretalho\b", r"\bdistribui(?:ção|dor(?:es)?)\b"]},
    {"term": "doação", "patterns": [r"\bdoa(?:ção|ções|r|doado|doados)\b", r"\bredistribui(?:ção|r)\b"]},
    {"term": "sobras", "patterns": [r"\bsobras?\b", r"\brestos?\b"]},
]


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def latest_report() -> Path:
    candidates = sorted(REPORTS_DIR.glob("arquivo-pt-submissoes-*.tsv"))
    if not candidates:
        raise FileNotFoundError("No arquivo-pt-submissoes-*.tsv report found in reports/")
    return candidates[-1]


def load_report(path: Path) -> dict[str, dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fh:
        rows = csv.DictReader(fh, delimiter="\t")
        return {row["url"]: row for row in rows if row.get("url")}


def generate_fallback(url: str, date_value: str | None) -> str:
    if not date_value:
        return ""
    stamp = str(date_value)[:10].replace("-", "")
    if len(stamp) != 8:
        return ""
    return f"https://arquivo.pt/wayback/{stamp}120000/{url}"


def item_year(item: dict[str, Any]) -> int | None:
    value = str(item.get("published_at") or "").strip()
    if len(value) >= 4 and value[:4].isdigit():
        return int(value[:4])
    return None


def clean_excerpt(text: str | None, limit: int = 320) -> str:
    collapsed = re.sub(r"\s+", " ", (text or "")).strip()
    return collapsed[:limit].rstrip()


def build_linguistic_analysis(items: list[dict[str, Any]]) -> dict[str, Any]:
    rows = []
    for term in LINGUISTIC_TERMS:
        counts = []
        for period in PERIODS:
            count = 0
            for item in items:
                year = item_year(item)
                if year is None or year < period["start"] or year > period["end"]:
                    continue
                haystack = "\n".join(
                    [
                        str(item.get("title") or ""),
                        str(item.get("text_content") or ""),
                        str(item.get("query") or ""),
                    ]
                )
                if any(re.search(pattern, haystack, flags=re.IGNORECASE) for pattern in term["patterns"]):
                    count += 1
            counts.append(count)

        trend = "up"
        if counts[-1] <= counts[0]:
            trend = "stable"

        rows.append(
            {
                "term": term["term"],
                "periods": [
                    {"id": period["id"], "label": period["label_short"], "count": count}
                    for period, count in zip(PERIODS, counts)
                ],
                "trend": trend,
            }
        )

    return {
        "method": "article_presence_by_period",
        "periods": PERIODS,
        "items": rows,
    }


def build_corpus_core(corpus: dict[str, Any]) -> dict[str, Any]:
    items = corpus.get("items") or []
    core = [
        item
        for item in items
        if str(item.get("relevance_label") or "").strip().lower() == "core"
    ]
    core.sort(key=lambda item: (str(item.get("published_at") or ""), str(item.get("title") or "")))

    years = [item_year(item) for item in core]
    valid_years = [year for year in years if year is not None]
    coverage_span = [str(min(valid_years)), str(max(valid_years))] if valid_years else []

    output_items = []
    for item in core:
        output_items.append(
            {
                "article_id": item.get("article_id"),
                "title": item.get("title"),
                "url": item.get("url"),
                "published_at": item.get("published_at"),
                "query": item.get("query"),
                "relevance_label": item.get("relevance_label"),
                "relevance_score": item.get("relevance_score"),
                "word_count": item.get("word_count"),
                "arquivo_pt_url": item.get("arquivo_pt_url"),
                "arquivo_pt_status": item.get("arquivo_pt_status"),
                "arquivo_pt_url_source": item.get("arquivo_pt_url_source"),
                "text_excerpt": clean_excerpt(item.get("text_content")),
                "manual_review": item.get("manual_review"),
            }
        )

    return {
        "metadata": {
            "schema": "desperdicio.corpus_core.v1",
            "created_at": now_utc_iso(),
            "source_file": "assets/data/corpus.json",
            "core_total": len(output_items),
            "years_with_coverage": len(sorted(set(valid_years))),
            "coverage_span": coverage_span,
            "arquivo_pt_coverage": {
                "with_arquivo_pt_url": sum(1 for item in output_items if item.get("arquivo_pt_url")),
                "report_links": sum(1 for item in output_items if item.get("arquivo_pt_url_source") == "report"),
                "generated_fallback_links": sum(
                    1 for item in output_items if item.get("arquivo_pt_url_source") == "generated_fallback"
                ),
            },
            "linguistic_analysis": build_linguistic_analysis(core),
        },
        "items": output_items,
    }


def enrich(obj: Any, report: dict[str, dict[str, str]], counters: dict[str, int]) -> Any:
    if isinstance(obj, dict):
        url = obj.get("url")
        row = report.get(url) if isinstance(url, str) else None
        if row:
            replay_url = row.get("replay_url", "").strip()
            fallback = generate_fallback(url, obj.get("published_at") or obj.get("date") or row.get("published_at"))
            arquivo_pt_url = replay_url or fallback
            if arquivo_pt_url:
                obj["arquivo_pt_url"] = arquivo_pt_url
                obj["arquivo_pt_url_source"] = "report" if replay_url else "generated_fallback"
            obj["arquivo_pt_status"] = row.get("status", "")
            counters["matched"] += 1
            if replay_url:
                counters["report_links"] += 1
            elif arquivo_pt_url:
                counters["fallback_links"] += 1
        for key, value in list(obj.items()):
            if key in {"arquivo_pt_url", "arquivo_pt_url_source", "arquivo_pt_status"}:
                continue
            obj[key] = enrich(value, report, counters)
        return obj

    if isinstance(obj, list):
        return [enrich(item, report, counters) for item in obj]

    return obj


def main() -> None:
    report_path = latest_report()
    report = load_report(report_path)
    print(f"Using report: {report_path.relative_to(ROOT)}")
    enriched_corpus: dict[str, Any] | None = None
    for path in TARGETS:
        data = json.loads(path.read_text(encoding="utf-8"))
        counters = {"matched": 0, "report_links": 0, "fallback_links": 0}
        data = enrich(data, report, counters)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if path == CORPUS_PATH:
            enriched_corpus = data
        print(
            f"{path.relative_to(ROOT)}: matched={counters['matched']} "
            f"report_links={counters['report_links']} fallback_links={counters['fallback_links']}"
        )

    if enriched_corpus is not None:
        core_data = build_corpus_core(enriched_corpus)
        CORPUS_CORE_PATH.write_text(json.dumps(core_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{CORPUS_CORE_PATH.relative_to(ROOT)}: core_total={core_data['metadata']['core_total']}")


if __name__ == "__main__":
    main()
