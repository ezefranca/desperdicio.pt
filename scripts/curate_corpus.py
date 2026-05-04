#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import argparse
import email.utils
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DEFAULT_CORPUS = Path("assets/data/corpus.json")
DEFAULT_CURATION = Path("assets/data/corpus_curation.json")
DEFAULT_TIMELINE = Path("assets/data/timeline.json")
DEFAULT_VALIDATION = Path("assets/data/corpus_validation.json")


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_date(value: Any) -> Optional[str]:
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return None

    try:
        dt = email.utils.parsedate_to_datetime(text)
    except Exception:
        dt = None

    if dt is not None:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    if len(text) >= 10 and text[:10].count("-") == 2 and text[:4].isdigit():
        if len(text) == 10:
            return f"{text}T00:00:00Z"
        return text

    return text


def build_timeline(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    core_items = []
    for item in items:
        if (item.get("relevance_label") or "").strip().lower() != "core":
            continue

        published_at = item.get("published_at") or ""
        if not isinstance(published_at, str) or len(published_at) < 10 or not published_at[:4].isdigit():
            continue

        core_items.append(item)

    by_year = Counter()
    by_month = Counter()
    for item in core_items:
        published_at = item["published_at"]
        by_year[published_at[:4]] += 1
        by_month[published_at[:7]] += 1

    years = sorted(by_year.items(), key=lambda pair: pair[0])
    months = sorted(by_month.items(), key=lambda pair: pair[0])
    peaks = sorted(
        ({"month": month, "count": count} for month, count in by_month.items()),
        key=lambda row: (-row["count"], row["month"]),
    )[:12]

    return {
        "stats": {
            "core_total": len(core_items),
            "years_span": [years[0][0], years[-1][0]] if years else [],
        },
        "by_year": [{"year": year, "count": count} for year, count in years],
        "by_month": [{"month": month, "count": count} for month, count in months],
        "peaks": peaks,
    }


def load_curation_entries(entries: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    loaded: Dict[str, Dict[str, Any]] = {}
    for entry in entries:
        article_id = str(entry.get("article_id") or "").strip()
        if not article_id:
            continue
        loaded[article_id] = entry
    return loaded


def main() -> None:
    parser = argparse.ArgumentParser(description="Aplica curadoria manual ao corpus e regenera timeline/relatório.")
    parser.add_argument("--corpus", default=str(DEFAULT_CORPUS), help="Ficheiro corpus.json de entrada e saída")
    parser.add_argument("--curation", default=str(DEFAULT_CURATION), help="Ficheiro com exclusões/promoções manuais")
    parser.add_argument("--timeline-out", default=str(DEFAULT_TIMELINE), help="Ficheiro timeline.json de saída")
    parser.add_argument("--validation-out", default=str(DEFAULT_VALIDATION), help="Ficheiro corpus_validation.json de saída")
    args = parser.parse_args()

    corpus_path = Path(args.corpus)
    curation_path = Path(args.curation)
    timeline_path = Path(args.timeline_out)
    validation_path = Path(args.validation_out)

    corpus = read_json(corpus_path)
    curation = read_json(curation_path)

    items = corpus.get("items") or []
    excludes = load_curation_entries(curation.get("exclude_from_core") or [])
    promotes = load_curation_entries(curation.get("promote_to_core") or [])

    by_id = {str(item.get("article_id") or ""): item for item in items}
    missing_ids = sorted([article_id for article_id in [*excludes.keys(), *promotes.keys()] if article_id not in by_id])
    if missing_ids:
        raise SystemExit(f"IDs não encontrados em corpus.json: {', '.join(missing_ids)}")

    normalized_dates = 0
    excluded_applied: List[Dict[str, Any]] = []
    promoted_applied: List[Dict[str, Any]] = []

    for item in items:
        article_id = str(item.get("article_id") or "")
        previous_date = item.get("published_at")
        normalized_date = normalize_date(previous_date)
        if normalized_date != previous_date:
            normalized_dates += 1
        item["published_at"] = normalized_date

        raw = item.get("raw")
        if isinstance(raw, dict) and raw.get("published_at") == previous_date and normalized_date is not None:
            raw["published_at"] = normalized_date

        manual_review: Dict[str, Any] = {}

        if article_id in excludes:
            entry = excludes[article_id]
            item["relevance_label"] = "noise"
            item["relevance_score"] = 0
            manual_review = {
                "action": "exclude_from_core",
                "reason": entry.get("reason"),
                "reviewed_at": curation.get("created_at"),
            }
            if isinstance(raw, dict):
                if "relevance_label" in raw:
                    raw["relevance_label"] = "noise"
                if "relevance_score" in raw:
                    raw["relevance_score"] = 0
            excluded_applied.append(
                {
                    "article_id": article_id,
                    "title": item.get("title"),
                    "reason": entry.get("reason"),
                }
            )

        if article_id in promotes:
            entry = promotes[article_id]
            target_score = int(entry.get("score") or 15)
            item["relevance_label"] = "core"
            item["relevance_score"] = max(int(item.get("relevance_score") or 0), target_score)
            manual_review = {
                "action": "promote_to_core",
                "reason": entry.get("reason"),
                "reviewed_at": curation.get("created_at"),
            }
            if isinstance(raw, dict):
                if "relevance_label" in raw:
                    raw["relevance_label"] = "core"
                if "relevance_score" in raw:
                    raw["relevance_score"] = item["relevance_score"]
            promoted_applied.append(
                {
                    "article_id": article_id,
                    "title": item.get("title"),
                    "reason": entry.get("reason"),
                    "score": item.get("relevance_score"),
                }
            )

        if manual_review:
            item["manual_review"] = manual_review

    timeline = build_timeline(items)
    core_items = [item for item in items if (item.get("relevance_label") or "").strip().lower() == "core"]
    missing_core_dates = [
        {
            "article_id": item.get("article_id"),
            "title": item.get("title"),
        }
        for item in core_items
        if not isinstance(item.get("published_at"), str) or len(item["published_at"]) < 10 or not item["published_at"][:4].isdigit()
    ]

    low_score_core = sorted(
        [
            {
                "article_id": item.get("article_id"),
                "title": item.get("title"),
                "published_at": item.get("published_at"),
                "relevance_score": item.get("relevance_score"),
            }
            for item in core_items
            if int(item.get("relevance_score") or 0) <= 12
        ],
        key=lambda row: (int(row.get("relevance_score") or 0), row.get("published_at") or ""),
    )

    corpus["created_at"] = now_utc_iso()
    source = corpus.get("source")
    if isinstance(source, dict):
        if source.get("db_path") == "out_desperdico/publico_live.sqlite":
            source["db_path"] = "data-sources/publico_live.sqlite"
    corpus["curation"] = {
        "applied_at": now_utc_iso(),
        "source_file": str(curation_path),
        "exclude_from_core_count": len(excluded_applied),
        "promote_to_core_count": len(promoted_applied),
    }

    validation = {
        "schema": "desperdico.corpus_validation.v1",
        "created_at": now_utc_iso(),
        "inputs": {
            "corpus": str(corpus_path),
            "curation": str(curation_path),
        },
        "summary": {
            "total_items": len(items),
            "core_total": len(core_items),
            "years_with_coverage": len(timeline.get("by_year") or []),
            "coverage_span": timeline.get("stats", {}).get("years_span") or [],
            "normalized_dates": normalized_dates,
            "missing_core_dates": len(missing_core_dates),
        },
        "manual_review": {
            "exclude_from_core": excluded_applied,
            "promote_to_core": promoted_applied,
            "notes": curation.get("notes") or [],
        },
        "residual_risk": {
            "low_score_core_remaining": low_score_core[:20],
            "missing_core_dates": missing_core_dates,
        },
    }

    write_json(corpus_path, corpus)
    write_json(timeline_path, timeline)
    write_json(validation_path, validation)

    print(f"[DONE] corpus: {corpus_path}")
    print(f"[DONE] timeline: {timeline_path}")
    print(f"[DONE] validation: {validation_path}")
    print(f"[INFO] core_total={len(core_items)} years={len(timeline.get('by_year') or [])} normalized_dates={normalized_dates}")


if __name__ == "__main__":
    main()
