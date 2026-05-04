#!/usr/bin/env python3
"""Mirror runtime editorial images locally and preserve their provenance.

This script downloads remote images currently required by the public site
runtime, stores them under ``assets/img/``, and updates ``featured.json`` so
the frontend no longer depends on third-party image hosts.
"""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
FEATURED_PATH = ROOT / "assets/data/featured.json"
MANIFEST_PATH = ROOT / "assets/data/image_manifest.json"
FEATURED_DIR = ROOT / "assets/img/publico/featured"
EXTRA_IMAGES = [
    {
        "id": "domestic-fridge-family",
        "usage": "domestic_feature",
        "title": "Infografia: como arrumar o frigorífico para evitar o desperdício alimentar?",
        "local_path": "assets/img/publico/editorial/domestic-fridge-family.jpg",
        "source_image_url": "https://imagens.publico.pt/imagens.aspx/2030284?tp=UH&db=IMAGENS&type=JPG",
        "credit": "Público / Estúdio P",
        "credit_url": "https://arquivo.pt/save/now/20260326011042/https://www.publico.pt/2025/09/29/estudiop/noticia/infografia-arrumar-frigorifico-evitar-desperdicio-alimentar-2147490",
        "caption": "Mais de metade do desperdício alimentar europeu nasce em contexto doméstico. A escolha continua a acontecer em casa.",
    },
    {
        "id": "eu-waste-rules-2025",
        "usage": "eu_process_card",
        "title": "Council and Parliament agree to reduce food waste and introduce new rules on waste textile",
        "local_path": "assets/img/editorial/eu-waste-rules-2025.jpg",
        "source_image_url": "https://www.europeaninterest.eu/wp-content/uploads/2025/02/NEW-Waste.jpg",
        "credit": "European Interest",
        "credit_url": "https://arquivo.pt/save/now/20260326150248/https://www.europeaninterest.eu/council-and-parliament-agree-to-reduce-food-waste-and-introduce-new-rules-on-waste-textile/",
        "caption": "O acordo político entre Conselho e Parlamento em 2025 antecedeu a fixação de metas vinculativas para a redução do desperdício alimentar.",
    },
    {
        "id": "anna-video-poster",
        "usage": "video_poster",
        "title": "Anna mergulha no lixo para combater o desperdício alimentar",
        "local_path": "assets/img/publico/editorial/anna-video-poster.jpg",
        "source_image_url": "https://i.ytimg.com/vi/1TNPzSRzTt4/maxresdefault.jpg",
        "credit": "Público P3 / YouTube",
        "credit_url": "https://www.youtube.com/watch?v=1TNPzSRzTt4",
        "caption": "Poster local do vídeo Anna mergulha no lixo para combater o desperdício alimentar.",
    },
    {
        "id": "brussels-sprout-closeup",
        "usage": "prologue_wink",
        "title": "Brussels sprout closeup",
        "local_path": "assets/img/editorial/brussels-sprout-closeup.jpg",
        "source_image_url": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Brussels_sprout_closeup.jpg",
        "credit": "Eric Hunt / Wikimedia Commons",
        "credit_url": "https://arquivo.pt/save/now/20260326153518/https://commons.wikimedia.org/wiki/File:Brussels_sprout_closeup.jpg",
        "caption": "Sim, é couve-de-Bruxelas. A obrigação, essa, é nossa.",
    },
    {
        "id": "epilogue-portuguese-table",
        "usage": "epilogue_closure",
        "title": "What do Portuguese people eat at home?",
        "local_path": "assets/img/editorial/epilogue-portuguese-table.webp",
        "source_image_url": "https://www.tasteoflisboa.com/wp-content/uploads/sites/2712/2022/11/02.Portuguese-home-food_portuguese-around-the-table.png",
        "credit": "Taste of Lisboa",
        "credit_url": "https://arquivo.pt/save/now/20260326161231/https://www.tasteoflisboa.com/blog/what-do-portuguese-people-eat-at-home/",
        "caption": "A mesa portuguesa continua a ser lugar de partilha antes de ser excesso.",
    },
]

USER_AGENT = "desperdicio.pt image mirror/1.0"
TIMEOUT = 60


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def guess_extension(url: str) -> str:
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".svg"}:
        return ".jpg" if suffix == ".jpeg" else suffix

    query = parse_qs(parsed.query)
    image_type = (query.get("type") or [""])[0].strip().lower()
    if image_type in {"jpg", "jpeg"}:
        return ".jpg"
    if image_type in {"png", "webp", "svg"}:
        return f".{image_type}"
    return ".jpg"


def download(url: str, dest: Path) -> None:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=TIMEOUT) as response:
        dest.write_bytes(response.read())


def main() -> None:
    FEATURED_DIR.mkdir(parents=True, exist_ok=True)

    payload = json.loads(FEATURED_PATH.read_text(encoding="utf-8"))
    manifest_items = []
    featured_count = 0

    for article in payload.get("featured", []):
        image = article.get("image")
        if not isinstance(image, dict):
            continue

        remote_url = str(image.get("source_url") or image.get("url") or "").strip()
        if not remote_url.startswith("http"):
            continue

        local_rel = Path("assets/img/publico/featured") / f"{article['id']}{guess_extension(remote_url)}"
        local_path = ROOT / local_rel
        download(remote_url, local_path)

        image["url"] = local_rel.as_posix()
        image["source_url"] = remote_url
        image["credit"] = image.get("credit") or "Público"
        image["credit_url"] = image.get("credit_url") or article.get("arquivo_pt_url") or article.get("url") or ""
        featured_count += 1

        manifest_items.append(
            {
                "id": article.get("id") or "",
                "usage": "historical_carousel",
                "title": article.get("title") or "",
                "local_path": local_rel.as_posix(),
                "source_image_url": remote_url,
                "credit": image["credit"],
                "credit_url": image["credit_url"],
                "caption": image.get("caption") or "",
            }
        )

    for item in EXTRA_IMAGES:
        local_path = ROOT / item["local_path"]
        local_path.parent.mkdir(parents=True, exist_ok=True)
        download(item["source_image_url"], local_path)
        manifest_items.append(item)

    FEATURED_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MANIFEST_PATH.write_text(
        json.dumps(
            {
                "generated_at": now_iso(),
                "description": "Locally mirrored third-party runtime images used by desperdicio.pt, with provenance for editorial and production use.",
                "items": manifest_items,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Mirrored {featured_count} featured images to {FEATURED_DIR.relative_to(ROOT)}")
    print(f"Mirrored {len(EXTRA_IMAGES)} additional editorial images")
    print(f"Updated {FEATURED_PATH.relative_to(ROOT)}")
    print(f"Wrote {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
