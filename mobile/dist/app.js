/**
 * PeakOff Mobile Customer Application (Stages 07–12)
 *
 * Interactive route-aware offer discovery, single-use QR voucher generation,
 * browser history navigation guard, and live synchronization with the
 * PeakOff Business Dashboard.
 */

const baseOffers = [
  {
    id: 'coffee-pastry',
    rank: 1,
    category: 'coffee',
    featured: true,
    name: 'Coffee & pastry',
    venue: 'Coffee & Co · Coffee Shop',
    discount: 20,
    price: 6.4,
    oldPrice: 8,
    walk: 5,
    stock: 4,
    expires: '19:00',
    tag: 'Best match',
    perks: 'Quiet seating · Fast Wi-Fi',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'bowling',
    rank: 2,
    category: 'entertainment',
    featured: true,
    name: 'Bowling session & shoes',
    venue: 'Strike Zone · Bowling Center',
    discount: 25,
    price: 11.25,
    oldPrice: 15,
    walk: 8,
    stock: 6,
    expires: '21:00',
    tag: 'Fun stop',
    perks: 'Lanes ready · Shoe rental included',
    image:
      'https://images.unsplash.com/photo-1514727200133-0f3a18aeeab4?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1587536849024-daaa4a417b16?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'study-hour',
    rank: 3,
    category: 'special',
    featured: true,
    name: 'Anti-cafe study & board games',
    venue: 'Sakit Məkan · Anti-Cafe',
    discount: 30,
    price: 5,
    oldPrice: 7.15,
    walk: 6,
    stock: 9,
    expires: '20:00',
    tag: 'Quiet pick',
    perks: 'Unlimited tea & coffee · Board games',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'roast-lab',
    rank: 4,
    category: 'coffee',
    featured: false,
    name: 'Iced latte & almond croissant',
    venue: 'Baku Roast Lab · Specialty Coffee',
    discount: 25,
    price: 5.25,
    oldPrice: 7,
    walk: 4,
    stock: 7,
    expires: '19:30',
    tag: 'Roastery deal',
    perks: 'Power outlets · Terrace seating',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'vr-arena',
    rank: 5,
    category: 'entertainment',
    featured: true,
    name: 'VR gaming & arcade pass',
    venue: 'VR Arena Baku · Entertainment',
    discount: 35,
    price: 9.75,
    oldPrice: 15,
    walk: 7,
    stock: 5,
    expires: '21:30',
    tag: 'Multiplayer fun',
    perks: '45-min full VR headset + 3 arcade tokens',
    image:
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'billiards-club',
    rank: 6,
    category: 'entertainment',
    featured: false,
    name: '1-hour pool table & drinks',
    venue: 'Cue & Lounge · Billiards Club',
    discount: 30,
    price: 8.4,
    oldPrice: 12,
    walk: 6,
    stock: 4,
    expires: '20:30',
    tag: 'After-work chill',
    perks: 'Pro tables · 2 soft drinks included',
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'tea-house',
    rank: 7,
    category: 'coffee',
    featured: false,
    name: 'Azeri tea pot & pakhlava set',
    venue: 'Chaykhana 19 · Tea House',
    discount: 30,
    price: 7,
    oldPrice: 10,
    walk: 6,
    stock: 8,
    expires: '21:00',
    tag: 'Cozy lounge',
    perks: 'Serves 2 · Traditional sweets included',
    image:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'fitness-pass',
    rank: 8,
    category: 'special',
    featured: false,
    name: 'Off-peak gym & sauna pass',
    venue: 'Pulse Fitness Hub · Wellness',
    discount: 40,
    price: 9,
    oldPrice: 15,
    walk: 7,
    stock: 5,
    expires: '20:00',
    tag: 'Beat the rush',
    perks: 'Towel service · Locker & sauna access',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'fresh-lunch',
    rank: 9,
    category: 'expiry',
    featured: false,
    name: 'Fresh lunch & dinner box',
    venue: 'Urban Fork · Bistro',
    discount: 35,
    price: 7.8,
    oldPrice: 12,
    walk: 9,
    stock: 3,
    expires: '18:30',
    tag: 'Last-day special',
    perks: 'Prepared today · Zero food waste',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=88'
  },
  {
    id: 'pastry-rescue',
    rank: 10,
    category: 'expiry',
    featured: false,
    name: '4-pack artisan pastry bundle',
    venue: 'Sweet Crust Bakery · Cafe',
    discount: 50,
    price: 6,
    oldPrice: 12,
    walk: 4,
    stock: 4,
    expires: '19:00',
    tag: '50% Rescue box',
    perks: 'Baked this morning · Takeaway ready',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=88',
    hero:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1000&q=88'
  }
];

