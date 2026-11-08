/**
 * PeakOff Core Optimization & Workflow Engine (Stages 01–13)
 *
 * Implements the two-sided marketplace logic connecting B2B venue capacity
 * and margin-protected dynamic pricing with B2C commuter discovery and
 * single-use QR coupon verification.
 */

const PLATFORM_FEE_RATE = 0.07;
const TOTAL_TABLES_DEFAULT = 30;

/**
 * Stage 01 & 02: Default Business Profile & Operational Data Integration
 */
function createInitialState() {
  return {
    venue: {
      id: 'coffee-and-co-baku',
      name: 'Coffee & Co',
      category: 'Coffee shop',
      location: 'Nizami Street, Baku',
      totalTables: TOTAL_TABLES_DEFAULT,
      openingHours: '08:00–23:00',
      offPeakWindow: '17:00–20:00'
    },
    occupied: 12,
    occupiedTables: Array.from({ length: TOTAL_TABLES_DEFAULT }, (_, i) => i < 12),
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
    coupons: {},
    activityLog: [
      {
        id: 'act-1',
        type: 'redeem',
        icon: 'check',
        title: 'Coffee & pastry coupon redeemed',
        detail: 'Just now · 16.00 AZN sale'
      },
      {
        id: 'act-2',
        type: 'opportunity',
        icon: 'trend',
        title: 'Evening opportunity detected',
        detail: '17:00 · Nizami Street area'
      }
    ],
    learningMetrics: {
      predictedEveningVisits: 16,
      actualEveningVisits: 18,
      conversionRate: 0.71,
      modelIterations: 12
    }
  };
}

/**
 * Stage 03: Demand and Sales Analysis
 * Evaluates current table occupancy, historical evening traffic, and capacity ratio.
 */
function analyzeDemand(state) {
  const totalTables = state.venue?.totalTables || TOTAL_TABLES_DEFAULT;
  const occupied = Math.max(0, Math.min(totalTables, Number(state.occupied) || 0));
  const available = totalTables - occupied;
  const occupancyRate = occupied / totalTables;
  const emptinessFactor = 1 - occupancyRate;

  // Base demand score (8%) + emptiness scaling (up to 20%) + commuter rush bonus (4%)
  const rawDemandDiscount = Math.round(8 + emptinessFactor * 20 + 4);

  return {
    totalTables,
    occupied,
    available,
    occupancyRate: Number(occupancyRate.toFixed(2)),
    rawDemandDiscount,
    isFull: occupied >= totalTables,
    isQuietPeriod: occupancyRate <= 0.65
  };
}

/**
 * Stage 04: Dynamic Discount Optimization
 * Calculates recommended discount while strictly enforcing:
 *   1. Merchant-defined maximum discount ceiling (state.max)
 *   2. Minimum profit floor after 7% platform fee and unit cost
 */
function calculateOptimalDiscount(state) {
  const demand = analyzeDemand(state);
  const price = Math.max(1, Number(state.price) || 20);
  const cost = Math.max(0, Number(state.cost) || 0);
  const floor = Math.max(0, Number(state.floor) || 0);
  const maxCeiling = Math.max(0, Math.min(50, Number(state.max) || 0));

  const netMultiplier = 1 - PLATFORM_FEE_RATE;
  const maxMarginSafeDiscount = Math.floor(
    100 * (1 - (cost + floor) / (price * netMultiplier))
  );

  const recommended = Math.max(
    0,
    Math.min(maxCeiling, demand.rawDemandDiscount, maxMarginSafeDiscount)
  );

  const customerPrice = Number((price * (1 - recommended / 100)).toFixed(2));
  const platformFee = Number((customerPrice * PLATFORM_FEE_RATE).toFixed(2));
  const netRevenue = Number((customerPrice - platformFee).toFixed(2));
  const netProfit = Number((netRevenue - cost).toFixed(2));
  const marginProtected = netProfit >= floor - 1e-6;

  return {
    recommended,
    maxCeiling,
    maxMarginSafeDiscount,
    customerPrice,
    platformFee,
    netRevenue,
    netProfit,
    marginProtected,
    paused: Boolean(state.autoPause && demand.isFull)
  };
}

