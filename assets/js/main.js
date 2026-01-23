// ==================== CONFIG ====================
const FILES = {
  storyline: ["assets/data/storyline_bundled_full.json", "assets/data/storyline_bundled.json", "assets/data/storyline.json"],
  timeline: "assets/data/timeline.json",
  legislation: "assets/data/legislation.json",
  wasteBreakdown: "assets/data/waste_breakdown.json",
  euComparison: "assets/data/eu_comparison.json",
  initiatives: "assets/data/initiatives_impact.json",
  projections: "assets/data/projections.json",
  featured: "assets/data/featured.json",
  deepArchive: "assets/data/deep_archive.json"
};

const EU_IMAGES = {
  hero: "https://www.europarl.europa.eu/resources/library/images/20240319PHT19475/20240319PHT19475-cl.jpg",
  wasteByCountry: "https://www.europarl.europa.eu/resources/library/images/20250910PHT30276/20250910PHT30276-cl.png"
};

// ==================== HELPERS ====================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
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
      <div class="mini-stat-value">${topPeak.month?.split('-')[1] || '12'}</div>
      <div class="mini-stat-label">Pico Mes</div>
    </div>
    <div class="mini-stat">
      <div class="mini-stat-value">${topPeak.count || 7}</div>
      <div class="mini-stat-label">Max/Mes</div>
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
        <a href="${esc(law.official_link || '#')}" target="_blank" rel="noopener">
          <div class="tl-header">
            <img src="${flagSrc}" alt="${isPT ? 'PT' : 'UE'}" class="tl-flag-img">
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
        ${chapter.kind === 'prologue' ? 'Prologo' :
          chapter.kind === 'epilogue' ? 'Epilogo' :
          chapter.kind === 'peak_wave' ? 'Onda de Atenção' : 'Capitulo'}
      </div>
      <h2 class="chapter-title">${esc(chapter.title)}</h2>
    </header>
  `;
}

function renderBigQuote(text, cite) {
  return `
    <div class="big-quote">
      <blockquote>${esc(text)}</blockquote>
      <cite>- ${esc(cite)}</cite>
    </div>
  `;
}

function renderStatsGrid(stats) {
  return `
    <div class="stats-grid">
      ${stats.map(s => `
        <div class="stat-card">
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

  return `
    <div class="chart-section">
      <div class="chart-header">
        <div>
          <div class="chart-title">Evolução da Cobertura Mediática</div>
          <div class="chart-subtitle">Artigos publicados por ano no Publico (2011-2026)</div>
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
        ${years.map(y => {
          const height = (y.count / maxCount) * 160;
          const isPeak = peaks.includes(y.year) || y.count > 20;
          return `
            <div class="chart-bar ${isPeak ? 'peak' : ''}">
              <div class="bar" style="height: ${Math.max(height, 8)}px">
                <span class="bar-value">${y.count}</span>
              </div>
              <span class="bar-label">${y.year.slice(2)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderMonthChart(timeline, focusMonth) {
  const months = timeline.by_month || [];
  const recent = months.slice(-24); // Last 24 months
  const maxCount = Math.max(...recent.map(m => m.count), 1);

  return `
    <div class="chart-section">
      <div class="chart-header">
        <div>
          <div class="chart-title">Cobertura Mensal Recente</div>
          <div class="chart-subtitle">Artigos por mes (ultimos 24 meses)</div>
        </div>
      </div>
      <div class="chart-bars">
        ${recent.map(m => {
          const height = (m.count / maxCount) * 140;
          const isFocus = m.month === focusMonth;
          return `
            <div class="chart-bar ${isFocus ? 'peak' : ''}">
              <div class="bar" style="height: ${Math.max(height, 4)}px">
                <span class="bar-value">${m.count}</span>
              </div>
              <span class="bar-label">${m.month.slice(5)}</span>
            </div>
          `;
        }).join('')}
      </div>
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
        <a href="${esc(fullLaw.official_link)}" target="_blank" rel="noopener" class="law-card-link">
          Ver diploma oficial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        ${items.map(a => `
          <a href="${esc(a.url || '')}" target="_blank" rel="noopener" class="evidence-card">
            <div class="evidence-card-content">
              <h4 class="evidence-card-title">${esc(a.title || 'Sem titulo')}</h4>
              <div class="evidence-card-meta">
                <span>${fmtDate(a.date || a.published_at)}</span>
                <span>Score ${a.score || 0}</span>
                ${a.word_count ? `<span>${a.word_count} palavras</span>` : ''}
              </div>
            </div>
            <div class="evidence-card-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function renderInfographic(imgUrl, title, caption, source) {
  return `
    <div class="infographic">
      <div class="infographic-title">Dados da Uniao Europeia</div>
      <div class="infographic-headline">${esc(title)}</div>
      <div class="infographic-image">
        <img src="${esc(imgUrl)}" alt="${esc(title)}" loading="lazy">
      </div>
      <div class="infographic-caption">
        ${esc(caption)}
        <span class="infographic-source"> - ${esc(source)}</span>
      </div>
    </div>
  `;
}

function renderFullImage(imgUrl, caption, credit) {
  return `
    <figure class="full-image">
      <img src="${esc(imgUrl)}" alt="${esc(caption)}" loading="lazy">
      <figcaption>
        ${esc(caption)}
        ${credit ? `<span class="credit"> - ${esc(credit)}</span>` : ''}
      </figcaption>
    </figure>
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
    <div class="donut-chart-container" data-animate="true">
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
            <div class="donut-legend-item ${phase.id === 'households' ? 'highlight' : ''}" data-index="${idx}" data-value="${phase.value}" data-label="${esc(phase.label)}">
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
      <p class="chart-source">Fonte: <a href="https://www.europarl.europa.eu/topics/pt/article/20170505STO73528/desperdicio-alimentar-na-ue-factos-e-numeros-infografia" target="_blank">Parlamento Europeu / Eurostat, 2022</a></p>
    </div>
  `;
}

function renderComparisonChart(data) {
  if (!data || !data.ranking) return '';

  const countries = data.ranking.slice(0, 10); // Top 10
  const maxValue = Math.max(...countries.map(c => c.value));
  const euAverage = data.eu_average || 131;
  const baselinePosition = (euAverage / maxValue) * 100;

  // Flag colors - Cyprus has white background with copper/orange island shape
  const flagColors = {
    CY: 'linear-gradient(to bottom, #fff 0%, #fff 100%)', // White with copper border
    DK: 'linear-gradient(to right, #c8102e 0%, #c8102e 100%)',
    PT: 'linear-gradient(to right, #006600 40%, #ff0000 40%)',
    GR: 'linear-gradient(to bottom, #0d5eaf 20%, #fff 20%, #fff 40%, #0d5eaf 40%, #0d5eaf 60%, #fff 60%, #fff 80%, #0d5eaf 80%)',
    BE: 'linear-gradient(to right, #000 33%, #ffd90c 33%, #ffd90c 66%, #f31830 66%)',
    LU: 'linear-gradient(to bottom, #ed2939 33%, #fff 33%, #fff 66%, #00a1de 66%)',
    IE: 'linear-gradient(to right, #169b62 33%, #fff 33%, #fff 66%, #ff883e 66%)',
    ES: 'linear-gradient(to bottom, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%)',
    PL: 'linear-gradient(to bottom, #fff 50%, #dc143c 50%)',
    IT: 'linear-gradient(to right, #009246 33%, #fff 33%, #fff 66%, #ce2b37 66%)',
    FR: 'linear-gradient(to right, #002395 33%, #fff 33%, #fff 66%, #ed2939 66%)',
    DE: 'linear-gradient(to bottom, #000 33%, #dd0000 33%, #dd0000 66%, #ffcc00 66%)',
    NL: 'linear-gradient(to bottom, #ae1c28 33%, #fff 33%, #fff 66%, #21468b 66%)',
    AT: 'linear-gradient(to bottom, #ed2939 33%, #fff 33%, #fff 66%, #ed2939 66%)',
    SE: 'linear-gradient(135deg, #006aa7 0%, #006aa7 100%)',
    SI: 'linear-gradient(to bottom, #fff 33%, #0051ba 33%, #0051ba 66%, #ed1c24 66%)',
    HR: 'linear-gradient(to bottom, #ff0000 33%, #fff 33%, #fff 66%, #171796 66%)',
    EU: 'linear-gradient(135deg, #003399 0%, #003399 100%)'
  };

  // Special flag styling (Cyprus needs border)
  const flagStyles = {
    CY: 'border: 1px solid #d4a84b;' // Copper/gold border for Cyprus
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
          const extraFlagStyle = flagStyles[country.code] || '';
          return `
            <div class="comparison-bar-row ${isHighlight ? 'highlight' : ''} ${isBaseline ? 'baseline' : ''}" style="--delay: ${idx * 0.1}s">
              <div class="comparison-bar-label">
                <div class="comparison-bar-flag" style="background: ${flagColors[country.code] || 'var(--white-15)'}; ${extraFlagStyle}"></div>
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
      <p class="chart-source">Fonte: <a href="https://www.europarl.europa.eu/topics/pt/article/20170505STO73528/desperdicio-alimentar-na-ue-factos-e-numeros-infografia" target="_blank">Eurostat / Parlamento Europeu, 2022</a></p>
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

  const initiatives = data.initiatives.slice(0, 4);

  return `
    <div class="initiatives-grid">
      ${initiatives.map(init => {
        const stats = init.current_stats || init.stats_portugal || init.stats || {};
        const mainStat = stats.tonnes_saved_total || stats.meals_saved_total || stats.familias_apoiadas_diariamente || '—';
        const mainLabel = stats.tonnes_saved_total ? 'Toneladas salvas' :
                         stats.meals_saved_total ? 'Refeições salvas' :
                         stats.familias_apoiadas_diariamente ? 'Famílias/dia' : 'Impacto';

        return `
          <div class="initiative-card">
            <div class="initiative-header">
              <span class="initiative-name">${esc(init.name)}</span>
              <span class="initiative-type">${esc(init.type)}</span>
            </div>
            <div class="initiative-stats">
              <div class="initiative-stat">
                <div class="initiative-stat-value">${typeof mainStat === 'number' ? mainStat.toLocaleString('pt-PT') : mainStat}</div>
                <div class="initiative-stat-label">${mainLabel}</div>
              </div>
              <div class="initiative-stat">
                <div class="initiative-stat-value">${init.founded || init.arrived_portugal || '—'}</div>
                <div class="initiative-stat-label">Ano de início</div>
              </div>
            </div>
            <div class="initiative-insight">${esc(init.key_insight)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <p class="chart-source">Fontes: <a href="https://frutafeia.pt" target="_blank">Fruta Feia</a>, <a href="https://toogoodtogo.pt" target="_blank">Too Good To Go</a>, <a href="https://www.re-food.org" target="_blank">Refood</a></p>
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
      <p class="chart-source">Fonte: <a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">Directiva (UE) 2024/1438</a> e projecções editoriais</p>
    </div>
  `;
}

function renderCountdown(targetDate, message, subtext) {
  const targetDateStr = targetDate || '2030-12-31';

  return `
    <div class="countdown-block" data-target-date="${targetDateStr}" data-message="${esc(message)}">
      <div class="countdown-value">
        <span class="countdown-digits">0</span>
      </div>
      <div class="countdown-label">${esc(message)}</div>
      <div class="countdown-subtext">${esc(subtext)}</div>
      <p class="chart-source">Meta: <a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">Directiva (UE) 2024/1438</a></p>
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

    function animateValue(el, start, end, duration) {
      const range = end - start;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + range * easeOut);
        el.textContent = current.toLocaleString('pt-PT');

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

    function updateCountdown() {
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

      // Animate number rolling
      const currentValue = parseInt(digitsEl.textContent.replace(/\./g, '')) || 0;
      animateValue(digitsEl, currentValue, absDays, 1500);
    }

    // Initial update
    updateCountdown();

    // Update every hour (in case page stays open)
    setInterval(updateCountdown, 3600000);
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
  `;
}

function renderSummaryGrid(items) {
  const icons = {
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  };

  return `
    <div class="summary-grid">
      ${items.map(item => `
        <div class="summary-item">
          <div class="summary-item-icon">${icons[item.icon] || '<span>•</span>'}</div>
          <div class="summary-item-title">${esc(item.title)}</div>
          <div class="summary-item-text">${esc(item.text)}</div>
        </div>
      `).join('')}
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
    <div class="deep-archive">
      <div class="deep-archive-header">
        <h3 class="deep-archive-title">Arquivo Profundo: 1999–2010</h3>
        <p class="deep-archive-subtitle">Antes de existir tema, existia ruído. Os primeiros resultados do Arquivo.pt revelam uma ausência significativa.</p>
      </div>
      <div class="deep-archive-insight">${esc(data.insight)}</div>
      <div class="deep-archive-timeline">
        ${data.items.map(item => `
          <div class="deep-archive-item ${item.classification}">
            <div class="deep-archive-item-header">
              <span class="deep-archive-year">${item.year}</span>
              <span class="deep-archive-classification ${item.classification}">${classificationLabels[item.classification] || item.classification}</span>
            </div>
            <div class="deep-archive-item-title">${esc(item.title)}</div>
            <div class="deep-archive-quote">"${esc(item.quote)}"</div>
            <div class="deep-archive-note">${esc(item.note)}</div>
            <a href="${item.archive_url}" target="_blank" class="deep-archive-link arquivo-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
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

  // Generate arquivo.pt URLs (format: arquivo.pt/wayback/YYYYMMDD120000/url)
  const generateArquivoUrl = (article) => {
    const date = article.date || `${article.year}-01-01`;
    const timestamp = date.replace(/-/g, '') + '120000';
    return `https://arquivo.pt/wayback/${timestamp}/${article.url}`;
  };

  return `
    <div class="historical-carousel">
      <div class="carousel-header">
        <div>
          <h3 class="carousel-title">Linha do Tempo: Cobertura no Público</h3>
          <p class="carousel-subtitle">15 anos de jornalismo sobre desperdício alimentar, preservados pelo Arquivo.pt</p>
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn" onclick="document.querySelector('.carousel-track').scrollBy({left: -340, behavior: 'smooth'})">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="carousel-btn" onclick="document.querySelector('.carousel-track').scrollBy({left: 340, behavior: 'smooth'})">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="carousel-track">
        ${sortedArticles.map(article => {
          const year = article.year || article.date?.slice(0, 4) || 'N/A';
          const imageUrl = article.image?.url || 'https://imagens.publico.pt/imagens.aspx/1245446?tp=UH&db=IMAGENS&type=JPG';
          const arquivoUrl = generateArquivoUrl(article);

          return `
            <article class="carousel-card">
              <img src="${imageUrl}" alt="${esc(article.title)}" class="carousel-card-image" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180/1c1c1f/4ade80?text=${year}'">
              <div class="carousel-card-content">
                <span class="carousel-card-year">${year}</span>
                <h4 class="carousel-card-title">${esc(article.title)}</h4>
                <p class="carousel-card-excerpt">${esc(article.key_narrative || article.key_quote || (article.key_stats ? article.key_stats.join(' • ') : ''))}</p>
                <div class="carousel-card-links">
                  <a href="${arquivoUrl}" target="_blank" class="arquivo-badge" title="Ver versão preservada no Arquivo.pt">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                    Arquivo.pt
                  </a>
                  <a href="${article.url}" target="_blank" class="carousel-card-link">
                    Público
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
function renderLinguisticAnalysis() {
  // Data from editorial.txt: term presence per period (2011-2016 / 2017-2020 / 2021-2026)
  const terms = [
    { term: 'emissões', periods: [0, 6, 30], trend: 'up' },
    { term: 'cadeia', periods: [1, 6, 15], trend: 'up' },
    { term: 'circular', periods: [0, 2, 9], trend: 'up' },
    { term: 'economia', periods: [0, 3, 13], trend: 'up' },
    { term: 'validade', periods: [3, 4, 13], trend: 'up' },
    { term: 'supermercados', periods: [3, 8, 13], trend: 'up' },
    { term: 'doação', periods: [0, 3, 7], trend: 'up' },
    { term: 'sobras', periods: [2, 2, 9], trend: 'stable' }
  ];

  const maxValue = Math.max(...terms.flatMap(t => t.periods));

  return `
    <div class="linguistic-analysis">
      <div class="linguistic-analysis-header">
        <h3 class="linguistic-analysis-title">A Linguagem Muda: Do Doméstico ao Sistémico</h3>
        <p class="linguistic-analysis-subtitle">Análise de termos em 127 artigos do Público sobre desperdício alimentar (2011-2026)</p>
      </div>
      <div class="linguistic-analysis-insight">
        O vocabulário desloca-se de preocupações domésticas ("sobras", "validade") para conceitos sistémicos ("emissões", "cadeia", "economia circular"). Esta mudança reflecte a politização do tema e a pressão das metas europeias.
        <cite style="display: block; margin-top: 8px; font-style: normal; font-size: 11px;">
          <a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank" style="color: var(--accent);">Fonte: Corpus Público 2011-2026</a>
        </cite>
      </div>
      <div class="linguistic-grid">
        ${terms.map(t => {
          const trendLabel = t.trend === 'up' ? '↑' : '→';
          const trendClass = t.trend;
          return `
            <div class="linguistic-term-card">
              <div class="linguistic-term-name">
                "${t.term}"
                <span class="linguistic-term-trend ${trendClass}">${trendLabel}</span>
              </div>
              <div class="linguistic-periods">
                ${t.periods.map((val, i) => {
                  const periodLabels = ['2011-16', '2017-20', '2021-26'];
                  const periodClasses = ['p1', 'p2', 'p3'];
                  const width = (val / maxValue) * 100;
                  return `
                    <div class="linguistic-period">
                      <span class="linguistic-period-label">${periodLabels[i]}</span>
                      <div class="linguistic-period-bar">
                        <div class="linguistic-period-fill ${periodClasses[i]}" style="width: ${width}%"></div>
                      </div>
                      <span class="linguistic-period-value">${val}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="linguistic-legend">
        <div class="linguistic-legend-item">
          <span class="linguistic-legend-dot p1"></span>
          2011-2016 (Emergência)
        </div>
        <div class="linguistic-legend-item">
          <span class="linguistic-legend-dot p2"></span>
          2017-2020 (Institucionalização)
        </div>
        <div class="linguistic-legend-item">
          <span class="linguistic-legend-dot p3"></span>
          2021-2026 (Politização)
        </div>
      </div>
    </div>
  `;
}

// ==================== RENDER FULL CHAPTER ====================
function renderChapter(chapter, idx, data) {
  const { corpusIndex, lawIndex, timeline, laws, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive } = data;
  const blocks = chapter.blocks || [];
  const kind = chapter.kind;

  let html = renderChapterHeader(chapter, idx);

  // PROLOGUE
  if (kind === 'prologue') {
    html += renderBigQuote(
      "A cozinha é o palco onde o desperdício se disfarça de hábito. Bruxelas é o lugar onde a responsabilidade se disfarça de processo. Entre os dois, a comida desaparece.",
      "desperdicio.pt, 2026"
    );

    html += `<div class="prose">
      <p>Ninguém admite desperdiçar comida. No entanto, em Portugal, <strong>mais de 1,9 milhões de toneladas de alimentos</strong> acabam no lixo todos os anos. É um número abstracto, difícil de visualizar, até percebermos que representa cerca de 184 quilos por pessoa, por ano. <cite><a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank">Público, 2023</a></cite></p>
      <p>Este editorial documenta 15 anos de cobertura jornalística sobre desperdício alimentar, cruzando <em>127 artigos do Público</em> arquivados com <em>20 diplomas legais</em> de Portugal e da União Europeia. O objectivo: mostrar como um problema de cozinha se transformou em problema de Estado, e porque ainda estamos longe de o resolver.</p>
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
    }

    // EU comparison chart
    if (euComparison) {
      html += `<div class="prose">
        <h3>Portugal no contexto europeu</h3>
        <p>Com <strong>184 kg per capita</strong>, Portugal é o <em>4.º país da UE que mais desperdiça alimentos</em>, 40% acima da média europeia. Só Chipre, Dinamarca e Grécia apresentam valores mais elevados. <cite><a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank">Público, 2023</a></cite></p>
      </div>`;
      html += renderComparisonChart(euComparison);
    }

    // Year chart - media coverage evolution
    html += `<div class="prose">
      <h3>A evolução da atenção mediática</h3>
      <p>A cobertura jornalística do tema <strong>cresceu exponencialmente</strong>: de apenas 1 artigo em 2011 para <em>32 artigos em 2023</em>, o ano de maior atenção. Em 2025, registamos já 27 artigos — quase um por semana.</p>
    </div>`;

    html += renderStatsGrid([
      { value: '32', label: 'Artigos em 2023', color: 'warning', note: 'Ano recorde' },
      { value: '7', label: 'Pico Mensal', color: 'danger', note: 'Dezembro 2023' },
      { value: '6', label: 'Picos >5', color: 'accent', note: 'Meses de pico' },
      { value: '15', label: 'Anos de Dados', color: 'eu', note: '2011-2026' }
    ]);

    html += renderYearChart(timeline);

    // Projections chart
    if (projections) {
      html += `<div class="prose">
        <h3>Três cenários para 2030</h3>
        <p>A União Europeia obriga Portugal a reduzir o desperdício em <strong>30% até 2030</strong>. A meta dos ODS é ainda mais ambiciosa: <em>50%</em>. Mas qual é o cenário mais provável? <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">Directiva (UE) 2024/1438</a></cite></p>
      </div>`;
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
        <p>Enquanto o Estado avança devagar, iniciativas civis já salvam <strong>15.000 toneladas por ano</strong>. A Fruta Feia, a Too Good To Go e a Refood mostram que a mudança é possível quando há vontade. <cite><a href="https://www.publico.pt/2020/10/22/p3/noticia/fruta-feia-distinguida-premio-europeu-life-prova-funciona-1936266" target="_blank">Público, 2020</a></cite></p>
      </div>`;
      html += renderInitiativesGrid(initiatives);

      // Video: Anna mergulha no lixo (Público P3, 2020)
      html += `
        <div class="video-section">
          <div class="video-header">
            <span class="video-year">2020</span>
            <h4 class="video-title">Anna mergulha no lixo para combater o desperdício alimentar</h4>
            <p class="video-source">Público P3</p>
          </div>
          <div class="video-embed">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/1TNPzSRzTt4?si=vv74TvnVzXrjQHxq"
              title="Anna mergulha no lixo para combater o desperdício alimentar"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      `;
    }

    // Linguistic analysis - vocabulary shift over time
    html += `<div class="prose">
      <h3>Como Mudou o Discurso</h3>
      <p>A análise de 127 artigos do Público revela uma transformação profunda: o vocabulário deslocou-se de preocupações domésticas ("sobras", "validade") para conceitos sistémicos ("emissões", "cadeia", "economia circular"). Esta mudança reflecte a politização do tema. <cite><a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank">Público, 2023</a></cite></p>
    </div>`;
    html += renderLinguisticAnalysis();

    // Add the EU infographic
    html += renderInfographic(
      EU_IMAGES.wasteByCountry,
      "Portugal é o 4.º país da UE que mais desperdiça",
      "Desperdício alimentar por pessoa em cada país da UE em 2022. Portugal regista 184 kg per capita.",
      "Parlamento Europeu / Eurostat, 2022"
    );

    // Summary grid
    html += renderSummaryGrid([
      { icon: 'alert', title: '1,93 Mt/ano', text: 'Desperdício total em Portugal (2023)' },
      { icon: 'chart', title: '67%', text: 'Ocorre em casa, não nas empresas' },
      { icon: 'globe', title: '4.º na UE', text: '40% acima da média europeia' },
      { icon: 'target', title: '-30%', text: 'Meta obrigatória para 2030' }
    ]);

    // Deep archive (1999-2010)
    if (deepArchive) {
      html += renderDeepArchive(deepArchive);
    }

    // Historical carousel (2011-2026)
    if (featured?.featured) {
      html += renderHistoricalCarousel(featured.featured);
    }

    // Evidence cards
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(evidenceBlock.source_article_ids || [], corpusIndex, "Artigos Fundacionais");
    }
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        ${count} artigos publicados em ${monthName} de ${year} • ${peakRank}º maior pico
      </div>
    `;

    // Different context based on which peak wave this is
    const peakContexts = {
      '2023-12': `<p>Dezembro de 2023 marcou o <strong>maior pico de cobertura</strong> de toda a nossa análise: 7 artigos num só mês. O que aconteceu? A combinação de vários factores: a época natalícia (quando o desperdício doméstico dispara), o balanço de fim de ano da estratégia nacional, e a pressão crescente das metas europeias para 2030.</p>
      <p>Este pico representa <em>quase um quarto de toda a cobertura de 2023</em>. O tema deixou de ser sazonal. É agora permanente.</p>`,
      '2025-09': `<p>Setembro de 2025 trouxe <strong>6 artigos num mês</strong> — o segundo maior pico. O gatilho: a aprovação da Directiva (UE) 2024/1438 no Parlamento Europeu, que introduziu pela primeira vez <em>metas obrigatórias de redução</em> para todos os Estados-Membros. <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">EUR-Lex</a></cite></p>
      <p>Portugal terá de reduzir 30% do desperdício no retalho e consumo até 2030. A lei já não é recomendação. É obrigação.</p>`,
      '2023-10': `<p>Outubro de 2023 registou <strong>5 artigos</strong>, antecipando o pico de dezembro. O Dia Mundial da Alimentação (16 de outubro) é um catalisador anual de atenção mediática, mas em 2023 coincidiu com novos dados sobre Portugal ser o 4.º país da UE que mais desperdiça.</p>
      <p>A narrativa mudou: de "devemos fazer melhor" para "estamos a falhar".</p>`
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
  }

  // INSTITUTIONAL - PORTUGAL
  else if (chapter.chapter_id === 'ch-portugal-estado') {
    html += renderBigQuote(
      "A partir de 2024, tornou-se ilegal descartar alimentos proprios para consumo quando existam meios seguros de redistribuição.",
      "Decreto-Lei 102-D/2020"
    );

    html += `<div class="prose">
      <p>O desperdício alimentar deixou de ser apenas uma questão moral para se tornar <strong>obrigação legal</strong>. Em Portugal, o caminho começou em 2015 com uma resolução parlamentar que declarou 2016 o "Ano Nacional do Combate ao Desperdício Alimentar". Foi o primeiro passo de uma década de transformação legislativa. <cite><a href="https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID=39802" target="_blank">Resolução 65/2015</a></cite></p>
      <p>Em 2018, o Governo aprovou a <em>Estratégia Nacional e Plano de Acção de Combate ao Desperdício Alimentar (ENCDA)</em>, com uma visão ambiciosa: "Desperdício Alimentar Zero". A estratégia define três eixos — prevenção, redução e monitorização — desdobrados em 14 medidas concretas. <cite><a href="https://cncda.gov.pt/index.php/encda" target="_blank">CNCDA</a></cite></p>
      <p>O salto qualitativo chegou em 2020 com o Decreto-Lei 102-D. Este diploma não se limita a recomendar: <strong>obriga</strong>. Estabelece metas de redução de 25% até 2025 e 50% até 2030. E, crucialmente, a partir de 2024, proíbe o descarte de alimentos próprios para consumo quando existam alternativas de redistribuição. <cite><a href="https://diariodarepublica.pt/dr/detalhe/decreto-lei/102-d-2020-150908012" target="_blank">DRE</a></cite></p>
    </div>`;

    html += renderStatsGrid([
      { value: '-25%', label: 'Meta 2025', color: 'accent', note: 'Face a 2020' },
      { value: '-50%', label: 'Meta 2030', color: 'accent', note: 'Face a 2020' },
      { value: '2024', label: 'Proibição', color: 'warning', note: 'Descarte de comida boa' },
      { value: '14', label: 'Medidas', color: 'eu', note: 'ENCDA' }
    ]);

    html += `<div class="prose">
      <p>A Lei 62/2021 completou o quadro: estabeleceu o regime jurídico da doação de géneros alimentícios, <em>vedando cláusulas contratuais que impeçam doações</em>. Integrou ainda a educação sobre desperdício alimentar nos currículos escolares. <cite><a href="https://diariodarepublica.pt/dr/detalhe/lei/62-2021-169869772" target="_blank">DRE</a></cite></p>
      <p>O resultado: Portugal tem hoje um dos quadros legais mais completos da Europa para combater o desperdício. O problema não é a lei. É a execução.</p>
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
      html += renderEvidenceCards(evidenceBlock.source_article_ids || [], corpusIndex, "Cobertura Jornalística");
    }
  }

  // INSTITUTIONAL - BRUSSELS
  else if (chapter.chapter_id === 'ch-bruxelas-metodo') {
    html += renderBigQuote(
      "Sem método, o problema vira opinião. Com método, vira comparação. Com meta, vira política.",
      "desperdicio.pt"
    );

    html += `<div class="prose">
      <p>Foi este o percurso da União Europeia: primeiro harmonizar a forma de medir, depois estabelecer metas vinculativas. A jornada começou em 2018, quando a Directiva 2018/851 introduziu a <strong>primeira definição europeia de "resíduos alimentares"</strong> e obrigou todos os Estados-Membros a monitorizar anualmente. <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32018L0851" target="_blank">EUR-Lex</a></cite></p>
      <p>Em 2019, a Comissão publicou a metodologia comum de medição. Em 2020, a Estratégia do Prado ao Prato anunciou a intenção de metas vinculativas. E em Setembro de 2024, a Directiva (UE) 2024/1438 consumou essa promessa: <em>metas obrigatórias de redução para todos os países da UE</em>. <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">EUR-Lex</a></cite></p>
    </div>`;

    html += renderFullImage(
      EU_IMAGES.hero,
      "O desperdício alimentar é um dos maiores desafios ambientais da Europa",
      "Parlamento Europeu"
    );

    html += `<div class="prose">
      <p>Os números são brutais: a UE gera <strong>58 milhões de toneladas</strong> de resíduos alimentares por ano, representando 131 kg por pessoa. Portugal está acima da média europeia, ocupando a <em>4.ª posição entre os países que mais desperdiçam</em>. <cite><a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank">Público, 2023</a></cite></p>
      <p>As novas metas europeias são ambiciosas mas alcançáveis: redução de 10% no processamento industrial e 30% per capita no retalho e consumo até 2030. Quem não cumprir, enfrenta processos por incumprimento. <cite><a href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024L1438" target="_blank">EUR-Lex</a></cite></p>
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
      <p>O ODS 12.3 é o farol: reduzir para metade o desperdício alimentar per capita até 2030. A Europa transformou esse objectivo global em lei — agora cabe aos Estados-Membros transformar a lei em prática. <cite><a href="https://sdgs.un.org/goals/goal12" target="_blank">ONU</a></cite></p>
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
      html += renderEvidenceCards(evidenceBlock.source_article_ids || [], corpusIndex, "Impacto na Imprensa Portuguesa");
    }
  }

  // EPILOGUE
  else if (kind === 'epilogue') {
    html += renderBigQuote(
      "A mudança já começou. Falta acelerar.",
      "desperdicio.pt, 2026"
    );

    html += `<div class="prose">
      <p>Este editorial documenta <strong>15 anos de progresso real</strong>. Em 2011, o desperdício alimentar não existia como tema. Hoje, temos leis, metas vinculativas, e uma sociedade civil mobilizada. A Fruta Feia salvou mais de 6.000 toneladas. A Too Good To Go evitou milhões de refeições no lixo. A Refood alimenta milhares de famílias diariamente.</p>
      <p>São 127 artigos do Público que documentam esta transformação, preservados pelo Arquivo.pt. São 20 diplomas legais que provam que o Estado ouviu. <strong>O problema entrou na agenda. Agora precisa de sair das manchetes e entrar nas cozinhas.</strong></p>
    </div>`;

    html += renderStatsGrid([
      { value: '6.000t', label: 'Fruta Feia', color: 'accent', note: 'Toneladas salvas' },
      { value: '20', label: 'Leis', color: 'eu', note: 'PT + UE desde 2015' },
      { value: '32', label: 'Artigos 2023', color: 'warning', note: 'Recorde de atenção' },
      { value: '2030', label: 'Meta', color: 'accent', note: '-30% obrigatório' }
    ]);

    html += `<div class="prose">
      <p>O que mudou em 15 anos? <em>Muito.</em> Temos hoje um quadro legal que em 2011 não existia. Temos iniciativas que salvam milhares de toneladas. Temos consciência crescente, como provam os 32 artigos publicados só em 2023.</p>
      <p>Mas ainda desperdiçamos 184 kg por pessoa, por ano. <strong>A infraestrutura está montada. Falta cada um de nós usá-la.</strong> <cite><a href="https://www.publico.pt/2023/02/19/azul/noticia/portugues-deita-184-kg-comida-ano-propoem-mudar-2039370" target="_blank">Público, 2023</a></cite></p>
    </div>`;

    html += renderBigQuote(
      "O próximo passo não é uma nova lei. É abrir o frigorífico com outros olhos.",
      "desperdicio.pt"
    );

    // Timeline peaks summary
    html += `
      <div class="chart-section">
        <div class="chart-header">
          <div>
            <div class="chart-title">A Atenção Está a Crescer</div>
            <div class="chart-subtitle">Os 6 meses com maior cobertura jornalística sobre desperdício alimentar</div>
          </div>
        </div>
        <div class="stats-grid" style="margin: 24px 0 0;">
          ${(timeline.peaks || []).slice(0, 6).map((p, i) => {
            const [year, month] = p.month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const monthName = monthNames[parseInt(month) - 1];
            return `
            <div class="stat-card">
              <div class="stat-card-value ${i === 0 ? 'warning' : 'accent'}">${p.count}</div>
              <div class="stat-card-label">${monthName} ${year}</div>
              ${i === 0 ? '<div class="stat-card-note">Maior pico</div>' : ''}
            </div>
          `}).join('')}
        </div>
      </div>
    `;

    html += `<div class="prose">
      <p>As metas de 2030 são ambiciosas, mas alcançáveis. Portugal tem as ferramentas. Temos apps para salvar refeições, cooperativas para fruta imperfeita, bancos alimentares em todo o país. <strong>A pergunta já não é "o que fazer?" mas "quando começamos?"</strong></p>
      <p>A resposta é simples: <em>hoje, na próxima refeição.</em></p>
    </div>`;

    // Final evidence
    const evidenceBlock = blocks.find(b => b.type === 'evidence_cards');
    if (evidenceBlock) {
      html += renderEvidenceCards(evidenceBlock.source_article_ids || [], corpusIndex, "Artigos que Contam Esta História");
    }
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
    });
  }

  html += '<div class="divider"></div>';

  return `<section class="chapter" id="${esc(chapter.chapter_id || `ch-${idx}`)}">${html}</section>`;
}

// ==================== NAVIGATION ====================
function renderNavLinks(chapters) {
  const mainChapters = chapters.filter(ch =>
    ch.kind === 'prologue' || ch.kind === 'institutional' || ch.kind === 'epilogue'
  );

  // Single-word labels for nav based on chapter_id
  const navLabels = {
    'ch-prologue': 'Início',
    'ch-portugal-estado': 'Portugal',
    'ch-bruxelas-metodo': 'Europa',
    'ch-epilogue': 'Fecho'
  };

  return mainChapters.map(ch => {
    const label = navLabels[ch.chapter_id] || ch.title.split(' ')[0];
    return `<li><a href="#${esc(ch.chapter_id)}">${esc(label)}</a></li>`;
  }).join('');
}

function renderFooterChapters(chapters) {
  return chapters.slice(0, 6).map(ch => `
    <li><a href="#${esc(ch.chapter_id)}">${esc(ch.title)}</a></li>
  `).join('');
}

// ==================== SCROLL ANIMATIONS ====================
function initAnimations() {
  const chapters = $$('.chapter');

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

  // Nav scroll
  window.addEventListener('scroll', () => {
    $('#nav').classList.toggle('scrolled', window.scrollY > 100);
  });

  // Chart animations observer
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view', 'animated');

        // Animate comparison bars
        if (entry.target.classList.contains('comparison-chart')) {
          const bars = entry.target.querySelectorAll('.comparison-bar-fill');
          bars.forEach(bar => {
            const targetWidth = bar.dataset.width;
            bar.style.setProperty('--target-width', targetWidth + '%');
            setTimeout(() => {
              bar.style.width = targetWidth + '%';
            }, 100);
          });
        }

        // Animate donut segments
        if (entry.target.classList.contains('donut-chart-container')) {
          const segments = entry.target.querySelectorAll('.donut-segment');
          segments.forEach((seg, idx) => {
            setTimeout(() => {
              const targetDasharray = seg.dataset.targetDasharray;
              const dashoffset = seg.dataset.dashoffset;
              seg.style.strokeDasharray = targetDasharray;
              seg.style.strokeDashoffset = dashoffset;
            }, idx * 150);
          });
        }

        // Animate projection lines
        if (entry.target.classList.contains('projection-chart')) {
          const lines = entry.target.querySelectorAll('.animate-line');
          lines.forEach((line, idx) => {
            setTimeout(() => {
              line.style.strokeDashoffset = '0';
            }, idx * 300);
          });

          const points = entry.target.querySelectorAll('.animate-point');
          points.forEach(point => {
            point.style.opacity = '1';
          });
        }

        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  // Observe all animated charts
  $$('[data-animate="true"]').forEach(el => chartObserver.observe(el));

  // Donut chart interactivity
  document.addEventListener('mouseover', (e) => {
    const legendItem = e.target.closest('.donut-legend-item');
    if (legendItem) {
      const container = legendItem.closest('.donut-chart-container');
      if (!container) return;

      const idx = legendItem.dataset.index;
      const value = legendItem.dataset.value;
      const label = legendItem.dataset.label;

      const centerValue = container.querySelector('#donutCenterValue');
      const centerLabel = container.querySelector('#donutCenterLabel');

      if (centerValue) centerValue.textContent = value + '%';
      if (centerLabel) centerLabel.textContent = label;

      // Highlight segment
      const segments = container.querySelectorAll('.donut-segment');
      segments.forEach((seg, i) => {
        seg.style.opacity = i == idx ? '1' : '0.4';
        seg.style.strokeWidth = i == idx ? '38' : '32';
      });
    }
  });

  document.addEventListener('mouseout', (e) => {
    const legendItem = e.target.closest('.donut-legend-item');
    if (legendItem) {
      const container = legendItem.closest('.donut-chart-container');
      if (!container) return;

      // Reset to households (default)
      const centerValue = container.querySelector('#donutCenterValue');
      const centerLabel = container.querySelector('#donutCenterLabel');

      if (centerValue) centerValue.textContent = '67%';
      if (centerLabel) centerLabel.textContent = 'Em Casa';

      const segments = container.querySelectorAll('.donut-segment');
      segments.forEach(seg => {
        seg.style.opacity = '1';
        seg.style.strokeWidth = '32';
      });
    }
  });
}

// ==================== MAIN ====================
async function init() {
  try {
    const [storyline, timeline, legislation, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive] = await Promise.all([
      fetchFirst(FILES.storyline),
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
    (appendix.evidence_index || []).forEach(a => corpusIndex.set(String(a.article_id), a));

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
    const chapters = storyline.chapters || [];
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

    const data = { corpusIndex, lawIndex, timeline, laws, wasteBreakdown, euComparison, initiatives, projections, featured, deepArchive };
    console.log('Rendering chapters:', finalChapters.length);
    const rendered = finalChapters.map((ch, i) => {
      try {
        return renderChapter(ch, i, data);
      } catch (e) {
        console.error('Error rendering chapter:', ch.chapter_id, e);
        return `<section class="chapter visible"><div class="prose"><p>Erro no capítulo ${ch.chapter_id}: ${esc(e.message)}</p></div></section>`;
      }
    }).join('');
    $('#main').innerHTML = rendered;

    // Nav links
    $('#navLinks').innerHTML = renderNavLinks(finalChapters);

    // Animations
    initAnimations();

    // Initialize countdowns (after DOM is populated)
    initCountdowns();

  } catch (err) {
    console.error('Init error:', err);
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