let offers = baseOffers.map(item => ({ ...item }));

const iconPaths = {
  pin: '<path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>',
  route:
    '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c7 0 3-12 10-12"/>',
  train:
    '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 21l2-3m6 0 2 3M8 8h8M8 13h.01M16 13h.01"/>',
  bus: '<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M7 19v2m10-2v2M7 8h10M7 14h.01M17 14h.01"/>',
  car: '<path d="m5 11 2-5h10l2 5m-15 0h16v7H4zM7 18v2m10-2v2M7 14h.01M17 14h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m10 22 1-7-3-3 2-5 5 3 3 1m-7 4 4 3 1 4M8 12l-3 4"/>',
  tag: '<path d="M3 12V4h8l10 10-7 7z"/><circle cx="7.5" cy="8" r="1"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  qr: '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h2v2h-2zm4 0h2v6h-2zm-4 4h2v2h-2z"/>',
  home: '<path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9H8.5a2.5 2.5 0 1 1 2-4c1 1.3 1.5 4 1.5 4Zm0 0h3.5a2.5 2.5 0 1 0-2-4c-1 1.3-1.5 4-1.5 4Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  heart:
    '<path d="M20.8 5.7a5.4 5.4 0 0 0-7.6 0L12 6.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  wifi: '<path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0m-5 3a2 2 0 0 1 2 0"/>',
  swap: '<path d="M7 7h12l-3-3m3 13H5l3 3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h2"/>',
  ticket:
    '<path d="M3 8a3 3 0 0 0 0 6v4h18v-4a3 3 0 0 0 0-6V4H3z"/><path d="M13 7v2m0 2v2m0 2v2"/>',
  location:
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
  logout: '<path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8"/>',
  coffee:
    '<path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zm13 1h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2m4-2v2"/>',
  bowling:
    '<circle cx="12" cy="12" r="9"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="12" cy="12" r="1"/>',
  gamepad:
    '<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4m-2-2v4m7-1h.01M18 11h.01"/>'
};

function icon(name, cls = '') {
  return `<svg class="${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${
    iconPaths[name] || iconPaths.tag
  }</svg>`;
}

function logo() {
  return `<svg class="brand-mark" viewBox="0 0 40 46" aria-hidden="true"><ellipse cx="20" cy="40" rx="16" ry="4" fill="none" stroke="#00a690" stroke-width="3"/><path d="M20 2C10 2 5 9 5 17c0 11 15 23 15 23s15-12 15-23C35 9 30 2 20 2Z" fill="currentColor"/><circle cx="20" cy="17" r="5" fill="#052f42"/><path d="M29 5l3-3m1 7h4M27 1v4" stroke="#ffb51b" stroke-width="2"/></svg>`;
}

let stored = {};
try {
  stored = JSON.parse(localStorage.getItem('peakoff-mobile-demo') || '{}');
} catch {
  stored = {};
}

const destinations = ['Ahmadli', 'Nizami', 'Ganjlik', 'Elmlər', 'Sahil'];

