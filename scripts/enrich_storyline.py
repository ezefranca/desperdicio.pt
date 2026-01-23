#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict

BASE = Path(__file__).resolve().parent

CORPUS_P = BASE / "corpus.json"
STORY_P = BASE / "storyline.json"
TIMELINE_P = BASE / "timeline.json"
LEG_P = BASE / "legislation.json"

OUT_STORY = BASE / "storyline_enriched.json"
OUT_PROV = BASE / "provenance_enrich_storyline.json"

# Ajustes fáceis
TOP_N_PER_PEAK_MONTH = 10          # quantos artigos anexar por capítulo-onda
TOP_N_PER_INSTITUTIONAL = 12       # quantos artigos anexar em capítulos PT/UE
MAX_SOURCES_PER_TEXT_BLOCK = 6     # para não poluir cada bloco de texto

INSTITUTIONAL_KWS = [
    # PT
    "estratégia", "plano", "plano de ação", "encda", "economia circular", "rggr",
    "resolução", "conselho de ministros", "assembleia da república", "decreto-lei", "lei",
    "metas", "monitorização", "comissão",
    # EU
    "diretiva", "regulamento", "decisão", "eur-lex", "união europeia", "bruxelas",
    "farm to fork", "prado ao prato",
    # resíduos
    "resíduos", "biorresíduos", "aterro", "hierarquia", "prevenção"
]

