#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from collections import defaultdict

BASE = Path(__file__).resolve().parent

CORPUS_P = BASE / "corpus.json"
STORY_IN_P = BASE / "storyline_enriched.json"
OUT_P = BASE / "storyline_bundled.json"
PROV_P = BASE / "provenance_build_bundled_storyline.json"

# tuning
BUNDLE_TARGET_MIN = 18
BUNDLE_TARGET_MAX = 32
MAX_BUNDLES_PER_CHAPTER = 4

THEMES = {
    "Casa e cozinha": ["frigorífico", "cozinha", "sobras", "refeição", "casa", "família"],
    "Doação e redistribuição": ["doação", "doada", "banco alimentar", "instituição", "redistribuição", "supermercado", "retalho"],
    "Rotulagem e datas": ["validade", "consumir", "preferência", "rótulo", "rotulagem", "data-limite"],
    "Resíduos e sistema": ["resíduos", "lixo", "aterro", "recolha", "biorresíduos", "compostagem"],
    "Política e Bruxelas": ["diretiva", "regulamento", "decisão", "estratégia", "plano", "metas", "união europeia", "bruxelas", "eur-lex"],
    "Tecnologia e apps": ["app", "apps", "site", "sites", "plataforma", "tecnologia"],
}

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def read_json(p: Path) -> Any:
    return json.loads(p.read_text(encoding="utf-8"))

def write_json(p: Path, obj: Any) -> None:
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")

