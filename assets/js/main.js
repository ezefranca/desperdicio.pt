// ==================== CONFIG ====================
const FILES = {
  storyline: ["assets/data/storyline_bundled_full.json", "assets/data/storyline_bundled.json", "assets/data/storyline.json"],
  corpusCore: ["assets/data/corpus_core.json", "assets/data/corpus.json"],
  timeline: "assets/data/timeline.json",
  legislation: "assets/data/legislation.json",
  wasteBreakdown: "assets/data/waste_breakdown.json",
  euComparison: "assets/data/eu_comparison.json",
  initiatives: "assets/data/initiatives_impact.json",
  projections: "assets/data/projections.json",
  featured: "assets/data/featured.json",
  deepArchive: "assets/data/deep_archive.json"
};

const REFERENCES = {
  euWasteFacts: "https://www.europarl.europa.eu/topics/pt/article/20240318STO19401/desperdicio-alimentar-na-europa-factos-politicas-da-ue-e-metas-para-2030",
  euWasteDirective: "https://eur-lex.europa.eu/eli/dir/2025/1892/oj"
};

const ARCHIVE_REFERENCES = {
  euFoodWaste: "https://arquivo.pt/save/now/20260326011926/https://food.ec.europa.eu/food-safety/food-waste_en",
  unepFoodWaste: "https://arquivo.pt/save/now/20260326011947/https://www.unep.org/topics/food-systems/food-loss-and-waste",
  faoEnergy: "https://arquivo.pt/save/now/20260326012017/https://www.fao.org/energy/home/en",
  ieaEnergyAI: "https://arquivo.pt/save/now/20260326012052/https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai",
  eprsFoodWaste2025: "https://arquivo.pt/save/now/20260326012122/https://www.europarl.europa.eu/RegData/etudes/ATAG/2025/775925/EPRS_ATA%282025%29775925_EN.pdf",
  publicoThemeLanding: "https://arquivo.pt/save/now/20260326015627/https://www.publico.pt/desperdicio-alimentar",
  publicoWaste2025Families: "https://arquivo.pt/save/now/20260326022253/https://www.publico.pt/2025/09/25/azul/noticia/maior-parte-desperdicio-alimentar-portugal-produzido-familias-2148461",
  tasteOfLisboaHomeFood: "https://arquivo.pt/save/now/20260326161231/https://www.tasteoflisboa.com/blog/what-do-portuguese-people-eat-at-home/",
  ovosMolesHistory: "https://arquivo.pt/save/now/20260326134627/https://www.ptpt.pt/pt/produtos/664",
  lilianaMesaFarta: "https://arquivo.pt/save/now/20260326134628/https://www.unidoscontraodesperdicio.pt/post/liliana-sousa-em-portugal-o-desperd%C3%ADcio-decorre-da-tradi%C3%A7%C3%A3o-da-mesa-farta"
};

const EU_IMAGES = {
  hero: "assets/img/eu-food-waste-hero.jpg",
  wasteByCountry: "assets/img/eu-food-waste-ranking.png"
};

const EDITORIAL_IMAGES = {
  domestic: {
    url: "assets/img/publico/editorial/domestic-fridge-family.jpg",
    caption: "Mais de metade do desperdício alimentar europeu nasce em contexto doméstico. A escolha continua a acontecer em casa.",
    credit: "Público / Estúdio P",
    creditUrl: "https://arquivo.pt/save/now/20260326011042/https://www.publico.pt/2025/09/29/estudiop/noticia/infografia-arrumar-frigorifico-evitar-desperdicio-alimentar-2147490"
  },
  euProcess: {
    url: "assets/img/editorial/eu-waste-rules-2025.jpg",
    alt: "Representantes europeus numa sessão do Parlamento Europeu durante a negociação das novas regras sobre desperdício alimentar e resíduos têxteis.",
    caption: "Em 2025, a negociação entre Conselho e Parlamento antecedeu a diretiva que passou a fixar metas vinculativas para o desperdício alimentar.",
    credit: "European Interest",
    creditUrl: "https://arquivo.pt/save/now/20260326150248/https://www.europeaninterest.eu/council-and-parliament-agree-to-reduce-food-waste-and-introduce-new-rules-on-waste-textile/"
  },
  annaVideoPoster: {
    url: "assets/img/publico/editorial/anna-video-poster.jpg",
    alt: "Poster local do vídeo Anna mergulha no lixo para combater o desperdício alimentar.",
    credit: "Público P3 / YouTube",
    creditUrl: "https://www.youtube.com/watch?v=1TNPzSRzTt4"
  },
  prologueWink: {
    url: "assets/img/editorial/brussels-sprout-closeup.jpg",
    alt: "Close-up de uma couve-de-Bruxelas.",
    caption: "Sim, é couve-de-Bruxelas. A obrigação, essa, é nossa.",
    credit: "Eric Hunt / Wikimedia Commons",
    creditUrl: "https://arquivo.pt/save/now/20260326153518/https://commons.wikimedia.org/wiki/File:Brussels_sprout_closeup.jpg"
  },
  epilogueClosure: {
    url: "assets/img/editorial/epilogue-portuguese-table.webp",
    alt: "Mesa doméstica portuguesa, com várias pessoas reunidas à refeição.",
    caption: "A mesa portuguesa continua a ser lugar de partilha antes de ser excesso.",
    credit: "Taste of Lisboa",
    creditUrl: ARCHIVE_REFERENCES.tasteOfLisboaHomeFood
  }
};

const EVIDENCE_SETS = {
  "ch-prologo": [
    "e7a42ad6653f0d11a1805d5efa529932a0b5bd84",
    "24ee1bdaa3abb886619c1015f0991e723271f7a9",
    "ea288ea064ff6de004a6e666742b80946ad67779",
    "fb8769bee0790e37aa01b599f26ae6e8c103798d",
    "b2fb27b20e01d60be6ffd5143e90982132760eb4",
    "0a0d5e87c76f2e441c58b0d6d3836f0b56d7bf6c"
  ],
  "ch-portugal-estado": [
    "4fd5e7b28b364713e30f469eb9038a9e133a006b",
    "bf1b9b4c37fe86ff5e38c33a7585e4406890303f",
    "ea288ea064ff6de004a6e666742b80946ad67779",
    "b2fb27b20e01d60be6ffd5143e90982132760eb4",
    "0a0d5e87c76f2e441c58b0d6d3836f0b56d7bf6c",
    "c9fe143f0c40a42e32ffb7f03051912678e783b3"
  ],
  "ch-bruxelas-metodo": [
    "9f8e9ccb90c96b47b50a76a766c82d511021aff0",
    "43ad54a624920f8714a1fda1bb6b6664054806df",
    "d4a295c445e4c3b213886ba73303f7dba8f5b2f7",
    "c7a5e73eb76cc102ee1a792e4431b27620108994",
    "14950721615de42b92e4e7c9d18b43672eeccec3",
    "0ffba9286a2235554272838afb8b58c894b34604"
  ]
};

const PUBLICO_EDITORIAL = {
  themePageLive: "https://www.publico.pt/desperdicio-alimentar",
  themePageArchive: ARCHIVE_REFERENCES.publicoThemeLanding,
  highlights: [
    {
      articleId: "b2fb27b20e01d60be6ffd5143e90982132760eb4",
      label: "Dados nacionais",
      text: "A cobertura recente trouxe para primeiro plano a medição mais actual do INE e voltou a quantificar o problema com dados oficiais."
    },
    {
      articleId: "fb8769bee0790e37aa01b599f26ae6e8c103798d",
      label: "Comportamento doméstico",
      text: "O Público também entrou nos mecanismos concretos do descarte: rotulagem, confiança nos sentidos e alimentos ainda bons que acabam no lixo."
    },
    {
      articleId: "0a0d5e87c76f2e441c58b0d6d3836f0b56d7bf6c",
      label: "Escala do problema",
      text: "A peça mais recente reforça o eixo central deste projecto: a maior parte do desperdício nasce nas famílias, nas compras, no armazenamento e na confecção."
    }
  ]
};

const DOMESTIC_EDITORIAL = {
  featureImage: {
    url: EDITORIAL_IMAGES.domestic.url,
    caption: EDITORIAL_IMAGES.domestic.caption,
    credit: EDITORIAL_IMAGES.domestic.credit,
    creditUrl: EDITORIAL_IMAGES.domestic.creditUrl
  },
  items: [
    {
      url: "https://www.publico.pt/2014/12/21/sociedade/noticia/o-que-ha-no-fundo-do-nosso-frigorifico-1679718",
      label: "Frigorífico",
      text: "Uma peça precoce sobre o que fica esquecido no frio e acaba por sair de casa directamente para o lixo."
    },
    {
      url: "https://www.publico.pt/2021/12/23/impar/noticia/sobreviver-natal-limitar-estragos-1988390",
      label: "Natal",
      text: "A abundância festiva aparece aqui como teste real à diferença entre hospitalidade, excesso e reaproveitamento."
    },
    {
      url: "https://www.publico.pt/2023/09/20/impar/noticia/cozinhar-desperdicio-chef-kiko-tia-catia-joana-barrios-ajudam-fazem-festa-2064007",
      label: "Cozinhar",
      text: "A cozinha doméstica deixa de ser apenas origem do problema e passa a ser também lugar de técnica, partilha e solução."
    },
    {
      url: "https://www.publico.pt/2024/04/17/impar/noticia/menos-compras-cozinhar-desperdicar-comer-bem-2087162",
      label: "Planeamento",
      text: "Antes da próxima compra, a peça manda parar, abrir armários, rever o frigorífico e decidir melhor o que já existe em casa."
    },
    {
      url: "https://www.publico.pt/2024/12/24/azul/noticia/mudancas-podem-trazer-mesa-natal-ecologico-2116489",
      label: "Mesa",
      text: "Pequenas mudanças à mesa mostram que reduzir desperdício não precisa de empobrecer o ritual doméstico."
    },
    {
      url: "https://www.publico.pt/2025/09/29/estudiop/noticia/infografia-arrumar-frigorifico-evitar-desperdicio-alimentar-2147490",
      label: "Gestos simples",
      text: "Arrumar melhor o frigorífico surge como gesto quase banal, mas com efeito directo na duração e no destino dos alimentos."
    }
  ]
};

// ==================== HELPERS ====================
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => (s ?? "").toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const fmtDate = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtYear = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.getFullYear();
};

const fmtMonthLabel = month => {
  if (!month || typeof month !== "string" || month.length < 7) return "";
  const [year, mm] = month.split("-");
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const idx = parseInt(mm, 10) - 1;
  return `${monthNames[idx] || mm} ${String(year || "").slice(2)}`;
};

