const offers = [
  {
    id: "coffee-pastry",
    rank: 1,
    category: "recommended",
    name: "Coffee & pastry",
    venue: "Coffee & Co",
    discount: 20,
    price: 6.4,
    oldPrice: 8,
    walk: 5,
    stock: 4,
    expires: "19:00",
    tag: "Best match",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=88",
    hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id: "study-hour",
    rank: 2,
    category: "special",
    name: "Anti-cafe study hour",
    venue: "Sakit Məkan",
    discount: 30,
    price: 5,
    oldPrice: 7.15,
    walk: 6,
    stock: 9,
    expires: "20:00",
    tag: "Quiet pick",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=88",
    hero: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id: "bowling",
    rank: 3,
    category: "recommended",
    name: "Bowling session",
    venue: "Strike Zone",
    discount: 15,
    price: 12,
    oldPrice: 14.1,
    walk: 8,
    stock: 6,
    expires: "21:00",
    tag: "Fun stop",
    image: "https://images.unsplash.com/photo-1514727200133-0f3a18aeeab4?auto=format&fit=crop&w=800&q=88",
    hero: "https://images.unsplash.com/photo-1587536849024-daaa4a417b16?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id: "fresh-lunch",
    rank: 4,
    category: "expiry",
    name: "Fresh lunch box",
    venue: "Urban Fork",
    discount: 35,
    price: 7.8,
    oldPrice: 12,
    walk: 9,
    stock: 3,
    expires: "18:30",
    tag: "Last-day special",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=88",
    hero: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=88"
  }
];

const iconPaths = {
  pin:'<path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>',
  route:'<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c7 0 3-12 10-12"/>',
  train:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 21l2-3m6 0 2 3M8 8h8M8 13h.01M16 13h.01"/>',
  bus:'<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M7 19v2m10-2v2M7 8h10M7 14h.01M17 14h.01"/>',
  car:'<path d="m5 11 2-5h10l2 5m-15 0h16v7H4zM7 18v2m10-2v2M7 14h.01M17 14h.01"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  back:'<path d="m15 5-7 7 7 7"/>',
  walk:'<circle cx="13" cy="4" r="2"/><path d="m10 22 1-7-3-3 2-5 5 3 3 1m-7 4 4 3 1 4M8 12l-3 4"/>',
  tag:'<path d="M3 12V4h8l10 10-7 7z"/><circle cx="7.5" cy="8" r="1"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  qr:'<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h2v2h-2zm4 0h2v6h-2zm-4 4h2v2h-2z"/>',
  home:'<path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9H8.5a2.5 2.5 0 1 1 2-4c1 1.3 1.5 4 1.5 4Zm0 0h3.5a2.5 2.5 0 1 0-2-4c-1 1.3-1.5 4-1.5 4Z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  heart:'<path d="M20.8 5.7a5.4 5.4 0 0 0-7.6 0L12 6.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  wifi:'<path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0m-5 3a2 2 0 0 1 2 0"/>',
  swap:'<path d="M7 7h12l-3-3m3 13H5l3 3"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h2"/>',
  ticket:'<path d="M3 8a3 3 0 0 0 0 6v4h18v-4a3 3 0 0 0 0-6V4H3z"/><path d="M13 7v2m0 2v2m0 2v2"/>',
  location:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
  logout:'<path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8"/>'
};

