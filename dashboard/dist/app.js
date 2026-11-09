/**
 * PeakOff Business Dashboard Application
 *
 * Implements the B2B venue management interface across Stages 01–06 and 11–13
 * of the PeakOff workflow, enhanced with live PeakAI dynamic pricing
 * intelligence, scenario simulation, unit-economics & elasticity calculations,
 * and an interactive Business Strategy Guide.
 */

const $ = selector => document.querySelector(selector);

const icons = {
  overview:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  offers:
    '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7" cy="7" r="1"/>',
  inventory:
    '<path d="m12 2 10 5v10l-10 5L2 17V7zM2 7l10 5 10-5M12 12v10"/>',
  insights:
    '<path d="M4 21V12m6 9V7m6 14V3m5 18H1"/>',
  guide:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h6m-6 4h6"/>',
  settings:
    '<path d="m9 3-.6 2.2-2 .9-2-.6L2 9l1.5 1.7v2.6L2 15l2.4 3.5 2-.6 2 .9L9 21h6l.6-2.2 2-.9 2 .6L22 15l-1.5-1.7v-2.6L22 9l-2.4-3.5-2 .6-2-.9L15 3z"/><circle cx="12" cy="12" r="3"/>',
  tables:
    '<path d="M3 9h18v5H3zM5 14v7m14-7v7M5 9V4h14v5"/>',
  sales:
    '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  visits:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>',
  bell:
    '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  help:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.2m0 4h.01"/>',
  coffee:
    '<path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zm13 1h2a3 3 0 0 1 0 6h-2M7 2v2m4-2v2m4-2v2M2 23h18"/>',
  chevron:
    '<path d="m6 9 6 6 6-6"/>',
  arrow:
    '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  trend:
    '<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
  trendDown:
    '<path d="m3 7 6 6 4-4 8 10m-6 0h6v-6"/>',
  check:
    '<path d="m5 12 4 4L19 6"/>',
  play:
    '<path d="m8 4 12 8-12 8z"/>',
  bolt:
    '<path d="m13 2-10 12h8l-1 8L21 9h-8z"/>',
  info:
    '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  reset:
    '<path d="M3 4v5h5M3.5 9a9 9 0 1 1 .5 8"/>',
  sparkle:
    '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z"/>'
};

const icon = name =>
  `<svg class="ui-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${
    icons[name] || icons.offers
  }</svg>`;

const SCENARIOS = {
  commute: {
    id: 'commute',
    label: 'Evening drop-off · 12/30',
    occupied: 12,
    sales: 710,
    visits: 11,
    mult: 1.0,
    series: [540, 440, 345, 260, 195, 150, 115],
    context: 'Evening sales dropping (−27.6% vs yesterday) · 18 empty tables'
  },
  rainy: {
    id: 'rainy',
    label: 'Rainy slump · 6/30',
    occupied: 6,
    sales: 520,
    visits: 8,
    mult: 1.28,
    series: [470, 360, 255, 180, 130, 95, 70],
    context: 'Steep rainy-day sales decline (−46.9% vs yesterday) · 24 empty tables'
  },
  slump: {
    id: 'slump',
    label: 'Midweek slump · 8/30',
    occupied: 8,
    sales: 590,
    visits: 9,
    mult: 1.18,
    series: [500, 395, 295, 215, 155, 115, 85],
    context: 'Midweek evening sales decline (−39.8% vs yesterday) · 22 empty tables'
  },
  clearance: {
    id: 'clearance',
    label: 'Expiry drop-off · 10/30',
    occupied: 10,
    sales: 660,
    visits: 10,
    mult: 1.15,
    series: [520, 420, 320, 240, 175, 130, 100],
    context: '18:15 sales drop-off (−32.7%) + 4 pastry bundles expiring at 19:00'
  }
};

const initial = () => ({
  occupied: 12,
  occupiedTables: Array.from({ length: 30 }, (_, i) => i < 12),
  max: 35,
  floor: 8,
  cost: 4,
  price: 20,
  autoPause: true,
  active: false,
  discount: 24,
  claimed: 7,
  redeemed: 5,
  sales: 710,
  previousDaySales: 980,
  visits: 11,
  previousDayVisits: 17,
  declineModelVersion: 2,
  special: false,
  welcome: false,
  extraSpecials: {
    sandwich: true,
    cake: false,
    coldbrew: false
  },
  customSpecials: [],
  claimedDemo: false,
  redeemedDemo: false,
  scenario: 'commute',
  scenarioLabel: SCENARIOS.commute.context,
  coupons: {}
});

let state;
try {
  const saved = JSON.parse(localStorage.getItem('peakoff-demo') || '{}');
  state = { ...initial(), ...saved };
  if (!saved.declineModelVersion || saved.declineModelVersion < 2 || !SCENARIOS[state.scenario]) {
    const fresh = initial();
    state = {
      ...fresh,
      extraSpecials: state.extraSpecials || fresh.extraSpecials,
      customSpecials: Array.isArray(state.customSpecials) ? state.customSpecials : []
    };
    localStorage.setItem('peakoff-demo', JSON.stringify(state));
  }
  if (!Array.isArray(state.occupiedTables) || state.occupiedTables.length !== 30) {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < state.occupied);
  }
  if (!state.extraSpecials || typeof state.extraSpecials !== 'object') {
    state.extraSpecials = { sandwich: true, cake: false, coldbrew: false };
  }
  if (!Array.isArray(state.customSpecials)) {
    state.customSpecials = [];
  }
} catch {
  state = initial();
}

let page = location.hash.slice(1) || 'overview';
let period = 'Today · 17:00–20:00';
let currentTourStep = null;

// Live PeakAI Advisor state
const aiState = {
  loading: false,
  suggestion: null,
  guideLoading: false,
  guideQuestion: '',
  guideAnswer: ''
};
let aiDebounceTimer = null;

const syncChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('peakoff-sync')
    : null;

if (syncChannel) {
  syncChannel.onmessage = event => {
    if (event.data && event.data.state) {
      state = { ...state, ...event.data.state };
      localStorage.setItem('peakoff-demo', JSON.stringify(state));
      render(false);
    }
  };
}

function pushServerState() {
  fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  }).catch(() => {});
}

function save(broadcast = true) {
  localStorage.setItem('peakoff-demo', JSON.stringify(state));
  if (broadcast) {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'dashboard-update', state });
    }
    pushServerState();
  }
}

const money = value => `${Number(value).toFixed(2)} AZN`;
const paused = () => state.autoPause && state.occupied === 30;

function maxMarginSafe() {
  return Math.max(
    0,
    Math.floor(100 * (1 - (state.cost + state.floor) / (state.price * 0.93)))
  );
}

function suggested() {
  const demand = Math.round(8 + (1 - state.occupied / 30) * 20 + 4);
  return Math.max(0, Math.min(state.max, demand, maxMarginSafe()));
}

/**
 * Real-time Unit Economics, Elasticity & Break-Even Calculator
 */
function computeMetrics(discountOverride) {
  const d = discountOverride !== undefined ? discountOverride : suggested();
  const price = Math.max(1, Number(state.price) || 20);
  const cost = Math.max(0, Number(state.cost) || 0);
  const floor = Math.max(0, Number(state.floor) || 0);
  const available = Math.max(0, 30 - state.occupied);

  const customerPrice = Number((price * (1 - d / 100)).toFixed(2));
  const fee = Number((customerPrice * 0.07).toFixed(2));
  const netRevenue = Number((customerPrice - fee).toFixed(2));
  const unitProfit = Number((netRevenue - cost).toFixed(2));
  const marginPct =
    customerPrice > 0 ? Number(((unitProfit / customerPrice) * 100).toFixed(1)) : 0;
  const floorBuffer = Number((unitProfit - floor).toFixed(2));
  const marginProtected = unitProfit >= floor - 1e-6;

  const mult = SCENARIOS[state.scenario]?.mult || 1.0;
  const baselineGuests = Math.max(2, Math.round((state.occupied / 30) * 10));
  const fullUnitProfit = Number((price - cost).toFixed(2));
  const baselineProfit = Number((baselineGuests * fullUnitProfit).toFixed(2));

  const rawExtra =
    d > 0 && !paused()
      ? Math.round((d / 6.5) * (available / 10) * 3.2 * mult)
      : 0;
  const extraGuests = Math.min(Math.ceil(available * 1.4), Math.max(0, rawExtra));
  const incrementalProfit = Number((extraGuests * unitProfit).toFixed(2));
  const totalProjectedProfit = Number((baselineProfit + incrementalProfit).toFixed(2));

  const projectedOccupied = Math.min(
    30,
    state.occupied + Math.min(available, Math.ceil(extraGuests * 0.7))
  );
  const currentOccPct = Math.round((state.occupied / 30) * 100);
  const projectedOccPct = Math.round((projectedOccupied / 30) * 100);

  const cannibalizedLoss = Math.ceil(baselineGuests * 0.2) * (fullUnitProfit - unitProfit);
  const breakEvenGuests =
    unitProfit > 0 ? Math.max(1, Math.ceil(cannibalizedLoss / unitProfit)) : 0;
  const rescueNetRevenue = Number((4 * 6 * 0.93).toFixed(2));

  return {
    d,
    available,
    customerPrice,
    fee,
    netRevenue,
    unitProfit,
    marginPct,
    floorBuffer,
    marginProtected,
    safeLimit: maxMarginSafe(),
    baselineGuests,
    extraGuests,
    baselineProfit,
    incrementalProfit,
    totalProjectedProfit,
    currentOccPct,
    projectedOccPct,
    breakEvenGuests,
    rescueNetRevenue
  };
}