def sha256_file(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

def norm(s: Optional[str]) -> str:
    return (s or "").strip()

def month_key(dt: str) -> Optional[str]:
    s = norm(dt)
    if len(s) >= 7 and s[:4].isdigit() and s[4] == "-" and s[5:7].isdigit():
        return s[:7]
    return None

def year_key(dt: str) -> Optional[str]:
    s = norm(dt)
    if len(s) >= 4 and s[:4].isdigit():
        return s[:4]
    return None

def contains_any(text: str, kws: List[str]) -> bool:
    t = text.lower()
    return any(k.lower() in t for k in kws)

def score_of(it: Dict[str, Any]) -> int:
    try:
        return int(it.get("relevance_score") or it.get("score") or 0)
    except Exception:
        return 0

def wc_of(it: Dict[str, Any]) -> int:
    try:
        return int(it.get("word_count") or 0)
    except Exception:
        return 0

def blob(it: Dict[str, Any]) -> str:
    return " ".join([
        norm(it.get("title")),
        norm(it.get("snippet")),
        norm(it.get("lead")),
        norm(it.get("text_sample")),
        norm(it.get("rubric")),
        norm(it.get("section")),
        norm(it.get("query")),
    ])

def pick_article_id(it: Dict[str, Any]) -> str:
    aid = norm(it.get("article_id"))
    if aid:
        return aid
    return ""

def extract_used_ids(story: Dict[str, Any]) -> Set[str]:
    used: Set[str] = set()
    for ch in (story.get("chapters") or []):
        for b in (ch.get("blocks") or []):
            for aid in (b.get("source_article_ids") or []):
                if aid:
                    used.add(str(aid))
    appendix = story.get("appendix") or {}
    for it in (appendix.get("evidence_index") or []):
        aid = norm(it.get("article_id"))
        if aid:
            used.add(aid)
    return used

def split_into_bundles(ids: List[str], min_n: int, max_n: int) -> List[List[str]]:
    out = []
    i = 0
    n = len(ids)
    while i < n:
        chunk = ids[i:i+max_n]
        if len(chunk) < min_n and out:
            out[-1].extend(chunk)
            break
        out.append(chunk)
        i += max_n
    return out

def main() -> None:
    for p in [CORPUS_P, STORY_IN_P]:
        if not p.exists():
            raise SystemExit(f"Missing file: {p}")

    corpus = read_json(CORPUS_P)
    story = read_json(STORY_IN_P)

    items: List[Dict[str, Any]] = corpus.get("items") or []
    core = [it for it in items if norm(it.get("relevance_label")).lower() == "core" and norm(it.get("article_id"))]

    # indexes
    by_month: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    by_year: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    all_ids: List[str] = []

    blobs = {}
    for it in core:
        aid = pick_article_id(it)
        all_ids.append(aid)
        blobs[aid] = blob(it)
        m = month_key(it.get("published_at") or "")
        y = year_key(it.get("published_at") or "")
        if m: by_month[m].append(it)
        if y: by_year[y].append(it)

    used_before = extract_used_ids(story)
    remaining = [aid for aid in all_ids if aid not in used_before]

    # helper to rank lists
    def rank(lst: List[Dict[str, Any]]) -> List[str]:
        s = sorted(lst, key=lambda it: (score_of(it), wc_of(it)), reverse=True)
        return [pick_article_id(it) for it in s if pick_article_id(it)]

    chapters = story.get("chapters") or []

    for ch in chapters:
        title = norm(ch.get("title"))
        cid = norm(ch.get("id")).lower()

        # criar bundles preferenciais:
        bundles: List[Tuple[str, List[str], str]] = []  # (title, ids, method)

        # A) se capítulo tiver peak_month no conteúdo
        peak_months = []
        for b in (ch.get("blocks") or []):
            if b.get("type") == "peak_month":
                pm = norm(b.get("month"))
                if pm:
                    peak_months.append(pm)

        for pm in peak_months[:2]:
            if pm in by_month:
                ids = [aid for aid in rank(by_month[pm]) if aid in remaining][: (BUNDLE_TARGET_MAX * 2)]
                if ids:
                    bundles.append((f"Fontes do pico {pm}", ids, f"bundle:peak_month:{pm}"))

        # B) tema pelo título/id
        for theme_name, kws in THEMES.items():
            if theme_name.lower().split()[0] in title.lower() or theme_name.lower().split()[0] in cid or contains_any(title, kws):
                ids = [aid for aid in remaining if contains_any(blobs.get(aid, ""), kws)]
                # ordena por score aproximado: usa lista core rank geral, mas filtra
                ids_sorted = [aid for aid in rank(core) if aid in ids][: (BUNDLE_TARGET_MAX * 3)]
                if ids_sorted:
                    bundles.append((f"Fontes: {theme_name}", ids_sorted, f"bundle:theme:{theme_name}"))
                break

        # C) fallback: período (anos) para distribuir o resto
        if len(bundles) < 2:
            # pega anos mais densos do que sobrou
            rem_by_year = defaultdict(list)
            for aid in remaining:
                y = year_key(blobs.get(aid, ""))  # não serve; vamos usar published_at do corpus se precisar, mas simplifica:
                rem_by_year["ALL"].append(aid)
            # só distribui sequencialmente
            if remaining:
                bundles.append(("Fontes (continuação)", remaining[: (BUNDLE_TARGET_MAX * 4)], "bundle:fallback:remaining"))

        # limita bundles por capítulo e “consome” remaining
        bundles = bundles[:MAX_BUNDLES_PER_CHAPTER]

        # para cada bundle, cria cards grandes subdivididos
        for (btitle, ids, method) in bundles:
            # só usar IDs ainda restantes para garantir cobertura
            ids = [aid for aid in ids if aid in remaining]
            if not ids:
                continue

            # fatia em sub-bundles (cards grandes)
            for chunk in split_into_bundles(ids, BUNDLE_TARGET_MIN, BUNDLE_TARGET_MAX):
                if not chunk:
                    continue
                # marca como usado
                remaining_set = set(remaining)
                for aid in chunk:
                    if aid in remaining_set:
                        remaining_set.remove(aid)
                remaining = list(remaining_set)

                ch.setdefault("blocks", []).append({
                    "type": "evidence_bundle",
                    "title": btitle,
                    "subtitle": f"{len(chunk)} links (expandir)",
                    "source_article_ids": chunk,
                    "collapsed": True,
                    "method": method,
                })

    # Depois de percorrer capítulos, se sobrou core, espalha no último capítulo como bundles adicionais
    if remaining:
        last = chapters[-1] if chapters else None
        if last is None:
            story["chapters"] = []
            last = {"id": "final", "title": "Fecho", "blocks": []}
            story["chapters"].append(last)

        # cria bundles de resto
        remaining_sorted = remaining[:]  # já está ok
        for i, chunk in enumerate(split_into_bundles(remaining_sorted, BUNDLE_TARGET_MIN, BUNDLE_TARGET_MAX)):
            last.setdefault("blocks", []).append({
                "type": "evidence_bundle",
                "title": "Fontes adicionais",
                "subtitle": f"{len(chunk)} links (expandir)",
                "source_article_ids": chunk,
                "collapsed": True,
                "method": "bundle:tail:remaining",
            })

        remaining = []

    story["chapters"] = chapters
    story.setdefault("bundling", {})
    story["bundling"] = {
        "bundled_at": now_utc_iso(),
        "params": {
            "BUNDLE_TARGET_MIN": BUNDLE_TARGET_MIN,
            "BUNDLE_TARGET_MAX": BUNDLE_TARGET_MAX,
            "MAX_BUNDLES_PER_CHAPTER": MAX_BUNDLES_PER_CHAPTER,
        }
    }

    write_json(OUT_P, story)

    prov = {
        "schema": "desperdico.provenance.build_bundled_storyline.v1",
        "created_at": now_utc_iso(),
        "inputs": {
            "corpus.json": {"sha256": sha256_file(CORPUS_P)},
            "storyline_enriched.json": {"sha256": sha256_file(STORY_IN_P)},
        },
        "output": {
            "storyline_bundled.json": {"sha256": sha256_file(OUT_P)},
        },
        "rules": [
            "Bundles adicionados como blocks type=evidence_bundle.",
            "Cobertura é maximizada distribuindo remaining core ao longo de capítulos.",
            "Narrativa não é alterada, apenas recebe camadas colapsáveis de fontes.",
        ]
    }
    write_json(PROV_P, prov)

    print(f"[DONE] {OUT_P}")
    print(f"[DONE] {PROV_P}")
    print(f"[STATS] remaining_after_bundling={len(remaining)} (expected 0)")

if __name__ == "__main__":
    main()