LABEL_KWS = {
    "kitchen": ["frigorífico", "cozinha", "sobras", "refeição", "casa", "família"],
    "retail_donation": ["doação", "doada", "banco alimentar", "supermercado", "retalho", "redistribuição", "instituição"],
    "labels_dates": ["validade", "consumir", "preferência", "rótulo", "rotulagem", "data-limite"],
    "tech_apps": ["app", "apps", "site", "sites", "tecnologia", "plataforma"],
    "waste_system": ["resíduos", "lixo", "aterro", "recolha", "biorresíduos", "compostagem"],
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

def normalize_url(url: str) -> str:
    u = norm(url).split("#", 1)[0]
    if len(u) > 10 and u.endswith("/"):
        u = u[:-1]
    u = re.sub(r"\s+", "", u)
    return u

def contains_any(text: str, kws: List[str]) -> bool:
    t = text.lower()
    for k in kws:
        if k.lower() in t:
            return True
    return False

def month_key(dt: str) -> Optional[str]:
    s = norm(dt)
    if len(s) >= 7 and s[:4].isdigit() and s[4] == "-" and s[5:7].isdigit():
        return s[:7]
    return None

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

def pick_article_id(it: Dict[str, Any]) -> str:
    aid = norm(it.get("article_id"))
    if aid:
        return aid
    url = norm(it.get("url"))
    if url:
        return hashlib.sha1(("article|" + normalize_url(url)).encode("utf-8")).hexdigest()
    return ""

def main() -> None:
    for p in [CORPUS_P, STORY_P, TIMELINE_P, LEG_P]:
        if not p.exists():
            raise SystemExit(f"Missing file: {p}")

    corpus = read_json(CORPUS_P)
    story = read_json(STORY_P)
    timeline = read_json(TIMELINE_P)
    _leg = read_json(LEG_P)

    items: List[Dict[str, Any]] = corpus.get("items") or []
    # restringe ao core (você pode mudar para incluir maybe)
    core_items = [it for it in items if norm(it.get("relevance_label")).lower() == "core"]

    # index por mês
    by_month: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for it in core_items:
        m = month_key(it.get("published_at") or "")
        if m:
            by_month[m].append(it)

    # precompute texto para matching rápido
    def blob(it: Dict[str, Any]) -> str:
        return " ".join([
            norm(it.get("title")),
            norm(it.get("snippet")),
            norm(it.get("lead")),
            norm(it.get("text_sample")),
        ])

    blobs = {pick_article_id(it): blob(it) for it in core_items}

    def top_in_list(lst: List[Dict[str, Any]], n: int) -> List[Dict[str, Any]]:
        # ordena por score depois por word_count
        return sorted(lst, key=lambda it: (score_of(it), wc_of(it)), reverse=True)[:n]

    def diversity_prune(cands: List[Dict[str, Any]], n: int) -> List[Dict[str, Any]]:
        # tenta diversidade por query + (se existir) section/rubric
        out = []
        seen_q = set()
        seen_r = set()
        for it in cands:
            if len(out) >= n:
                break
            q = norm(it.get("query")).lower()
            r = norm(it.get("rubric") or it.get("section")).lower()
            if q and q in seen_q and len(out) >= (n // 2):
                continue
            if r and r in seen_r and len(out) >= (n // 2):
                continue
            out.append(it)
            if q: seen_q.add(q)
            if r: seen_r.add(r)
        # completa se faltou
        if len(out) < n:
            for it in cands:
                if len(out) >= n:
                    break
                if it in out:
                    continue
                out.append(it)
        return out[:n]

    def attach_evidence_block(ch: Dict[str, Any], picked: List[Dict[str, Any]], method: str) -> None:
        ids = [pick_article_id(it) for it in picked if pick_article_id(it)]
        if not ids:
            return
        block = {
            "type": "evidence_cards",
            "title": "Evidências",
            "subtitle": f"Seleção automática ({method})",
            "source_article_ids": ids,
            "method": method,
        }
        ch.setdefault("blocks", []).append(block)

    # enrich chapters
    chapters = story.get("chapters") or []
    for ch in chapters:
        cid = norm(ch.get("id"))
        title = norm(ch.get("title"))
        blocks = ch.get("blocks") or []

        # 1) se é capítulo-onda com peak_month
        peak_month = None
        for b in blocks:
            if b.get("type") == "peak_month":
                peak_month = norm(b.get("month"))
                break
        if peak_month and peak_month in by_month:
            cands = top_in_list(by_month[peak_month], TOP_N_PER_PEAK_MONTH * 3)
            picked = diversity_prune(cands, TOP_N_PER_PEAK_MONTH)
            attach_evidence_block(ch, picked, method=f"peak_month:{peak_month}:top_score_diverse")
            continue

        # 2) capítulos institucionais: heurística por título/id
        is_pt = ("portugal" in title.lower()) or ("portugal" in cid.lower())
        is_eu = ("bruxelas" in title.lower()) or ("ue" in title.lower()) or ("eu" in cid.lower())

        if is_pt or is_eu:
            cands = []
            for it in core_items:
                t = blobs.get(pick_article_id(it), "")
                if contains_any(t, INSTITUTIONAL_KWS):
                    cands.append(it)
            cands = top_in_list(cands, TOP_N_PER_INSTITUTIONAL * 3)
            picked = diversity_prune(cands, TOP_N_PER_INSTITUTIONAL)
            attach_evidence_block(ch, picked, method="institutional:keyword_match:top_score_diverse")
            continue

        # 3) capítulos temáticos (cozinha, doação, etc.) se houver label no id/título
        for label, kws in LABEL_KWS.items():
            if label in cid.lower() or label in title.lower():
                cands = []
                for it in core_items:
                    t = blobs.get(pick_article_id(it), "")
                    if contains_any(t, kws):
                        cands.append(it)
                cands = top_in_list(cands, TOP_N_PER_INSTITUTIONAL * 3)
                picked = diversity_prune(cands, TOP_N_PER_INSTITUTIONAL)
                attach_evidence_block(ch, picked, method=f"theme:{label}:keyword_match:top_score_diverse")
                break

    # 4) enriquecer blocos de texto: se bloco 'text' sem source_article_ids, tentar preencher
    for ch in chapters:
        for b in (ch.get("blocks") or []):
            if b.get("type") != "text":
                continue
            if (b.get("source_article_ids") or []):
                continue
            text = norm(b.get("content"))
            if not text:
                continue

            # keywords por proximidade simples
            matched = []
            for it in core_items:
                aid = pick_article_id(it)
                t = blobs.get(aid, "")
                if not t:
                    continue
                # match: pelo menos 1 keyword institucional OU 1 keyword temática
                if contains_any(text, INSTITUTIONAL_KWS) and contains_any(t, INSTITUTIONAL_KWS):
                    matched.append(it)
                else:
                    for _, kws in LABEL_KWS.items():
                        if contains_any(text, kws) and contains_any(t, kws):
                            matched.append(it)
                            break

            matched = sorted(matched, key=lambda it: (score_of(it), wc_of(it)), reverse=True)
            ids = [pick_article_id(it) for it in matched if pick_article_id(it)]
            ids = ids[:MAX_SOURCES_PER_TEXT_BLOCK]
            if ids:
                b["source_article_ids"] = ids
                b["method"] = (b.get("method") or "text_anchor") + ":keyword_overlap"

    story["chapters"] = chapters
    story["enrichment"] = {
        "enriched_at": now_utc_iso(),
        "params": {
            "TOP_N_PER_PEAK_MONTH": TOP_N_PER_PEAK_MONTH,
            "TOP_N_PER_INSTITUTIONAL": TOP_N_PER_INSTITUTIONAL,
            "MAX_SOURCES_PER_TEXT_BLOCK": MAX_SOURCES_PER_TEXT_BLOCK,
        }
    }

    write_json(OUT_STORY, story)

    prov = {
        "schema": "desperdico.provenance.enrich_storyline.v1",
        "created_at": now_utc_iso(),
        "inputs": {
            "corpus.json": {"sha256": sha256_file(CORPUS_P)},
            "storyline.json": {"sha256": sha256_file(STORY_P)},
            "timeline.json": {"sha256": sha256_file(TIMELINE_P)},
            "legislation.json": {"sha256": sha256_file(LEG_P)},
        },
        "outputs": {
            "storyline_enriched.json": {"sha256": sha256_file(OUT_STORY)},
        },
        "notes": [
            "Enrichment adds evidence_cards blocks and anchors text blocks with source_article_ids using keyword heuristics.",
            "No corpus items removed; storyline remains a derived view referencing article_ids.",
        ]
    }
    write_json(OUT_PROV, prov)
    print(f"[DONE] {OUT_STORY}")
    print(f"[DONE] {OUT_PROV}")

if __name__ == "__main__":
    main()