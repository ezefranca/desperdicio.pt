# Documentação PT-PT

## 1. O que é este projecto

O `desperdicio.pt` é um editorial documental interactivo sobre desperdício alimentar em Portugal. O site cruza:

- arquivo do Público preservado pelo Arquivo.pt;
- resultados do arquivo vivo do Público;
- legislação portuguesa e europeia;
- dados estatísticos editoriais;
- uma camada de gamificação local em `localStorage`.

O projecto é um site estático. Não depende de framework front-end nem de backend dedicado para ser servido.

## 2. Estrutura real do repositório

### `index.html`

Página principal do editorial.

### `metodologia/index.html`

Página pública de metodologia.

### `assets/css/styles.css`

Folha de estilos global do projecto.

### `assets/js/main.js`

Responsável por:

- carregar os JSON em `assets/data/`;
- renderizar capítulos, gráficos, cards e timeline;
- preencher a navegação;
- activar animações e partilha.

### `assets/js/game.js`

Responsável pelo widget de gamificação:

- quiz;
- calculadora pessoal;
- desafios;
- conquistas;
- persistência em `localStorage`.

### `assets/data/`

Contém os dados finais que alimentam o site. Os ficheiros mais relevantes são:

- `corpus.json`: corpus normalizado.
- `corpus_core.json`: recorte lean com os 127 artigos core e metadados de cobertura.
- `timeline.json`: distribuição anual e mensal.
- `legislation.json`: diplomas legais.
- `featured.json`: peças editoriais destacadas.
- `image_manifest.json`: proveniência das imagens de terceiros espelhadas localmente.
- `storyline.json`: narrativa base.
- `storyline_bundled.json`: narrativa com bundles automáticos.
- `storyline_bundled_full.json`: snapshot editorial mais completo; é o primeiro ficheiro tentado pelo site.

### `data-sources/`

Contém as bases de dados de trabalho:

- `arquivo_publico_desperdico.sqlite`
- `publico_live.sqlite`
- `metadata_export.csv`

### `scripts/`

Contém os scripts de recolha, enriquecimento, filtragem e construção da narrativa.

## 3. Requisitos

### Obrigatórios

- Python 3.10 ou superior
- `requests`
- `beautifulsoup4`

### Opcionais

- `lxml`
  O scraper faz fallback para `html.parser`, por isso não é obrigatório.
- Node.js
  Útil apenas para validações rápidas de sintaxe em `assets/js/*.js`.

## 4. Instalação local

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install requests beautifulsoup4
```

## 5. Como correr o website

Na raiz do projecto:

```bash
python3 -m http.server 4173
```

Abrir no navegador:

- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/metodologia/`

### Ordem de carregamento da storyline

O `main.js` tenta carregar:

1. `assets/data/storyline_bundled_full.json`
2. `assets/data/storyline_bundled.json`
3. `assets/data/storyline.json`

Isto significa que o site continua a funcionar mesmo que o snapshot “full” não exista, desde que haja pelo menos uma das outras versões.

## 6. Como usar os scripts

### `scripts/fetch_publico_arquivo_metadata.py`

Função:

- pesquisa o Arquivo.pt por várias queries;
- restringe a pesquisa ao domínio do Público;
- grava resultados históricos em SQLite;
- mantém checkpoint de paginação.

Output:

- `data-sources/arquivo_publico_desperdico.sqlite`
- `data-sources/metadata_export.csv`

Execução:

```bash
python3 scripts/fetch_publico_arquivo_metadata.py
```

### `scripts/fetch_publico_json_search.py`

Função:

- usa a pesquisa JSON do Público para obter resultados do arquivo vivo;
- grava resultados na tabela `items`.

Output:

- `data-sources/publico_live.sqlite`

Execução:

```bash
python3 scripts/fetch_publico_json_search.py
```

### `scripts/enrich_publico_from_html.py`

Função:

- lê URLs a partir da view `v_articles`;
- faz download do HTML das páginas;
- extrai título, data, autores, secção e texto;
- grava tudo em `article_details`.

Execução:

```bash
python3 scripts/enrich_publico_from_html.py
```

### `scripts/relevance_filter.py`

Função:

- atribui `relevance_score`;
- classifica cada artigo em `core`, `maybe` ou `noise`.

Execução:

```bash
python3 scripts/relevance_filter.py
```

### `scripts/export_corpus.py`

Função:

- exporta `article_details` para `assets/data/corpus.json`;
- normaliza `published_at` para formato ISO quando possível.