/**
 * Request live PeakAI suggestion based on current mock venue telemetry
 */
async function requestAiSuggestion(immediate = false) {
  clearTimeout(aiDebounceTimer);
  const delay = immediate ? 0 : 450;

  aiDebounceTimer = setTimeout(async () => {
    aiState.loading = true;
    updateAiContainers();

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'suggest', state })
      });
      const data = await response.json();
      if (data && data.ok) {
        aiState.suggestion = data;
      }
    } catch {
      const m = computeMetrics();
      const prevSales = state.previousDaySales || 980;
      const dropPct = Math.abs(((state.sales - prevSales) / prevSales) * 100).toFixed(1);
      aiState.suggestion = {
        ok: true,
        source: 'local-engine',
        recommendedDiscount: m.d,
        confidence: 'High',
        headline: `Sales down ${dropPct}% · ${m.d}% margin-safe recovery offer`,
        summary: `Evening sales (${state.sales} AZN) are down ${dropPct}% vs. yesterday (${prevSales} AZN) with ${m.available} empty tables. A ${m.d}% offer protects ${money(
          m.unitProfit
        )} net profit per sale and projects +${m.extraGuests} extra guests (+${money(
          m.incrementalProfit
        )} recovery).`,
        actionGuide: [
          `Publish ${m.d}% single-use QR offer to reverse the evening sales drop-off.`,
          `Activate 4 pastry rescue bundles at 6.00 AZN before 19:00 (+${money(
            m.rescueNetRevenue
          )} net).`,
          'Scan QR coupons on arrival; offers auto-pause if 30/30 tables fill.'
        ],
        bundleTip: `Clear 4 expiring pastry bundles at 50% off to recover ${money(
          m.rescueNetRevenue
        )} before 19:00.`
      };
    } finally {
      aiState.loading = false;
      updateAiContainers();
    }
  }, delay);
}

function updateAiContainers() {
  const slot = $('#ai-live-slot');
  if (slot) {
    slot.innerHTML = renderAiPanelInner();
    enhanceIcons(slot);
  }
}

function selectScenario(id) {
  const sc = SCENARIOS[id];
  if (!sc) return;
  state.scenario = id;
  state.scenarioLabel = sc.context;
  state.occupied = sc.occupied;
  state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < sc.occupied);
  state.sales = sc.sales;
  state.visits = sc.visits;
  if (id === 'clearance') state.special = true;
  save();
  render(false);
  notify(`Scenario loaded: ${sc.label} — querying PeakAI…`);
  requestAiSuggestion(true);
}

function applyAiDiscount(pct) {
  const safeCap = Math.min(state.max, maxMarginSafe());
  const clamped = Math.max(0, Math.min(safeCap, Number(pct) || suggested()));
  state.discount = clamped;
  state.active = clamped > 0 && !paused();
  save();
  render(false);
  notify(
    state.active
      ? `Applied PeakAI's ${clamped}% dynamic offer. Synced to customer app.`
      : 'Offer updated.'
  );
}

async function submitGuideQuestion(presetQuestion) {
  const inputEl = $('#copilot-input');
  const q = presetQuestion || (inputEl ? inputEl.value.trim() : '');
  if (!q) {
    notify('Enter a question for PeakAI.');
    return;
  }
  aiState.guideQuestion = q;
  aiState.guideLoading = true;
  render(false);

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'guide', question: q, state })
    });
    const data = await response.json();
    aiState.guideAnswer =
      data?.answer ||
      'Unable to reach PeakAI right now. Showing deterministic engine guidance.';
  } catch {
    const m = computeMetrics();
    aiState.guideAnswer = `Based on ${state.occupied}/30 occupied tables:\n• Recommended discount: ${m.d}% (Customer pays ${money(
      m.customerPrice
    )}, 7% fee = ${money(m.fee)})\n• Net profit per sale: ${money(
      m.unitProfit
    )} (+${money(m.floorBuffer)} above your ${money(
      state.floor
    )} floor)\n• Projected 17:00–20:00 lift: +${m.extraGuests} guests (+${money(
      m.incrementalProfit
    )} incremental profit).`;
  } finally {
    aiState.guideLoading = false;
    render(false);
  }
}

const IMAGES = {
  pastry:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85',
  coffeeCombo:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=85',
  welcome:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85',
  sandwich:
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85',
  cake:
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85',
  coldbrew:
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=85',
  croissant:
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85'
};

const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='360' viewBox='0 0 600 360'%3E%3Crect width='600' height='360' fill='%23e8f7f2'/%3E%3Ccircle cx='300' cy='165' r='44' fill='%23008f83' opacity='.18'/%3E%3Ctext x='300' y='245' text-anchor='middle' font-family='sans-serif' font-size='18' font-weight='700' fill='%23052b3b'%3ECoffee %26 Co Special%3C/text%3E%3C/svg%3E";

const food = IMAGES.croissant;

function notify(message) {
  const toastEl = $('#toast');
  toastEl.textContent = message;
  toastEl.style.display = 'block';
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toastEl.style.display = 'none';
  }, 3300);
}