const state = {
  screen: 'home',
  filter: 'recommended',
  mode: 'train',
  time: '18:30',
  selectedOffer: 'coffee-pastry',
  claimed: Array.isArray(stored.claimed) ? stored.claimed : [],
  redeemed: Array.isArray(stored.redeemed) ? stored.redeemed : [],
  favorites: Array.isArray(stored.favorites) ? stored.favorites : [],
  routeFrom: '28 May, Baku',
  routeTo: 'Ahmadli'
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

/**
 * Browser History Management so pressing Back on mobile always stays inside
 * the app and returns to the Home screen instead of exiting the site.
 */
function snapshotState() {
  return {
    screen: state.screen,
    filter: state.filter,
    selectedOffer: state.selectedOffer
  };
}

function initHistoryGuard() {
  try {
    history.replaceState(
      { screen: 'home', filter: 'recommended', selectedOffer: 'coffee-pastry', guard: true },
      '',
      '#home'
    );
    history.pushState(snapshotState(), '', `#${state.screen}`);
  } catch {}
}

function navigateTo(screen, options = {}) {
  if (options.filter) state.filter = options.filter;
  if (options.selectedOffer) state.selectedOffer = options.selectedOffer;

  const changed = state.screen !== screen || options.filter || options.selectedOffer;
  state.screen = screen;

  if (changed && !options.fromPopState) {
    try {
      history.pushState(snapshotState(), '', `#${screen}`);
    } catch {}
  }
  render();
}

function goBackInApp() {
  if (state.screen === 'voucher') {
    navigateTo('detail');
  } else if (state.screen === 'detail') {
    navigateTo('explore');
  } else if (state.screen !== 'home') {
    navigateTo('home');
  }
}

window.addEventListener('popstate', event => {
  if (event.state && event.state.screen) {
    if (event.state.guard && state.screen !== 'home') {
      state.screen = 'home';
      try {
        history.pushState(snapshotState(), '', '#home');
      } catch {}
      render();
      return;
    }
    state.screen = event.state.screen;
    if (event.state.filter) state.filter = event.state.filter;
    if (event.state.selectedOffer) state.selectedOffer = event.state.selectedOffer;
    if (state.screen === 'home') {
      try {
        history.pushState(snapshotState(), '', '#home');
      } catch {}
    }
    render();
  } else {
    state.screen = 'home';
    try {
      history.pushState(snapshotState(), '', '#home');
    } catch {}
    render();
  }
});

const syncChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('peakoff-sync')
    : null;

function syncWithBusinessState(bizState) {
  if (!bizState) return;
  const coffeeOffer = offers.find(item => item.id === 'coffee-pastry');
  if (coffeeOffer) {
    const discount = bizState.active ? Number(bizState.discount) || 20 : 20;
    coffeeOffer.discount = discount;
    coffeeOffer.price = Number(
      (coffeeOffer.oldPrice * (1 - discount / 100)).toFixed(2)
    );
  }
}

try {
  const savedBiz = JSON.parse(localStorage.getItem('peakoff-demo') || 'null');
  if (savedBiz) syncWithBusinessState(savedBiz);
} catch {}

if (syncChannel) {
  syncChannel.onmessage = event => {
    if (event.data && event.data.state) {
      syncWithBusinessState(event.data.state);
      render();
    }
  };
}

if (typeof EventSource !== 'undefined') {
  try {
    const es = new EventSource('/api/events');
    es.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.state) {
          syncWithBusinessState(data.state);
          render();
        }
      } catch {}
    };
  } catch {}
}

function persist() {
  localStorage.setItem(
    'peakoff-mobile-demo',
    JSON.stringify({
      claimed: state.claimed,
      redeemed: state.redeemed,
      favorites: state.favorites
    })
  );
}

