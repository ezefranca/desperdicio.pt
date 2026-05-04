# desperdicio.pt

Editorial documental interactivo sobre desperdício alimentar em Portugal, construído a partir do arquivo do Público preservado pelo Arquivo.pt e complementado com dados legais e estatísticos.

## Estado actual do projecto

- Site estático em `HTML + CSS + JavaScript`.
- Dados finais servidos a partir de `assets/data/`.
- Bases de dados de trabalho em `data-sources/`.
- Snapshot editorial principal em `assets/data/storyline_bundled_full.json`.

## Citação

O repositório inclui [`CITATION.cff`](CITATION.cff) na raiz para o GitHub expor `Cite this repository` com metadados de citação em APA e BibTeX.

## Métricas usadas no site

| Métrica | Valor |
|---------|-------|
| Artigos totais processados | 337 |
| Artigos core usados no site | 127 |
| Diplomas legais | 20 |
| Anos com cobertura publicada | 14 |
| Intervalo temporal da cobertura | 2011-2026 |
| Pico de cobertura | Dezembro 2023 (7 artigos) |

## Estrutura

```text
desperdicio.pt/
├── index.html
├── robots.txt
├── sitemap.xml
├── llms.txt
├── metodologia/
│   └── index.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── data/
│       ├── corpus.json
│       ├── corpus_core.json
│       ├── storyline.json
│       ├── storyline_bundled.json
│       ├── storyline_bundled_full.json
│       ├── timeline.json
│       ├── legislation.json
│       ├── featured.json
│       ├── image_manifest.json
│       ├── waste_breakdown.json
│       ├── eu_comparison.json
│       ├── initiatives_impact.json
│       ├── projections.json
│       ├── deep_archive.json
│       └── game.json
├── data-sources/
│   ├── arquivo_publico_desperdico.sqlite
│   ├── publico_live.sqlite
│   └── metadata_export.csv
├── scripts/
├── DOCUMENTACAO-PT-PT.md
├── KIT-DE-AVALIACAO.md
└── VALIDACAO-FINAL-CORPUS.md
```

## Como correr o site

### Opção recomendada

```bash
python3 -m http.server 4173
```

Depois abrir:

- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/metodologia/`

## Dependências dos scripts

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install requests beautifulsoup4
```

`lxml` é opcional. O scraper faz fallback para `html.parser` se `lxml` não estiver disponível.

## Pipeline de dados

### 1. Metadados históricos via Arquivo.pt

```bash
python3 scripts/fetch_publico_arquivo_metadata.py
```

Output:

- `data-sources/arquivo_publico_desperdico.sqlite`
- `data-sources/metadata_export.csv`

### 2. Pesquisa no arquivo vivo do Público

```bash
python3 scripts/fetch_publico_json_search.py
```

Output:

- `data-sources/publico_live.sqlite`

### 3. Enriquecimento HTML

```bash
python3 scripts/enrich_publico_from_html.py
```

Adiciona metadados e texto extraído à tabela `article_details` dentro de `data-sources/publico_live.sqlite`.

### 4. Classificação de relevância

```bash
python3 scripts/relevance_filter.py
```

Preenche `relevance_score` e `relevance_label` na tabela `article_details`.

### 5. Export do corpus normalizado

```bash
python3 scripts/export_corpus.py
```

Output por omissão:

- `assets/data/corpus.json`

### 6. Curadoria final e rebuild da timeline

```bash
python3 scripts/curate_corpus.py
```

Outputs:

- `assets/data/timeline.json`
- `assets/data/corpus_validation.json`

### 7. Construção da storyline

```bash
python3 scripts/build_storyline.py
```

Output por omissão:

- `assets/data/storyline.json`

Nota: este script usa `assets/data/featured.json` como fallback editorial quando não existe `evidence.json`.

### 8. Enriquecimento da storyline

```bash
python3 scripts/enrich_storyline.py
```

Outputs:

- `assets/data/storyline_enriched.json` (intermédio)
- `assets/data/provenance_enrich_storyline.json` (intermédio)

### 9. Bundling final

```bash
python3 scripts/build_bundled_storyline.py
```

Outputs:

- `assets/data/storyline_bundled.json`
- `assets/data/provenance_build_bundled_storyline.json` (intermédio)

### 10. Actualizar o estado de preservação no Arquivo.pt

```bash
python3 scripts/refresh_arquivo_pt_archive_status.py
```

Output:

- `reports/arquivo-pt-submissoes-YYYYMMDD.tsv`

### 11. Anexar links verificados do Arquivo.pt

```bash
python3 scripts/attach_arquivo_pt_urls.py
```

Outputs actualizados:

- `assets/data/corpus.json`
- `assets/data/corpus_core.json`
- `assets/data/featured.json`
- `assets/data/storyline.json`
- `assets/data/storyline_bundled.json`
- `assets/data/storyline_bundled_full.json`

Fonte:

- `reports/arquivo-pt-submissoes-*.tsv` (o script usa automaticamente o relatório mais recente)

### 12. Espelhar imagens editoriais remotas para uso local

```bash
python3 scripts/localize_runtime_images.py
```

Outputs actualizados:

- `assets/data/featured.json`
- `assets/data/image_manifest.json`
- `assets/img/publico/featured/`
- `assets/img/publico/editorial/`
- `assets/img/editorial/`

## Ordem prática recomendada

Se queres apenas correr o site:

```bash
python3 -m http.server 4173
```

Se queres regenerar dados:

```bash
python3 scripts/fetch_publico_json_search.py
python3 scripts/enrich_publico_from_html.py
python3 scripts/relevance_filter.py
python3 scripts/export_corpus.py
python3 scripts/curate_corpus.py
python3 scripts/build_storyline.py
python3 scripts/enrich_storyline.py
python3 scripts/build_bundled_storyline.py
python3 scripts/refresh_arquivo_pt_archive_status.py
python3 scripts/attach_arquivo_pt_urls.py
```

O fetch do Arquivo.pt pode ser corrido em paralelo como fonte histórica complementar:

```bash
python3 scripts/fetch_publico_arquivo_metadata.py
```

## Notas importantes

- O site tenta carregar os dados por esta ordem: `storyline_bundled_full.json`, `storyline_bundled.json`, `storyline.json`.
- `storyline_bundled_full.json` é o snapshot editorial mais completo actualmente versionado.
- O frontend usa `corpus_core.json` sempre que existe, caindo em `corpus.json` apenas como fallback.
- A classificação `core` é heurística. A revisão manual final fica documentada em `assets/data/corpus_curation.json` e `assets/data/corpus_validation.json`.
- Os campos `arquivo_pt_url`, `arquivo_pt_status` e `arquivo_pt_url_source` são anexados a partir do relatório mais recente em `reports/arquivo-pt-submissoes-*.tsv`.
- O runtime público usa imagens locais. `assets/data/featured.json` guarda o caminho local em `image.url` e a proveniência original em `image.source_url`.
- `assets/data/image_manifest.json` documenta as imagens de terceiros espelhadas localmente para garantir robustez em produção.
- `robots.txt`, `sitemap.xml` e `llms.txt` ajudam descoberta por motores de busca e leitura por agentes.

## Documentação adicional

- `DOCUMENTACAO-PT-PT.md`: guia operacional completo.
- `KIT-DE-AVALIACAO.md`: links-chave e roteiro de demonstração para júri.
- `VALIDACAO-FINAL-CORPUS.md`: nota curta sobre a validação manual do conjunto final.