function scenarioBar() {
  return `<div class="scenario-bar" role="region" aria-label="Live mock data scenarios">
    <span class="scenario-label">Live mock scenario:</span>
    ${Object.values(SCENARIOS)
      .map(
        sc =>
          `<button class="scenario-chip ${
            (state.scenario || 'commute') === sc.id ? 'active' : ''
          }" onclick="selectScenario('${sc.id}')">${sc.label}</button>`
      )
      .join('')}
  </div>`;
}

function renderAiPanelInner() {
  const m = computeMetrics();
  const s = aiState.suggestion;
  const recPct = s ? s.recommendedDiscount : m.d;
  const badgeLabel = aiState.loading
    ? 'PeakAI · Analyzing live telemetry…'
    : s?.source === 'peakai-live'
    ? `PeakAI Live · ${s.confidence || 'High'} confidence`
    : 'PeakAI Optimization Engine';

  const prevSales = state.previousDaySales || 980;
  const dropPct = Math.abs(((state.sales - prevSales) / prevSales) * 100).toFixed(1);
  const headline = s
    ? s.headline
    : `Sales down ${dropPct}% (−${Math.max(0, Math.round(prevSales - state.sales))} AZN) · ${m.d}% recovery offer`;
  const summary = s
    ? s.summary
    : `Today's sales (${state.sales} AZN) are trailing yesterday (${prevSales} AZN) with ${m.available} empty tables. A ${m.d}% discount keeps net profit at ${money(
        m.unitProfit
      )} per sale (+${money(m.floorBuffer)} above floor) and projects +${
        m.extraGuests
      } evening guests (+${money(m.incrementalProfit)} recovery).`;
  const guideItems =
    s?.actionGuide || [
      `Publish a ${m.d}% evening offer to fill ${m.available} available tables.`,
      `Activate 4 pastry rescue bundles at 6.00 AZN before 19:00 (+${money(
        m.rescueNetRevenue
      )} net).`,
      'Scan single-use QR vouchers at arrival; auto-pause protects full capacity.'
    ];
  const bundleTip =
    s?.bundleTip ||
    `Pastry rescue tip: Clear 4 expiring bundles at 50% off to recover ${money(
      m.rescueNetRevenue
    )} net revenue.`;

  return `
    <div class="ai-head">
      <span class="ai-badge"><span class="ai-pulse"></span> ${badgeLabel}</span>
      <span style="font-size:12px;color:#9fc0cc">${
        state.scenarioLabel || SCENARIOS.commute.context
      }</span>
    </div>
    <div class="ai-body">
      <div>
        <div class="ai-headline">${headline}</div>
        <p class="ai-summary">${summary}</p>
        <div class="ai-actions">
          <button class="btn ai-apply" ${
            paused() || recPct === 0 ? 'disabled' : ''
          } onclick="applyAiDiscount(${recPct})">✓ Apply ${recPct}% PeakAI offer</button>
          <button class="btn ai-ghost" onclick="requestAiSuggestion(true)">↻ Refresh PeakAI</button>
          <button class="btn ai-ghost" onclick="navigate('guide')">Open PeakAI Guide →</button>
        </div>
      </div>
      <div class="ai-guide-card">
        <h3>Live 3-Step Owner Playbook</h3>
        <ol class="ai-guide-list">
          ${guideItems.map(item => `<li>${item}</li>`).join('')}
        </ol>
        <div class="ai-bundle-tip">★ ${bundleTip}</div>
      </div>
    </div>
  `;
}

function aiPanel() {
  return `<section class="ai-panel" id="ai-live-slot" aria-live="polite">${renderAiPanelInner()}</section>`;
}

function pageHeading(title, sub) {
  return `<div class="page-top">
    <div>
      <h1>${title}</h1>
      <p class="subtitle">${sub}</p>
    </div>
    <div class="actions">
      <button class="btn" onclick="verifyModal()">✓ Verify coupon</button>
      <button class="btn" onclick="navigate('guide')">✦ PeakAI Guide</button>
      <button class="btn" onclick="tour(0)">▷ Walk through demo</button>
      <select class="date" aria-label="Reporting period" onchange="period=this.value;render(false)">
        <option ${period.startsWith('Today') ? 'selected' : ''}>Today · 17:00–20:00</option>
        <option ${period.startsWith('Yesterday') ? 'selected' : ''}>Yesterday · 17:00–20:00</option>
      </select>
    </div>
  </div>`;
}

function chart() {
  const yesterday = period.startsWith('Yesterday');
  const slots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
  const prevValues = [670, 645, 620, 595, 575, 555, 540];
  const scSeries = SCENARIOS[state.scenario]?.series || [540, 440, 345, 260, 195, 150, 115];
  const values = yesterday
    ? [610, 545, 480, 415, 360, 315, 280]
    : scSeries;

  const valToY = v => Math.round(200 - (Math.max(0, Math.min(800, v)) / 800) * 180);
  const prevYs = prevValues.map(valToY);
  const ys = values.map(valToY);

  const recoveryValues = [
    values[2],
    Math.min(640, values[3] + 150),
    Math.min(650, values[4] + 245),
    Math.min(660, values[5] + 315),
    Math.min(670, values[6] + 370)
  ];
  const recoveryPoints = recoveryValues
    .map((v, idx) => `${230 + idx * 94},${valToY(v)}`)
    .join(' ');

  return `<svg class="chart" viewBox="0 0 620 230" role="img" aria-label="Declining evening sales pace compared with previous days">
    <defs>
      <linearGradient id="fillDecline" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#d94f46" stop-opacity=".18"/>
        <stop offset="1" stop-color="#d94f46" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${[20, 65, 110, 155, 200]
      .map(
        (y, i) =>
          `<line x1="42" y1="${y}" x2="610" y2="${y}" stroke="#edf1f0"/><text x="5" y="${
            y + 4
          }">${800 - i * 200}</text>`
      )
      .join('')}
    <path d="M42 ${ys[0]} ${ys
    .slice(1)
    .map((y, i) => `L${136 + i * 94} ${y}`)
    .join(' ')} L606 200H42Z" fill="url(#fillDecline)"/>
    <polyline points="${prevYs
      .map((y, i) => `${42 + i * 94},${y}`)
      .join(' ')}" stroke="#9aaab0" stroke-width="2.5" stroke-dasharray="4 3" fill="none"/>
    <polyline points="${ys
      .map((y, i) => `${42 + i * 94},${y}`)
      .join(' ')}" fill="none" stroke="#d94f46" stroke-width="3"/>
    ${
      state.active && !yesterday
        ? `<polyline points="${recoveryPoints}" fill="none" stroke="#00a28a" stroke-width="2.8" stroke-dasharray="6 4"/>`
        : ''
    }
    ${ys
      .map((y, i) => {
        const dropSlotPct = Math.round(((values[i] - prevValues[i]) / prevValues[i]) * 100);
        return `<circle class="point" cx="${
          42 + i * 94
        }" cy="${y}" r="4" fill="white" stroke="#d94f46" stroke-width="2" onclick="notify('${
          slots[i]
        } sales pace: ${values[i]} AZN vs ${prevValues[i]} AZN previous days (${dropSlotPct}% decline)')"><title>${
          slots[i]
        } · ${values[i]} AZN (${dropSlotPct}% vs previous days)</title></circle>`;
      })
      .join('')}
    ${slots
      .map((t, i) => `<text x="${27 + i * 94}" y="224">${t}</text>`)
      .join('')}
  </svg>`;
}

function overview() {
  const yesterday = period.startsWith('Yesterday');
  const m = computeMetrics(state.active ? state.discount : suggested());
  const prevSales = state.previousDaySales || 980;
  const prevVisits = state.previousDayVisits || 17;
  const salesDiff = state.sales - prevSales;
  const salesPct = ((salesDiff / prevSales) * 100).toFixed(1);
  const salesDeclining = !yesterday && salesDiff < 0;
  const visitsDiff = state.visits - prevVisits;
  const visitsDeclining = !yesterday && visitsDiff < 0;

  const stats = [
    [
      'sales',
      'Sales today',
      yesterday ? prevSales.toLocaleString() : state.sales.toLocaleString(),
      '<small> AZN</small>',
      yesterday
        ? 'Previous-day baseline · 7-day avg 1,040 AZN'
        : salesDeclining
        ? `<span class="red">↘ ${Math.abs(salesPct)}% (−${Math.abs(
            Math.round(salesDiff)
          )} AZN)</span> vs. yesterday (${prevSales} AZN)`
        : `<span class="green">↗ +${Math.abs(salesPct)}%</span> recovered above yesterday`,
      salesDeclining ? 'decline' : ''
    ],
    [
      'visits',
      'Visits today',
      yesterday ? prevVisits : state.visits,
      '',
      yesterday
        ? 'Previous-day evening walk-ins'
        : visitsDeclining
        ? `<span class="red">↘ ${Math.abs(
            visitsDiff
          )} fewer guests</span> vs. yesterday (${prevVisits}) · +${m.extraGuests} w/ offer`
        : `<span class="green">↗ +${m.extraGuests} guests</span> forecasted (17:00–20:00)`,
      visitsDeclining ? 'decline' : ''
    ],
    [
      'tables',
      'Tables occupied',
      state.occupied,
      '<small> / 30</small>',
      `${m.available} empty · projects ${m.currentOccPct}% → ${m.projectedOccPct}% w/ PeakOff`,
      'highlight'
    ],
    [
      'offers',
      'Coupons claimed / redeemed',
      state.claimed,
      `<small> / ${state.redeemed}</small>`,
      `+${money(m.incrementalProfit)} projected off-peak profit recovery`,
      ''
    ]
  ];

  return (
    pageHeading(
      'Business overview',
      salesDeclining
        ? `Evening sales are down ${Math.abs(
            salesPct
          )}% vs. yesterday. Live PeakAI recovery & margin protection ready.`
        : 'Live PeakAI recommendations & margin calculations ready.'
    ) +
    scenarioBar() +
    aiPanel() +
    `<div class="stats">${stats
      .map(
        ([i, l, n, u, b, cardCls]) =>
          `<div class="card stat ${cardCls}">
            <div class="stat-top">${l}<span class="stat-icon" style="${
            cardCls === 'decline'
              ? 'background:#fdeceb;color:#c63b33'
              : 'background:#e9f7f2;color:#009888'
          }">${icon(i)}</span></div>
            <div class="stat-value">${n}${u}</div>
            <div class="stat-bottom">${b}</div>
          </div>`
      )
      .join('')}</div>
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Evening sales drop-off</h2>
          <div class="legend">
            <span><i class="dot red"></i>${
              yesterday ? 'Yesterday (dipping)' : 'Today (declining)'
            }</span>
            <span><i class="dot gray"></i>Previous days avg</span>
            ${
              state.active && !yesterday
                ? `<span><i class="dot"></i>With ${state.discount}% offer</span>`
                : ''
            }
          </div>
        </div>
        ${chart()}
      </section>
      <section class="card">
        <div class="card-head">
          <h2>Live occupancy</h2>
          <button class="edit-link" onclick="navigate('tables')">Update tables ↗</button>
        </div>
        <div class="occupancy">
          <svg viewBox="0 0 280 160" aria-label="${state.occupied} of 30 tables occupied">
            <path d="M30 140 A110 110 0 0 1 250 140" pathLength="100" fill="none" stroke="#edf1f1" stroke-width="20" stroke-linecap="round"/>
            <path d="M30 140 A110 110 0 0 1 250 140" pathLength="100" fill="none" stroke="#00a28b" stroke-width="20" stroke-linecap="round" stroke-dasharray="${Math.max(
              0.1,
              (state.occupied / 30) * 100
            )} 100"/>
          </svg>
          <div class="gauge-label">
            <strong>${state.occupied}<span class="muted"> / 30</span></strong>
            <p>Tables occupied</p>
          </div>
        </div>
        <div class="occupancy-keys">
          <span>▱ &nbsp;<b>${state.occupied}</b> occupied</span>
          <span>▱ &nbsp;<b>${30 - state.occupied}</b> available</span>
        </div>
      </section>
    </div>
    <div class="bottom-grid">
      <section class="card">
        <div class="card-head">
          <h2>Offer performance</h2>
          <button class="edit-link" onclick="navigate('offers')">Open calculator ↗</button>
        </div>
        <div class="offer-row">
          <img class="food" src="${food}" alt="Fresh croissants">
          <div>
            <h3>Coffee &amp; pastry</h3>
            <span class="badge">${state.active ? state.discount : 20}% off · ${money(
      m.unitProfit
    )} net profit/sale</span>
          </div>
          <div class="offer-count">
            <strong>${state.redeemed}</strong>
            <p>Redemptions</p>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="card-head">
          <h2>Latest activity</h2>
          <span class="badge danger">↘ Sales alert</span>
        </div>
        <div class="activity">
          <span class="activity-icon" style="background:#fdeceb;color:#c63b33">↘</span>
          <div>
            <p>Evening sales declining (−${Math.abs(salesPct)}% vs. yesterday)</p>
            <small>17:00–20:00 shortfall: −${Math.max(
              0,
              Math.round(prevSales - state.sales)
            )} AZN · ${m.available} empty tables</small>
          </div>
        </div>
        <div class="activity">
          <span class="activity-icon">${state.active ? '✓' : 'ϟ'}</span>
          <div>
            <p>${
              state.active
                ? `${state.discount}% PeakOff recovery offer active`
                : `PeakAI suggests ${m.d}% offer (+${money(m.incrementalProfit)} lift)`
            }</p>
            <small>Nizami Street commuter corridor</small>
          </div>
        </div>
      </section>
    </div>`
  );
}

function offers() {
  const m = computeMetrics();
  const d = m.d;

  return (
    pageHeading(
      'Smart discount manager',
      'Dynamic AI pricing, live unit-economics & off-peak profit projections.'
    ) +
    scenarioBar() +
    aiPanel() +
    `${
      paused()
        ? '<div class="notice">Your venue is full. Active offers are paused automatically.</div>'
        : ''
    }
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Dynamic pricing controls</h2>
          <span class="badge">${state.active ? `Active · ${state.discount}%` : 'Ready when you are'}</span>
        </div>
        <label for="max">Owner maximum discount ceiling <strong class="green" style="float:right;font-size:23px">${
          state.max
        }%</strong></label>
        <input id="max" type="range" min="0" max="50" value="${
          state.max
        }" oninput="update('max',Number(this.value))">
        <div class="range-labels">
          <span>0%</span>
          <span>Margin-safe ceiling: ${m.safeLimit}% · Owner cap: ${state.max}%</span>
          <span>50%</span>
        </div>
        <div class="split">
          <div>
            <label for="cost">Product unit cost (AZN)</label>
            <input id="cost" type="number" min="0" max="1000" step=".5" value="${
              state.cost
            }" onchange="update('cost',Math.max(0,Number(this.value)))">
          </div>
          <div>
            <label for="floor">Minimum profit after costs (AZN)</label>
            <input id="floor" type="number" min="0" max="1000" step=".5" value="${
              state.floor
            }" onchange="update('floor',Math.max(0,Number(this.value)))">
          </div>
        </div>
        <div class="suggestion">
          <strong>↗ Calculated optimal discount: ${d}%</strong>
          <p>${
            state.occupied === 30
              ? 'No empty tables. Consider pausing your offer.'
              : `${m.available} empty tables + ${
                  SCENARIOS[state.scenario]?.label || 'evening demand'
                }`
          }<br>${
            m.marginProtected
              ? `✓ Minimum profit protected (+${money(
                  m.floorBuffer
                )} buffer above your ${money(state.floor)} floor).`
              : 'No feasible offer: lower your profit floor or raise regular price.'
          }</p>
        </div>
        <button class="btn primary wide" ${
          paused() || !m.marginProtected ? 'disabled' : ''
        } onclick="activate()">${state.active ? 'Update' : 'Apply'} ${d}% offer</button>
        <div class="switch-row">
          <label for="auto" style="margin:0">Pause offers when venue is full (30/30)</label>
          <input id="auto" type="checkbox" ${
            state.autoPause ? 'checked' : ''
          } onchange="update('autoPause',this.checked)">
        </div>
      </section>

      <section class="card">
        <h2>Unit economics breakdown</h2>
        <label for="price">Regular menu price (AZN)</label>
        <input id="price" type="number" min="1" max="10000" step=".5" value="${
          state.price
        }" onchange="update('price',Math.max(1,Number(this.value)))">
        ${[
          ['Applied discount', `${d}% (cap: ${Math.min(state.max, m.safeLimit)}%)`],
          ['Customer pays', money(m.customerPrice)],
          ['PeakOff fee · 7% on verified QR scan', `− ${money(m.fee)}`],
          ['Net business revenue (93%)', money(m.netRevenue)],
          ['Product unit cost', `− ${money(state.cost)}`]
        ]
          .map(
            ([k, v]) =>
              `<div class="money-row"><span>${k}</span><strong>${v}</strong></div>`
          )
          .join('')}
        <div class="money-row total">
          <span>Net profit per redeemed sale<br><small>Net margin: ${m.marginPct}% · Floor buffer: +${money(
      Math.max(0, m.floorBuffer)
    )}</small></span>
          <strong class="green">${money(m.unitProfit)}</strong>
        </div>
        ${
          state.active
            ? '<button class="btn wide" style="margin-top:16px" onclick="customerDemo()">Preview customer journey →</button>'
            : ''
        }
      </section>
    </div>

    <section class="card" style="margin-bottom:23px">
      <div class="card-head">
        <h2>Evening impact &amp; break-even simulator (17:00–20:00)</h2>
        <span class="badge">Live projection</span>
      </div>
      <div class="calc-grid">
        <div class="calc-box accent">
          <small>Incremental evening profit</small>
          <strong>+${money(m.incrementalProfit)}</strong>
          <span>${money(m.baselineProfit)} baseline → ${money(
      m.totalProjectedProfit
    )} total</span>
        </div>
        <div class="calc-box">
          <small>Projected extra guests</small>
          <strong>+${m.extraGuests} visits</strong>
          <span>Occupancy lift: ${m.currentOccPct}% → ${m.projectedOccPct}%</span>
        </div>
        <div class="calc-box">
          <small>Break-even threshold</small>
          <strong>+${m.breakEvenGuests} guest${m.breakEvenGuests === 1 ? '' : 's'}</strong>
          <span>Extra sales needed to beat 0% discount</span>
        </div>
        <div class="calc-box">
          <small>Perishable rescue recovery</small>
          <strong>+${money(m.rescueNetRevenue)}</strong>
          <span>4 expiring bundles @ 6.00 AZN (${
            state.special ? 'Active' : 'Ready'
          })</span>
        </div>
      </div>
      <div class="formula-card">
        <strong>How PeakOff calculates your safe recommendation:</strong><br>
        1. <strong>Margin-Safe Ceiling:</strong> <code>floor(100 × (1 − (${money(
          state.cost
        )} + ${money(state.floor)}) / (${money(
      state.price
    )} × 0.93))) = ${m.safeLimit}%</code><br>
        2. <strong>Demand Signal:</strong> <code>round(8 + (1 − ${
          state.occupied
        }/30) × 20 + 4) = ${Math.round(
      8 + (1 - state.occupied / 30) * 20 + 4
    )}%</code><br>
        3. <strong>Final Enforced Cap:</strong> <code>min(Owner Ceiling ${
          state.max
        }%, Margin Limit ${m.safeLimit}%, Demand Signal) = ${d}%</code> — guaranteeing your profit never drops below <strong>${money(
      state.floor
    )}</strong>.
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <h2>Special inventory offers</h2>
        <button class="edit-link" onclick="navigate('inventory')">Manage inventory ↗</button>
      </div>
      <div class="offer-row">
        <img class="food" src="${food}" alt="Croissants">
        <div>
          <h3>4 pastry bundles near best-before date</h3>
          <p>Safe to sell today until 19:00 · Recovers +${money(
            m.rescueNetRevenue
          )} net revenue</p>
          <span class="badge">Limited stock</span>
        </div>
        <button class="btn primary" style="margin-left:auto" onclick="specialOffer()">${
          state.special ? 'Offer is active ✓' : 'Create limited offer →'
        }</button>
      </div>
    </section>`
  );
}

function tables() {
  if (!Array.isArray(state.occupiedTables) || state.occupiedTables.length !== 30) {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < state.occupied);
  }

  return (
    pageHeading(
      'Your tables',
      'Keep availability up to date. Your AI recommendation & auto-pause follow capacity in real time.'
    ) +
    `<section class="card">
      <div class="card-head">
        <h2>${state.occupied} occupied · ${30 - state.occupied} available</h2>
        <div class="actions">
          <button class="btn" onclick="setAllTables(false)">All available</button>
          <button class="btn" onclick="setAllTables(true)">Venue is full</button>
        </div>
      </div>
      <p class="subtitle">Select any table to toggle occupancy. Changing capacity recalculates your optimal discount immediately.</p>
      <div class="table-grid">
        ${Array.from(
          { length: 30 },
          (_, i) =>
            `<button class="table-btn ${
              state.occupiedTables[i] ? 'occupied' : ''
            }" onclick="toggleTable(${i})">▱ ${String(i + 1).padStart(
              2,
              '0'
            )}<span>${state.occupiedTables[i] ? 'Occupied' : 'Available'}</span></button>`
        ).join('')}
      </div>
      <div class="suggestion">
        <strong>${
          paused()
            ? 'Offers paused · venue is full (30/30)'
            : `${30 - state.occupied} tables available for your next guests`
        }</strong>
        <p>${
          paused()
            ? 'Free a table to resume your active offer.'
            : `Live calculated discount: ${suggested()}% (protects ${money(
                computeMetrics().unitProfit
              )} net profit per sale).`
        }</p>
      </div>
    </section>`
  );
}

function inventory() {
  const m = computeMetrics();
  const extra = state.extraSpecials || {};
  const builtInItems = [
    {
      name: 'Pastry rescue bundle',
      tag: 'Near-expiry · 19:00',
      stock: '4 bundles available',
      desc: 'Artisan butter croissants & danishes baked this morning · Safe until 19:00',
      deal: '50% off · 6.00 AZN',
      net: `+${money(22.32)} net`,
      img: IMAGES.pastry,
      active: Boolean(state.special),
      fn: 'specialOffer()'
    },
    {
      name: 'Signature coffee & croissant',
      tag: 'Off-peak · 17:00–20:00',
      stock: 'Evening commuter stop',
      desc: `Double cappuccino + warm croissant · Protects ${money(
        m.unitProfit
      )} profit/sale`,
      deal: `${state.active ? state.discount : 20}% off · ${money(
        state.price
      )} reg`,
      net: `${money(m.netRevenue)} net/sale`,
      img: IMAGES.coffeeCombo,
      active: Boolean(state.active),
      fn: "navigate('offers')"
    },
    {
      name: 'Welcome to Coffee & Co',
      tag: 'First-visit promo',
      stock: 'New customer acquisition',
      desc: 'Flat white or iced latte + house cookie · Turns commuters into regulars',
      deal: '15% off · 8.50 AZN',
      net: '+7.91 AZN net/sale',
      img: IMAGES.welcome,
      active: Boolean(state.welcome),
      fn: 'welcomeOffer()'
    },
    {
      name: 'Club sandwich & fresh juice',
      tag: 'Prepared today · 20:00',
      stock: '5 lunch-to-dinner boxes left',
      desc: 'Grilled chicken club + pressed orange juice · Zero end-of-day food waste',
      deal: '40% off · 7.20 AZN',
      net: '+33.48 AZN net total',
      img: IMAGES.sandwich,
      active: Boolean(extra.sandwich),
      fn: "toggleExtraSpecial('sandwich','Club sandwich & fresh juice')"
    },
    {
      name: 'Honey cake & cheesecake duo',
      tag: 'Patisserie rescue',
      stock: '3 dessert duo boxes left',
      desc: 'Fresh Baku honey cake + San Sebastian slice · Evening tea pairing',
      deal: '35% off · 9.10 AZN',
      net: '+25.39 AZN net total',
      img: IMAGES.cake,
      active: Boolean(extra.cake),
      fn: "toggleExtraSpecial('cake','Honey cake & cheesecake duo')"
    },
    {
      name: 'Cold brew & iced matcha 2-pack',
      tag: 'Excess batch',
      stock: '6 chilled bottles ready',
      desc: 'Small-batch 18h cold brew + ceremonial iced matcha · Grab-and-go commute',
      deal: '30% off · 8.40 AZN',
      net: '+46.87 AZN net total',
      img: IMAGES.coldbrew,
      active: Boolean(extra.coldbrew),
      fn: "toggleExtraSpecial('coldbrew','Cold brew & iced matcha 2-pack')"
    }
  ];

  const customItems = (state.customSpecials || []).map((item, idx) => ({
    name: item.name,
    tag: 'Custom special',
    stock: `${item.stock} available · until ${item.until}`,
    desc: 'Custom venue promotional & waste-reduction bundle',
    deal: `${item.discount}% off · ${money(item.price)}`,
    net: `+${money(item.stock * item.price * 0.93)} net`,
    img: IMAGES[item.imgKey] || IMAGES.pastry,
    active: Boolean(item.active),
    fn: `toggleCustomSpecial(${idx})`
  }));

  const allItems = [...builtInItems, ...customItems];
  const activeCount = allItems.filter(i => i.active).length;

  return (
    pageHeading(
      'Special inventory',
      'Turn expiring stock & off-peak hours into high-margin customer acquisition.'
    ) +
    `<div class="scenario-bar" style="justify-content:space-between">
      <span><strong>${activeCount} of ${
      allItems.length
    }</strong> special inventory offers currently active on PeakOff</span>
      <button class="btn primary" style="padding:8px 14px" onclick="addSpecialModal()">+ Add special item</button>
    </div>
    <div class="inventory-grid">${allItems
      .map(
        item =>
          `<section class="card">
            <div class="inventory-thumb">
              <img class="food" src="${item.img}" alt="${item.name.replace(
            /"/g,
            '&quot;'
          )}" loading="lazy" onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
              <span class="inventory-tag">${item.tag}</span>
            </div>
            <h2>${item.name}</h2>
            <p><strong>${item.stock}</strong><br>${item.desc}</p>
            <div class="inventory-meta">
              <span class="badge">${item.deal}</span>
              <span class="inventory-net">${item.net}</span>
            </div>
            <div class="inventory-card-spacer"></div>
            <button class="btn ${item.active ? '' : 'primary'}" onclick="${
            item.fn
          }">${item.active ? 'Active ✓ · Pause / manage' : 'Activate offer →'}</button>
          </section>`
      )
      .join('')}</div>`
  );
}

function insights() {
  const m = computeMetrics(state.active ? state.discount : suggested());
  const prevSales = state.previousDaySales || 980;
  const salesDiff = state.sales - prevSales;
  const salesPct = ((salesDiff / prevSales) * 100).toFixed(1);
  return (
    pageHeading(
      'Business insights',
      'Off-peak sales drop-off diagnostics, demand elasticity & closed-loop conversion analytics.'
    ) +
    `<div class="calc-grid" style="margin-top:0;margin-bottom:22px">
      <div class="calc-box" style="background:#fff9f8;border-color:#f3d2cf">
        <small>Today's revenue shortfall</small>
        <strong style="color:#c63b33">−${Math.max(
          0,
          Math.round(prevSales - state.sales)
        )} AZN</strong>
        <span>↘ ${Math.abs(salesPct)}% vs. previous day (${prevSales} AZN)</span>
      </div>
      <div class="calc-box accent">
        <small>Net profit per QR guest</small>
        <strong>${money(m.unitProfit)}</strong>
        <span>${m.marginPct}% margin after 7% fee &amp; cost</span>
      </div>
      <div class="calc-box">
        <small>Projected seat recovery</small>
        <strong>${m.currentOccPct}% → ${m.projectedOccPct}%</strong>
        <span>+${m.extraGuests} off-peak commuter guests</span>
      </div>
      <div class="calc-box">
        <small>Waste-reduction value</small>
        <strong>+${money(m.rescueNetRevenue)}</strong>
        <span>Saved from 4 near-expiry bundles</span>
      </div>
    </div>
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Evening sales drop-off</h2>
          <span class="badge danger">↘ ${Math.abs(salesPct)}% decline today</span>
        </div>
        ${chart()}
      </section>
      <section class="card">
        <h2>Where sales decline steepest</h2>
        ${[
          ['17:00–18:00', '<span class="red">↘ −24% sales</span> · 40% occupancy'],
          ['18:00–19:00', '<span class="red">↘ −54% sales</span> · 33% occupancy'],
          ['19:00–20:00', '<span class="red">↘ −76% sales</span> · Steepest drop-off']
        ]
          .map(
            ([t, v]) =>
              `<div class="money-row"><strong>${t}</strong><span>${v}</span></div>`
          )
          .join('')}
        <div class="suggestion">
          <strong>PeakAI root-cause &amp; recovery insight</strong>
          <p>Walk-in sales drop sharply after 17:30 as Nizami Street office workers rush to 28 May &amp; Sahil metro. Publishing a 20–25% single-use QR offer captures commuters along their route before empty tables go unmonetized.</p>
        </div>
        <button class="btn primary wide" onclick="navigate('offers')">Reverse evening drop-off →</button>
      </section>
    </div>`
  );
}

function guide() {
  const m = computeMetrics();
  const presetPrompts = [
    'How is my minimum profit floor guaranteed?',
    'What is the best strategy for my 18 empty tables right now?',
    'How should I price and bundle my 4 expiring pastry packs?',
    'Explain the 7% fee and break-even math with my current numbers'
  ];

  const stages = [
    [
      'STAGE 01–02',
      'Profile & Live Capacity',
      `30 total tables (${state.occupied} occupied, ${m.available} free). Menu price ${money(
        state.price
      )}, unit cost ${money(state.cost)}, profit floor ${money(state.floor)}.`
    ],
    [
      'STAGE 03–04',
      'PeakAI Demand & Margin Cap',
      `PeakAI & the pricing engine cap discounts at min(Owner ${state.max}%, Margin-Safe ${m.safeLimit}%) → recommending ${m.d}%.`
    ],
    [
      'STAGE 05–06',
      'Owner Approval & Rescue',
      `You control publication, auto-pause at 30/30 tables, and 50% near-expiry bundles (+${money(
        m.rescueNetRevenue
      )} net recovery).`
    ],
    [
      'STAGE 07–09',
      'Commuter Route Discovery',
      'Commuters on Metro/Bus see your ranked offer along their route and claim a single-use cryptographic QR coupon.'
    ],
    [
      'STAGE 10–11',
      'Staff QR Verification',
      `Staff verify the code in 1 click. Duplicate or full-house redemptions are blocked automatically.`
    ],
    [
      'STAGE 12–13',
      '7% Fee & Learning Loop',
      `Customer pays ${money(m.customerPrice)}, fee is ${money(
        m.fee
      )}, you net ${money(m.unitProfit)} profit. Results refine future forecasts.`
    ]
  ];

  return (
    pageHeading(
      'Business strategy guide & PeakAI co-pilot',
      'Ask PeakAI anything about your live margins, capacity strategy, or PeakOff workflow.'
    ) +
    `<section class="card" style="margin-bottom:23px">
      <div class="card-head">
        <h2>Ask PeakAI Business Co-Pilot</h2>
        <span class="badge">PeakAI Live</span>
      </div>
      <p class="subtitle" style="margin-top:0">Every answer is calculated using your venue's current numbers (${
        state.occupied
      }/30 tables, ${money(state.price)} price, ${money(state.cost)} cost, ${money(
      state.floor
    )} minimum profit).</p>
      <div class="copilot-box">
        <input id="copilot-input" type="text" value="${
          aiState.guideQuestion || ''
        }" placeholder="Ask e.g. What happens to my profit if 10 more tables fill up?" onkeydown="if(event.key==='Enter')submitGuideQuestion()">
        <button class="btn primary" ${
          aiState.guideLoading ? 'disabled' : ''
        } onclick="submitGuideQuestion()">${
      aiState.guideLoading ? 'Thinking…' : 'Ask PeakAI →'
    }</button>
      </div>
      <div class="prompt-chips">
        ${presetPrompts
          .map(
            p =>
              `<button class="prompt-chip" onclick="submitGuideQuestion('${p.replace(
                /'/g,
                "\\'"
              )}')">✦ ${p}</button>`
          )
          .join('')}
      </div>
      ${
        aiState.guideLoading
          ? '<div class="ai-answer">Analyzing your live venue telemetry with PeakAI…</div>'
          : aiState.guideAnswer
          ? `<div class="ai-answer">${aiState.guideAnswer
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')}</div>`
          : ''
      }
    </section>

    <section class="card">
      <div class="card-head">
        <h2>End-to-end platform playbook (Stages 01–13)</h2>
        <button class="edit-link" onclick="tour(0)">Launch Azerbaijani speaker tour ↗</button>
      </div>
      <div class="stage-grid">
        ${stages
          .map(
            ([num, title, copy]) =>
              `<div class="stage-card">
                <span class="stage-num">${num}</span>
                <h3>${title}</h3>
                <p>${copy}</p>
              </div>`
          )
          .join('')}
      </div>
    </section>`
  );
}

function settings() {
  return (
    pageHeading(
      'Venue settings',
      'The details behind your next great customer experience.'
    ) +
    `<section class="card" style="max-width:680px">
      <h2>Coffee &amp; Co</h2>
      <div class="money-row"><span>Location</span><strong>Nizami Street, Baku</strong></div>
      <div class="money-row"><span>Venue category</span><strong>Coffee shop</strong></div>
      <div class="money-row"><span>Total tables</span><strong>30</strong></div>
      <div class="money-row"><span>Permitted discount ceiling</span><strong>${state.max}%</strong></div>
      <div class="money-row"><span>Optimization Engine</span><strong>PeakAI (Live)</strong></div>
      <div class="switch-row">
        <label for="setting-auto" style="margin:0">Automatically pause when full</label>
        <input id="setting-auto" type="checkbox" ${
          state.autoPause ? 'checked' : ''
        } onchange="update('autoPause',this.checked)">
      </div>
      <div class="notice">Presentation workspace. Venue details are sample data with live AI reasoning.</div>
      <button class="btn" onclick="resetDemo()">Reset all demo data</button>
    </section>`
  );
}

function navigate(nextPage) {
  location.hash = nextPage;
  page = nextPage;
  render(false);
}

function enhanceIcons(root = document.body) {
  const symbols = {
    '☕': 'coffee',
    '♧': 'bell',
    '⌄': 'chevron',
    '↺': 'reset',
    'ⓘ': 'info',
    'ϟ': 'bolt',
    '▱': 'tables',
    '↗': 'trend',
    '↘': 'trendDown',
    '→': 'arrow',
    '✓': 'check',
    '▷': 'play',
    '✦': 'sparkle'
  };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (
      !node.parentElement.closest('script,style,svg,option,textarea') &&
      Object.keys(symbols).some(char => node.nodeValue.includes(char))
    ) {
      targets.push(node);
    }
  }

  for (const node of targets) {
    const fragment = document.createDocumentFragment();
    for (const part of node.nodeValue.split(/([☕♧⌄↺ⓘϟ▱↗↘→✓▷✦])/)) {
      if (symbols[part]) {
        const el = document.createElement('template');
        el.innerHTML = icon(symbols[part]);
        fragment.append(el.content);
      } else {
        fragment.append(document.createTextNode(part));
      }
    }
    node.replaceWith(fragment);
  }
}

function render(persistState = true) {
  const nav = [
    ['overview', 'Overview'],
    ['offers', 'Offers'],
    ['tables', 'Tables'],
    ['inventory', 'Inventory'],
    ['insights', 'Insights'],
    ['guide', 'PeakAI Guide'],
    ['settings', 'Settings']
  ];
  if (!nav.some(([p]) => p === page)) page = 'overview';

  $('#nav').innerHTML = nav
    .map(
      ([p, n]) =>
        `<button class="${p === page ? 'active' : ''}" onclick="navigate('${p}')" ${
          p === page ? 'aria-current="page"' : ''
        }>${icon(p)}${n}</button>`
    )
    .join('');

  const views = {
    overview,
    offers,
    tables,
    inventory,
    insights,
    guide,
    settings
  };
  $('#main').innerHTML = views[page]();
  enhanceIcons();
  if (persistState) save();
}

function update(key, value) {
  state[key] = value;
  if (key === 'occupied') {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < value);
  }
  save();
  render(false);
  requestAiSuggestion(false);
}

function setAllTables(occupied) {
  state.occupiedTables = Array.from({ length: 30 }, () => occupied);
  state.occupied = occupied ? 30 : 0;
  save();
  render(false);
  requestAiSuggestion(true);
}

function toggleTable(index) {
  if (!Array.isArray(state.occupiedTables) || state.occupiedTables.length !== 30) {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < state.occupied);
  }
  state.occupiedTables[index] = !state.occupiedTables[index];
  state.occupied = state.occupiedTables.filter(Boolean).length;
  save();
  render(false);
  requestAiSuggestion(false);
}

function activate() {
  state.discount = suggested();
  state.active = true;
  save();
  render(false);
  notify(
    `${state.discount}% evening offer activated. Customers can now claim it.`
  );
}

function modal(html) {
  const dialogEl = $('#dialog');
  dialogEl.innerHTML = html;
  enhanceIcons(dialogEl);
  if (!dialogEl.open) dialogEl.showModal();
}

function specialOffer() {
  modal(`
    <h2>Pastry rescue bundle</h2>
    <p>Offer 4 bundles at 6.00 AZN each (regularly 12.00 AZN). Available today until 19:00. Recovers +22.32 AZN net after 7% fee instead of end-of-day waste.</p>
    <div class="notice">Mock stock: 4 bundles · Best before: today, 19:00</div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="state.special=!state.special;save();closeModal();render(false);requestAiSuggestion(true);notify(state.special?'Limited offer activated':'Limited offer paused')">${
        state.special ? 'Pause offer' : 'Activate limited offer'
      }</button>
    </div>
  `);
}

function welcomeOffer() {
  state.welcome = !state.welcome;
  save();
  render(false);
  notify(
    state.welcome ? '15% welcome offer activated' : 'Welcome offer paused'
  );
}

function toggleExtraSpecial(key, label) {
  if (!state.extraSpecials) state.extraSpecials = {};
  state.extraSpecials[key] = !state.extraSpecials[key];
  save();
  render(false);
  notify(
    state.extraSpecials[key]
      ? `${label} offer activated on PeakOff`
      : `${label} offer paused`
  );
}

function toggleCustomSpecial(idx) {
  if (!Array.isArray(state.customSpecials) || !state.customSpecials[idx]) return;
  state.customSpecials[idx].active = !state.customSpecials[idx].active;
  save();
  render(false);
  notify(
    state.customSpecials[idx].active
      ? `${state.customSpecials[idx].name} activated`
      : `${state.customSpecials[idx].name} paused`
  );
}

function addSpecialModal() {
  modal(`
    <span class="badge">Stage 06 · Special inventory</span>
    <h2 style="margin-top:12px">Add special inventory offer</h2>
    <p>Create a time-sensitive offer for excess batches, fresh daily items, or new menu launches.</p>
    <label for="sp-name">Item or bundle name</label>
    <input id="sp-name" type="text" value=" Pistachio croissant 3-pack" placeholder="e.g. Pistachio croissant 3-pack">
    <div class="split">
      <div>
        <label for="sp-price">Discounted price (AZN)</label>
        <input id="sp-price" type="number" min="1" step=".5" value="6.5">
      </div>
      <div>
        <label for="sp-disc">Discount (%)</label>
        <input id="sp-disc" type="number" min="5" max="70" value="45">
      </div>
    </div>
    <div class="split">
      <div>
        <label for="sp-stock">Available quantity</label>
        <input id="sp-stock" type="number" min="1" max="50" value="5">
      </div>
      <div>
        <label for="sp-cat">Visual category</label>
        <select id="sp-cat">
          <option value="pastry">Bakery &amp; pastries</option>
          <option value="sandwich">Sandwiches &amp; lunch</option>
          <option value="cake">Cakes &amp; desserts</option>
          <option value="coldbrew">Chilled drinks</option>
          <option value="coffeeCombo">Hot coffee combos</option>
        </select>
      </div>
    </div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveCustomSpecial()">Publish special offer →</button>
    </div>
  `);
}

function saveCustomSpecial() {
  const name = ($('#sp-name')?.value || '').trim() || 'Special bundle';
  const price = Math.max(1, Number($('#sp-price')?.value) || 6.5);
  const discount = Math.min(70, Math.max(5, Number($('#sp-disc')?.value) || 40));
  const stock = Math.max(1, Math.round(Number($('#sp-stock')?.value) || 4));
  const imgKey = $('#sp-cat')?.value || 'pastry';

  if (!Array.isArray(state.customSpecials)) state.customSpecials = [];
  state.customSpecials.unshift({
    name,
    price,
    discount,
    stock,
    until: '20:00',
    imgKey,
    active: true
  });
  save();
  closeModal();
  render(false);
  notify(`${name} published to Special Offers!`);
}

function closeModal() {
  currentTourStep = null;
  $('#dialog').close();
}

function customerDemo() {
  if (paused()) {
    notify('Venue is full. Free a table before accepting a new customer.');
    return;
  }
  modal(`
    <span class="badge">Customer view · simulated</span>
    <h2 style="margin-top:15px">A good stop before heading home.</h2>
    <p>You're near Nizami Street. Skip the crowded commute for a coffee at Coffee &amp; Co, just 4 minutes away.</p>
    <div class="step-visual">${state.discount}% off<br><small style="font-size:14px">${money(
    state.price * (1 - state.discount / 100)
  )} · ${30 - state.occupied} tables available</small></div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" ${
        state.claimedDemo ? 'disabled' : ''
      } onclick="claim()">${
    state.claimedDemo ? 'Coupon claimed' : 'Claim demo coupon'
  }</button>
      ${
        state.claimedDemo && !state.redeemedDemo
          ? '<button class="btn primary" onclick="coupon()">Open coupon</button>'
          : ''
      }
    </div>
  `);
}

function claim() {
  if (state.claimedDemo || paused()) return;
  state.claimedDemo = true;
  state.claimed++;
  save();
  render(false);
  coupon();
}

function coupon() {
  modal(`
    <h2>Your Coffee &amp; Co coupon</h2>
    <p>Show this demo coupon at the venue. In the live product, a unique QR code would be scanned by staff.</p>
    <div class="coupon">PEAK-DEMO-0008<br><br>${state.discount}% discount · One use only</div>
    <p>This prototype uses a demo code instead of a scannable QR.</p>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="redeem('PEAK-DEMO-0008')">Simulate staff verification</button>
    </div>
  `);
}

function verifyModal() {
  const defaultCode = state.redeemedDemo ? 'PO-COFF-2811' : 'PEAK-DEMO-0008';
  modal(`
    <span class="badge">Stage 11 · Staff QR verification</span>
    <h2 style="margin-top:12px">Verify customer coupon</h2>
    <p>Enter a single-use PeakOff coupon code from the customer mobile app or presentation demo to verify authenticity and apply the discount.</p>
    <label for="coupon-code-input">Coupon code</label>
    <input id="coupon-code-input" type="text" value="${defaultCode}" placeholder="e.g. PEAK-DEMO-0008 or PO-COFF-2811">
    <div class="actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="redeem($('#coupon-code-input').value)">Verify &amp; redeem</button>
    </div>
  `);
}

function redeem(code = 'PEAK-DEMO-0008') {
  const normalized = String(code || 'PEAK-DEMO-0008').trim().toUpperCase();
  if (!normalized) {
    notify('Please enter a valid coupon code.');
    return;
  }

  if (
    (normalized === 'PEAK-DEMO-0008' && state.redeemedDemo) ||
    state.coupons?.[normalized]?.status === 'REDEEMED'
  ) {
    notify(`Coupon ${normalized} has already been redeemed.`);
    return;
  }

  if (state.occupied === 30) {
    notify('Venue is full. Update table availability first.');
    return;
  }

  if (normalized === 'PEAK-DEMO-0008') {
    state.redeemedDemo = true;
    state.claimedDemo = true;
  }

  if (!state.coupons) state.coupons = {};
  state.coupons[normalized] = {
    code: normalized,
    status: 'REDEEMED',
    redeemedAt: new Date().toISOString()
  };

  state.redeemed++;
  state.visits++;
  state.occupied++;
  if (Array.isArray(state.occupiedTables)) {
    const freeIdx = state.occupiedTables.findIndex(v => !v);
    if (freeIdx !== -1) state.occupiedTables[freeIdx] = true;
  }

  const activeDiscount = state.active ? state.discount : 24;
  state.sales = Number(
    (state.sales + state.price * (1 - activeDiscount / 100)).toFixed(2)
  );

  save();
  closeModal();
  navigate('overview');
  requestAiSuggestion(true);
  notify(
    'Coupon verified. Sales, visits and occupancy updated. A 7% fee applies to this sale.'
  );
}

function venueModal() {
  modal(`
    <span class="badge">Stage 01 &amp; 02 · Business profile</span>
    <h2 style="margin-top:12px">Coffee &amp; Co · Nizami Street</h2>
    <div class="money-row"><span>Category</span><strong>Coffee shop &amp; bakery</strong></div>
    <div class="money-row"><span>Seating capacity</span><strong>30 tables (${state.occupied} occupied)</strong></div>
    <div class="money-row"><span>Off-peak target window</span><strong>17:00–20:00</strong></div>
    <div class="money-row"><span>Max discount threshold</span><strong>${state.max}% (Margin-safe: ${maxMarginSafe()}%)</strong></div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="closeModal();navigate('settings')">Open venue settings</button>
    </div>
  `);
}

function notificationsModal() {
  const m = computeMetrics();
  modal(`
    <span class="badge">Platform notifications</span>
    <h2 style="margin-top:12px">Evening activity &amp; PeakAI insights</h2>
    <div class="activity">
      <span class="activity-icon">ϟ</span>
      <div>
        <p>${
          aiState.suggestion?.headline ||
          `Evening opportunity: ${m.available} tables available`
        }</p>
        <small>Suggested discount: ${m.d}% · Net profit ${money(
    m.unitProfit
  )}/sale (+${money(m.incrementalProfit)} evening lift)</small>
      </div>
    </div>
    <div class="activity">
      <span class="activity-icon">✓</span>
      <div>
        <p>${state.claimed} coupons claimed · ${state.redeemed} verified redemptions</p>
        <small>7% platform fee applies only to verified sales</small>
      </div>
    </div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="closeModal();navigate('offers')">Manage offers</button>
    </div>
  `);
}

const steps = [
  [
    'Sales drop-off becomes visible',
    'Saat 17:00-dır. Coffee & Co məkanında 30 masadan yalnız 12-si doludur və axşam satışları əvvəlki günlə müqayisədə 27.6% azalıb. Sahib icmalda bu enişi dərhal görür.',
    'Sales ↘ −27.6% · 12 / 30 tables'
  ],
  [
    'The owner sets the limits',
    'Sahib maksimum endirimi 35%, məhsulun maya dəyərini 4 AZN, minimum mənfəəti isə 8 AZN seçir. Tövsiyə bu limitləri keçmir.',
    '35% maximum discount'
  ],
  [
    'PeakAI suggests an offer',
    'PeakAI və optimallaşdırma mühərriki boş masaları və axşam tələbatını nəzərə alaraq 24% endirim təklif edir. Sahib gəlir simulyatorunu yoxlayıb təklifi aktivləşdirir.',
    '20.00 → 15.20 AZN'
  ],
  [
    'A commuter finds a better stop',
    'İşdən çıxan əməkdaş və ya dərsdən çıxan tələbə yaxınlıqdakı təklifi görür. Sıxlıqda gözləmək əvəzinə Coffee & Co seçir və endirim kuponunu əldə edir.',
    'A quieter commute. A better coffee.'
  ],
  [
    'The venue verifies the coupon',
    'Müştəri məkana gəlir. Əməkdaş kuponu təsdiqləyir. 15.20 AZN satışdan 1.06 AZN platforma haqqı çıxılır, məkana xərclərdən əvvəl 14.14 AZN qalır.',
    '14.14 AZN to the business'
  ],
  [
    'The loop closes',
    'Satış, ziyarət və masa sayı yenilənir. Bütün masalar dolarsa təkliflər avtomatik dayanır. Sahib əlavə olaraq vaxtı yaxınlaşan, hələ təhlükəsiz məhsullara məhdud təklif yaradır.',
    'More guests. Less waste.'
  ]
];

function tour(index) {
  currentTourStep = index;
  const s = steps[index];
  modal(`
    <div class="step-counter">How PeakOff works · ${index + 1} of ${steps.length}</div>
    <h2>${s[0]}</h2>
    <div class="step-visual">${s[2]}</div>
    <p lang="az">${s[1]}</p>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      ${
        index > 0
          ? `<button class="btn" onclick="tour(${index - 1})">Back</button>`
          : ''
      }
      <button class="btn primary" onclick="${
        index === 5
          ? "closeModal();navigate('offers')"
          : `tour(${index + 1})`
      }">${index === 5 ? 'Try it yourself' : 'Next step →'}</button>
    </div>
  `);
}

function resetDemo() {
  state = initial();
  aiState.guideAnswer = '';
  aiState.guideQuestion = '';
  save();
  fetch('/api/reset', { method: 'POST' }).catch(() => {});
  closeModal();
  render(false);
  requestAiSuggestion(true);
  notify('Demo reset. Fetching fresh PeakAI analysis…');
}

// Connect to optional live SSE sync server when running via node server.js
if (typeof EventSource !== 'undefined') {
  try {
    const es = new EventSource('/api/events');
    es.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.state && data.state.declineModelVersion >= 2) {
          state = { ...state, ...data.state };
          localStorage.setItem('peakoff-demo', JSON.stringify(state));
          render(false);
        }
      } catch {}
    };
  } catch {}
}

$('#help').innerHTML = icon('help');
$('#reset').onclick = resetDemo;
$('#help').onclick = () => tour(0);
$('#notifications').onclick = notificationsModal;
if ($('#venue-trigger')) {
  $('#venue-trigger').onclick = venueModal;
}

window.addEventListener('keydown', event => {
  if (currentTourStep !== null && $('#dialog')?.open) {
    if (event.key === 'ArrowRight' && currentTourStep < steps.length - 1) {
      tour(currentTourStep + 1);
    } else if (event.key === 'ArrowLeft' && currentTourStep > 0) {
      tour(currentTourStep - 1);
    }
  }
});

window.addEventListener('hashchange', () => {
  page = location.hash.slice(1);
  render(false);
});

render(false);
requestAiSuggestion(true);
