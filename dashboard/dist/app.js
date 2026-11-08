/**
 * PeakOff Business Dashboard Application
 *
 * Implements the B2B venue management interface across Stages 01–06 and 11–13
 * of the PeakOff workflow while preserving the original presentation design.
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
  check:
    '<path d="m5 12 4 4L19 6"/>',
  play:
    '<path d="m8 4 12 8-12 8z"/>',
  bolt:
    '<path d="m13 2-10 12h8l-1 8L21 9h-8z"/>',
  info:
    '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  reset:
    '<path d="M3 4v5h5M3.5 9a9 9 0 1 1 .5 8"/>'
};

const icon = name =>
  `<svg class="ui-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${
    icons[name] || icons.offers
  }</svg>`;

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
  sales: 1240,
  visits: 18,
  special: false,
  welcome: false,
  claimedDemo: false,
  redeemedDemo: false,
  coupons: {}
});

let state;
try {
  const saved = JSON.parse(localStorage.getItem('peakoff-demo') || '{}');
  state = { ...initial(), ...saved };
  if (!Array.isArray(state.occupiedTables) || state.occupiedTables.length !== 30) {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < state.occupied);
  }
} catch {
  state = initial();
}

let page = location.hash.slice(1) || 'overview';
let period = 'Today · 17:00–20:00';
let currentTourStep = null;

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

function suggested() {
  const demand = Math.round(8 + (1 - state.occupied / 30) * 20 + 4);
  const marginLimit = Math.floor(
    100 * (1 - (state.cost + state.floor) / (state.price * 0.93))
  );
  return Math.max(0, Math.min(state.max, demand, marginLimit));
}

const food =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80';

function notify(message) {
  const toastEl = $('#toast');
  toastEl.textContent = message;
  toastEl.style.display = 'block';
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toastEl.style.display = 'none';
  }, 3300);
}

function pageHeading(title, sub) {
  return `<div class="page-top">
    <div>
      <h1>${title}</h1>
      <p class="subtitle">${sub}</p>
    </div>
    <div class="actions">
      <button class="btn" onclick="verifyModal()">✓ Verify coupon</button>
      <button class="btn" onclick="tour(0)">▷ Walk through demo</button>
      <select class="date" aria-label="Reporting period" onchange="period=this.value;render()">
        <option ${period.startsWith('Today') ? 'selected' : ''}>Today · 17:00–20:00</option>
        <option ${period.startsWith('Yesterday') ? 'selected' : ''}>Yesterday · 17:00–20:00</option>
      </select>
    </div>
  </div>`;
}

function chart() {
  const yesterday = period.startsWith('Yesterday');
  const ys = yesterday
    ? [175, 160, 140, 126, 109, 94, 78]
    : [168, 147, 128, 106, 87, 60, 40];
  const slots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
  const values = yesterday
    ? [110, 178, 265, 330, 405, 470, 540]
    : [142, 235, 320, 418, 502, 622, 712];

  return `<svg class="chart" viewBox="0 0 620 230" role="img" aria-label="Evening sales compared with previous days">
    <defs>
      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#00a78e" stop-opacity=".20"/>
        <stop offset="1" stop-color="#00a78e" stop-opacity="0"/>
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
    .join(' ')} L606 200H42Z" fill="url(#fill)"/>
    <polyline points="42,182 136,170 230,157 324,143 418,129 512,115 606,102" stroke="#bac7cb" stroke-width="2.5" fill="none"/>
    <polyline points="${ys
      .map((y, i) => `${42 + i * 94},${y}`)
      .join(' ')}" fill="none" stroke="#00a28a" stroke-width="3"/>
    ${ys
      .map(
        (y, i) =>
          `<circle class="point" cx="${
            42 + i * 94
          }" cy="${y}" r="4" fill="white" stroke="#00a28a" stroke-width="2" onclick="notify('${
            slots[i]
          } cumulative evening sales: ${values[i]} AZN')"><title>${slots[i]} · ${
            values[i]
          } AZN</title></circle>`
      )
      .join('')}
    ${slots
      .map((t, i) => `<text x="${27 + i * 94}" y="224">${t}</text>`)
      .join('')}
  </svg>`;
}

function overview() {
  const yesterday = period.startsWith('Yesterday');
  const stats = [
    [
      'sales',
      'Sales today',
      yesterday ? '980' : state.sales.toLocaleString(),
      '<small> AZN</small>',
      '<span class="green">↗ 26.5%</span> vs. previous day'
    ],
    [
      'visits',
      'Visits today',
      yesterday ? 14 : state.visits,
      '',
      '<span class="green">↗ 4 visitors</span> vs. previous day'
    ],
    [
      'tables',
      'Tables occupied',
      state.occupied,
      '<small> / 30</small>',
      `${30 - state.occupied} tables ready for new customers`
    ],
    [
      'offers',
      'Coupons claimed / redeemed',
      state.claimed,
      `<small> / ${state.redeemed}</small>`,
      'Customers finding their next good moment'
    ]
  ];

  return (
    pageHeading(
      'Business overview',
      'A little quieter now. A lot more opportunity ahead.'
    ) +
    `<div class="stats">${stats
      .map(
        ([i, l, n, u, b], idx) =>
          `<div class="card stat ${idx === 2 ? 'highlight' : ''}">
            <div class="stat-top">${l}<span class="stat-icon" style="${
            idx > 0 ? 'background:#e9f7f2;color:#009888' : ''
          }">${icon(i)}</span></div>
            <div class="stat-value">${n}${u}</div>
            <div class="stat-bottom">${b}</div>
          </div>`
      )
      .join('')}</div>
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Sales over time</h2>
          <div class="legend">
            <span><i class="dot"></i>${yesterday ? 'Yesterday' : 'Today'}</span>
            <span><i class="dot gray"></i>Previous days</span>
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
    <div class="opportunity">
      <span class="bolt">ϟ</span>
      <div>
        <h3>${
          state.occupied === 30
            ? 'A full house. A good problem to have.'
            : `${30 - state.occupied} empty tables. Let's turn that around.`
        }</h3>
        <p>${
          paused()
            ? 'Offers are automatically paused until a table opens.'
            : `Evening rush nearby. A ${suggested()}% offer could bring your next customers in.`
        }</p>
      </div>
      <button class="btn" onclick="navigate('offers')">Manage discounts &nbsp; →</button>
    </div>
    <div class="bottom-grid">
      <section class="card">
        <div class="card-head">
          <h2>Offer performance</h2>
          <button class="edit-link" onclick="navigate('offers')">View offers ↗</button>
        </div>
        <div class="offer-row">
          <img class="food" src="${food}" alt="Fresh croissants">
          <div>
            <h3>Coffee &amp; pastry</h3>
            <span class="badge">${state.active ? state.discount : 20}% off</span>
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
          <span class="badge">Live demo</span>
        </div>
        <div class="activity">
          <span class="activity-icon">✓</span>
          <div>
            <p>${
              state.redeemedDemo
                ? 'Demo coupon redeemed successfully'
                : 'Coffee & pastry coupon redeemed'
            }</p>
            <small>Just now · ${money(
              state.price * (1 - (state.active ? state.discount : 20) / 100)
            )} sale</small>
          </div>
        </div>
        <div class="activity">
          <span class="activity-icon">↗</span>
          <div>
            <p>${
              state.active
                ? `${state.discount}% evening offer activated`
                : 'Evening opportunity detected'
            }</p>
            <small>17:00 · Nizami Street area</small>
          </div>
        </div>
      </section>
    </div>`
  );
}

function offers() {
  const d = suggested();
  const customer = state.price * (1 - d / 100);
  const fee = customer * 0.07;
  const net = customer - fee;

  return (
    pageHeading(
      'Smart discount manager',
      'Fill empty seats while protecting your margins.'
    ) +
    `${
      paused()
        ? '<div class="notice">Your venue is full. Active offers are paused automatically.</div>'
        : ''
    }
    <div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Dynamic pricing controls</h2>
          <span class="badge">${state.active ? 'Offer active' : 'Ready when you are'}</span>
        </div>
        <label for="max">Maximum discount <strong class="green" style="float:right;font-size:23px">${
          state.max
        }%</strong></label>
        <input id="max" type="range" min="0" max="50" value="${
          state.max
        }" oninput="update('max',Number(this.value))">
        <div class="range-labels">
          <span>0%</span>
          <span>Your limit. Always respected.</span>
          <span>50%</span>
        </div>
        <div class="split">
          <div>
            <label for="cost">Product cost (AZN)</label>
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
          <strong>↗ Suggested discount: ${d}%</strong>
          <p>${
            state.occupied === 30
              ? 'No empty tables. Consider pausing your offer.'
              : 'Low occupancy + evening commuter demand'
          }<br>${
            net - state.cost >= state.floor
              ? '✓ Your minimum profit is protected.'
              : 'No feasible offer: lower your profit requirement or raise your regular price.'
          }</p>
        </div>
        <button class="btn primary wide" ${
          paused() || net - state.cost < state.floor ? 'disabled' : ''
        } onclick="activate()">${state.active ? 'Update' : 'Apply'} ${d}% offer</button>
        <div class="switch-row">
          <label for="auto" style="margin:0">Pause offers when venue is full</label>
          <input id="auto" type="checkbox" ${
            state.autoPause ? 'checked' : ''
          } onchange="update('autoPause',this.checked)">
        </div>
      </section>
      <section class="card">
        <h2>Offer preview</h2>
        <label for="price">Regular price (AZN)</label>
        <input id="price" type="number" min="1" max="10000" step=".5" value="${
          state.price
        }" onchange="update('price',Math.max(1,Number(this.value)))">
        ${[
          ['Customer discount', `${d}%`],
          ['Discounted customer price', money(customer)],
          ['PeakOff fee · 7%', money(fee)]
        ]
          .map(
            ([k, v]) =>
              `<div class="money-row"><span>${k}</span><strong>${v}</strong></div>`
          )
          .join('')}
        <div class="money-row total">
          <span>Business receives<br><small>before product costs</small></span>
          <strong class="green">${money(net)}</strong>
        </div>
        <div class="money-row">
          <span>Profit after product costs</span>
          <strong>${money(net - state.cost)}</strong>
        </div>
        <p class="subtitle" style="line-height:1.8;margin-top:18px">The 7% fee applies only to verified redeemed sales.</p>
        ${
          state.active
            ? '<button class="btn wide" style="margin-top:20px" onclick="customerDemo()">Preview customer journey →</button>'
            : ''
        }
      </section>
    </div>
    <section class="card">
      <div class="card-head">
        <h2>Special inventory offers</h2>
        <button class="edit-link" onclick="navigate('inventory')">Manage inventory ↗</button>
      </div>
      <div class="offer-row">
        <img class="food" src="${food}" alt="Croissants">
        <div>
          <h3>4 pastry bundles near best-before date</h3>
          <p>Safe to sell today until 19:00</p>
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
      'Keep availability up to date. Your offers follow your capacity.'
    ) +
    `<section class="card">
      <div class="card-head">
        <h2>${state.occupied} occupied · ${30 - state.occupied} available</h2>
        <div class="actions">
          <button class="btn" onclick="setAllTables(false)">All available</button>
          <button class="btn" onclick="setAllTables(true)">Venue is full</button>
        </div>
      </div>
      <p class="subtitle">Select a table to change its status. Teal tables are occupied.</p>
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
            ? 'Offers paused · venue is full'
            : `${30 - state.occupied} tables available for your next guests`
        }</strong>
        <p>${
          paused()
            ? 'Free a table to resume your active offer.'
            : `Current suggested discount: ${suggested()}%. Availability informs your recommendation.`
        }</p>
      </div>
    </section>`
  );
}

function inventory() {
  const items = [
    [
      'Pastry rescue bundle',
      '4 bundles available',
      'Safe to sell today until 19:00',
      '50% off · 6.00 AZN',
      state.special,
      'specialOffer()'
    ],
    [
      'Coffee & pastry',
      'Your evening favourite',
      'Available during the 17:00–20:00 window',
      `${state.active ? state.discount : 20}% off · 20.00 AZN regular`,
      state.active,
      "navigate('offers')"
    ],
    [
      'Welcome to Coffee & Co',
      'For first-time visitors',
      'A little welcome goes a long way.',
      '15% off first visit',
      state.welcome,
      'welcomeOffer()'
    ]
  ];

  return (
    pageHeading(
      'Special inventory',
      'Give good products another opportunity. Bring new customers in.'
    ) +
    `<div class="inventory-grid">${items
      .map(
        ([name, stock, desc, deal, active, fn]) =>
          `<section class="card">
            <img class="food" src="${food}" alt="Coffee shop pastries">
            <h2>${name}</h2>
            <p>${stock}<br>${desc}</p>
            <span class="badge">${deal}</span>
            <button class="btn ${active ? '' : 'primary'}" onclick="${fn}">${
            active ? 'Active · manage offer' : 'Create offer →'
          }</button>
          </section>`
      )
      .join('')}</div>`
  );
}

function insights() {
  return (
    pageHeading(
      'Business insights',
      'Understand the hours that need a little extra attention.'
    ) +
    `<div class="grid">
      <section class="card">
        <div class="card-head">
          <h2>Evening sales comparison</h2>
          <span class="badge">+26.5% today</span>
        </div>
        ${chart()}
      </section>
      <section class="card">
        <h2>Your quieter hours</h2>
        ${[
          ['14:00–16:00', '28% average occupancy'],
          ['17:00–18:00', '40% average occupancy'],
          ['18:00–20:00', '62% average occupancy']
        ]
          .map(
            ([t, v]) =>
              `<div class="money-row"><strong>${t}</strong><span>${v}</span></div>`
          )
          .join('')}
        <div class="suggestion">
          <strong>Evenings have potential</strong>
          <p>Nearby commuters are looking for a place to wait out the rush. Try a limited evening offer.</p>
        </div>
        <button class="btn primary wide" onclick="navigate('offers')">Set up an evening offer</button>
      </section>
    </div>`
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
      <div class="switch-row">
        <label for="setting-auto" style="margin:0">Automatically pause when full</label>
        <input id="setting-auto" type="checkbox" ${
          state.autoPause ? 'checked' : ''
        } onchange="update('autoPause',this.checked)">
      </div>
      <div class="notice">Presentation workspace. Venue details are sample data.</div>
      <button class="btn" onclick="resetDemo()">Reset all demo data</button>
    </section>`
  );
}

function navigate(nextPage) {
  location.hash = nextPage;
  page = nextPage;
  render();
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
    '→': 'arrow',
    '✓': 'check',
    '▷': 'play'
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
    for (const part of node.nodeValue.split(/([☕♧⌄↺ⓘϟ▱↗→✓▷])/)) {
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

  const views = { overview, offers, tables, inventory, insights, settings };
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
}

function setAllTables(occupied) {
  state.occupiedTables = Array.from({ length: 30 }, () => occupied);
  state.occupied = occupied ? 30 : 0;
  save();
  render(false);
}

function toggleTable(index) {
  if (!Array.isArray(state.occupiedTables) || state.occupiedTables.length !== 30) {
    state.occupiedTables = Array.from({ length: 30 }, (_, i) => i < state.occupied);
  }
  state.occupiedTables[index] = !state.occupiedTables[index];
  state.occupied = state.occupiedTables.filter(Boolean).length;
  save();
  render(false);
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
    <p>Offer 4 bundles at 6.00 AZN each (regularly 12.00 AZN). Available today until 19:00. Only products still safe to consume are eligible.</p>
    <div class="notice">Mock stock: 4 bundles · Best before: today, 19:00</div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="state.special=!state.special;save();closeModal();render(false);notify(state.special?'Limited offer activated':'Limited offer paused')">${
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
    <div class="money-row"><span>Max discount threshold</span><strong>${state.max}%</strong></div>
    <div class="actions">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="closeModal();navigate('settings')">Open venue settings</button>
    </div>
  `);
}

function notificationsModal() {
  modal(`
    <span class="badge">Platform notifications</span>
    <h2 style="margin-top:12px">Evening activity &amp; AI insights</h2>
    <div class="activity">
      <span class="activity-icon">ϟ</span>
      <div>
        <p>Evening opportunity: ${30 - state.occupied} tables available</p>
        <small>Suggested discount: ${suggested()}% (protects ${money(state.floor)} minimum profit)</small>
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
    'Quiet hours become visible',
    'Saat 17:00-dır. Coffee & Co məkanında 30 masadan yalnız 12-si doludur. Sahib icmalda satışları əvvəlki günlə müqayisə edir.',
    '12 / 30 tables occupied'
  ],
  [
    'The owner sets the limits',
    'Sahib maksimum endirimi 35%, məhsulun maya dəyərini 4 AZN, minimum mənfəəti isə 8 AZN seçir. Tövsiyə bu limitləri keçmir.',
    '35% maximum discount'
  ],
  [
    'PeakOff suggests an offer',
    'Demo hesablaması boş masaları və axşam tələbatını nəzərə alaraq 24% endirim təklif edir. Sahib qiymət bölgüsünü yoxlayıb təklifi aktivləşdirir.',
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
  save();
  fetch('/api/reset', { method: 'POST' }).catch(() => {});
  closeModal();
  render(false);
  notify('Demo reset. Ready for your next presentation.');
}

// Connect to optional live SSE sync server when running via node server.js
if (typeof EventSource !== 'undefined') {
  try {
    const es = new EventSource('/api/events');
    es.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.state) {
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