const buildImageFallbackDataUri = label => {
  const safeLabel = esc(label || "Arquivo");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#131315" offset="0%"/>
          <stop stop-color="#1f2937" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="92" cy="92" r="36" fill="#4ade80" fill-opacity="0.14"/>
      <circle cx="560" cy="74" r="52" fill="#f59e0b" fill-opacity="0.10"/>
      <text x="320" y="168" text-anchor="middle" fill="#e5e7eb" font-family="Inter, Arial, sans-serif" font-size="22">
        Público / Arquivo.pt
      </text>
      <text x="320" y="204" text-anchor="middle" fill="#4ade80" font-family="Inter, Arial, sans-serif" font-size="18">
        ${safeLabel}
      </text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const renderSourceReference = (label, url, suffix = "") => {
  const sourceLabel = esc(label || "");
  const sourceUrl = esc(url || "");
  const tail = suffix ? ` — ${esc(suffix)}` : "";
  if (sourceUrl) {
    return `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${sourceLabel}</a>${tail}`;
  }
  return `${sourceLabel}${tail}`;
};

const generateArquivoUrl = article => {
  if (article?.arquivo_pt_url) return article.arquivo_pt_url;
  if (article?.archive_url) return article.archive_url;

  const url = article?.url || article?.article_url;
  if (!url) return "";

  const date = article?.date || article?.published_at || `${article?.year || "2013"}-01-01`;
  const stamp = String(date).slice(0, 10).replace(/-/g, "");
  return `https://arquivo.pt/wayback/${stamp}120000/${url}`;
};

const getEvidenceIds = (chapterId, fallbackIds = []) => EVIDENCE_SETS[chapterId] || fallbackIds;
const normalizeChapters = chapters => Array.isArray(chapters)
  ? chapters
  : (chapters && typeof chapters === 'object' ? Object.values(chapters) : []);

async function fetchJson(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function fetchFirst(paths) {
  for (const p of paths) {
    try { return await fetchJson(p); } catch (_) {}
  }
  throw new Error("No storyline found");
}

// ==================== RENDER SIDEBAR ====================
function renderMiniStats(timeline) {
  const stats = timeline.stats || {};
  const peaks = timeline.peaks || [];
  const topPeak = peaks[0] || {};

  return `
    <div class="mini-stat">
      <div class="mini-stat-value">${stats.core_total || 127}</div>
      <div class="mini-stat-label">Artigos</div>
    </div>
    <div class="mini-stat">
      <div class="mini-stat-value">${(timeline.by_year || []).length}</div>
      <div class="mini-stat-label">Anos</div>
    </div>
    <div class="mini-stat">
      <div class="mini-stat-value">${fmtMonthLabel(topPeak.month) || 'Dez 23'}</div>
      <div class="mini-stat-label">Pico</div>
    </div>
    <div class="mini-stat">
      <div class="mini-stat-value">${topPeak.count || 7}</div>
      <div class="mini-stat-label">Max/Mês</div>
    </div>
  `;
}

function renderTimeline(laws) {
  const sorted = [...laws].sort((a, b) => new Date(a.date_enacted) - new Date(b.date_enacted));

  return sorted.map(law => {
    const isPT = (law.jurisdiction || "").toLowerCase().includes("portugal");
    const isDirect = law.scope === "direct";
    const flagSrc = isPT ? 'assets/img/flag_pt.svg' : 'assets/img/flag_eu.svg';

    return `
      <div class="tl-item ${isDirect ? 'direct' : ''}">
        <a href="${esc(law.official_link || '#')}" target="_blank" rel="noopener noreferrer">
          <div class="tl-header">
            <img src="${flagSrc}" alt="" aria-hidden="true" class="tl-flag-img">
            <span class="tl-year">${fmtYear(law.date_enacted)}</span>
          </div>
          <div class="tl-title">${esc(law.title)}</div>
          <div class="tl-type">${esc(law.type || '')}</div>
        </a>
      </div>
    `;
  }).join('');
}

// ==================== RENDER CHAPTERS ====================
function renderChapterHeader(chapter, idx) {
  const num = String(idx + 1).padStart(2, '0');
  return `
    <header class="chapter-header">
      <div class="chapter-eyebrow">
        <span class="num">${num}</span>
        ${chapter.kind === 'prologue' ? 'Prólogo' :
          chapter.kind === 'epilogue' ? 'Epílogo' :
          chapter.kind === 'peak_wave' ? 'Onda de Atenção' : 'Capitulo'}
      </div>
      <h2 class="chapter-title">${esc(chapter.title)}</h2>
    </header>
  `;
}

function renderBigQuote(text, cite) {
  const quoteText = esc(text)
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\r?\n/g, '<br>');

  return `
    <div class="big-quote" data-animate="true">
      <blockquote>${quoteText}</blockquote>
      <cite>- ${esc(cite)}</cite>
    </div>
  `;
}

function renderStatsGrid(stats) {
  return `
    <div class="stats-grid" data-animate="true">
      ${stats.map((s, idx) => `
        <div class="stat-card" style="--item-delay: ${idx * 0.08}s">
          <div class="stat-card-value ${s.color || 'accent'}">${s.value}</div>
          <div class="stat-card-label">${esc(s.label)}</div>
          ${s.note ? `<div class="stat-card-note">${esc(s.note)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderYearChart(timeline) {
  const years = timeline.by_year || [];
  const peaks = (timeline.peaks || []).map(p => p.month?.slice(0, 4));
  const maxCount = Math.max(...years.map(y => y.count), 1);
  const coreTotal = timeline.stats?.core_total || 127;

  return `
    <div class="chart-section bar-chart-section" data-animate="true">
      <div class="chart-header">
        <div>
          <div class="chart-title">Evolução da Cobertura Mediática</div>
          <div class="chart-subtitle">Artigos publicados por ano no Público (2011-2026)</div>
        </div>
        <div class="chart-legend">
          <div class="chart-legend-item">
            <div class="chart-legend-dot" style="background: var(--accent)"></div>
            Normal
          </div>
          <div class="chart-legend-item">
            <div class="chart-legend-dot" style="background: var(--warning)"></div>
            Ano de pico
          </div>
        </div>
      </div>
      <div class="chart-bars">
        ${years.map((y, idx) => {
          const height = (y.count / maxCount) * 160;
          const isPeak = peaks.includes(y.year) || y.count > 20;
          return `
            <div class="chart-bar ${isPeak ? 'peak' : ''}" style="--bar-delay: ${idx * 0.05}s">
              <div class="bar" style="height: ${Math.max(height, 8)}px">
                <span class="bar-value">${y.count}</span>
              </div>
              <span class="bar-label">${y.year.slice(2)}</span>
            </div>
          `;
        }).join('')}
      </div>
      <p class="chart-source">Fonte: <a href="https://arquivo.pt" target="_blank" rel="noopener noreferrer">Corpus desperdicio.pt</a> — ${coreTotal} artigos datados do Público preservados no Arquivo.pt</p>
    </div>
  `;
}

function renderMonthChart(timeline, focusMonth) {
  const months = timeline.by_month || [];
  const recent = months.slice(-24); // Last 24 months
  const maxCount = Math.max(...recent.map(m => m.count), 1);

  return `
    <div class="chart-section bar-chart-section" data-animate="true">
      <div class="chart-header">
        <div>
          <div class="chart-title">Cobertura Mensal Recente</div>
          <div class="chart-subtitle">Artigos por mês nos últimos 24 meses</div>
        </div>
      </div>
      <div class="chart-bars">
        ${recent.map((m, idx) => {
          const height = (m.count / maxCount) * 140;
          const isFocus = m.month === focusMonth;
          return `
            <div class="chart-bar ${isFocus ? 'peak' : ''}" style="--bar-delay: ${idx * 0.03}s">
              <div class="bar" style="height: ${Math.max(height, 4)}px">
                <span class="bar-value">${m.count}</span>
              </div>
              <span class="bar-label">${m.month.slice(5)}</span>
            </div>
          `;
        }).join('')}
      </div>
      <p class="chart-source">Fonte: <a href="https://arquivo.pt" target="_blank" rel="noopener noreferrer">Corpus desperdicio.pt</a> — artigos do Público preservados no Arquivo.pt</p>
    </div>
  `;
}

function renderTargets() {
  return `
    <div class="targets-row">
      <div class="target-card">
        <div class="target-card-header">
          <span class="tl-flag eu"></span>
          <span class="target-card-label">Processamento e Fabrico</span>
        </div>
        <div class="target-card-value">-10%</div>
        <div class="target-card-desc">Redução obrigatória de resíduos alimentares na transformação industrial até 2030</div>
        <span class="target-card-badge">Meta Vinculativa UE</span>
      </div>
      <div class="target-card">
        <div class="target-card-header">
          <span class="tl-flag eu"></span>
          <span class="target-card-label">Retalho e Consumidores</span>
        </div>
        <div class="target-card-value">-30%</div>
        <div class="target-card-desc">Redução per capita no retalho, restauração e agregados familiares até 2030</div>
        <span class="target-card-badge">Meta Vinculativa UE</span>
      </div>
    </div>
    <p class="chart-source">Fonte: <a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">Diretiva (UE) 2025/1892</a></p>
  `;
}

function renderODSBadge() {
  return `
    <div class="ods-badge">
      <div class="ods-icon">
        <span class="num">12</span>
        <span class="label">ODS</span>
      </div>
      <div class="ods-content">
        <div class="ods-title">ODS 12.3 - Meta Global 2030</div>
        <div class="ods-desc">Reduzir para metade o desperdício alimentar per capita a nível do retalho e do consumidor, e reduzir as perdas de alimentos ao longo das cadeias de produção e abastecimento.</div>
        <div class="ods-source"><a href="https://sdgs.un.org/goals/goal12" target="_blank" rel="noopener noreferrer">Nações Unidas — Objectivo 12</a></div>
      </div>
    </div>
  `;
}

function renderLawCard(law, lawIndex) {
  const fullLaw = lawIndex.get(law.law_id) || law;
  const isPT = (fullLaw.jurisdiction || "").toLowerCase().includes("portugal");

  return `
    <div class="law-card">
      <div class="law-card-header">
        <div class="law-card-jurisdiction">
          <span class="tl-flag ${isPT ? 'pt' : 'eu'}"></span>
          ${esc(fullLaw.jurisdiction)}
        </div>
        <span class="law-card-type">${esc(fullLaw.type || '')}</span>
        <span class="law-card-date">${fmtDate(fullLaw.date_enacted)}</span>
      </div>
      <h4 class="law-card-title">${esc(fullLaw.title)}</h4>
      ${fullLaw.summary ? `<p class="law-card-summary">${esc(fullLaw.summary)}</p>` : ''}
      ${fullLaw.official_link ? `
        <a href="${esc(fullLaw.official_link)}" target="_blank" rel="noopener noreferrer" class="law-card-link">
          Ver diploma oficial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </a>
      ` : ''}
    </div>
  `;
}

function renderEvidenceCards(ids, corpusIndex, title = "Fontes e Evidências") {
  const items = ids.map(id => corpusIndex.get(String(id))).filter(Boolean).slice(0, 6);
  if (!items.length) return '';

  return `
    <div class="evidence-section">
      <div class="evidence-header">
        <h3 class="evidence-title">${esc(title)}</h3>
        <span class="evidence-count">${items.length} artigos</span>
      </div>
      <div class="evidence-grid">
        ${items.map(a => {
          const arquivoUrl = generateArquivoUrl(a);
          const liveUrl = a.url || '';
          return `
          <a href="${esc(arquivoUrl || liveUrl)}" target="_blank" rel="noopener noreferrer" class="evidence-card">
            <div class="evidence-card-content">
              <h4 class="evidence-card-title">${esc(a.title || 'Sem titulo')}</h4>
              <div class="evidence-card-meta">
                <span>${fmtDate(a.date || a.published_at)}</span>
                <span>Score ${a.relevance_score || a.score || 0}</span>
                ${a.word_count ? `<span>${a.word_count} palavras</span>` : ''}
                ${arquivoUrl ? `<span>Arquivo.pt</span>` : ''}
              </div>
              ${liveUrl ? `<div class="evidence-card-links"><span class="evidence-card-link">${arquivoUrl ? 'Abrir versão preservada' : 'Abrir artigo'}</span>${arquivoUrl ? `<span class="evidence-card-link-secondary">Live disponível</span>` : ''}</div>` : ''}
            </div>
            <div class="evidence-card-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderEvidenceBundle(ids, corpusIndex, title = "Fontes adicionais", subtitle = "") {
  const items = ids.map(id => corpusIndex.get(String(id))).filter(Boolean);
  if (!items.length) return '';

  return `
    <details class="evidence-bundle">
      <summary class="evidence-bundle-summary">
        <div>
          <div class="evidence-bundle-title">${esc(title)}</div>
          <div class="evidence-bundle-subtitle">${esc(subtitle || `${items.length} artigos adicionais preservados no Arquivo.pt`)}</div>
        </div>
        <span class="evidence-bundle-toggle">${items.length} links</span>
      </summary>
      <div class="evidence-bundle-list">
        ${items.map(item => {
          const arquivoUrl = generateArquivoUrl(item);
          return `
            <a href="${esc(arquivoUrl || item.url || '')}" target="_blank" rel="noopener noreferrer" class="evidence-bundle-item">
              <span class="evidence-bundle-item-title">${esc(item.title || 'Sem título')}</span>
              <span class="evidence-bundle-item-meta">${fmtDate(item.published_at)} · Score ${item.relevance_score || 0}</span>
            </a>
          `;
        }).join('')}
      </div>
    </details>
  `;
}

function renderInfographic(imgUrl, title, caption, source, note = '') {
  return `
    <div class="infographic">
      <div class="infographic-title">Dados da União Europeia</div>
      <div class="infographic-headline">${esc(title)}</div>
      <div class="infographic-image">
        <img src="${esc(imgUrl)}" alt="${esc(title)}" loading="lazy">
      </div>
      <div class="infographic-caption">
        ${esc(caption)}
        <span class="infographic-source"> - ${esc(source)}</span>
      </div>
      ${note ? `<p class="infographic-note">${note}</p>` : ''}
    </div>
  `;
}

function renderFullImage(imgUrl, caption, credit, creditUrl = '') {
  return `
    <figure class="full-image" data-animate="true">
      <img src="${esc(imgUrl)}" alt="${esc(caption)}" loading="lazy">
      <figcaption>
        ${esc(caption)}
        ${credit ? `<span class="credit"> - ${creditUrl ? `<a href="${esc(creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(credit)}</a>` : esc(credit)}</span>` : ''}
      </figcaption>
    </figure>
  `;
}

function renderDomesticEditorial(corpusData) {
  const urlIndex = new Map((corpusData?.items || []).map(item => [item.url, item]));
  const featureImage = DOMESTIC_EDITORIAL.featureImage;
  const cards = DOMESTIC_EDITORIAL.items.map(entry => {
    const item = urlIndex.get(entry.url);
    if (!item) return null;
    const archiveUrl = generateArquivoUrl(item) || item.arquivo_pt_url || item.url || '';
    return {
      label: entry.label,
      title: item.title || 'Sem título',
      text: entry.text,
      note: `${fmtDate(item.published_at || item.date || '')} · Público`,
      link: archiveUrl,
      linkLabel: 'Abrir versão preservada'
    };
  }).filter(Boolean);

  if (!cards.length) return '';

  return `
    <div class="archive-proof domestic-editorial">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Em casa</span>
        <h3 class="archive-proof-title">Frigorífico, sobras e mesa: o desperdício doméstico tem história própria</h3>
        <p class="archive-proof-text">Estas seis peças do Público, preservadas no Arquivo.pt, olham para o mesmo ponto de pressão por ângulos diferentes: compras, arrumação, cozinha, Natal, restos e decisões pequenas que definem o destino da comida.</p>
      </div>
      <figure class="domestic-editorial-media">
        <img src="${esc(featureImage.url)}" alt="${esc(featureImage.caption)}" loading="lazy">
        <figcaption>
          ${esc(featureImage.caption)}
          <span class="credit"> - <a href="${esc(featureImage.creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(featureImage.credit)}</a></span>
        </figcaption>
      </figure>
      <div class="archive-proof-grid">
        ${cards.map(card => `
          <article class="archive-proof-card">
            <div class="archive-proof-label">${esc(card.label)}</div>
            <h4 class="archive-proof-card-title">${esc(card.title)}</h4>
            <p class="archive-proof-card-text">${esc(card.text)}</p>
            <div class="archive-proof-note">${esc(card.note)}</div>
            <a href="${esc(card.link)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">${esc(card.linkLabel)}</a>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEUProcessCard() {
  const image = EDITORIAL_IMAGES.euProcess;
  return `
    <aside class="editorial-image-card" data-animate="true">
      <figure class="editorial-image-card-media">
        <img src="${esc(image.url)}" alt="${esc(image.alt)}" loading="lazy">
        <figcaption>
          ${esc(image.caption)}
          <span class="credit"> - <a href="${esc(image.creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(image.credit)}</a></span>
        </figcaption>
      </figure>
      <div class="editorial-image-card-copy">
        <span class="archive-proof-kicker">Viragem institucional</span>
        <h3 class="archive-proof-title">Em 2025, o desperdício entrou no plano vinculativo</h3>
        <p class="archive-proof-text">O acordo político entre Conselho e Parlamento abriu caminho à Diretiva (UE) 2025/1892, que fixou metas obrigatórias para os Estados-Membros. A escala do problema continua doméstica; o enquadramento passou a ser europeu.</p>
        <div class="editorial-image-card-links">
          <a href="${esc(REFERENCES.euWasteDirective)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">Ler a diretiva</a>
          <a href="${esc(ARCHIVE_REFERENCES.eprsFoodWaste2025)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">Contexto legislativo</a>
        </div>
      </div>
    </aside>
  `;
}

function renderPrologueWink() {
  const image = EDITORIAL_IMAGES.prologueWink;
  return `
    <aside class="prologue-wink" data-animate="true">
      <img src="${esc(image.url)}" alt="${esc(image.alt)}" loading="lazy" class="prologue-wink-image">
      <div class="prologue-wink-copy">
        <div class="prologue-wink-kicker">A piada, visível</div>
        <p class="prologue-wink-text">${esc(image.caption)}</p>
        <p class="prologue-wink-credit"><a href="${esc(image.creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(image.credit)}</a></p>
      </div>
    </aside>
  `;
}

function renderVideoFeature(featured) {
  const article = (featured?.featured || []).find(item => item?.id === '2019-anna-dumpster-diving');
  if (!article) return '';

  const poster = EDITORIAL_IMAGES.annaVideoPoster.url;
  const archiveUrl = generateArquivoUrl(article) || article.arquivo_pt_url || article.url || '';
  const videoUrl = article.video_url || 'https://www.youtube.com/watch?v=1TNPzSRzTt4';
  const embedUrl = 'https://www.youtube-nocookie.com/embed/1TNPzSRzTt4?si=vv74TvnVzXrjQHxq';

  return `
    <div class="video-section">
      <div class="video-header">
        <span class="video-year">2019</span>
        <h4 class="video-title">Anna mergulha no lixo para combater o desperdício alimentar</h4>
        <p class="video-source">Público P3</p>
      </div>
      <div class="video-embed" data-video-stage>
        <button class="video-poster" type="button" data-video-src="${esc(embedUrl)}" aria-label="Reproduzir vídeo Anna mergulha no lixo para combater o desperdício alimentar">
          <img src="${esc(poster)}" alt="${esc(EDITORIAL_IMAGES.annaVideoPoster.alt)}" loading="lazy">
          <span class="video-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>
          <span class="video-poster-copy">
            <strong>Carregar vídeo</strong>
            <span>O poster é local. O embed só é pedido se escolheres reproduzir.</span>
          </span>
        </button>
      </div>
      <p class="video-credit">Poster local com crédito <a href="${esc(EDITORIAL_IMAGES.annaVideoPoster.creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(EDITORIAL_IMAGES.annaVideoPoster.credit)}</a>.</p>
      <div class="video-links">
        ${archiveUrl ? `<a href="${esc(archiveUrl)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">Abrir peça preservada</a>` : ''}
        <a href="${esc(videoUrl)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">Ver no YouTube</a>
      </div>
    </div>
  `;
}

// ==================== NEW CHART RENDER FUNCTIONS ====================

function renderDonutChart(data) {
  if (!data || !data.by_phase) return '';

  const phases = data.by_phase;
  const total = phases.reduce((sum, p) => sum + p.value, 0);
  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  // Distinct color palette for each phase
  const distinctColors = [
    '#ef4444', // red - households (danger)
    '#f59e0b', // amber - retail
    '#4ade80', // green - processing
    '#3b82f6', // blue - production
    '#8b5cf6', // purple - other
  ];

  // Calculate stroke dasharray for each segment
  let currentOffset = 0;
  const segments = phases.map((phase, idx) => {
    const percentage = phase.value / total;
    const dashArray = percentage * circumference;
    const dashOffset = -currentOffset;
    currentOffset += dashArray;

    return {
      ...phase,
      dashArray,
      dashOffset,
      color: distinctColors[idx] || distinctColors[idx % distinctColors.length]
    };
  });

  const highlightPhase = phases.find(p => p.id === 'households');
  const highlightIdx = phases.findIndex(p => p.id === 'households');

  return `
    <div class="donut-chart-container" data-animate="true" data-default-value="${highlightPhase?.value || 67}%" data-default-label="${esc(highlightPhase?.label || 'Em Casa')}">
      <div class="donut-chart-header">
        <h3 class="donut-chart-title">Onde nasce o desperdício?</h3>
        <p class="donut-chart-subtitle">Distribuição por fase da cadeia alimentar em Portugal (${data.metadata?.year || 2023})</p>
      </div>
      <div class="donut-chart-content">
        <div class="donut-chart-visual">
          <svg class="donut-svg" viewBox="0 0 240 240">
            ${segments.map((seg, idx) => `
              <circle
                class="donut-segment"
                data-index="${idx}"
                cx="120" cy="120" r="${radius}"
                stroke="${seg.color}"
                stroke-dasharray="0 ${circumference}"
                data-target-dasharray="${seg.dashArray} ${circumference - seg.dashArray}"
                data-dashoffset="${seg.dashOffset}"
                style="transform-origin: center; cursor: pointer;"
              />
            `).join('')}
          </svg>
          <div class="donut-center">
            <div class="donut-center-value" id="donutCenterValue">${highlightPhase?.value || 67}%</div>
            <div class="donut-center-label" id="donutCenterLabel">Em Casa</div>
          </div>
        </div>
        <div class="donut-legend">
          ${phases.map((phase, idx) => `
            <div class="donut-legend-item ${phase.id === 'households' ? 'highlight' : ''}" data-index="${idx}" data-value="${phase.value}" data-label="${esc(phase.label)}" role="button" tabindex="0" aria-label="Ver detalhe de ${esc(phase.label)}: ${phase.value}%">
              <div class="donut-legend-color" style="background: ${segments[idx].color}"></div>
              <div class="donut-legend-info">
                <div class="donut-legend-label">${esc(phase.label)}</div>
                <div class="donut-legend-insight">${esc(phase.insight)}</div>
              </div>
              <div class="donut-legend-value">${phase.value}%</div>
            </div>
          `).join('')}
        </div>
      </div>
      <p class="donut-caption">Dois terços do desperdício acontecem depois de a comida chegar a casa. O problema não está nas prateleiras, está nos nossos frigoríficos.</p>
      <p class="chart-source">Fonte: ${renderSourceReference(data.metadata?.source, data.metadata?.source_url || '', data.metadata?.year ? String(data.metadata.year) : '')}</p>
    </div>
  `;
}

function renderComparisonChart(data) {
  if (!data || !data.ranking) return '';

  const countries = data.ranking.slice(0, 10); // Top 10
  const maxValue = Math.max(...countries.map(c => c.value));
  const euAverage = data.eu_average || 131;
  const baselinePosition = (euAverage / maxValue) * 100;

  // Flag emojis by country code
  const flagEmojis = {
    CY: '🇨🇾', DK: '🇩🇰', PT: '🇵🇹', GR: '🇬🇷', BE: '🇧🇪',
    LU: '🇱🇺', IE: '🇮🇪', ES: '🇪🇸', PL: '🇵🇱', IT: '🇮🇹',
    FR: '🇫🇷', DE: '🇩🇪', NL: '🇳🇱', AT: '🇦🇹', SE: '🇸🇪',
    SI: '🇸🇮', HR: '🇭🇷', FI: '🇫🇮', SK: '🇸🇰', CZ: '🇨🇿',
    HU: '🇭🇺', RO: '🇷🇴', BG: '🇧🇬', EE: '🇪🇪', LV: '🇱🇻',
    LT: '🇱🇹', MT: '🇲🇹', EU: '🇪🇺'
  };

  return `
    <div class="comparison-chart" data-animate="true">
      <div class="comparison-chart-header">
        <h3 class="comparison-chart-title">Portugal no contexto europeu</h3>
        <p class="comparison-chart-subtitle">Desperdício alimentar per capita (kg/ano) — dados de ${data.metadata?.year || 2022}</p>
      </div>
      <div class="comparison-bars">
        ${countries.map((country, idx) => {
          const width = (country.value / maxValue) * 100;
          const isHighlight = country.highlight;
          const isBaseline = country.baseline;
          const flagEmoji = flagEmojis[country.code] || '🏳️';
          return `
            <div class="comparison-bar-row ${isHighlight ? 'highlight' : ''} ${isBaseline ? 'baseline' : ''}" style="--delay: ${idx * 0.1}s">
              <div class="comparison-bar-label">
                <span class="comparison-bar-flag-emoji">${flagEmoji}</span>
                <span>${esc(country.country)}</span>
              </div>
              <div class="comparison-bar-track">
                <div class="comparison-bar-fill" data-width="${width}" style="width: 0%"></div>
                ${isBaseline ? `<div class="comparison-baseline" style="left: ${baselinePosition}%"></div>` : ''}
              </div>
              <div class="comparison-bar-value">${country.value}</div>
            </div>
          `;
        }).join('')}
      </div>
      <p class="comparison-caption">Portugal desperdiça 41% mais que a média europeia. Estamos no pódio errado.</p>
      <p class="chart-source">Fonte: ${renderSourceReference(data.metadata?.source, data.metadata?.source_url || REFERENCES.euWasteFacts, data.metadata?.year ? String(data.metadata.year) : '')}</p>
    </div>
  `;
}

function renderCalloutAssertion(content, emphasis) {
  return `
    <div class="callout callout-assertion">
      <div class="callout-icon">!</div>
      <div class="callout-label">Dado-chave</div>
      <div class="callout-content">${esc(content)}</div>
      ${emphasis ? `<span class="callout-emphasis">${esc(emphasis)}</span>` : ''}
    </div>
  `;
}

function renderCalloutOpposing(perspective, content, response) {
  return `
    <div class="callout callout-opposing">
      <div class="callout-icon">?</div>
      <div class="callout-label">${esc(perspective || 'Contra-argumento')}</div>
      <div class="callout-content">${esc(content)}</div>
      ${response ? `<div class="callout-response"><strong>Resposta:</strong> ${esc(response)}</div>` : ''}
    </div>
  `;
}

function renderDefinitionBlock(term, definition, source) {
  return `
    <div class="definition-block">
      <div class="definition-term">${esc(term)}</div>
      <div class="definition-text">${esc(definition)}</div>
      ${source ? `<div class="definition-source">Fonte: ${esc(source)}</div>` : ''}
    </div>
  `;
}

function renderInitiativesGrid(data) {
  if (!data || !data.initiatives) return '';

  const initiatives = data.initiatives.filter(init => init.highlight_on_site !== false).slice(0, 4);

  return `
    <div class="initiatives-grid">
      ${initiatives.map(init => {
        const stats = init.current_stats || init.stats_portugal || init.stats || {};
        const options = [
          { value: stats.tonnes_saved_total, label: 'Toneladas salvas' },
          { value: stats.tonnes_saved_weekly_kg, label: 'Kg/semana' },
          { value: stats.surprise_bags_saved_total, label: 'Bags salvas' },
          { value: stats.meals_saved_total, label: 'Refeições salvas' },
          { value: stats.refeicoes_redistribuidas_mes, label: 'Refeições/mês' },
          { value: stats.beneficiarios_activos, label: 'Beneficiários' },
          { value: stats.familias_apoiadas_diariamente, label: 'Famílias/dia' }
        ].filter(option => option.value !== undefined && option.value !== null && option.value !== '');
        const mainMetric = options[0] || { value: '—', label: 'Impacto' };
        const startYear = init.founded || init.arrived_portugal || '—';
        const sourceMarkup = init.source
          ? `<p class="initiative-source">Fonte: <a href="${esc(init.source.url)}" target="_blank" rel="noopener noreferrer">${esc(init.source.label)}</a>${init.source.accessed_at ? ` — verificado em ${esc(init.source.accessed_at)}` : ''}</p>`
          : '';

        return `
          <div class="initiative-card">
            <div class="initiative-header">
              <span class="initiative-name">${esc(init.name)}</span>
              <span class="initiative-type">${esc(init.type)}</span>
            </div>
            <div class="initiative-stats">
              <div class="initiative-stat">
                <div class="initiative-stat-value">${typeof mainMetric.value === 'number' ? mainMetric.value.toLocaleString('pt-PT') : mainMetric.value}</div>
                <div class="initiative-stat-label">${mainMetric.label}</div>
              </div>
              <div class="initiative-stat">
                <div class="initiative-stat-value">${startYear}</div>
                <div class="initiative-stat-label">Ano de início</div>
              </div>
            </div>
            <div class="initiative-insight">${esc(init.key_insight)}</div>
            ${sourceMarkup}
          </div>
        `;
      }).join('')}
    </div>
    <p class="chart-source">${esc(data.metadata?.source_note || 'Fontes oficiais das próprias iniciativas.')}</p>
  `;
}

function renderProjectionChart(data) {
  if (!data || !data.scenarios) return '';

  const inertia = data.scenarios.find(s => s.id === 'inertia');
  const target30 = data.target_lines?.target_30;
  const target50 = data.target_lines?.target_50;

  // SVG dimensions
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const years = [2020, 2022, 2024, 2026, 2028, 2030];
  const xScale = (year) => padding.left + ((year - 2020) / 10) * chartWidth;
  const yScale = (value) => padding.top + chartHeight - ((value - 0.8) / 1.5) * chartHeight;

  // Generate path data
  const generatePath = (points) => {
    return points.map((p, i) => {
      const x = xScale(p.year);
      const y = yScale(p.tonnes);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const inertiaPath = generatePath(inertia?.projections || []);
  const target30Path = generatePath(target30?.values || []);
  const target50Path = generatePath(target50?.values || []);

  // Calculate path lengths for animation
  const calcPathLength = (points) => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = xScale(points[i].year) - xScale(points[i-1].year);
      const dy = yScale(points[i].tonnes) - yScale(points[i-1].tonnes);
      length += Math.sqrt(dx*dx + dy*dy);
    }
    return length;
  };

  const inertiaLength = calcPathLength(inertia?.projections || []);

  return `
    <div class="projection-chart" data-animate="true">
      <div class="projection-chart-header">
        <h3 class="projection-chart-title">Trajectória actual vs. metas 2030</h3>
        <p class="projection-chart-subtitle">Desperdício alimentar em Portugal (milhões de toneladas)</p>
      </div>
      <svg class="projection-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        ${[0.9, 1.2, 1.5, 1.8, 2.1].map(v => `
          <line x1="${padding.left}" y1="${yScale(v)}" x2="${width - padding.right}" y2="${yScale(v)}" stroke="var(--white-08)" stroke-width="1"/>
          <text x="${padding.left - 8}" y="${yScale(v) + 4}" fill="var(--white-30)" font-size="11" text-anchor="end">${v.toFixed(1)}</text>
        `).join('')}

        <!-- X axis labels -->
        ${years.map(year => `
          <text x="${xScale(year)}" y="${height - 10}" fill="var(--white-50)" font-size="11" text-anchor="middle">${year}</text>
        `).join('')}

        <!-- Target lines -->
        <path d="${target50Path}" class="projection-line target-50 animate-line" style="stroke-dasharray: 1000; stroke-dashoffset: 1000;"/>
        <path d="${target30Path}" class="projection-line target-30 animate-line" style="stroke-dasharray: 1000; stroke-dashoffset: 1000;"/>

        <!-- Actual trajectory -->
        <path d="${inertiaPath}" class="projection-line actual animate-line" stroke-width="4" style="stroke-dasharray: ${inertiaLength}; stroke-dashoffset: ${inertiaLength};"/>

        <!-- Points (hidden initially) -->
        ${(inertia?.projections || []).map((p, i) => `
          <circle cx="${xScale(p.year)}" cy="${yScale(p.tonnes)}" r="5" class="projection-point animate-point" stroke="var(--danger)" style="opacity: 0; --delay: ${0.5 + i * 0.15}s;"/>
        `).join('')}
      </svg>
      <div class="projection-legend">
        <div class="projection-legend-item">
          <div class="projection-legend-line actual"></div>
          <span>Trajectória actual</span>
        </div>
        <div class="projection-legend-item">
          <div class="projection-legend-line target-30" style="background: repeating-linear-gradient(90deg, var(--accent), var(--accent) 4px, transparent 4px, transparent 8px);"></div>
          <span>Meta UE -30%</span>
        </div>
        <div class="projection-legend-item">
          <div class="projection-legend-line target-50" style="background: repeating-linear-gradient(90deg, var(--warning), var(--warning) 2px, transparent 2px, transparent 4px);"></div>
          <span>Meta ODS -50%</span>
        </div>
      </div>
      <div class="projection-insight">
        Se nada mudar, em 2030 Portugal estará a desperdiçar <strong>mais</strong>, não menos. A linha vermelha não mente.
      </div>
      <p class="projection-caption">${esc(data.key_insight || '')}</p>
      <p class="chart-source">Fonte: <a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">Diretiva (UE) 2025/1892</a> e projecções editoriais</p>
    </div>
  `;
}

function renderCountdown(targetDate, message, subtext) {
  const targetDateStr = targetDate || '2030-12-31';

  return `
    <div class="countdown-block" data-animate="true" data-target-date="${targetDateStr}" data-message="${esc(message)}">
      <div class="countdown-value">
        <span class="countdown-digits" aria-label="0"></span>
      </div>
      <div class="countdown-label">${esc(message)}</div>
      <div class="countdown-subtext">${esc(subtext)}</div>
      <p class="chart-source">Meta: <a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">Diretiva (UE) 2025/1892</a></p>
    </div>
  `;
}

// Countdown animation helper
function initCountdowns() {
  const countdowns = $$('.countdown-block');

  countdowns.forEach(container => {
    const targetDateStr = container.dataset.targetDate;
    const originalMessage = container.dataset.message;
    if (!targetDateStr) return;

    const targetDate = new Date(targetDateStr);
    const digitsEl = container.querySelector('.countdown-digits');
    const labelEl = container.querySelector('.countdown-label');
    let animationFrame = 0;

    function stopAnimation() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      digitsEl.classList.remove('countdown-animating');
    }

    function setVisualDigits(value) {
      const rounded = Math.max(0, Math.round(value));
      digitsEl.style.setProperty('--countdown-num', rounded);
      digitsEl.setAttribute('aria-label', rounded.toLocaleString('pt-PT'));
    }

    function setStaticDigits(value) {
      stopAnimation();
      setVisualDigits(value);
    }

    function easeOutExpo(progress) {
      if (progress >= 1) return 1;
      return 1 - Math.pow(2, -10 * progress);
    }

    function animateDigits(value) {
      stopAnimation();
      const finalValue = Math.max(0, value);
      const duration = 1800;
      digitsEl.classList.add('countdown-animating');
      setVisualDigits(0);

      const start = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        setVisualDigits(finalValue * easeOutExpo(progress));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
          return;
        }
        animationFrame = 0;
        digitsEl.classList.remove('countdown-animating');
        setVisualDigits(finalValue);
      };

      animationFrame = requestAnimationFrame(step);
    }

    function updateCountdown(animate = false) {
      const now = new Date();
      const diff = targetDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const absDays = Math.abs(days);

      // Update label based on whether deadline passed
      if (days < 0) {
        labelEl.textContent = 'Dias desde o prazo europeu';
        container.classList.add('countdown-passed');
      } else {
        labelEl.textContent = originalMessage || 'Dias até ao prazo europeu';
        container.classList.remove('countdown-passed');
      }

      if (animate) {
        animateDigits(absDays);
      } else if (container.dataset.countdownAnimated === 'true') {
        setStaticDigits(absDays);
      }
    }

    container.__animateCountdown = () => {
      if (container.dataset.countdownAnimated === 'true') return;
      container.dataset.countdownAnimated = 'true';
      updateCountdown(true);
    };

    updateCountdown(false);

    if (container.classList.contains('in-view') || container.classList.contains('animated')) {
      container.__animateCountdown();
    }

    // Update every hour (in case page stays open)
    setInterval(() => updateCountdown(false), 3600000);
  });
}

function renderScenarios(data) {
  if (!data || !data.scenarios) return '';

  return `
    <div class="scenarios-grid">
      ${data.scenarios.map(scenario => {
        const isLikely = scenario.probability?.includes('provável');
        return `
          <div class="scenario-card ${isLikely ? 'likely' : ''}">
            <div class="scenario-header">
              <span class="scenario-name">${esc(scenario.name)}</span>
              <span class="scenario-probability">${esc(scenario.probability)}</span>
            </div>
            <p class="scenario-description">${esc(scenario.description)}</p>
            <div class="scenario-outcome">
              <div class="scenario-outcome-value">${scenario.outcome?.final_tonnes || '—'} Mt</div>
              <div class="scenario-outcome-label">em 2030</div>
            </div>
            <div class="scenario-verdict">${esc(scenario.verdict)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <p class="chart-source">Fonte: Projecções editoriais baseadas em <a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">Diretiva (UE) 2025/1892</a> e dados do <a href="https://arquivo.pt" target="_blank" rel="noopener noreferrer">corpus Público/Arquivo.pt</a></p>
  `;
}

function renderSummaryGrid(items) {
  const icons = {
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  };

  return `
    <div class="summary-grid" data-animate="true">
      ${items.map((item, idx) => `
        <div class="summary-item" style="--item-delay: ${idx * 0.08}s">
          <div class="summary-item-icon" aria-hidden="true">${icons[item.icon] || '<span>•</span>'}</div>
          <div class="summary-item-title">${esc(item.title)}</div>
          <div class="summary-item-text">${esc(item.text)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function getCoverageSummary(timeline) {
  const years = [...(timeline.by_year || [])];
  const peaks = [...(timeline.peaks || [])];
  const topYear = [...years].sort((a, b) => (b.count - a.count) || a.year.localeCompare(b.year))[0] || { year: '2023', count: 32 };
  const topPeak = peaks[0] || { month: '2023-12', count: 7 };
  const strongPeaks = peaks.filter(p => p.count >= 5).length;
  return { topYear, topPeak, strongPeaks };
}

function renderArchiveDependence(featured, deepArchive) {
  const featuredItems = [...(featured?.featured || [])]
    .filter(article => article?.url && article?.date && ((article.year || parseInt(article.date, 10)) <= 2014))
    .sort((a, b) => (a.year || 0) - (b.year || 0));

  const earlyCoverage = featuredItems[0] || null;
  const decisiveCoverage = featuredItems.find(article => /campo|f[aá]brica|fruta feia|caixotes/i.test(article.title || '')) || featuredItems[1] || null;
  const absenceProof = (deepArchive?.items || []).find(item => item?.archive_url) || null;

  const cards = [
    earlyCoverage ? {
      label: 'Recuperação',
      title: earlyCoverage.title,
      text: 'O Arquivo.pt permite recuperar cobertura antiga do Público que estrutura a cronologia do projecto e ancora a evolução do tema.',
      link: generateArquivoUrl(earlyCoverage),
      linkLabel: 'Ver versão preservada',
      note: `${earlyCoverage.year} · Público`
    } : null,
    absenceProof ? {
      label: 'Prova de ausência',
      title: absenceProof.title,
      text: 'A preservação histórica é metodologicamente decisiva porque permite mostrar que, antes de 2011, o tema surgia de forma dispersa e ainda sem cobertura consistente dedicada ao desperdício alimentar.',
      link: absenceProof.archive_url,
      linkLabel: 'Abrir prova no Arquivo.pt',
      note: `${absenceProof.year} · ${absenceProof.classification === 'noise' ? 'contexto disperso' : 'contexto indirecto'}`
    } : null,
    decisiveCoverage ? {
      label: 'Verificabilidade',
      title: decisiveCoverage.title,
      text: 'Cada afirmação central pode ser reaberta numa URL preservada, com data e contexto, reduzindo a dependência de memória, screenshots soltas ou links quebrados.',
      link: generateArquivoUrl(decisiveCoverage),
      linkLabel: 'Validar no Arquivo.pt',
      note: `${decisiveCoverage.year} · Público`
    } : null
  ].filter(Boolean);

  if (!cards.length) return '';

  return `
    <div class="archive-proof">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Sem Arquivo.pt este trabalho não existia</span>
        <h3 class="archive-proof-title">Porque este trabalho depende do Arquivo.pt</h3>
        <p class="archive-proof-text">O arquivo não serviu apenas para ilustrar a narrativa. Serviu para recuperar cobertura antiga, provar ausências e manter cada evidência reabrível e verificável.</p>
      </div>
      <div class="archive-proof-grid">
        ${cards.map(card => `
          <article class="archive-proof-card">
            <div class="archive-proof-label">${esc(card.label)}</div>
            <h4 class="archive-proof-card-title">${esc(card.title)}</h4>
            <p class="archive-proof-card-text">${esc(card.text)}</p>
            <div class="archive-proof-note">${esc(card.note)}</div>
            <a href="${esc(card.link)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">${esc(card.linkLabel)}</a>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPublicoCommitment(corpusIndex) {
  const cards = [
    {
      label: 'Página temática',
      title: 'O Público mantém hoje uma frente dedicada ao desperdício alimentar',
      text: 'A cobertura deixou de ser apenas episódica. Existe uma página temática própria que agrega peças recentes e torna o tema legível como continuidade editorial.',
      link: PUBLICO_EDITORIAL.themePageArchive || PUBLICO_EDITORIAL.themePageLive,
      linkLabel: 'Abrir página temática',
      note: PUBLICO_EDITORIAL.themePageArchive ? 'Público · captura preservada no Arquivo.pt' : 'Público · página temática'
    },
    ...PUBLICO_EDITORIAL.highlights.map(item => {
      const article = corpusIndex.get(String(item.articleId));
      if (!article) return null;
      const replayUrl = generateArquivoUrl(article);
      const published = fmtDate(article.published_at || article.date || '');
      return {
        label: item.label,
        title: article.title,
        text: item.text,
        link: replayUrl || article.url || '',
        linkLabel: replayUrl ? 'Ler versão preservada' : 'Ler artigo',
        note: `${published} · Público`
      };
    })
  ].filter(Boolean);

  if (!cards.length) return '';

  return `
    <div class="archive-proof publico-commitment">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Compromisso editorial</span>
        <h3 class="archive-proof-title">O Público tratou o tema como frente, não como episódio</h3>
        <p class="archive-proof-text">A continuidade não aparece apenas nos 127 artigos curados para este projecto. Aparece também no presente: numa página temática própria e numa sequência recente de peças que liga medição, comportamento doméstico e soluções práticas.</p>
      </div>
      <div class="archive-proof-grid">
        ${cards.map(card => `
          <article class="archive-proof-card">
            <div class="archive-proof-label">${esc(card.label)}</div>
            <h4 class="archive-proof-card-title">${esc(card.title)}</h4>
            <p class="archive-proof-card-text">${esc(card.text)}</p>
            <div class="archive-proof-note">${esc(card.note)}</div>
            <a href="${esc(card.link)}" target="_blank" rel="noopener noreferrer" class="archive-proof-link">${esc(card.linkLabel)}</a>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderUseCases() {
  const useCases = [
    {
      audience: 'Professores',
      title: 'Recurso para aulas de sustentabilidade e literacia mediática',
      text: 'Usar a linha do tempo, os casos do Arquivo.pt e o jogo para discutir consumo, arquivo web e responsabilidade pública.'
    },
    {
      audience: 'Jornalistas',
      title: 'Modelo replicável de investigação com arquivo web',
      text: 'Cruzar cobertura histórica, legislação e dados públicos para reconstruir agendas mediáticas e testar mudanças de linguagem.'
    },
    {
      audience: 'Investigadores',
      title: 'Corpus aberto para análise longitudinal',
      text: 'O projecto expõe dados, critérios de curadoria e validação final, facilitando reutilização, crítica e extensão metodológica.'
    },
    {
      audience: 'Cidadãos e ONG',
      title: 'Ferramenta prática de utilidade pública',
      text: 'Ajudar a perceber a escala do problema, localizar medidas concretas e transformar um arquivo jornalístico em serviço presente.'
    }
  ];

  return `
    <div class="use-cases">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Utilidade pública</span>
        <h3 class="archive-proof-title">Como usar este projecto</h3>
      </div>
      <div class="use-cases-grid">
        ${useCases.map(card => `
          <article class="use-case-card">
            <div class="use-case-audience">${esc(card.audience)}</div>
            <h4 class="use-case-title">${esc(card.title)}</h4>
            <p class="use-case-text">${esc(card.text)}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCulturalContext() {
  const cards = [
    {
      label: 'Reaproveitamento',
      title: 'A nossa cozinha também nasceu de excedentes bem aproveitados.',
      text: 'A história dos Ovos Moles de Aveiro é um bom lembrete cultural: as claras eram usadas para engomar os hábitos e as gemas, para não serem desperdiçadas, tornaram-se base de um doce conventual que hoje é património gastronómico.',
      note: 'Produtos Tradicionais Portugueses · Ovos Moles de Aveiro - IGP',
      sources: [
        { label: 'História do produto', url: ARCHIVE_REFERENCES.ovosMolesHistory }
      ]
    },
    {
      label: 'Hospitalidade',
      title: 'Mesa farta não precisa de significar comida a mais no lixo.',
      text: 'Liliana Sousa lembra que parte do desperdício em Portugal nasce da tradição da mesa farta, da compra por impulso e da confeção em excesso. Mas a mesma entrevista insiste noutra ideia decisiva: reduzir o desperdício é sinal de evolução, não de escassez.',
      note: 'Unidos Contra o Desperdício · entrevista com Liliana Sousa',
      sources: [
        { label: 'Entrevista preservada', url: ARCHIVE_REFERENCES.lilianaMesaFarta }
      ]
    }
  ];

  return `
    <div class="cultural-context cultural-context-compact" data-animate="true">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Cultura alimentar</span>
        <h3 class="archive-proof-title">A hospitalidade portuguesa conhece abundância, engenho e aproveitamento.</h3>
        <p class="archive-proof-text">A tradição da mesa portuguesa não é uma autorização para desperdiçar. É uma memória de partilha, invenção culinária e reaproveitamento que vale a pena recuperar.</p>
      </div>
      <div class="cultural-context-grid">
        ${cards.map((card, idx) => `
          <article class="cultural-context-card" style="--item-delay: ${idx * 0.08}s">
            <div class="cultural-context-illustration" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <div class="archive-proof-label">${esc(card.label)}</div>
            <h4 class="archive-proof-card-title">${esc(card.title)}</h4>
            <p class="archive-proof-card-text">${esc(card.text)}</p>
            <div class="archive-proof-note">${esc(card.note)}</div>
            <div class="energy-reflection-sources">
              ${card.sources.map(source => `
                <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" class="energy-reflection-source">${esc(source.label)}</a>
              `).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEnergyReflection() {
  const cards = [
    {
      label: 'Energia incorporada',
      title: 'Quando a comida desaparece, o custo físico não desaparece com ela.',
      text: 'O Parlamento Europeu sublinha que, quando um alimento é descartado, a energia e os recursos acumulados ao longo da cadeia continuam a existir sem qualquer benefício nutricional. No mesmo enquadramento, a UE associa o desperdício alimentar de 2022 a 254 milhões de toneladas de CO2 e a 342 mil milhões de metros cúbicos de água.',
      sources: [
        { label: 'Parlamento Europeu / EPRS, 2025', url: ARCHIVE_REFERENCES.eprsFoodWaste2025 },
        { label: 'UNEP, 2024', url: ARCHIVE_REFERENCES.unepFoodWaste }
      ]
    },
    {
      label: 'Hierarquia europeia',
      title: 'Compostar é melhor do que aterrar. Mas chega tarde.',
      text: 'A hierarquia europeia põe primeiro a prevenção na origem e a redistribuição para consumo humano. Só depois aparecem alimentação animal, usos industriais, reciclagem e recuperação de nutrientes, onde entram compostagem e biogás. O sentido é claro: tratar bem o resíduo importa, mas evitar que a comida se torne resíduo vale mais.',
      sources: [
        { label: 'Parlamento Europeu / EPRS, 2025', url: ARCHIVE_REFERENCES.eprsFoodWaste2025 },
        { label: 'Comissão Europeia', url: ARCHIVE_REFERENCES.euFoodWaste }
      ]
    },
    {
      label: 'O ponto decisivo',
      title: 'A pergunta certa não é apenas o que fazemos ao resíduo.',
      text: 'Se o desperdício alimentar é energia e recursos materializados, então a medida decisiva é o que evitamos perder antes do balde: comprar melhor, conservar melhor, redistribuir mais cedo e reduzir excedentes na origem. Tratar o resíduo conta. Evitar o resíduo conta mais.',
      sources: [
        { label: 'Parlamento Europeu / EPRS, 2025', url: ARCHIVE_REFERENCES.eprsFoodWaste2025 },
        { label: 'Comissão Europeia', url: ARCHIVE_REFERENCES.euFoodWaste }
      ]
    }
  ];

  return `
    <div class="energy-reflection" data-animate="true">
      <div class="archive-proof-header">
        <span class="archive-proof-kicker">Reflexão final</span>
        <h3 class="archive-proof-title">No fim, tudo isto é energia</h3>
        <p class="archive-proof-text">Comida deitada fora não é apenas comida perdida. É solo, água, refrigeração, transporte, processamento, trabalho e energia já gastos ao longo da cadeia.</p>
      </div>
      <div class="energy-reflection-grid">
        ${cards.map((card, idx) => `
          <article class="energy-reflection-card" style="--item-delay: ${idx * 0.08}s">
            <div class="energy-reflection-label">${esc(card.label)}</div>
            <h4 class="energy-reflection-title">${esc(card.title)}</h4>
            <p class="energy-reflection-text">${esc(card.text)}</p>
            <div class="energy-reflection-sources">
              ${card.sources.map(source => `
                <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" class="energy-reflection-source">
                  ${esc(source.label)}
                </a>
              `).join('')}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="energy-reflection-note">
        <p>Há ainda uma segunda ironia material nesta história: até a camada digital nos obriga a lembrar que a infraestrutura nunca é abstracta. A IEA estima que os centros de dados consumiram cerca de 415 TWh de electricidade em 2024 e podem aproximar-se de 945 TWh em 2030. A lição não é atacar tecnologia. É mais simples: por trás de quase tudo o que desperdiçamos, há sempre energia já comprometida.</p>
        <p class="chart-source">Fontes: ${renderSourceReference('IEA, 2025', ARCHIVE_REFERENCES.ieaEnergyAI, 'Arquivo.pt')} · ${renderSourceReference('FAO', ARCHIVE_REFERENCES.faoEnergy, 'Arquivo.pt')}</p>
      </div>
    </div>
  `;
}

// ==================== DEEP ARCHIVE ====================
function renderDeepArchive(data) {
  if (!data || !data.items) return '';

  const classificationLabels = {
    'noise': 'Ruído',
    'food-adjacent': 'Adjacente',
    'food-focused': 'Foco directo'
  };

  return `
    <div class="deep-archive" data-animate="true">
      <div class="deep-archive-header">
        <h3 class="deep-archive-title">Arquivo Profundo: 1999–2010</h3>
        <p class="deep-archive-subtitle">Antes de existir um recorte jornalístico estável, existiam referências dispersas. Os primeiros resultados do Arquivo.pt mostram um tema ainda sem cobertura consistente.</p>
      </div>
      <div class="deep-archive-insight">${esc(data.insight)}</div>
      <div class="deep-archive-timeline">
        ${data.items.map((item, idx) => `
          <div class="deep-archive-item ${item.classification}" style="--item-delay: ${idx * 0.12}s">
            <div class="deep-archive-item-header">
              <span class="deep-archive-year">${item.year}</span>
              <span class="deep-archive-classification ${item.classification}">${classificationLabels[item.classification] || item.classification}</span>
            </div>
            <div class="deep-archive-item-title">${esc(item.title)}</div>
            <div class="deep-archive-quote">"${esc(item.quote)}"</div>
            <div class="deep-archive-note">${esc(item.note)}</div>
            <a href="${item.archive_url}" target="_blank" rel="noopener noreferrer" class="deep-archive-link arquivo-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
              </svg>
              Ver no Arquivo.pt
            </a>
          </div>
        `).join('')}
      </div>
      <p class="deep-archive-insight" style="margin-top: 24px; border-left-color: var(--accent);">${esc(data.key_insight)}</p>
    </div>
  `;
}

// ==================== HISTORICAL CAROUSEL ====================
function renderHistoricalCarousel(articles) {
  if (!articles || articles.length === 0) return '';

  const sortedArticles = [...articles].sort((a, b) => {
    const yearA = a.year || parseInt(a.date?.slice(0, 4)) || 0;
    const yearB = b.year || parseInt(b.date?.slice(0, 4)) || 0;
    return yearA - yearB;
  });

  return `
    <div class="historical-carousel">
      <div class="carousel-header">
        <div>
          <h3 class="carousel-title">Linha do Tempo: Cobertura no Público</h3>
          <p class="carousel-subtitle">Uma seleção cronológica de peças do Público preservadas pelo Arquivo.pt</p>
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn" type="button" data-carousel-dir="-1" aria-label="Deslocar para a esquerda">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="carousel-btn" type="button" data-carousel-dir="1" aria-label="Deslocar para a direita">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="carousel-track" data-carousel-track>
        ${sortedArticles.map(article => {
          const year = article.year || article.date?.slice(0, 4) || 'N/A';
          const imageUrl = article.image?.url || buildImageFallbackDataUri(year);
          const arquivoUrl = generateArquivoUrl(article);
          const fallbackImage = buildImageFallbackDataUri(year);

          return `
            <article class="carousel-card">
              <img src="${imageUrl}" alt="${esc(article.title)}" class="carousel-card-image" loading="lazy" data-fallback-src="${fallbackImage}">
              <div class="carousel-card-content">
                <span class="carousel-card-year">${year}</span>
                <h4 class="carousel-card-title">${esc(article.title)}</h4>
                <p class="carousel-card-excerpt">${esc(article.key_narrative || article.key_quote || (article.key_stats ? article.key_stats.join(' • ') : ''))}</p>
                <div class="carousel-card-links">
                  <a href="${arquivoUrl}" target="_blank" rel="noopener noreferrer" class="arquivo-badge" title="Ver versão preservada no Arquivo.pt">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                    Arquivo.pt
                  </a>
                  <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="carousel-card-link">
                    Público
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ==================== LINGUISTIC ANALYSIS ====================
function renderLinguisticAnalysis(corpusData) {
  const analysis = corpusData?.metadata?.linguistic_analysis;
  const terms = analysis?.items || [];
  if (!terms.length) return '';

  const maxValue = Math.max(...terms.flatMap(term => (term.periods || []).map(period => period.count || 0)), 1);
  const periods = analysis.periods || [];

  return `
    <div class="linguistic-analysis" data-animate="true">
      <div class="linguistic-analysis-header">
        <h3 class="linguistic-analysis-title">A Linguagem Muda: Do Doméstico ao Sistémico</h3>
        <p class="linguistic-analysis-subtitle">Análise de termos em 127 artigos do Público sobre desperdício alimentar (2011-2026)</p>
      </div>
      <div class="linguistic-analysis-insight">
        O vocabulário desloca-se de preocupações domésticas ("sobras", "validade") para conceitos sistémicos ("emissões", "cadeia", "economia circular"). Esta leitura é calculada automaticamente sobre o corpus final, sem depender de notas editoriais externas.
        <cite style="display: block; margin-top: 8px; font-style: normal; font-size: 11px;">
          <a href="assets/data/corpus_core.json" target="_blank" rel="noopener noreferrer" style="color: var(--accent);">Fonte: corpus_core.json</a>
        </cite>
      </div>
      <div class="linguistic-grid">
        ${terms.map((t, termIdx) => {
          const trendLabel = t.trend === 'up' ? '↑' : '→';
          const trendClass = t.trend;
          return `
            <div class="linguistic-term-card" style="--item-delay: ${termIdx * 0.07}s">
              <div class="linguistic-term-name">
                "${t.term}"
                <span class="linguistic-term-trend ${trendClass}">${trendLabel}</span>
              </div>
              <div class="linguistic-periods">
                ${(t.periods || []).map((period, i) => {
                  const periodClasses = ['p1', 'p2', 'p3'];
                  const width = ((period.count || 0) / maxValue) * 100;
                  return `
                    <div class="linguistic-period">
                      <span class="linguistic-period-label">${period.label}</span>
                      <div class="linguistic-period-bar">
                        <div class="linguistic-period-fill ${periodClasses[i]}" style="width: ${width}%; --period-delay: ${termIdx * 0.07 + i * 0.1}s"></div>
                      </div>
                      <span class="linguistic-period-value">${period.count || 0}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="linguistic-legend">
        ${periods.map((period, idx) => `
          <div class="linguistic-legend-item">
            <span class="linguistic-legend-dot p${idx + 1}"></span>
            ${esc(period.label)}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==================== RENDER FULL CHAPTER ====================
function renderChapter(chapter, idx, data) {
  const { corpusData, corpusIndex, lawIndex, timeline, laws, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive } = data;
  const blocks = chapter.blocks || [];
  const kind = chapter.kind;
  const coverage = getCoverageSummary(timeline);
  const bundleBlocks = blocks.filter(block => block.type === 'evidence_bundle');
  const renderBundles = () => bundleBlocks.map(block =>
    renderEvidenceBundle(
      block.source_article_ids || [],
      corpusIndex,
      block.title || 'Fontes adicionais',
      block.subtitle || ''
    )
  ).join('');

  let html = renderChapterHeader(chapter, idx);

  // PROLOGUE
  if (kind === 'prologue') {
    html += renderPrologueWink();
    html += renderBigQuote(
      "A cozinha é o palco onde o desperdício se disfarça de hábito. Bruxelas é o lugar onde a responsabilidade se disfarça de processo. Entre os dois, a comida desaparece.",
      "desperdicio.pt, 2026"
    );

    html += `<div class="prose">
      <p>Quase ninguém se orgulha de desperdiçar comida. Mas a reprovação moral ainda não travou a escala do problema: em Portugal, <strong>cerca de 1,93 milhões de toneladas de alimentos</strong> acabam no lixo por ano. Na leitura europeia usada pelo Parlamento Europeu para 2022, isso correspondia a cerca de <strong>184 quilos por pessoa</strong>. <cite><a href="${ARCHIVE_REFERENCES.publicoWaste2025Families}" target="_blank" rel="noopener noreferrer">Público / dados de 2023</a> · <a href="${REFERENCES.euWasteFacts}" target="_blank" rel="noopener noreferrer">Parlamento Europeu / Eurostat, 2022</a></cite></p>
      <p>Este editorial documenta <em>127 artigos do Público</em>, publicados entre 2011 e 2026 e preservados pelo Arquivo.pt, cruzando-os com <em>20 diplomas legais</em> de Portugal e da União Europeia. O objectivo: mostrar como um problema de cozinha se transformou em problema de Estado, e porque ainda estamos longe de o resolver.</p>
    </div>`;

    // Main stats grid
    html += renderStatsGrid([
      { value: '127', label: 'Artigos Analisados', color: 'accent', note: 'Publico 2011-2026' },
      { value: '184kg', label: 'Desperdício/Pessoa', color: 'warning', note: 'Por ano em Portugal' },
      { value: '20', label: 'Diplomas Legais', color: 'eu', note: 'PT + UE' },
      { value: '4.º', label: 'Lugar na UE', color: 'danger', note: 'Mais desperdício' }
    ]);

    // Waste breakdown donut chart
    if (wasteBreakdown) {
      html += renderCalloutAssertion(
        'Dois terços do desperdício acontecem depois de a comida chegar a casa.',
        'O problema não está só nas empresas. Está nas nossas cozinhas.'
      );
      html += renderDonutChart(wasteBreakdown);
      html += renderDomesticEditorial(corpusData);
    }

    // EU comparison chart
    if (euComparison) {
      html += `<div class="prose">
        <h3>Portugal no contexto europeu</h3>
        <p>Com <strong>184 kg per capita</strong>, Portugal é o <em>4.º país da UE que mais desperdiça alimentos</em>, 40% acima da média europeia. Só Chipre, Dinamarca e Grécia apresentam valores mais elevados. <cite><a href="${REFERENCES.euWasteFacts}" target="_blank" rel="noopener noreferrer">Parlamento Europeu / Eurostat, 2022</a></cite></p>
      </div>`;
      html += renderComparisonChart(euComparison);
    }

    // Year chart - media coverage evolution
    html += `<div class="prose">
      <h3>A evolução da atenção mediática</h3>
      <p>A cobertura jornalística do tema <strong>cresceu de forma estrutural</strong>: de apenas 1 artigo em 2011 para <em>${coverage.topYear.count} artigos em ${coverage.topYear.year}</em>, o ano de maior atenção. O desperdício alimentar ganhou peso progressivo e passou a ocupar um lugar estável na agenda pública.</p>
    </div>`;

    html += renderStatsGrid([
      { value: String(coverage.topYear.count), label: `Artigos em ${coverage.topYear.year}`, color: 'warning', note: 'Ano recorde' },
      { value: String(coverage.topPeak.count || 7), label: 'Pico Mensal', color: 'danger', note: fmtMonthLabel(coverage.topPeak.month) || 'Dez 23' },
      { value: String(coverage.strongPeaks || 0), label: 'Picos >=5', color: 'accent', note: 'Meses de pico' },
      { value: String((timeline.by_year || []).length || 14), label: 'Anos com Cobertura', color: 'eu', note: '2011-2026' }
    ]);

    html += renderYearChart(timeline);

    // Projections chart
    if (projections) {
      html += `<div class="prose">
        <h3>Três cenários para 2030</h3>
        <p>A União Europeia obriga Portugal a reduzir o desperdício em <strong>30% até 2030</strong>. A meta dos ODS é ainda mais ambiciosa: <em>50%</em>. Mas qual é o cenário mais provável? <cite><a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">Diretiva (UE) 2025/1892</a></cite></p>
      </div>`;
      html += renderEUProcessCard();
      html += renderProjectionChart(projections);
      html += renderCountdown(
        projections.countdown?.target_date || '2030-12-31',
        'Dias até ao prazo europeu',
        'Meta: redução de 30% no desperdício alimentar'
      );
      html += renderScenarios(projections);
    }

    // Initiatives impact
    if (initiatives) {
      html += `<div class="prose">
        <h3>A sociedade civil em acção</h3>
        <p>Enquanto o Estado avança devagar, iniciativas civis e plataformas de redistribuição já operam em escala. A Fruta Feia liga produtores a consumidores, a Too Good To Go reencaminha excedentes do retalho e da restauração, e a Refood redistribui refeições diariamente. O problema não está sem resposta: já existe infra-estrutura cívica para agir.</p>
      </div>`;
      html += renderInitiativesGrid(initiatives);
      html += renderVideoFeature(featured);
    }

    // Linguistic analysis - vocabulary shift over time
    html += `<div class="prose">
      <h3>Como Mudou o Discurso</h3>
      <p>A análise do corpus final revela uma transformação profunda: o vocabulário deslocou-se de preocupações domésticas ("sobras", "validade") para conceitos sistémicos ("emissões", "cadeia", "economia circular"). Esta mudança reflecte a politização do tema e aparece directamente nos 127 artigos curados.</p>
    </div>`;
    html += renderLinguisticAnalysis(corpusData);

    // Add the EU infographic
    html += renderInfographic(
      EU_IMAGES.wasteByCountry,
      "Portugal é o 4.º país da UE que mais desperdiça",
      "Desperdício alimentar por pessoa em cada país da UE em 2022. Portugal regista 184 kg per capita.",
      "Parlamento Europeu / Eurostat, 2022",
      `Na leitura do Parlamento Europeu para 2022, Espanha surge entre os países com menor desperdício alimentar por habitante. O contraste ibérico serve apenas para lembrar isto: o desperdício não é um destino cultural fixo.`
    );

    // Summary grid
    html += renderSummaryGrid([
      { icon: 'alert', title: '1,93 Mt/ano', text: 'Desperdício total em Portugal (2023)' },
      { icon: 'chart', title: '67%', text: 'Ocorre em casa, não nas empresas' },
      { icon: 'globe', title: '4.º na UE', text: '40% acima da média europeia' },
      { icon: 'target', title: '-30%', text: 'Meta obrigatória para 2030' }
    ]);

    html += renderArchiveDependence(featured, deepArchive);

    // Deep archive (1999-2010)
    if (deepArchive) {
      html += renderDeepArchive(deepArchive);
    }

    // Historical carousel
    if (featured?.featured) {
      html += renderHistoricalCarousel(featured.featured);
    }

    html += renderPublicoCommitment(corpusIndex);

    // Evidence cards
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(getEvidenceIds(chapter.chapter_id, evidenceBlock.source_article_ids || []), corpusIndex, "Artigos Fundacionais");
    }
    html += renderBundles();
  }

  // PEAK WAVE
  else if (kind === 'peak_wave') {
    const peakMonth = chapter.meta?.peak_month || '';
    const [year, month] = peakMonth.split('-');
    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthName = monthNames[parseInt(month)] || month;

    const peakData = (timeline.peaks || []).find(p => p.month === peakMonth);
    const count = peakData?.count || 0;

    // Calculate year total for context
    const yearData = (timeline.by_year || []).find(y => y.year === year);
    const yearTotal = yearData?.count || 0;

    // Get peak rank
    const peakRank = (timeline.peaks || []).findIndex(p => p.month === peakMonth) + 1;

    html += `
      <div class="peak-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        ${count} artigos publicados em ${monthName} de ${year} • ${peakRank}º maior pico
      </div>
    `;

    // Different context based on which peak wave this is
    const peakContexts = {
      '2023-12': `<p>Dezembro de 2023 marcou o <strong>maior pico de cobertura</strong> de toda a nossa análise. O que aconteceu? A combinação de vários factores: a época natalícia, o balanço de fim de ano da estratégia nacional e a pressão crescente das metas europeias para 2030.</p>
      <p>Foi um momento de concentração editorial raro: num só mês, o tema deixou de soar ocasional e passou a parecer estrutural.</p>`,
      '2025-09': `<p>Setembro de 2025 trouxe um dos maiores picos do período. O gatilho: a aprovação da Diretiva (UE) 2025/1892, que introduziu pela primeira vez <em>metas obrigatórias de redução</em> para todos os Estados-Membros. <cite><a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">EUR-Lex</a></cite></p>
      <p>Portugal terá de reduzir 30% do desperdício no retalho e consumo até 2030. A lei já não é recomendação. É obrigação.</p>`,
      '2023-10': `<p>Outubro de 2023 antecipou o pico de dezembro. O Dia Mundial da Alimentação é um catalisador anual de atenção mediática, mas em 2023 coincidiu com novos dados sobre Portugal ser o 4.º país da UE que mais desperdiça.</p>
      <p>A narrativa mudou: de apelos genéricos a um diagnóstico mais exigente sobre a urgência do problema.</p>`
    };

    html += `<div class="prose">
      ${peakContexts[peakMonth] || `<p>Em ${monthName.toLowerCase()} de ${year}, o tema do desperdício alimentar voltou a ocupar as páginas do Público com ${count} artigos. Estes picos de atenção coincidem com momentos legislativos — novas directivas europeias, relatórios anuais, dias internacionais de consciencialização.</p>
      <p>A pergunta que fica: <em>cresce o desperdício, ou cresce apenas a conversa sobre ele?</em></p>`}
    </div>`;

    // Stats for this peak
    html += renderStatsGrid([
      { value: count.toString(), label: 'Artigos no Mês', color: 'warning', note: peakMonth },
      { value: yearTotal.toString(), label: 'Total no Ano', color: 'accent', note: year },
      { value: `${Math.round((count/yearTotal)*100)}%`, label: 'Do Ano', color: 'eu', note: 'Concentração' },
      { value: `#${peakRank}`, label: 'Ranking', color: 'danger', note: 'Entre todos os picos' }
    ]);

    html += renderMonthChart(timeline, peakMonth);

    // Evidence cards for this peak
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(evidenceBlock.source_article_ids || [], corpusIndex, `Artigos de ${monthName} ${year}`);
    }
    html += renderBundles();
  }

  // INSTITUTIONAL - PORTUGAL
  else if (chapter.chapter_id === 'ch-portugal-estado') {
    html += renderBigQuote(
      "A partir de 2024, tornou-se ilegal descartar alimentos proprios para consumo quando existam meios seguros de redistribuição.",
      "Decreto-Lei 102-D/2020"
    );

    html += `<div class="prose">
      <p>O desperdício alimentar deixou de ser apenas uma questão moral para se tornar <strong>obrigação legal</strong>. Em Portugal, o caminho começou em 2015 com uma resolução parlamentar que declarou 2016 o "Ano Nacional do Combate ao Desperdício Alimentar". Foi o primeiro passo de uma década de transformação legislativa. <cite><a href="https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID=39802" target="_blank" rel="noopener noreferrer">Resolução 65/2015</a></cite></p>
      <p>Em 2018, o Governo aprovou a <em>Estratégia Nacional e Plano de Acção de Combate ao Desperdício Alimentar (ENCDA)</em>, com uma visão ambiciosa: "Desperdício Alimentar Zero". A estratégia define três eixos — prevenção, redução e monitorização — desdobrados em 14 medidas concretas. <cite><a href="https://cncda.gov.pt/index.php/encda" target="_blank" rel="noopener noreferrer">CNCDA</a></cite></p>
      <p>O salto qualitativo chegou em 2020 com o Decreto-Lei 102-D. Este diploma não se limita a recomendar: <strong>obriga</strong>. Estabelece metas de redução de 25% até 2025 e 50% até 2030. E, crucialmente, a partir de 2024, proíbe o descarte de alimentos próprios para consumo quando existam alternativas de redistribuição. <cite><a href="https://diariodarepublica.pt/dr/detalhe/decreto-lei/102-d-2020-150908012" target="_blank" rel="noopener noreferrer">DRE</a></cite></p>
    </div>`;

    html += renderStatsGrid([
      { value: '-25%', label: 'Meta 2025', color: 'accent', note: 'Face a 2020' },
      { value: '-50%', label: 'Meta 2030', color: 'accent', note: 'Face a 2020' },
      { value: '2024', label: 'Proibição', color: 'warning', note: 'Descarte de comida boa' },
      { value: '14', label: 'Medidas', color: 'eu', note: 'ENCDA' }
    ]);

    html += `<div class="prose">
      <p>A Lei 62/2021 completou o quadro: estabeleceu o regime jurídico da doação de géneros alimentícios, <em>vedando cláusulas contratuais que impeçam doações</em>. Integrou ainda a educação sobre desperdício alimentar nos currículos escolares. <cite><a href="https://diariodarepublica.pt/dr/detalhe/lei/62-2021-169869772" target="_blank" rel="noopener noreferrer">DRE</a></cite></p>
      <p>O resultado: Portugal tem hoje um dos quadros legais mais completos da Europa para combater o desperdício. O desafio está agora em transformar esse enquadramento em execução continuada.</p>
    </div>`;

    // Render key Portuguese laws from the legislation data
    const ptLaws = laws.filter(l =>
      l.jurisdiction === 'Portugal' &&
      l.scope === 'direct'
    ).slice(0, 4);

    ptLaws.forEach(law => {
      html += renderLawCard({ law_id: law.law_id, ...law }, lawIndex);
    });

    // Evidence
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(getEvidenceIds(chapter.chapter_id, evidenceBlock.source_article_ids || []), corpusIndex, "Cobertura em Portugal");
    }
    html += renderBundles();
  }

  // INSTITUTIONAL - BRUSSELS
  else if (chapter.chapter_id === 'ch-bruxelas-metodo') {
    html += renderBigQuote(
      "Sem método, o problema vira opinião. Com método, vira comparação. Com meta, vira política.",
      "desperdicio.pt"
    );

    html += `<div class="prose">
      <p>Foi este o percurso da União Europeia: primeiro harmonizar a forma de medir, depois estabelecer metas vinculativas. A jornada começou em 2018, quando a Directiva 2018/851 introduziu a <strong>primeira definição europeia de "resíduos alimentares"</strong> e obrigou todos os Estados-Membros a monitorizar anualmente. <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32018L0851" target="_blank" rel="noopener noreferrer">EUR-Lex</a></cite></p>
      <p>Em 2019, a Comissão publicou a metodologia comum de medição. Em 2020, a Estratégia do Prado ao Prato anunciou a intenção de metas vinculativas. E em Setembro de 2025, a Diretiva (UE) 2025/1892 consumou essa promessa: <em>metas obrigatórias de redução para todos os países da UE</em>. <cite><a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">EUR-Lex</a></cite></p>
    </div>`;

    html += renderFullImage(
      EU_IMAGES.hero,
      "O desperdício alimentar é um dos maiores desafios ambientais da Europa",
      "Parlamento Europeu"
    );

    html += `<div class="prose">
      <p>Os números são brutais: a UE gera dezenas de milhões de toneladas de resíduos alimentares por ano, com Portugal acima da média europeia e na <em>4.ª posição entre os países que mais desperdiçam</em>. <cite><a href="${REFERENCES.euWasteFacts}" target="_blank" rel="noopener noreferrer">Parlamento Europeu / Eurostat, 2022</a></cite></p>
      <p>As novas metas europeias são ambiciosas mas exequíveis: redução de 10% no processamento industrial e 30% per capita no retalho e consumo até 2030. Quem não cumprir, enfrenta procedimentos por incumprimento. <cite><a href="${REFERENCES.euWasteDirective}" target="_blank" rel="noopener noreferrer">EUR-Lex</a></cite></p>
    </div>`;

    html += renderTargets();

    html += renderStatsGrid([
      { value: '58M', label: 'Toneladas/Ano', color: 'danger', note: 'Total UE' },
      { value: '131kg', label: 'Per Capita UE', color: 'warning', note: 'Média europeia' },
      { value: '184kg', label: 'Per Capita PT', color: 'danger', note: 'Acima da média' },
      { value: '2030', label: 'Prazo Final', color: 'eu', note: 'Metas vinculativas' }
    ]);

    html += renderODSBadge();

    html += `<div class="prose">
      <p>O ODS 12.3 é o farol: reduzir para metade o desperdício alimentar per capita até 2030. A Europa transformou esse objectivo global em lei — agora cabe aos Estados-Membros transformar a lei em prática. <cite><a href="https://sdgs.un.org/goals/goal12" target="_blank" rel="noopener noreferrer">ONU</a></cite></p>
    </div>`;

    // Render key EU laws from legislation data
    const euLaws = laws.filter(l =>
      l.jurisdiction === 'EU' &&
      l.scope === 'direct'
    ).slice(0, 4);

    euLaws.forEach(law => {
      html += renderLawCard({ law_id: law.law_id, ...law }, lawIndex);
    });

    // Evidence
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(getEvidenceIds(chapter.chapter_id, evidenceBlock.source_article_ids || []), corpusIndex, "Contexto Europeu e Metas");
    }
    html += renderBundles();
  }

  // EPILOGUE
  else if (kind === 'epilogue') {
    html += renderBigQuote(
      "A mudança já começou. Falta acelerar.",
      "desperdicio.pt, 2026"
    );

    html += `<div class="prose">
      <p>Este editorial documenta uma transformação visível entre 2011 e 2026. Em 2011, o desperdício alimentar ainda tinha presença limitada como tema autónomo. Hoje, temos leis, metas vinculativas, e uma sociedade civil mobilizada. A Fruta Feia já opera em dezenas de toneladas por semana, a Too Good To Go salvou milhões de bolsas de comida em Portugal e a Refood apoia famílias diariamente.</p>
      <p>São 127 artigos datados do Público que documentam esta mudança, preservados pelo Arquivo.pt. São 20 diplomas legais que provam que o Estado ouviu. <strong>O problema entrou na agenda. Agora precisa de sair das manchetes e entrar nas cozinhas.</strong></p>
    </div>`;

    html += renderStatsGrid([
      { value: '27 t/sem', label: 'Fruta Feia', color: 'accent', note: 'Escala semanal' },
      { value: '20', label: 'Leis', color: 'eu', note: 'PT + UE desde 2015' },
      { value: String(coverage.topYear.count), label: `Artigos ${coverage.topYear.year}`, color: 'warning', note: 'Recorde de atenção' },
      { value: '2030', label: 'Meta', color: 'accent', note: '-30% obrigatório' }
    ]);

    html += `<div class="prose">
      <p>O que mudou neste período? <em>Muito.</em> Temos hoje um quadro legal que em 2011 não existia. Temos iniciativas que salvam milhares de toneladas. Temos consciência crescente, como prova o recorde de cobertura atingido em ${coverage.topYear.year}.</p>
      <p>Mas ainda desperdiçamos 184 kg por pessoa, por ano. <strong>A infraestrutura está montada. Falta cada um de nós usá-la.</strong> <cite><a href="${REFERENCES.euWasteFacts}" target="_blank" rel="noopener noreferrer">Parlamento Europeu / Eurostat, 2022</a></cite></p>
    </div>`;

    html += renderBigQuote(
      "O próximo passo não é uma nova lei. É abrir o frigorífico com outros olhos.",
      "desperdicio.pt"
    );

    html += renderEnergyReflection();
    html += renderBigQuote(
  'Numa casa portuguesa fica bem<br />\
Pão e vinho sobre a mesa<br />\
E se à porta humildemente bate alguém<br />\
Senta-se à mesa com a gente<br />\
Fica bem essa franqueza, fica bem<br />\
Que o povo nunca a desmente<br />\
A alegria da pobreza<br />\
Está nesta grande riqueza<br />\
De dar e ficar contente',
  'Amália Rodrigues'
);  
    html += renderFullImage(
      EDITORIAL_IMAGES.epilogueClosure.url,
      EDITORIAL_IMAGES.epilogueClosure.caption,
      EDITORIAL_IMAGES.epilogueClosure.credit,
      EDITORIAL_IMAGES.epilogueClosure.creditUrl
    );

    html += renderBigQuote(
      "Hoje, na próxima refeição, antes de o alimento se transformar em resíduo e em energia perdida.",
      "desperdicio.pt"
    );

    html += renderBundles();
  }

  // Default handling for other chapter types
  else {
    blocks.forEach(block => {
      if (block.type === 'text') {
        html += `<div class="prose"><p>${esc(block.content)}</p></div>`;
      }
      if (block.type === 'law') {
        html += renderLawCard(block.content, lawIndex);
      }
      if (block.type === 'evidence_cards') {
        html += renderEvidenceCards(block.source_article_ids || [], corpusIndex);
      }
      if (block.type === 'evidence_bundle') {
        html += renderEvidenceBundle(block.source_article_ids || [], corpusIndex, block.title || 'Fontes adicionais', block.subtitle || '');
      }
    });
  }

  html += '<div class="divider"></div>';

  return `<section class="chapter" id="${esc(chapter.chapter_id || `ch-${idx}`)}">${html}</section>`;
}

// ==================== NAVIGATION ====================
function renderNavLinks(chapters) {
  const mainChapters = normalizeChapters(chapters).filter(ch =>
    ch.kind === 'prologue' || ch.kind === 'institutional' || ch.kind === 'epilogue'
  );

  // Single-word labels for nav based on chapter_id
  const navLabels = {
    'ch-prologo': 'Início',
    'ch-portugal-estado': 'Portugal',
    'ch-bruxelas-metodo': 'Europa',
    'ch-epilogo': 'Fecho'
  };

  return mainChapters.map(ch => {
    const label = navLabels[ch.chapter_id] || ch.title.split(' ')[0];
    return `<li><a href="#${esc(ch.chapter_id)}" data-nav-target="${esc(ch.chapter_id)}">${esc(label)}</a></li>`;
  }).join('');
}

function renderFooterChapters(chapters) {
  return normalizeChapters(chapters).slice(0, 6).map(ch => `
    <li><a href="#${esc(ch.chapter_id)}">${esc(ch.title)}</a></li>
  `).join('');
}

// ==================== SCROLL ANIMATIONS ====================
function initAnimations() {
  const chapters = $$('.chapter');
  const nav = $('#nav');
  const navLinks = [...$$('#navLinks a[data-nav-target]')];
  let navTicking = false;

  function setActiveNavLink(chapterId) {
    navLinks.forEach(link => {
      const isActive = link.dataset.navTarget === chapterId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function syncActiveChapter() {
    if (!navLinks.length) return;

    const visibleTrackedChapters = chapters
      .filter(chapter => navLinks.some(link => link.dataset.navTarget === chapter.id))
      .map(chapter => ({ chapter, top: chapter.getBoundingClientRect().top }))
      .filter(item => item.top <= window.innerHeight * 0.4);

    const candidate = (visibleTrackedChapters[visibleTrackedChapters.length - 1] || {}).chapter || chapters[0];
    if (candidate?.id) {
      setActiveNavLink(candidate.id);
    }
  }

  function updateNavFrame() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 100);
    }
    syncActiveChapter();
    navTicking = false;
  }

  // Make first chapter visible immediately
  if (chapters.length > 0) {
    chapters[0].classList.add('visible');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

  chapters.forEach(el => observer.observe(el));

  syncActiveChapter();
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(updateNavFrame);
      navTicking = true;
    }
  }, { passive: true });

  function activateAnimatedBlock(target) {
    if (!target || target.classList.contains('animated')) return;
    target.classList.add('in-view', 'animated');

    if (target.classList.contains('comparison-chart')) {
      const bars = target.querySelectorAll('.comparison-bar-fill');
      bars.forEach(bar => {
        const targetWidth = bar.dataset.width;
        bar.style.setProperty('--target-width', targetWidth + '%');
        setTimeout(() => {
          bar.style.width = targetWidth + '%';
        }, 100);
      });
    }

    if (target.classList.contains('donut-chart-container')) {
      const segments = target.querySelectorAll('.donut-segment');
      segments.forEach((seg, idx) => {
        setTimeout(() => {
          const targetDasharray = seg.dataset.targetDasharray;
          const dashoffset = seg.dataset.dashoffset;
          seg.style.strokeDasharray = targetDasharray;
          seg.style.strokeDashoffset = dashoffset;
        }, idx * 150);
      });
    }

    if (target.classList.contains('projection-chart')) {
      const lines = target.querySelectorAll('.animate-line');
      lines.forEach((line, idx) => {
        setTimeout(() => {
          line.style.strokeDashoffset = '0';
        }, idx * 300);
      });

      const points = target.querySelectorAll('.animate-point');
      points.forEach(point => {
        point.style.opacity = '1';
      });
    }

    if (target.classList.contains('countdown-block') && typeof target.__animateCountdown === 'function') {
      target.__animateCountdown();
    }
  }

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      activateAnimatedBlock(entry.target);
      chartObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  const animatedBlocks = $$('[data-animate="true"]');
  animatedBlocks.forEach(el => chartObserver.observe(el));
  animatedBlocks.forEach(el => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08) {
      activateAnimatedBlock(el);
      chartObserver.unobserve(el);
    }
  });

  function highlightDonutLegendItem(legendItem) {
    const container = legendItem?.closest('.donut-chart-container');
    if (!container) return;

    const idx = legendItem.dataset.index;
    const value = legendItem.dataset.value;
    const label = legendItem.dataset.label;

    const centerValue = container.querySelector('#donutCenterValue');
    const centerLabel = container.querySelector('#donutCenterLabel');

    if (centerValue) centerValue.textContent = `${value}%`;
    if (centerLabel) centerLabel.textContent = label;

    const segments = container.querySelectorAll('.donut-segment');
    segments.forEach((seg, i) => {
      seg.style.opacity = i == idx ? '1' : '0.4';
      seg.style.strokeWidth = i == idx ? '38' : '32';
    });
  }

  function resetDonutLegendItem(legendItem) {
    const container = legendItem?.closest('.donut-chart-container');
    if (!container) return;

    const centerValue = container.querySelector('#donutCenterValue');
    const centerLabel = container.querySelector('#donutCenterLabel');
    const defaultValue = container.dataset.defaultValue || '67%';
    const defaultLabel = container.dataset.defaultLabel || 'Em Casa';

    if (centerValue) centerValue.textContent = defaultValue;
    if (centerLabel) centerLabel.textContent = defaultLabel;

    const segments = container.querySelectorAll('.donut-segment');
    segments.forEach(seg => {
      seg.style.opacity = '1';
      seg.style.strokeWidth = '32';
    });
  }

  ['mouseover', 'focusin'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
      const legendItem = e.target.closest('.donut-legend-item');
      if (legendItem) {
        highlightDonutLegendItem(legendItem);
      }
    });
  });

  ['mouseout', 'focusout'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
      const legendItem = e.target.closest('.donut-legend-item');
      if (legendItem) {
        resetDonutLegendItem(legendItem);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    const legendItem = e.target.closest('.donut-legend-item');
    if (!legendItem) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      highlightDonutLegendItem(legendItem);
    }
  });
}

function initInteractiveMedia() {
  document.addEventListener('click', (e) => {
    const videoPoster = e.target.closest('.video-poster[data-video-src]');
    if (videoPoster) {
      const stage = videoPoster.closest('[data-video-stage]');
      const videoSrc = videoPoster.dataset.videoSrc || '';
      if (stage && videoSrc) {
        stage.innerHTML = `
          <iframe
            width="560"
            height="315"
            src="${esc(videoSrc)}"
            title="Anna mergulha no lixo para combater o desperdício alimentar"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>
        `;
      }
      return;
    }

    const button = e.target.closest('.carousel-btn[data-carousel-dir]');
    if (!button) return;

    const carousel = button.closest('.historical-carousel');
    const track = carousel?.querySelector('[data-carousel-track]');
    if (!track) return;

    const direction = parseInt(button.dataset.carouselDir || '0', 10) || 0;
    track.scrollBy({ left: direction * 340, behavior: 'smooth' });
  });

  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('carousel-card-image')) return;

    const fallbackSrc = img.dataset.fallbackSrc;
    if (fallbackSrc && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  }, true);
}

// ==================== MAIN ====================
async function init() {
  try {
    const [storyline, corpusData, timeline, legislation, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive] = await Promise.all([
      fetchFirst(FILES.storyline),
      fetchFirst(FILES.corpusCore).catch(() => ({ items: [] })),
      fetchJson(FILES.timeline),
      fetchJson(FILES.legislation),
      fetchJson(FILES.wasteBreakdown).catch(() => null),
      fetchJson(FILES.euComparison).catch(() => null),
      fetchJson(FILES.initiatives).catch(() => null),
      fetchJson(FILES.projections).catch(() => null),
      fetchJson(FILES.featured).catch(() => null),
      fetchJson(FILES.deepArchive).catch(() => null)
    ]);

    // Build indexes
    const corpusIndex = new Map();
    const appendix = storyline.appendix || {};
    (corpusData.items || []).forEach(item => {
      if (item?.article_id) corpusIndex.set(String(item.article_id), item);
    });

    const lawIndex = new Map();
    const laws = legislation.legislation || [];
    [...laws, ...(appendix.law_index || [])].forEach(l => {
      const id = l.law_id || l.id;
      if (id) lawIndex.set(String(id), l);
    });

    // Update stats
    const stats = timeline.stats || {};
    $('#statArticles').textContent = stats.core_total || 127;
    $('#statYears').textContent = (timeline.by_year || []).length;
    $('#statLaws').textContent = laws.length;

    // Render sidebar
    $('#miniStats').innerHTML = renderMiniStats(timeline);
    $('#timeline').innerHTML = renderTimeline(laws);

    // Filter and render main chapters
    const chapters = normalizeChapters(storyline.chapters || []);
    const mainChapters = chapters.filter(ch =>
      ch.kind === 'prologue' ||
      ch.kind === 'institutional' ||
      ch.kind === 'epilogue' ||
      ch.kind === 'peak_wave'
    );

    // Only show 1 peak wave to avoid redundancy
    const peakWaves = mainChapters.filter(ch => ch.kind === 'peak_wave').slice(0, 1);
    const otherChapters = mainChapters.filter(ch => ch.kind !== 'peak_wave');
    const finalChapters = [
      ...otherChapters.filter(ch => ch.kind === 'prologue'),
      ...peakWaves,
      ...otherChapters.filter(ch => ch.kind === 'institutional'),
      ...otherChapters.filter(ch => ch.kind === 'epilogue')
    ];

    const data = { corpusData, corpusIndex, lawIndex, timeline, laws, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive };
    const rendered = finalChapters.map((ch, i) => {
      try {
        return renderChapter(ch, i, data);
      } catch (error) {
        return `<section class="chapter visible"><div class="prose"><p>Erro no capítulo ${esc(ch.chapter_id || 'desconhecido')}: ${esc(error.message)}</p></div></section>`;
      }
    }).join('');
    $('#main').innerHTML = rendered;

    // Nav links
    $('#navLinks').innerHTML = renderNavLinks(finalChapters);

    // Initialize countdowns (after DOM is populated)
    initCountdowns();

    // Animations
    initAnimations();
    initInteractiveMedia();

  } catch (err) {
    $('#main').innerHTML = `
      <div class="chapter visible">
        <div class="prose"><p>Erro ao carregar dados: ${esc(err.message)}</p></div>
      </div>
    `;
  }
}

// Run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ==================== SHARE FUNCTIONALITY ====================

(function initShare() {
  const shareData = {
    title: 'desperdicio.pt - Deitar comida fora nem sempre é descuido. Às vezes é hábito.',
    text: 'Portugal desperdiça 184 kg de comida por pessoa, por ano — somos o 4.º país da UE que mais desperdiça. Uma investigação baseada na cobertura do Público entre 2011 e 2026.',
    url: window.location.href
  };

  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`
  };

  function showToast(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'share-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  function copyToClipboard() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url).then(() => {
        showToast('Link copiado!');
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const textarea = document.createElement('textarea');
    textarea.value = shareData.url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    try {
      document.execCommand('copy');
      showToast('Link copiado!');
    } catch (e) {
      showToast('Não foi possível copiar');
    }
    document.body.removeChild(textarea);
  }

  function handleShare(e) {
    const btn = e.target.closest('.share-btn');
    if (!btn) return;

    e.preventDefault();
    const network = btn.dataset.network;

    if (network === 'copy') {
      copyToClipboard();
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
      return;
    }

    if (shareUrls[network]) {
      const popup = window.open(shareUrls[network], '_blank', 'noopener,noreferrer,width=600,height=400,menubar=no,toolbar=no');
      if (popup) popup.opener = null;
    }
  }

  // Show share sidebar after scrolling past hero
  function initShareSidebar() {
    const sidebar = document.getElementById('shareSidebar');
    if (!sidebar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = document.querySelector('.hero')?.offsetHeight || 600;

          if (scrollY > heroHeight * 0.5) {
            sidebar.classList.add('visible');
          } else {
            sidebar.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Event delegation for share buttons
    sidebar.addEventListener('click', handleShare);
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareSidebar);
  } else {
    initShareSidebar();
  }
})();
