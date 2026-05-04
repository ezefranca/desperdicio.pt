#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DEFAULT_OUT_DIR = Path("assets/data")

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def sha1_text(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def read_json(p: Path) -> Any:
    return json.loads(p.read_text(encoding="utf-8"))

def write_json(p: Path, obj: Any) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")

def read_bytes(p: Path) -> bytes:
    return p.read_bytes()


def normalize_evidence_items(evidence: Dict[str, Any]) -> List[Dict[str, Any]]:
    if isinstance(evidence.get("items"), list):
        return [it for it in evidence["items"] if isinstance(it, dict)]

    if isinstance(evidence.get("featured"), list):
        items: List[Dict[str, Any]] = []
        for it in evidence["featured"]:
            if not isinstance(it, dict):
                continue
            items.append({
                "title": it.get("title"),
                "date": it.get("date"),
                "url": it.get("url"),
                "score": (it.get("editorial_recommendation") or {}).get("priority"),
                "word_count": None,
            })
        return items

    return []

def normalize_url(url: str) -> str:
    if not url:
        return ""
    u = url.strip().split("#", 1)[0]
    if len(u) > 10 and u.endswith("/"):
        u = u[:-1]
    u = re.sub(r"\s+", "", u)
    return u

def law_id_from_link(link: str) -> str:
    return sha1_text("law|" + normalize_url(link))

def article_id_from_url(url: str) -> str:
    return sha1_text("article|" + normalize_url(url))

def index_corpus_by_url(corpus: Dict[str, Any]) -> Dict[str, str]:
    m: Dict[str, str] = {}
    for it in corpus.get("items", []):
        url = normalize_url(it.get("url") or "")
        aid = it.get("article_id")
        if url and aid:
            m[url] = aid
    return m

def pick_peak_months(timeline: Dict[str, Any], n: int = 6) -> List[str]:
    peaks = timeline.get("peaks") or []
    months = []
    for p in peaks[:n]:
        m = p.get("month")
        if m:
            months.append(m)
    return months

def group_corpus_by_month(corpus: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    by: Dict[str, List[Dict[str, Any]]] = {}
    for it in corpus.get("items", []):
        if (it.get("relevance_label") or "").strip().lower() != "core":
            continue
        dt = (it.get("published_at") or "").strip()
        if not dt or len(dt) < 7:
            continue
        # aceita YYYY-MM...
        month = dt[:7]
        by.setdefault(month, []).append(it)
    return by

def select_top_articles(items: List[Dict[str, Any]], k: int = 3) -> List[Dict[str, Any]]:
    def key(it: Dict[str, Any]) -> Tuple[int, int]:
        score = it.get("relevance_score")
        wc = it.get("word_count")
        return (int(score) if isinstance(score, int) else 0, int(wc) if isinstance(wc, int) else 0)
    return sorted(items, key=key, reverse=True)[:k]

def build_chapters_from_peaks(
    timeline: Dict[str, Any],
    corpus: Dict[str, Any],
    legislation: Dict[str, Any],
) -> List[Dict[str, Any]]:
    peak_months = pick_peak_months(timeline, n=6)
    by_month = group_corpus_by_month(corpus)

    # Núcleo legal (capítulos institucionais)
    laws = legislation.get("legislation") or []
    # separar leis “direct” e “indirect”
    laws_direct = [l for l in laws if (l.get("scope") == "direct")]
    laws_indirect = [l for l in laws if (l.get("scope") != "direct")]

    def law_ref(l: Dict[str, Any]) -> Dict[str, Any]:
        link = l.get("official_link") or ""
        return {
            "law_id": law_id_from_link(link),
            "title": l.get("title"),
            "jurisdiction": l.get("jurisdiction"),
            "type": l.get("type"),
            "identifier": l.get("identifier"),
            "date_enacted": l.get("date_enacted"),
            "official_link": link,
            "scope": l.get("scope"),
        }

    # Escolhas mínimas de leis-chave para narrativa (sem “inventar”)
    # 1) Portugal: AR 65/2015, RCM 46/2018, DL 102-D/2020, Lei 62/2021
    # 2) UE: 2018/851, 2019/1597, 2019/2000, Farm to Fork, 2025/1892
    wanted_substrings = [
        "65/2015",
        "46/2018",
        "102-d/2020",
        "62/2021",
        "2018/851",
        "2019/1597",
        "2019/2000",
        "Farm to Fork",
        "2025/1892",
    ]
    picked_laws: List[Dict[str, Any]] = []
    for w in wanted_substrings:
        for l in laws:
            t = (l.get("title") or "") + " " + (l.get("identifier") or "") + " " + (l.get("official_link") or "")
            if w.lower() in t.lower():
                picked_laws.append(l)
                break

    chapters: List[Dict[str, Any]] = []

    # Capítulo 0: Prólogo (não depende de pico)
    chapters.append({
        "chapter_id": "ch-prologo",
        "title": "Não é Bruxelas. Não é a couve. É o dever de todos.",
        "kind": "prologue",
        "blocks": [
            {
                "block_id": "b-prologo-1",
                "type": "text",
                "content": "A cozinha é o palco onde o desperdício se disfarça de hábito. Bruxelas é o lugar onde a responsabilidade se disfarça de processo. Entre os dois, a comida desaparece.",
                "method": "author_stub",
                "source_article_ids": [],
                "source_law_ids": [],
            },
            {
                "block_id": "b-prologo-chart",
                "type": "chart_ref",
                "content": {"chart": "timeline.by_year", "note": "Abrir com a curva de atenção mediática e prometer prova clicável."},
                "method": "timeline_json",
                "source_article_ids": [],
                "source_law_ids": [],
            }
        ]
    })

    # Capítulos guiados por picos (cada pico vira “virada/onda” com evidências)
    for i, month in enumerate(peak_months, start=1):
        month_items = by_month.get(month, [])
        top = select_top_articles(month_items, k=3)

        blocks = []
        blocks.append({
            "block_id": f"b-peak-{i}-intro",
            "type": "text",
            "content": f"Em {month}, o tema sobe à superfície. O que muda: o vocabulário. O que persiste: o descarte.",
            "method": "peak_month_intro_stub",
            "source_article_ids": [],
            "source_law_ids": [],
        })

        for j, it in enumerate(top, start=1):
            url = it.get("url") or ""
            aid = it.get("article_id") or article_id_from_url(url)
            blocks.append({
                "block_id": f"b-peak-{i}-ev-{j}",
                "type": "evidence",
                "content": {
                    "title": it.get("title"),
                    "url": url,
                    "published_at": it.get("published_at"),
                    "snippet": (it.get("text_content") or "")[:260] if it.get("text_content") else None,
                    "relevance_score": it.get("relevance_score"),
                    "word_count": it.get("word_count"),
                },
                "method": "peak_month_top_score",
                "source_article_ids": [aid],
                "source_law_ids": [],
            })

        blocks.append({
            "block_id": f"b-peak-{i}-chart",
            "type": "chart_ref",
            "content": {"chart": "timeline.by_month", "focus_month": month},
            "method": "timeline_json_peak_focus",
            "source_article_ids": [],
            "source_law_ids": [],
        })

        chapters.append({
            "chapter_id": f"ch-onda-{i}",
            "title": f"Onda de atenção: {month}",
            "kind": "peak_wave",
            "meta": {"peak_month": month},
            "blocks": blocks
        })

    # Capítulo institucional PT
    pt_laws = [l for l in picked_laws if (l.get("jurisdiction") == "Portugal")]
    chapters.append({
        "chapter_id": "ch-portugal-estado",
        "title": "Quando o tema vira Estado (Portugal)",
        "kind": "institutional",
        "blocks": [
            {
                "block_id": "b-pt-1",
                "type": "text",
                "content": "O desperdício deixa de ser só moral e vira obrigação: metas, planos, execução, sanção.",
                "method": "author_stub",
                "source_article_ids": [],
                "source_law_ids": [],
            },
            *[
                {
                    "block_id": f"b-pt-law-{idx+1}",
                    "type": "law",
                    "content": law_ref(l),
                    "method": "legislation_json_key_pick",
                    "source_article_ids": [],
                    "source_law_ids": [law_id_from_link(l.get("official_link") or "")],
                }
                for idx, l in enumerate(pt_laws)
            ]
        ]
    })

    # Capítulo institucional UE
    eu_laws = [l for l in picked_laws if (l.get("jurisdiction") == "EU")]
    chapters.append({
        "chapter_id": "ch-bruxelas-metodo",
        "title": "Bruxelas: metas e método",
        "kind": "institutional",
        "blocks": [
            {
                "block_id": "b-eu-1",
                "type": "text",
                "content": "Sem método, o problema vira opinião. Com método, vira comparação. Com meta, vira política.",
                "method": "author_stub",
                "source_article_ids": [],
                "source_law_ids": [],
            },
            *[
                {
                    "block_id": f"b-eu-law-{idx+1}",
                    "type": "law",
                    "content": law_ref(l),
                    "method": "legislation_json_key_pick",
                    "source_article_ids": [],
                    "source_law_ids": [law_id_from_link(l.get("official_link") or "")],
                }
                for idx, l in enumerate(eu_laws)
            ]
        ]
    })

    # Epílogo: fecho com prova (sem prosa final)
    chapters.append({
        "chapter_id": "ch-epilogo",
        "title": "Fecho: o que mudou (e o que ficou igual)",
        "kind": "epilogue",
        "blocks": [
            {
                "block_id": "b-ep-1",
                "type": "text",
                "content": "O editorial termina quando a prova começa: cada frase aponta para uma fonte. A crítica é coletiva, porque o desperdício também é.",
                "method": "author_stub",
                "source_article_ids": [],
                "source_law_ids": [],
            },
            {
                "block_id": "b-ep-chart",
                "type": "chart_ref",
                "content": {"chart": "timeline.peaks", "note": "Fechar com picos e uma pergunta: cresce o desperdício ou cresce a conversa?"},
                "method": "timeline_json",
                "source_article_ids": [],
                "source_law_ids": [],
            }
        ]
    })

    return chapters

def build_provenance(inputs: List[Path], outputs: List[Path], step: str) -> Dict[str, Any]:
    in_list = []
    for p in inputs:
        b = read_bytes(p)
        in_list.append({"path": str(p), "sha256": sha256_bytes(b)})
    out_list = []
    for p in outputs:
        b = read_bytes(p)
        out_list.append({"path": str(p), "sha256": sha256_bytes(b)})
    return {
        "schema": "desperdico.provenance.v1",
        "created_at": now_utc_iso(),
        "step": step,
        "inputs": in_list,
        "outputs": out_list,
        "environment": {
            "python": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
        }
    }

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", type=str, default=str(DEFAULT_OUT_DIR), help="Pasta de saída (default: assets/data)")
    ap.add_argument("--corpus", type=str, default="", help="Path corpus.json (default: out-dir/corpus.json)")
    ap.add_argument("--timeline", type=str, default="", help="Path timeline.json (default: out-dir/timeline.json)")
    ap.add_argument("--evidence", type=str, default="", help="Path evidence.json ou featured.json (default: out-dir/featured.json se existir)")
    ap.add_argument("--legislation", type=str, default="", help="Path legislation.json (default: out-dir/legislation.json)")
    args = ap.parse_args()

    out_dir = Path(args.out_dir)
    corpus_p = Path(args.corpus) if args.corpus else (out_dir / "corpus.json")
    timeline_p = Path(args.timeline) if args.timeline else (out_dir / "timeline.json")
    if args.evidence:
        evidence_p = Path(args.evidence)
    else:
        featured_p = out_dir / "featured.json"
        evidence_p = featured_p if featured_p.exists() else (out_dir / "evidence.json")
    legislation_p = Path(args.legislation) if args.legislation else (out_dir / "legislation.json")

    for p in [corpus_p, timeline_p, evidence_p, legislation_p]:
        if not p.exists():
            raise SystemExit(f"Falta arquivo: {p}")

    corpus = read_json(corpus_p)
    timeline = read_json(timeline_p)
    evidence = read_json(evidence_p)
    legislation = read_json(legislation_p)

    # Index de URL->article_id (para garantir referência estável)
    url_to_id = index_corpus_by_url(corpus)

    # normalizar evidências (garantir que têm id e apontam pro corpus)
    ev_items = normalize_evidence_items(evidence)
    # evidence.json no seu caso é {"count":..,"items":[...]} (ok)
    for it in ev_items:
        u = normalize_url(it.get("url") or "")
        it["article_id"] = url_to_id.get(u) or article_id_from_url(u)

    # construir capítulos
    chapters = build_chapters_from_peaks(timeline, corpus, legislation)

    storyline = {
        "schema": "desperdico.storyline.v1",
        "created_at": now_utc_iso(),
        "inputs": {
            "corpus_schema": corpus.get("schema"),
            "timeline_schema": timeline.get("schema"),
            "evidence_schema": evidence.get("schema"),
            "legislation_schema": legislation.get("schema"),
        },
        "logline": "Não é Bruxelas, nem a couve, nem a cozinha: o desperdício é um dever de todos.",
        "chapters": chapters,
        "appendix": {
            "evidence_index": [
                {
                    "article_id": it.get("article_id"),
                    "title": it.get("title"),
                    "date": it.get("date"),
                    "url": it.get("url"),
                    "score": it.get("score"),
                    "word_count": it.get("word_count"),
                }
                for it in ev_items
            ],
            "law_index": [
                {
                    "law_id": law_id_from_link(l.get("official_link") or ""),
                    "title": l.get("title"),
                    "jurisdiction": l.get("jurisdiction"),
                    "type": l.get("type"),
                    "identifier": l.get("identifier"),
                    "date_enacted": l.get("date_enacted"),
                    "official_link": l.get("official_link"),
                    "scope": l.get("scope"),
                }
                for l in (legislation.get("legislation") or [])
            ]
        }
    }

    story_path = out_dir / "storyline.json"
    write_json(story_path, storyline)
    print(f"[DONE] {story_path}")

    prov_path = out_dir / "provenance_build_storyline.json"
    # escrever primeiro, depois calcular hashes completos
    write_json(prov_path, {"placeholder": True})
    prov = build_provenance([corpus_p, timeline_p, evidence_p, legislation_p], [story_path], "build_storyline")
    write_json(prov_path, prov)
    print(f"[DONE] {prov_path}")

if __name__ == "__main__":
    main()