function icon(name, cls='') {
  return `<svg class="${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}

function logo() {
  return `<svg class="brand-mark" viewBox="0 0 40 46" aria-hidden="true"><ellipse cx="20" cy="40" rx="16" ry="4" fill="none" stroke="#00a690" stroke-width="3"/><path d="M20 2C10 2 5 9 5 17c0 11 15 23 15 23s15-12 15-23C35 9 30 2 20 2Z" fill="currentColor"/><circle cx="20" cy="17" r="5" fill="#052f42"/><path d="M29 5l3-3m1 7h4M27 1v4" stroke="#ffb51b" stroke-width="2"/></svg>`;
}

const stored = JSON.parse(localStorage.getItem('peakoff-mobile-demo') || '{}');
const state = {
  screen: 'home',
  filter: 'recommended',
  mode: 'train',
  time: '18:30',
  selectedOffer: null,
  claimed: stored.claimed || [],
  routeFrom: '28 May, Baku',
  routeTo: 'Ahmadli'
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

function persist(){localStorage.setItem('peakoff-mobile-demo',JSON.stringify({claimed:state.claimed}))}
function money(value){return `${Number(value).toFixed(2)} AZN`}
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2400)}

function statusBar(){return `<div class="status"><span>17:35</span><span class="status-icons"><svg viewBox="0 0 20 14"><path fill="currentColor" d="M1 11h3v3H1zm5-3h3v6H6zm5-3h3v9h-3zm5-4h3v13h-3z"/></svg>${icon('wifi')}<span>▰</span></span></div>`}
function brand(){return `<div class="brand-row">${logo()}<span class="brand-name">Peak<b>Off</b></span></div>`}

function mapGraphic(compact=false){return `<svg viewBox="0 0 360 200" preserveAspectRatio="none" aria-label="Mock route map">
  <rect width="360" height="200" fill="#e9e4d8"/><path d="M0 34 360 70M0 126 360 100M55 0 80 200M170 0 150 200M290 0 260 200" stroke="#fff" stroke-width="12" opacity=".85"/><path d="M0 78 360 150M105 0 120 200M225 0 205 200" stroke="#cdd9c6" stroke-width="19" opacity=".7"/><path d="M0 176c70-25 115-12 166 24h194v-18c-70-22-122-17-178-8C108 185 59 154 0 160Z" fill="#8ed4ee"/>
  <path d="M62 119c25-45 48-57 79-44 34 14 41 39 75 27 35-13 51-47 91-32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M62 119c25-45 48-57 79-44 34 14 41 39 75 27 35-13 51-47 91-32" fill="none" stroke="#10a78b" stroke-width="${compact?5:6}" stroke-linecap="round" stroke-dasharray="${compact?'5 7':'0'}"/>
  <circle cx="62" cy="119" r="17" fill="#2f8ce8" opacity=".22"/><circle cx="62" cy="119" r="9" fill="#2f8ce8" stroke="#fff" stroke-width="4"/><path d="M307 50c-10 0-16 7-16 15 0 12 16 26 16 26s16-14 16-26c0-8-6-15-16-15Z" fill="#ff8b12" stroke="#fff" stroke-width="3"/><circle cx="307" cy="65" r="5" fill="#fff"/>
  ${compact?'':`<g transform="translate(125 43)"><path d="M0 0h30v30H0z" rx="8" fill="#ffad18"/><circle cx="15" cy="15" r="7" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 12h3a3 3 0 0 1 0 6h-3" fill="none" stroke="#fff" stroke-width="2"/></g><g transform="translate(215 112)"><circle cx="15" cy="15" r="15" fill="#ffad18"/><path d="M9 10v14m12-14v14M9 15h12" stroke="#fff" stroke-width="2"/></g>`}
  </svg>`}

function topRegion(title, extra=''){
  return `<header class="top-region">${statusBar()}${brand()}<h1 class="page-title">${title}</h1>${extra}</header>`;
}

function bottomNav(active){
  const items=[['home','Home','home'],['explore','Explore','search'],['offers','Offers','tag'],['rewards','Rewards','gift'],['profile','Profile','user']];
  return `<nav class="bottom-nav" aria-label="Primary navigation">${items.map(([screen,label,ico])=>`<button class="nav-item ${active===screen?'active':''}" data-action="navigate" data-screen="${screen}">${icon(ico)}<span>${label}</span></button>`).join('')}</nav>`;
}

function homeScreen(){
  return `<div class="screen">${topRegion('Your route')}
    <div class="route-map">${mapGraphic()}<span class="map-pill from">28 May</span><span class="map-pill to">Ahmadli</span></div>
    <section class="route-card" aria-label="Route">
      <div class="field-row">${icon('location')}<div><span>From:</span><strong>${state.routeFrom}</strong></div><button data-action="swap" aria-label="Swap route">${icon('swap')}</button></div>
      <div class="field-row">${icon('pin')}<div><span>To:</span><strong>${state.routeTo}</strong></div><button data-action="edit-route" aria-label="Edit destination">${icon('chevron')}</button></div>
    </section>
    <div class="mode-switch" aria-label="Transport mode">${[['train','Metro'],['bus','Bus'],['car','Drive']].map(([mode,label])=>`<button class="mode ${state.mode===mode?'active':''}" data-action="mode" data-mode="${mode}">${icon(mode)} ${label}</button>`).join('')}</div>
    <section class="section"><div class="section-head"><h2>Choose your time</h2><span>${icon('info')} Estimates</span></div>
      <div class="time-list">${[['18:00','High','26 min'],['18:30','Busy','24 min'],['19:00','Calmer','21 min']].map(([time,traffic,duration])=>`<button class="time-option ${state.time===time?'active':''}" data-action="time" data-time="${time}">${icon('clock')}<strong>${time}</strong><span class="traffic ${traffic.toLowerCase()}">${traffic}</span><small>≈ ${duration}</small></button>`).join('')}</div>
    </section>
    <button class="primary-button" data-action="find-offers">Find nearby offers ${icon('arrow')}</button>
    ${bottomNav('home')}
  </div>`;
}

function offersHeader(){return topRegion('Offers ranked for you',`<div class="filters"><button class="filter-select">${icon('pin')} Near 28 May</button><button class="filter-select">${icon('clock')} ${state.time}–19:00</button></div>`)}
function filteredOffers(){if(state.filter==='recommended')return offers.filter(item=>item.category==='recommended'||item.rank===1);if(state.filter==='special')return offers.filter(item=>item.category==='special');if(state.filter==='expiry')return offers.filter(item=>item.category==='expiry'||item.stock<=4);return offers}

function exploreScreen(){
  const list=filteredOffers();
  return `<div class="screen">${offersHeader()}
    <div class="tabs">${[['recommended','Recommended'],['special','Special deals'],['expiry','Near-expiry'],['all','All']].map(([id,label])=>`<button class="tab ${state.filter===id?'active':''}" data-action="filter" data-filter="${id}">${label}</button>`).join('')}</div>
    <div class="offer-list">${list.length?list.map(offerCard).join(''):`<div class="empty-state">${icon('search')}<h2>No matches yet</h2><p>Try another category or departure time.</p></div>`}</div>
    <div class="stock-banner">${icon('tag')} Save more · limited stock</div>
    ${bottomNav('explore')}
  </div>`;
}

function offerCard(offer){return `<button class="offer-card ${offer.rank===1?'best':''}" data-action="open-offer" data-id="${offer.id}">
  <span class="offer-image" style="background-image:url('${offer.image}')">${offer.rank===1?`<span class="best-label">♛ ${offer.tag}</span>`:`<span class="rank">${offer.rank}</span>`}</span>
  <span class="offer-copy"><h3>${offer.name}</h3><span class="discount">${offer.discount}% OFF</span><span class="meta">${icon('walk')} ${offer.walk} min walk</span><strong class="price">${money(offer.price)}</strong></span>
  <span class="chevron">${icon('chevron')}</span>
  </button>`}

function detailScreen(){
  const offer=offers.find(item=>item.id===state.selectedOffer)||offers[0];
  const isClaimed=state.claimed.includes(offer.id);
  return `<div class="screen"><div class="detail-hero" style="background-image:url('${offer.hero}')">
    <div class="detail-top"><button class="back-button" data-action="back" aria-label="Back">${icon('back')}</button><div class="detail-brand">${logo()} Peak<span style="color:var(--amber)">Off</span></div><button class="round-button" data-action="favorite" aria-label="Save offer">${icon('heart')}</button></div>
  </div><main class="detail-sheet">
    <h1>${offer.venue}</h1><div class="venue-meta"><span>${icon('walk')} ${offer.walk} min walk</span><span>${icon('wifi')} Quiet seating · Wi-Fi</span></div>
    <div class="deal-strip">${icon('tag')} ${offer.tag} · ${offer.discount}% OFF</div>
    <section class="bundle"><img src="${offer.image}" alt="${offer.name}"><div><h2>${offer.name}</h2><div><span class="old-price">${money(offer.oldPrice)}</span> <strong class="new-price">${money(offer.price)}</strong></div><span class="stock">${icon('layers')} ${offer.stock} left</span></div></section>
    <div class="availability">${icon('calendar')}<div><strong>Available today until ${offer.expires}</strong><small>Within safe sell-by date.</small></div></div>
    <div class="mini-map">${mapGraphic(true)}</div>
  </main><div class="sticky-claim"><button class="primary-button" data-action="claim" data-id="${offer.id}">${icon('qr')} ${isClaimed?'Open QR voucher':'Claim QR voucher'}</button></div></div>`;
}

function qrGrid(code){let seed=code.split('').reduce((sum,c)=>sum+c.charCodeAt(0),0);return Array.from({length:169},(_,index)=>{const x=index%13,y=Math.floor(index/13);const finder=(x<4&&y<4)||(x>8&&y<4)||(x<4&&y>8);const on=finder?x===0||y===0||x===3||y===3||((x===1||x===2)&&(y===1||y===2)):((index*17+seed+y*7)%5<2);return `<i class="${on?'on':''}"></i>`}).join('')}
function voucherScreen(){const offer=offers.find(item=>item.id===state.selectedOffer)||offers[0];const code=`PO-${offer.id.slice(0,4).toUpperCase()}-2811`;return `<div class="screen voucher-screen"><div class="voucher-card">${brand()}<h1>${offer.discount}% off at ${offer.venue}</h1><p>${offer.name} · valid today until ${offer.expires}</p><div class="qr" aria-label="Demo QR code">${qrGrid(code)}</div><div class="voucher-code">${code}</div><div class="voucher-terms">Show this demo voucher at the venue. One use only. Mock data.</div><div class="voucher-actions"><button class="secondary-button" data-action="navigate" data-screen="offers">My vouchers</button><button class="secondary-button" data-action="back-detail">Offer details</button></div></div></div>`}

function myOffersScreen(){const claimed=offers.filter(item=>state.claimed.includes(item.id));return `<div class="screen">${topRegion('Your vouchers')}${claimed.length?`<div class="offer-list" style="padding-top:14px">${claimed.map(offerCard).join('')}</div>`:`<div class="empty-state">${icon('ticket')}<h2>No vouchers yet</h2><p>Choose an offer near your route and claim its QR voucher.</p><button class="primary-button" style="width:100%;margin:18px 0" data-action="navigate" data-screen="explore">Explore offers</button></div>`}${bottomNav('offers')}</div>`}
function rewardsScreen(){return `<div class="screen">${topRegion('Your rewards')}<div class="profile-card"><div class="section-head"><h2>120 Peak points</h2><span>Next reward at 200</span></div><div style="height:10px;background:#e5ebe9;border-radius:10px;overflow:hidden"><div style="width:60%;height:100%;background:var(--teal)"></div></div><div class="stock-banner" style="margin:20px 0 0">${icon('gift')} Claim offers to earn more</div></div>${bottomNav('rewards')}</div>`}
function profileScreen(){return `<div class="screen">${topRegion('Profile')}<section class="profile-card"><div class="profile-head"><div class="avatar">AA</div><div><h2>Aykhan Amirov</h2><p>PeakOff demo member</p></div></div>${[['location','Saved routes'],['bell','Notifications'],['heart','Favourite venues'],['logout','Reset demo']].map(([ico,label],index)=>`<button class="menu-row" style="width:100%;border-left:0;border-right:0;border-bottom:0;background:transparent;text-align:left" data-action="${index===3?'reset':'profile-item'}">${icon(ico)}<strong>${label}</strong>${icon('chevron')}</button>`).join('')}</section>${bottomNav('profile')}</div>`}

function render(){
  const screens={home:homeScreen,explore:exploreScreen,detail:detailScreen,voucher:voucherScreen,offers:myOffersScreen,rewards:rewardsScreen,profile:profileScreen};
  app.innerHTML=(screens[state.screen]||homeScreen)();
  app.querySelector('.screen')?.scrollTo(0,0);
}

app.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action;
  if(action==='navigate'){state.screen=target.dataset.screen}
  if(action==='mode'){state.mode=target.dataset.mode;notify(`${target.textContent.trim()} selected`)}
  if(action==='time'){state.time=target.dataset.time}
  if(action==='find-offers'){state.screen='explore'}
  if(action==='filter'){state.filter=target.dataset.filter}
  if(action==='open-offer'){state.selectedOffer=target.dataset.id;state.screen='detail'}
  if(action==='back'){state.screen='explore'}
  if(action==='back-detail'){state.screen='detail'}
  if(action==='claim'){
    state.selectedOffer=target.dataset.id;
    if(!state.claimed.includes(target.dataset.id)){state.claimed.push(target.dataset.id);persist();notify('Voucher claimed')}
    state.screen='voucher';
  }
  if(action==='swap'){[state.routeFrom,state.routeTo]=[state.routeTo,state.routeFrom]}
  if(action==='favorite'){notify('Offer saved to favourites')}
  if(action==='edit-route'){notify('Route editing is simulated')}
  if(action==='profile-item'){notify('Demo setting')}
  if(action==='reset'){state.claimed=[];persist();state.screen='home';notify('Demo reset')}
  render();
});

render();