Execução:

```bash
python3 scripts/export_corpus.py
```

### `scripts/curate_corpus.py`

Função:

- aplica exclusões e promoções manuais a partir de `assets/data/corpus_curation.json`;
- normaliza datas finais do corpus;
- regenera `timeline.json`;
- produz `assets/data/corpus_validation.json`.

Execução:

```bash
python3 scripts/curate_corpus.py
```

### `scripts/build_storyline.py`

Função:

- constrói a narrativa base;
- usa `featured.json` como fallback editorial quando não existe `evidence.json`.

Execução:

```bash
python3 scripts/build_storyline.py
```

### `scripts/refresh_arquivo_pt_archive_status.py`

Função:

- verifica cada URL core do Público no índice global do Arquivo.pt e na colecção `save/now`;
- submete ao ArchivePageNow apenas os URLs ainda ausentes;
- gera um relatório datado em `reports/arquivo-pt-submissoes-YYYYMMDD.tsv`.

Execução:

```bash
python3 scripts/refresh_arquivo_pt_archive_status.py
```

### `scripts/attach_arquivo_pt_urls.py`

Função:

- lê automaticamente o relatório mais recente em `reports/arquivo-pt-submissoes-*.tsv`;
- anexa `arquivo_pt_url`, `arquivo_pt_status` e `arquivo_pt_url_source`;
- actualiza o corpus, deriva `corpus_core.json` e enriquece os JSON editoriais usados pelo site.

Execução:

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

### `scripts/localize_runtime_images.py`

Função:

- descarrega localmente as imagens editoriais remotas usadas no runtime público;
- actualiza `assets/data/featured.json` para apontar para caminhos locais;
- regista a proveniência em `assets/data/image_manifest.json`.

Execução:

```bash
python3 scripts/localize_runtime_images.py
```

Outputs actualizados:

- `assets/data/featured.json`
- `assets/data/image_manifest.json`
- `assets/img/publico/featured/`
- `assets/img/publico/editorial/`
- `assets/img/editorial/`

### `scripts/enrich_storyline.py`

Função:

- acrescenta evidências automáticas aos capítulos;
- reconhece `chapter_id` e `meta.peak_month`.

Execução:

```bash
python3 scripts/enrich_storyline.py
```

Outputs:

- `assets/data/storyline_enriched.json` (intermédio, não necessário para correr o site)
- `assets/data/provenance_enrich_storyline.json` (intermédio)

### `scripts/build_bundled_storyline.py`

Função:

- cria bundles adicionais de fontes;
- distribui artigos `core` ainda não usados.

Execução:

```bash
python3 scripts/build_bundled_storyline.py
```

Outputs:

- `assets/data/storyline_bundled.json`
- `assets/data/provenance_build_bundled_storyline.json` (intermédio)

## 7. Fluxo recomendado

### Se queres apenas abrir o site

```bash
python3 -m http.server 4173
```

### Se queres regenerar o corpus e a narrativa

```bash
python3 scripts/fetch_publico_json_search.py
python3 scripts/enrich_publico_from_html.py
python3 scripts/relevance_filter.py
python3 scripts/export_corpus.py
python3 scripts/curate_corpus.py
python3 scripts/build_storyline.py
python3 scripts/enrich_storyline.py
python3 scripts/build_bundled_storyline.py
python3 scripts/attach_arquivo_pt_urls.py
```

### Se também queres actualizar a base histórica do Arquivo.pt

```bash
python3 scripts/fetch_publico_arquivo_metadata.py
```

## 8. Verificações úteis

### Validar sintaxe do JavaScript

```bash
node --check assets/js/main.js
node --check assets/js/game.js
```

### Validar os JSON

```bash
python3 - <<'PY'
import json
from pathlib import Path
for p in sorted(Path("assets/data").glob("*.json")):
    json.loads(p.read_text())
    print("OK", p)
PY
```

## 9. Limitações actuais

- O classificador por regex ainda deixa entrar alguns falsos positivos de baixa relevância editorial.
- `storyline_bundled_full.json` existe como snapshot versionado, mas a cadeia automática regenerada no repositório termina em `storyline_bundled.json`.
- O site e o kit de avaliação usam `corpus_core.json` para leitura mais limpa; `corpus.json` mantém-se como export completo.

## 10. Ficheiros complementares

- `KIT-DE-AVALIACAO.md`
- `VALIDACAO-FINAL-CORPUS.md`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `README.md`