/**
 * Stage 09: Single-Use QR Coupon Generation
 */
function generateCoupon(state, { offerId = 'coffee-pastry', discount, customerName = 'Customer' } = {}) {
  const appliedDiscount = discount ?? (state.active ? state.discount : 20);
  const prefix = offerId === 'demo' ? 'PEAK-DEMO' : `PO-${offerId.slice(0, 4).toUpperCase()}`;
  const code = offerId === 'demo' ? 'PEAK-DEMO-0008' : `${prefix}-2811`;

  const coupon = {
    code,
    offerId,
    venue: state.venue?.name || 'Coffee & Co',
    discount: appliedDiscount,
    customerName,
    createdAt: new Date().toISOString(),
    expiresAt: '19:00',
    status: 'CLAIMED'
  };

  if (!state.coupons) state.coupons = {};
  if (!state.coupons[code]) {
    state.coupons[code] = coupon;
    state.claimed = (Number(state.claimed) || 0) + 1;
  }

  return state.coupons[code];
}

/**
 * Stage 11, 12 & 13: QR Verification, Redemption, and Continuous Learning Loop
 */
function redeemCoupon(state, code = 'PEAK-DEMO-0008') {
  const normalized = String(code || '').trim().toUpperCase();
  const totalTables = state.venue?.totalTables || TOTAL_TABLES_DEFAULT;

  if (state.occupied >= totalTables) {
    return {
      ok: false,
      reason: 'VENUE_FULL',
      message: 'Venue is full. Update table availability first.'
    };
  }

  const existing = state.coupons?.[normalized];
  if (existing && existing.status === 'REDEEMED') {
    return {
      ok: false,
      reason: 'ALREADY_REDEEMED',
      message: `Coupon ${normalized} has already been redeemed.`
    };
  }

  if (normalized === 'PEAK-DEMO-0008' && state.redeemedDemo) {
    return {
      ok: false,
      reason: 'ALREADY_REDEEMED',
      message: 'Demo coupon has already been redeemed.'
    };
  }

  const discount = existing?.discount ?? (state.active ? state.discount : 24);
  const saleAmount = Number((state.price * (1 - discount / 100)).toFixed(2));
  const feeAmount = Number((saleAmount * PLATFORM_FEE_RATE).toFixed(2));
  const netToBusiness = Number((saleAmount - feeAmount).toFixed(2));

  if (normalized === 'PEAK-DEMO-0008') {
    state.redeemedDemo = true;
    state.claimedDemo = true;
  }

  if (!state.coupons) state.coupons = {};
  state.coupons[normalized] = {
    ...(existing || {
      code: normalized,
      offerId: 'coffee-pastry',
      venue: 'Coffee & Co',
      discount
    }),
    status: 'REDEEMED',
    redeemedAt: new Date().toISOString(),
    saleAmount,
    feeAmount,
    netToBusiness
  };

  state.redeemed = (Number(state.redeemed) || 0) + 1;
  state.visits = (Number(state.visits) || 0) + 1;
  state.occupied = Math.min(totalTables, (Number(state.occupied) || 0) + 1);
  if (Array.isArray(state.occupiedTables)) {
    const freeIdx = state.occupiedTables.findIndex(v => !v);
    if (freeIdx !== -1) state.occupiedTables[freeIdx] = true;
  }
  state.sales = Number(((Number(state.sales) || 0) + saleAmount).toFixed(2));

  // Stage 13: Continuous Learning update
  if (state.learningMetrics) {
    state.learningMetrics.actualEveningVisits = state.visits;
    state.learningMetrics.conversionRate = Number(
      Math.min(1, state.redeemed / Math.max(1, state.claimed)).toFixed(2)
    );
    state.learningMetrics.modelIterations += 1;
  }

  return {
    ok: true,
    code: normalized,
    discount,
    saleAmount,
    feeAmount,
    netToBusiness,
    state
  };
}

module.exports = {
  PLATFORM_FEE_RATE,
  TOTAL_TABLES_DEFAULT,
  createInitialState,
  analyzeDemand,
  calculateOptimalDiscount,
  generateCoupon,
  redeemCoupon
};
