#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import re
import sqlite3
from pathlib import Path
from typing import List, Tuple

DB_PATH = Path("out_desperdico/publico_live.sqlite")

# Termos que indicam tema (PT + EN). Ajusta depois se quiser.
POSITIVE = [
    r"\bdesperd[ií]cio\b",
    r"\bdesperd[ií]cio alimentar\b",
    r"\bperdas\b",
    r"\bperdas e desperd[ií]cio\b",
    r"\bfood waste\b",
    r"\bfood loss\b",
    r"\bsobras\b",
    r"\brestos\b",
    r"\balimentos?\b",
    r"\brefei(c|ç)ões?\b",
    r"\bretalho\b",
    r"\bsupermercad(os|o)\b",
    r"\bdoa(c|ç)[aã]o\b",
    r"\bbanco(s)? alimentar(es)?\b",
    r"\bcantina(s)?\b",
    r"\bvalidade\b",
    r"\bdata de validade\b",
    r"\bdesperdi(c|ç)ar\b",
    r"\bdeitar fora\b",
]

# Termos que costumam ser ruído (exemplos) — não é perfeito, mas já elimina muita coisa.
NEGATIVE = [
    r"\bpesc(a|as)\b",
    r"\bpeixes?\b",
    r"\bgen[eé]tica\b",
    r"\buniversidade\b",
    r"\bestudo\b",
    r"\bciencia\b",
    r"\bclube\b",
    r"\bfutebol\b",
    r"\bbolsa\b",
    r"\ba(c|ç)[oõ]es\b",
    r"\bcriptomoeda\b",
]

ARTICLE_URL_RE = re.compile(r"^https://www\.publico\.pt/\d{4}/\d{2}/\d{2}/")

def ensure_columns(conn: sqlite3.Connection) -> None:
    # cria colunas se não existirem
    cols = [r[1] for r in conn.execute("PRAGMA table_info(article_details)").fetchall()]
    if "relevance_score" not in cols:
        conn.execute("ALTER TABLE article_details ADD COLUMN relevance_score INTEGER DEFAULT 0;")
    if "relevance_label" not in cols:
        conn.execute("ALTER TABLE article_details ADD COLUMN relevance_label TEXT DEFAULT '';")
    conn.commit()

def score_text(title: str, text: str) -> int:
    hay = (title or "") + "\n" + (text or "")
    h = hay.lower()
    s = 0
    for pat in POSITIVE:
        if re.search(pat, h, flags=re.IGNORECASE):
            s += 3
    for pat in NEGATIVE:
        if re.search(pat, h, flags=re.IGNORECASE):
            s -= 2
    # pequeno boost se “desperdício alimentar” aparecer como frase
    if re.search(r"desperd[ií]cio alimentar", h, flags=re.IGNORECASE):
        s += 6
    return s

def label_for(score: int) -> str:
    # thresholds simples (ajusta depois de ver amostras)
    if score >= 9:
        return "core"
    if score >= 4:
        return "maybe"
    return "noise"

def fetch_rows(conn: sqlite3.Connection, limit: int = 5000) -> List[Tuple[int,str,str,str]]:
    rows = conn.execute("""
        SELECT id, full_url, COALESCE(title,''), COALESCE(text_content,'')
        FROM article_details
        WHERE COALESCE(text_content,'') <> ''
        ORDER BY id ASC
        LIMIT ?;
    """, (limit,)).fetchall()
    return [(r[0], r[1], r[2], r[3]) for r in rows]

def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"DB não existe: {DB_PATH}")

    conn = sqlite3.connect(str(DB_PATH))
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        ensure_columns(conn)

        rows = fetch_rows(conn, limit=200000)  # alto para cobrir tudo; sqlite lê incrementalmente ok
        updated = 0
        for rid, url, title, text in rows:
            if not ARTICLE_URL_RE.match(url or ""):
                continue
            s = score_text(title, text)
            lab = label_for(s)
            conn.execute(
                "UPDATE article_details SET relevance_score=?, relevance_label=? WHERE id=?;",
                (s, lab, rid)
            )
            updated += 1
            if updated % 2000 == 0:
                conn.commit()
                print(f"[PROGRESS] updated={updated}")
        conn.commit()
        print(f"[DONE] relevance marcada em {updated} rows")

        # resumo
        total = conn.execute("SELECT COUNT(*) FROM article_details WHERE COALESCE(text_content,'') <> ''").fetchone()[0]
        core = conn.execute("SELECT COUNT(*) FROM article_details WHERE relevance_label='core'").fetchone()[0]
        maybe = conn.execute("SELECT COUNT(*) FROM article_details WHERE relevance_label='maybe'").fetchone()[0]
        noise = conn.execute("SELECT COUNT(*) FROM article_details WHERE relevance_label='noise'").fetchone()[0]
        print("[STATS] total_com_texto:", total)
        print("[STATS] core:", core, "maybe:", maybe, "noise:", noise)

        print("\n[SAMPLE] 5 core")
        for r in conn.execute("""
            SELECT relevance_score, substr(title,1,90), full_url
            FROM article_details
            WHERE relevance_label='core'
            ORDER BY relevance_score DESC, id DESC
            LIMIT 5;
        """).fetchall():
            print("-", r[0], r[1], r[2])

        print("\n[SAMPLE] 5 noise (para validar que está limpando)")
        for r in conn.execute("""
            SELECT relevance_score, substr(title,1,90), full_url
            FROM article_details
            WHERE relevance_label='noise'
            ORDER BY id DESC
            LIMIT 5;
        """).fetchall():
            print("-", r[0], r[1], r[2])

    finally:
        conn.close()

if __name__ == "__main__":
    main()