function money(value) {
  return `${Number(value).toFixed(2)} AZN`;
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function statusBar() {
  return `<div class="status"><span>17:35</span><span class="status-icons"><svg viewBox="0 0 20 14"><path fill="currentColor" d="M1 11h3v3H1zm5-3h3v6H6zm5-3h3v9h-3zm5-4h3v13h-3z"/></svg>${icon(
    'wifi'
  )}<span>▰</span></span></div>`;
}

function brand() {
  return `<div class="brand-row">${logo()}<span class="brand-name">Peak<b>Off</b></span></div>`;
}

function mapGraphic(compact = false) {
  return `<svg viewBox="0 0 360 200" preserveAspectRatio="none" aria-label="Mock route map">
    <rect width="360" height="200" fill="#e9e4d8"/>
    <path d="M0 34 360 70M0 126 360 100M55 0 80 200M170 0 150 200M290 0 260 200" stroke="#fff" stroke-width="12" opacity=".85"/>
    <path d="M0 78 360 150M105 0 120 200M225 0 205 200" stroke="#cdd9c6" stroke-width="19" opacity=".7"/>
    <path d="M0 176c70-25 115-12 166 24h194v-18c-70-22-122-17-178-8C108 185 59 154 0 160Z" fill="#8ed4ee"/>
    <path d="M62 119c25-45 48-57 79-44 34 14 41 39 75 27 35-13 51-47 91-32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
    <path d="M62 119c25-45 48-57 79-44 34 14 41 39 75 27 35-13 51-47 91-32" fill="none" stroke="#10a78b" stroke-width="${
      compact ? 5 : 6
    }" stroke-linecap="round" stroke-dasharray="${compact ? '5 7' : '0'}"/>
    <circle cx="62" cy="119" r="17" fill="#2f8ce8" opacity=".22"/>
    <circle cx="62" cy="119" r="9" fill="#2f8ce8" stroke="#fff" stroke-width="4"/>
    <path d="M307 50c-10 0-16 7-16 15 0 12 16 26 16 26s16-14 16-26c0-8-6-15-16-15Z" fill="#ff8b12" stroke="#fff" stroke-width="3"/>
    <circle cx="307" cy="65" r="5" fill="#fff"/>
    ${
      compact
        ? ''
        : `<g transform="translate(125 43)"><rect width="30" height="30" rx="8" fill="#ffad18"/><circle cx="15" cy="15" r="7" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 12h3a3 3 0 0 1 0 6h-3" fill="none" stroke="#fff" stroke-width="2"/></g><g transform="translate(215 112)"><circle cx="15" cy="15" r="15" fill="#ffad18"/><path d="M9 10v14m12-14v14M9 15h12" stroke="#fff" stroke-width="2"/></g>`
    }
  </svg>`;
}

function topRegion(title, extra = '', showBack = false) {
  return `<header class="top-region">
    ${statusBar()}
    ${brand()}
    <div class="title-row">
      ${
        showBack
          ? `<button class="back-button" data-action="go-home" aria-label="Back to home">${icon(
              'back'
            )}</button>`
          : ''
      }
      <h1 class="page-title">${title}</h1>
    </div>
    ${extra}
  </header>`;
}

function bottomNav(active) {
  const items = [
    ['home', 'Home', 'home'],
    ['explore', 'Explore', 'search'],
    ['offers', 'Vouchers', 'tag'],
    ['rewards', 'Rewards', 'gift'],
    ['profile', 'Profile', 'user']
  ];
  return `<nav class="bottom-nav" aria-label="Primary navigation">${items
    .map(
      ([screen, label, ico]) =>
        `<button class="nav-item ${
          active === screen ? 'active' : ''
        }" data-action="navigate" data-screen="${screen}">${icon(
          ico
        )}<span>${label}</span></button>`
    )
    .join('')}</nav>`;
}

function getTimeEstimates() {
  if (state.mode === 'bus') {
    return [
      ['18:00', 'High', '34 min'],
      ['18:30', 'Busy', '30 min'],
      ['19:00', 'Calmer', '25 min']
    ];
  }
  if (state.mode === 'car') {
    return [
      ['18:00', 'High', '29 min'],
      ['18:30', 'Busy', '22 min'],
      ['19:00', 'Calmer', '17 min']
    ];
  }
  return [
    ['18:00', 'High', '26 min'],
    ['18:30', 'Busy', '24 min'],
    ['19:00', 'Calmer', '21 min']
  ];
}

function homeScreen() {
  const shortFrom = state.routeFrom.split(',')[0];
  const shortTo = state.routeTo.split(',')[0];
  const previewOffers = [offers[0], offers[1], offers[4]];

  return `<div class="screen">
    ${topRegion(
      'Skip the rush. Save nearby.',
      '<p class="page-sub">Smart off-peak deals along your evening commute</p>'
    )}

    <section class="demo-strip" aria-label="How PeakOff works">
      <button class="demo-step" data-action="demo-step" data-step="route">
        <span>1</span>
        <strong>Set Route</strong>
        <small>${shortFrom} → ${shortTo}</small>
      </button>
      <button class="demo-step" data-action="find-offers">
        <span>2</span>
        <strong>Pick Spot</strong>
        <small>${offers.length} live offers</small>
      </button>
      <button class="demo-step" data-action="quick-voucher">
        <span>3</span>
        <strong>Scan QR</strong>
        <small>${state.claimed.length ? `${state.claimed.length} active` : 'Instant code'}</small>
      </button>
    </section>

    <div class="quick-cats" aria-label="Quick categories">
      <button class="quick-cat" data-action="quick-cat" data-filter="coffee">
        ${icon('coffee')}
        <span>Coffee</span>
      </button>
      <button class="quick-cat" data-action="quick-cat" data-filter="entertainment">
        ${icon('bowling')}
        <span>Bowling &amp; Fun</span>
      </button>
      <button class="quick-cat" data-action="quick-cat" data-filter="special">
        ${icon('gamepad')}
        <span>Anti-Cafe &amp; Gym</span>
      </button>
      <button class="quick-cat" data-action="quick-cat" data-filter="expiry">
        ${icon('tag')}
        <span>50% Rescue</span>
      </button>
    </div>

    <div class="route-map">
      ${mapGraphic()}
      <span class="map-pill from">${shortFrom}</span>
      <span class="map-pill to">${shortTo}</span>
    </div>

    <section class="route-card" aria-label="Route">
      <div class="field-row">
        ${icon('location')}
        <div><span>From:</span><strong>${state.routeFrom}</strong></div>
        <button data-action="swap" aria-label="Swap route">${icon('swap')}</button>
      </div>
      <div class="field-row">
        ${icon('pin')}
        <div><span>To:</span><strong>${state.routeTo}</strong></div>
        <button data-action="edit-route" aria-label="Edit destination">${icon('chevron')}</button>
      </div>
    </section>

    <div class="mode-switch" aria-label="Transport mode">${[
      ['train', 'Metro'],
      ['bus', 'Bus'],
      ['car', 'Drive']
    ]
      .map(
        ([mode, label]) =>
          `<button class="mode ${
            state.mode === mode ? 'active' : ''
          }" data-action="mode" data-mode="${mode}">${icon(mode)} ${label}</button>`
      )
      .join('')}</div>

    <section class="section">
      <div class="section-head">
        <h2>Departure window</h2>
        <span>${icon('info')} Commute traffic</span>
      </div>
      <div class="time-list">${getTimeEstimates()
        .map(
          ([time, traffic, duration]) =>
            `<button class="time-option ${
              state.time === time ? 'active' : ''
            }" data-action="time" data-time="${time}">${icon(
              'clock'
            )}<strong>${time}</strong><span class="traffic ${traffic.toLowerCase()}">${traffic}</span><small>≈ ${duration}</small></button>`
        )
        .join('')}</div>
    </section>

    <button class="primary-button" data-action="find-offers">
      Explore all ${offers.length} nearby offers ${icon('arrow')}
    </button>

    <section class="home-preview">
      <div class="section-head" style="padding:0 2px">
        <h2>Top stops along your route</h2>
        <button class="link-btn" data-action="find-offers">See all →</button>
      </div>
      <div class="offer-list" style="padding:0">
        ${previewOffers.map(offerCard).join('')}
      </div>
    </section>

    ${bottomNav('home')}
  </div>`;
}

function offersHeader() {
  const shortFrom = state.routeFrom.split(',')[0];
  return topRegion(
    'Offers ranked for you',
    `<div class="filters">
      <button class="filter-select" data-action="go-home">${icon(
        'pin'
      )} Near ${shortFrom}</button>
      <button class="filter-select" data-action="cycle-time">${icon('clock')} ${
      state.time
    }–21:00</button>
    </div>`,
    true
  );
}

function filteredOffers() {
  if (state.filter === 'recommended') {
    return offers.filter(item => item.featured);
  }
  if (state.filter === 'coffee') {
    return offers.filter(item => item.category === 'coffee');
  }
  if (state.filter === 'entertainment') {
    return offers.filter(item => item.category === 'entertainment');
  }
  if (state.filter === 'special') {
    return offers.filter(item => item.category === 'special');
  }
  if (state.filter === 'expiry') {
    return offers.filter(item => item.category === 'expiry');
  }
  return offers;
}

function exploreScreen() {
  const list = filteredOffers();
  const categories = [
    ['recommended', 'Recommended'],
    ['coffee', 'Coffee & Tea'],
    ['entertainment', 'Bowling & Fun'],
    ['special', 'Anti-Cafe & Gym'],
    ['expiry', 'Near-expiry'],
    ['all', `All (${offers.length})`]
  ];

  return `<div class="screen">${offersHeader()}
    <div class="tabs">${categories
      .map(
        ([id, label]) =>
          `<button class="tab ${
            state.filter === id ? 'active' : ''
          }" data-action="filter" data-filter="${id}">${label}</button>`
      )
      .join('')}</div>
    <div class="offer-list">${
      list.length
        ? list.map(offerCard).join('')
        : `<div class="empty-state">${icon(
            'search'
          )}<h2>No matches yet</h2><p>Try another category or departure time.</p></div>`
    }</div>
    <div class="stock-banner">${icon('tag')} Dynamic off-peak pricing · limited stock</div>
    ${bottomNav('explore')}
  </div>`;
}

function offerCard(offer) {
  return `<button class="offer-card ${
    offer.rank === 1 ? 'best' : ''
  }" data-action="open-offer" data-id="${offer.id}">
    <span class="offer-image" style="background-image:url('${offer.image}')">${
    offer.rank === 1
      ? `<span class="best-label">♛ ${offer.tag}</span>`
      : `<span class="rank">${offer.rank}</span>`
  }</span>
    <span class="offer-copy">
      <small class="venue-tag">${offer.venue}</small>
      <h3>${offer.name}</h3>
      <span class="discount">${offer.discount}% OFF</span>
      <span class="meta">${icon('walk')} ${offer.walk} min walk · ${offer.stock} left</span>
      <strong class="price">${money(offer.price)}</strong>
    </span>
    <span class="chevron">${icon('chevron')}</span>
  </button>`;
}

function detailScreen() {
  const offer =
    offers.find(item => item.id === state.selectedOffer) || offers[0];
  const isClaimed = state.claimed.includes(offer.id);
  const isFav = state.favorites.includes(offer.id);

  return `<div class="screen">
    <div class="detail-hero" style="background-image:url('${offer.hero}')">
      <div class="detail-top">
        <button class="back-button" data-action="back" aria-label="Back">${icon(
          'back'
        )}</button>
        <div class="detail-brand">${logo()} Peak<span style="color:var(--amber)">Off</span></div>
        <button class="round-button" data-action="favorite" data-id="${
          offer.id
        }" aria-label="Save offer" style="${
    isFav ? 'background:rgba(255,181,27,.35);border-color:#ffb51b' : ''
  }">${icon('heart')}</button>
      </div>
    </div>
    <main class="detail-sheet">
      <h1>${offer.venue.split(' · ')[0]}</h1>
      <div class="venue-meta">
        <span>${icon('walk')} ${offer.walk} min walk</span>
        <span>${icon('wifi')} ${offer.perks || 'Quiet seating · Wi-Fi'}</span>
      </div>
      <div class="deal-strip">${icon('tag')} ${offer.tag} · ${
    offer.discount
  }% OFF</div>
      <section class="bundle">
        <img src="${offer.image}" alt="${offer.name}">
        <div>
          <h2>${offer.name}</h2>
          <div>
            <span class="old-price">${money(offer.oldPrice)}</span>
            <strong class="new-price">${money(offer.price)}</strong>
          </div>
          <span class="stock">${icon('layers')} ${offer.stock} left</span>
        </div>
      </section>
      <div class="availability">
        ${icon('calendar')}
        <div>
          <strong>Available today until ${offer.expires}</strong>
          <small>Single-use QR coupon · Valid during off-peak window.</small>
        </div>
      </div>
      <div class="mini-map">${mapGraphic(true)}</div>
    </main>
    <div class="sticky-claim">
      <button class="primary-button" data-action="claim" data-id="${offer.id}">
        ${icon('qr')} ${isClaimed ? 'Open QR voucher' : 'Claim QR voucher'}
      </button>
    </div>
  </div>`;
}

function qrGrid(code) {
  const seed = code.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return Array.from({ length: 169 }, (_, index) => {
    const x = index % 13;
    const y = Math.floor(index / 13);
    const finder = (x < 4 && y < 4) || (x > 8 && y < 4) || (x < 4 && y > 8);
    const on = finder
      ? x === 0 ||
        y === 0 ||
        x === 3 ||
        y === 3 ||
        ((x === 1 || x === 2) && (y === 1 || y === 2))
      : (index * 17 + seed + y * 7) % 5 < 2;
    return `<i class="${on ? 'on' : ''}"></i>`;
  }).join('');
}

function voucherScreen() {
  const offer =
    offers.find(item => item.id === state.selectedOffer) || offers[0];
  const code = `PO-${offer.id.slice(0, 4).toUpperCase()}-2811`;
  const isRedeemed = state.redeemed.includes(offer.id);

  return `<div class="screen voucher-screen">
    <div class="voucher-card">
      ${brand()}
      <h1>${offer.discount}% off at ${offer.venue.split(' · ')[0]}</h1>
      <p>${offer.name} · valid today until ${offer.expires}</p>
      <div class="qr" aria-label="Demo QR code">${qrGrid(code)}</div>
      <div class="voucher-code">${code}</div>
      <div class="voucher-terms">
        ${
          isRedeemed
            ? '✓ Verified & redeemed at venue · +25 Peak points earned'
            : 'Show this QR voucher at the venue. Single-use cryptographic token.'
        }
      </div>
      <button class="primary-button" style="width:100%;margin:12px 0 0" data-action="simulate-scan" data-id="${
        offer.id
      }" data-code="${code}">
        ${icon('qr')} ${
    isRedeemed ? 'Redeemed ✓ (Back to Home)' : 'Simulate venue QR scan'
  }
      </button>
      <div class="voucher-actions">
        <button class="secondary-button" data-action="go-home">Home</button>
        <button class="secondary-button" data-action="navigate" data-screen="offers">My vouchers</button>
      </div>
    </div>
  </div>`;
}

function myOffersScreen() {
  const claimed = offers.filter(item => state.claimed.includes(item.id));
  return `<div class="screen">${topRegion('Your vouchers', '', true)}
    ${
      claimed.length
        ? `<div class="offer-list" style="padding-top:14px">${claimed
            .map(offerCard)
            .join('')}</div>`
        : `<div class="empty-state">${icon(
            'ticket'
          )}<h2>No vouchers yet</h2><p>Choose a coffee shop, bowling lane, or entertainment deal near your route and claim its QR voucher.</p><button class="primary-button" style="width:100%;margin:18px 0" data-action="navigate" data-screen="explore">Explore offers</button></div>`
    }
    ${bottomNav('offers')}
  </div>`;
}

function rewardsScreen() {
  const points = 120 + state.claimed.length * 25 + state.redeemed.length * 15;
  const pct = Math.min(100, Math.round((points / 200) * 100));
  return `<div class="screen">${topRegion('Your rewards', '', true)}
    <div class="profile-card">
      <div class="section-head">
        <h2>${points} Peak points</h2>
        <span>${
          points >= 200 ? 'Reward unlocked!' : 'Next reward at 200'
        }</span>
      </div>
      <div style="height:10px;background:#e5ebe9;border-radius:10px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:var(--teal);transition:width .25s ease"></div>
      </div>
      <div class="stock-banner" style="margin:20px 0 0">${icon(
        'gift'
      )} +25 pts per claim · +15 pts on venue scan</div>
    </div>
    ${bottomNav('rewards')}
  </div>`;
}

function profileScreen() {
  const favCount = state.favorites.length;
  const menuItems = [
    ['location', `Saved route (${state.routeFrom.split(',')[0]} → ${state.routeTo})`],
    ['bell', 'Notifications · Quiet-hour alerts on'],
    ['heart', `Favourite venues (${favCount})`],
    ['logout', 'Reset demo']
  ];

  return `<div class="screen">${topRegion('Profile', '', true)}
    <section class="profile-card">
      <div class="profile-head">
        <div class="avatar">AA</div>
        <div>
          <h2>Aykhan Amirov</h2>
          <p>PeakOff demo member · ${state.claimed.length} voucher(s)</p>
        </div>
      </div>
      ${menuItems
        .map(
          ([ico, label], index) =>
            `<button class="menu-row" style="width:100%;border-left:0;border-right:0;border-bottom:0;background:transparent;text-align:left" data-action="${
              index === 3
                ? 'reset'
                : index === 0
                ? 'go-home'
                : index === 2
                ? 'open-favs'
                : 'profile-item'
            }">${icon(ico)}<strong>${label}</strong>${icon('chevron')}</button>`
        )
        .join('')}
    </section>
    ${bottomNav('profile')}
  </div>`;
}

function render() {
  const screens = {
    home: homeScreen,
    explore: exploreScreen,
    detail: detailScreen,
    voucher: voucherScreen,
    offers: myOffersScreen,
    rewards: rewardsScreen,
    profile: profileScreen
  };
  app.innerHTML = (screens[state.screen] || homeScreen)();
  app.querySelector('.screen')?.scrollTo(0, 0);
}

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'navigate') {
    navigateTo(target.dataset.screen);
    return;
  }
  if (action === 'go-home') {
    navigateTo('home');
    return;
  }
  if (action === 'demo-step') {
    const currentIdx = destinations.indexOf(state.routeTo);
    state.routeTo = destinations[(currentIdx + 1) % destinations.length];
    notify(`Route updated: ${state.routeFrom.split(',')[0]} → ${state.routeTo}`);
    render();
    return;
  }
  if (action === 'quick-cat') {
    navigateTo('explore', { filter: target.dataset.filter });
    return;
  }
  if (action === 'quick-voucher') {
    const id = state.claimed[0] || 'coffee-pastry';
    if (!state.claimed.includes(id)) {
      state.claimed.push(id);
      persist();
    }
    navigateTo('voucher', { selectedOffer: id });
    return;
  }
  if (action === 'mode') {
    state.mode = target.dataset.mode;
    notify(`${target.textContent.trim()} selected`);
  }
  if (action === 'time') {
    state.time = target.dataset.time;
  }
  if (action === 'cycle-time') {
    const times = ['18:00', '18:30', '19:00'];
    state.time = times[(times.indexOf(state.time) + 1) % times.length];
    notify(`Departure window updated to ${state.time}–21:00`);
  }
  if (action === 'find-offers') {
    navigateTo('explore', { filter: 'all' });
    return;
  }
  if (action === 'filter') {
    state.filter = target.dataset.filter;
    render();
    return;
  }
  if (action === 'open-offer') {
    navigateTo('detail', { selectedOffer: target.dataset.id });
    return;
  }
  if (action === 'back') {
    goBackInApp();
    return;
  }
  if (action === 'back-detail') {
    navigateTo('detail');
    return;
  }
  if (action === 'claim') {
    const offerId = target.dataset.id;
    if (!state.claimed.includes(offerId)) {
      state.claimed.push(offerId);
      persist();
      notify('QR Voucher claimed · +25 Peak points');
      fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId })
      }).catch(() => {});
    }
    navigateTo('voucher', { selectedOffer: offerId });
    return;
  }
  if (action === 'simulate-scan') {
    const offerId = target.dataset.id;
    const code = target.dataset.code;
    if (state.redeemed.includes(offerId)) {
      navigateTo('home');
      return;
    }
    state.redeemed.push(offerId);
    persist();
    notify('QR verified! Discount applied · +15 bonus pts');
    fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    }).catch(() => {});
    render();
    return;
  }
  if (action === 'swap') {
    [state.routeFrom, state.routeTo] = [state.routeTo, state.routeFrom];
  }
  if (action === 'favorite') {
    const id = target.dataset.id || state.selectedOffer || offers[0].id;
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter(fav => fav !== id);
      notify('Removed from favourites');
    } else {
      state.favorites.push(id);
      notify('Offer saved to favourites');
    }
    persist();
  }
  if (action === 'edit-route') {
    const currentIdx = destinations.indexOf(state.routeTo);
    state.routeTo = destinations[(currentIdx + 1) % destinations.length];
    notify(`Destination updated to ${state.routeTo}`);
  }
  if (action === 'open-favs') {
    navigateTo('explore', { filter: 'all' });
    notify(
      state.favorites.length
        ? `${state.favorites.length} favourite offer(s)`
        : 'Tap the heart on any offer to save it'
    );
    return;
  }
  if (action === 'profile-item') {
    notify('Quiet-hour commute notifications are active');
  }
  if (action === 'reset') {
    state.claimed = [];
    state.redeemed = [];
    state.favorites = [];
    state.routeFrom = '28 May, Baku';
    state.routeTo = 'Ahmadli';
    persist();
    notify('Demo reset');
    navigateTo('home');
    return;
  }
  render();
});

initHistoryGuard();
render();
