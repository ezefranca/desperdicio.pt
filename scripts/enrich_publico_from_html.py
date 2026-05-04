#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import random
import re
import sqlite3
import time
from datetime import datetime
from typing import Optional, Tuple

import requests
from bs4 import BeautifulSoup, FeatureNotFound

DB = "data-sources/publico_live.sqlite"

HTTP_TIMEOUT = 25
MAX_RETRIES = 6
BACKOFF_BASE = 1.2
BACKOFF_MAX = 20.0
SLEEP_BETWEEN = 0.6
BATCH_LIMIT = 2000  # por corrida

UA = "DesPerdicoResearchBot/1.0 (+contact: you@example.com)"


def build_soup(html: str) -> BeautifulSoup:
    for parser in ("lxml", "html.parser"):
        try:
            return BeautifulSoup(html, parser)
        except FeatureNotFound:
            continue
    return BeautifulSoup(html, "html.parser")


def backoff_sleep(attempt: int) -> None:
    base = min(BACKOFF_MAX, BACKOFF_BASE * (2 ** attempt))
    jitter = random.uniform(0.0, 0.35 * base)
    time.sleep(base + jitter)


def fetch_html(url: str) -> Tuple[int, str, str]:
    """
    returns: (status_code, final_url, html)
    """
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(
                url,
                timeout=HTTP_TIMEOUT,
                headers={"user-agent": UA, "accept": "text/html,application/xhtml+xml"},
                allow_redirects=True,
            )
            if r.status_code == 200 and r.text:
                return r.status_code, str(r.url), r.text
            if r.status_code in (429, 500, 502, 503, 504):
                pass
            else:
                # 4xx etc: não adianta insistir muito
                if attempt >= 1:
                    return r.status_code, str(r.url), r.text or ""
        except requests.RequestException:
            pass
        backoff_sleep(attempt)
    return 0, url, ""


def get_meta(soup: BeautifulSoup, prop: str = "", name: str = "") -> str:
    if prop:
        tag = soup.find("meta", attrs={"property": prop})
        if tag and tag.get("content"):
            return tag["content"].strip()
    if name:
        tag = soup.find("meta", attrs={"name": name})
        if tag and tag.get("content"):
            return tag["content"].strip()
    return ""


def extract_jsonld(soup: BeautifulSoup) -> list:
    out = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            txt = tag.get_text(strip=True)
            if not txt:
                continue
            data = json.loads(txt)
            out.append(data)
        except Exception:
            continue
    return out


def clean_text(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s


def extract_article_text(soup: BeautifulSoup) -> str:
    """
    Heurística:
    1) tenta <article> e agrega parágrafos
    2) fallback: maior bloco de <p> dentro de main
    """
    # remove lixo
    for sel in ["script", "style", "noscript"]:
        for t in soup.select(sel):
            t.decompose()

    article = soup.find("article")
    if article:
        ps = [clean_text(p.get_text(" ", strip=True)) for p in article.find_all("p")]
        ps = [p for p in ps if len(p) >= 30]
        text = "\n".join(ps).strip()
        if len(text) >= 400:
            return text

    main = soup.find("main") or soup
    ps = [clean_text(p.get_text(" ", strip=True)) for p in main.find_all("p")]
    ps = [p for p in ps if len(p) >= 30]
    text = "\n".join(ps).strip()
    return text


def extract_authors(soup: BeautifulSoup) -> str:
    # meta author
    a = get_meta(soup, name="author")
    if a:
        return a

    # json-ld author
    jsonlds = extract_jsonld(soup)
    authors = []
    def pull_author(obj):
        if isinstance(obj, dict):
            if "author" in obj:
                return obj["author"]
            if "@graph" in obj:
                return obj["@graph"]
        return None

    for block in jsonlds:
        candidate = pull_author(block)
        if candidate is None:
            continue
        # normalize
        if isinstance(candidate, list):
            for x in candidate:
                if isinstance(x, dict) and x.get("name"):
                    authors.append(x["name"])
                elif isinstance(x, str):
                    authors.append(x)
        elif isinstance(candidate, dict) and candidate.get("name"):
            authors.append(candidate["name"])
        elif isinstance(candidate, str):
            authors.append(candidate)

    # unique preserve order
    seen = set()
    uniq = []
    for x in authors:
        x = clean_text(x)
        if not x or x in seen:
            continue
        seen.add(x)
        uniq.append(x)

    return ", ".join(uniq)


def extract_published_at(soup: BeautifulSoup) -> str:
    # OpenGraph / article meta
    t = get_meta(soup, prop="article:published_time")
    if t:
        return t
    t = get_meta(soup, name="date")
    if t:
        return t

    # json-ld datePublished
    for block in extract_jsonld(soup):
        if isinstance(block, dict):
            if block.get("datePublished"):
                return str(block["datePublished"])
            if "@graph" in block and isinstance(block["@graph"], list):
                for x in block["@graph"]:
                    if isinstance(x, dict) and x.get("datePublished"):
                        return str(x["datePublished"])

    return ""


def detect_paywall_hint(html: str, text: str) -> int:
    # heurísticas fracas mas úteis: conteúdo muito curto ou menções
    lower = html.lower()
    if "clube p" in lower or "exclusivo" in lower:
        return 1
    if len(text) < 300:
        return 1
    return 0


def word_count(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"\w+", text, flags=re.UNICODE))


def already_done(conn: sqlite3.Connection, url: str) -> bool:
    row = conn.execute("SELECT 1 FROM article_details WHERE full_url = ? LIMIT 1;", (url,)).fetchone()
    return row is not None


def main():
    conn = sqlite3.connect(DB)
    try:
        # pega artigos ainda não enriquecidos
        rows = conn.execute("""
            SELECT full_url
            FROM v_articles
            ORDER BY id ASC
            LIMIT ?;
        """, (BATCH_LIMIT,)).fetchall()

        total = len(rows)
        print(f"[INFO] artigos na batch: {total}")

        done = 0
        for (url,) in rows:
            if already_done(conn, url):
                continue

            status, final_url, html = fetch_html(url)
            fetched_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

            if not html:
                conn.execute("""
                    INSERT OR IGNORE INTO article_details
                    (full_url, fetched_at_utc, http_status, final_url, paywall_hint, word_count, text_content, html_snippet)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """, (url, fetched_at, status, final_url, 1, 0, "", ""))
                conn.commit()
                print(f"[MISS] {status} {url}")
                time.sleep(SLEEP_BETWEEN)
                continue

            soup = build_soup(html)

            title = get_meta(soup, prop="og:title") or soup.title.get_text(strip=True) if soup.title else ""
            published_at = extract_published_at(soup)
            authors = extract_authors(soup)
            section = get_meta(soup, prop="article:section")

            text = extract_article_text(soup)
            wc = word_count(text)
            paywall = detect_paywall_hint(html, text)

            html_snip = html[:4000]

            conn.execute("""
                INSERT OR IGNORE INTO article_details
                (full_url, fetched_at_utc, http_status, final_url, title, published_at, section, authors, paywall_hint, word_count, text_content, html_snippet)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (url, fetched_at, status, final_url, title, published_at, section, authors, paywall, wc, text, html_snip))
            conn.commit()

            done += 1
            print(f"[OK] {done} status={status} wc={wc} paywall={paywall} url={url}")
            time.sleep(SLEEP_BETWEEN)

        print("[DONE] enrichment finished")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
