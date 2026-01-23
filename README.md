# desperdicio.pt

Um editorial documental sobre o desperdício alimentar em Portugal e na Europa, construído a partir do arquivo do Público preservado pelo Arquivo.pt.

## Sobre o Projecto

O **desperdicio.pt** é um projecto de jornalismo de dados que investiga 15 anos de cobertura do Público sobre desperdício alimentar (2011-2026), cruzando **337 artigos** com **20 diplomas legais** de Portugal e da União Europeia.

### Estatísticas do Corpus

| Métrica | Valor |
|---------|-------|
| Total de artigos | 337 |
| Artigos core (relevantes) | 128 |
| Anos de cobertura | 2011-2026 |
| Diplomas legais | 20 (PT + EU) |
| Picos de cobertura | Dez 2023 (7), Set 2025 (6) |

## Estrutura do Projecto

```
desperdicio.pt/
├── index.html              # Página principal
├── metodologia/
│   └── index.html          # Documentação técnica
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── img/                # Logos e imagens
│   └── data/
│       ├── corpus.json
│       ├── storyline_bundled.json
│       ├── timeline.json
│       ├── legislation.json
│       ├── featured.json
│       ├── waste_breakdown.json
│       ├── eu_comparison.json
│       ├── initiatives_impact.json
│       ├── projections.json
│       └── deep_archive.json
├── scripts/                # Pipeline de dados
│   ├── fetch_publico_arquivo_metadata.py
│   ├── fetch_publico_json_search.py
│   ├── enrich_publico_from_html.py
│   ├── relevance_filter.py
│   ├── export_corpus.py
│   ├── build_storyline.py
│   ├── build_bundled_storyline.py
│   └── enrich_storyline.py
├── CNAME
├── LICENSE
└── README.md
```

## Fontes de Dados

### Arquivo.pt Text Search API

```
GET https://arquivo.pt/textsearch?q={query}&siteSearch=www.publico.pt
```

Queries utilizadas:
- "desperdício alimentar"
- "desperdício de alimentos"
- "perdas e desperdício alimentar"
- "combate ao desperdício alimentar"
- "sobras de comida"
- "food waste"

### Público.pt

Artigos do arquivo vivo do Público (2020-2026) e histórico preservado no Arquivo.pt (1999-2019).

Base de dados: [Levantamento de domínios e subdomínios do Público no Arquivo.pt (1996-2019)](https://arquivo.pt/wayback/publico.pt), enriquecido com cobertura até 2026.

## Como Executar

### Requisitos

- Python 3.10+
- requests
- beautifulsoup4

### Instalação

```bash
git clone https://github.com/ezefranca/desperdicio.pt.git
cd desperdicio.pt

python -m venv venv
source venv/bin/activate

pip install requests beautifulsoup4
```

### Execução do Pipeline

```bash
python scripts/fetch_publico_arquivo_metadata.py
python scripts/enrich_publico_from_html.py
python scripts/relevance_filter.py
python scripts/export_corpus.py
python scripts/build_storyline.py
```

## Estrutura Editorial

O editorial está organizado em **5 movimentos argumentativos**:

1. **De invisível a inevitável** — Como o desperdício entrou na agenda mediática
2. **O inimigo está em casa** — 67% do desperdício acontece nos lares
3. **Leis que existem, implementação que falha** — O gap entre legislação e prática
4. **Soluções que nasceram fora do Estado** — Fruta Feia, Too Good To Go, Refood
5. **2030 é amanhã** — Metas europeias e cenários futuros

## Licença

Este projecto está licenciado sob a MIT License. Ver [LICENSE](LICENSE) para mais detalhes.

## Parceiros e Fontes

- **Arquivo.pt** — Preservação da Web Portuguesa
- **Público.pt** — Jornalismo de Referência
- **Parlamento Europeu** — Dados e estatísticas
- **Assembleia da República** — Legislação portuguesa
- **Eurostat** — Dados estatísticos europeus
- **Diário da República Electrónico** — Legislação portuguesa

---

**desperdicio.pt** — *Deitar comida fora não é descuido. É hábito.*
