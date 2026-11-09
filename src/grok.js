/**
 * PeakOff xAI Grok Live Intelligence Service
 *
 * Loads XAI_API from environment or local .env and provides live AI-driven
 * dynamic discount recommendations, financial guidance, and commuter matching
 * grounded in real-time mock venue telemetry.
 */

const fs = require('fs');
const path = require('path');
const { analyzeDemand, calculateOptimalDiscount, PLATFORM_FEE_RATE } = require('./engine');

const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const DEFAULT_MODEL = 'grok-4.20-0309-non-reasoning';
const FALLBACK_MODEL = 'grok-4.7';

/**
 * Load .env from project root into process.env if not already populated.
 */
function loadDotEnv() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore file system errors in serverless environments where env vars are injected directly
  }
}

function getApiKey() {
  loadDotEnv();
  return (
    process.env.XAI_API ||
    process.env.XAI_API_KEY ||
    process.env.GROK_API_KEY ||
    ''
  ).trim();
}

/**
 * Compute extended financial & elasticity metrics for any venue state.
 */
function computeDetailedMetrics(state = {}) {
  const demand = analyzeDemand(state);
  const opt = calculateOptimalDiscount(state);
  const price = Math.max(1, Number(state.price) || 20);
  const cost = Math.max(0, Number(state.cost) || 4);
  const floor = Math.max(0, Number(state.floor) || 8);
  const activeDiscount =
    state.customDiscount !== undefined
      ? Number(state.customDiscount)
      : opt.recommended;

  const customerPrice = Number((price * (1 - activeDiscount / 100)).toFixed(2));
  const fee = Number((customerPrice * PLATFORM_FEE_RATE).toFixed(2));
  const netRevenue = Number((customerPrice - fee).toFixed(2));
  const unitProfit = Number((netRevenue - cost).toFixed(2));
  const profitMarginPct =
    customerPrice > 0 ? Number(((unitProfit / customerPrice) * 100).toFixed(1)) : 0;
  const floorBuffer = Number((unitProfit - floor).toFixed(2));

  // Scenario demand multiplier
  const scenarioMultipliers = {
    commute: 1.0,
    rainy: 1.28,
    surge: 0.65,
    clearance: 1.15
  };
  const mult = scenarioMultipliers[state.scenario || 'commute'] || 1.0;

  // Baseline organic evening guests (without discount)
  const baselineGuests = Math.max(2, Math.round((demand.occupied / 30) * 10));
  const fullPriceUnitProfit = Number((price - cost).toFixed(2));
  const baselineProfit = Number((baselineGuests * fullPriceUnitProfit).toFixed(2));

  // Elasticity-driven incremental guests from PeakOff (capped by empty tables * 1.4 turnover)
  const rawExtraGuests =
    activeDiscount > 0 && !opt.paused
      ? Math.round((activeDiscount / 6.5) * (demand.available / 10) * 3.2 * mult)
      : 0;
  const projectedExtraGuests = Math.min(
    Math.ceil(demand.available * 1.4),
    Math.max(0, rawExtraGuests)
  );
  const incrementalProfit = Number((projectedExtraGuests * unitProfit).toFixed(2));
  const projectedTotalProfit = Number((baselineProfit + incrementalProfit).toFixed(2));

  // Projected table occupancy
  const seatsFilledNow = Math.min(
    demand.totalTables,
    demand.occupied + Math.min(demand.available, Math.ceil(projectedExtraGuests * 0.7))
  );
  const projectedOccupancyPct = Math.round((seatsFilledNow / demand.totalTables) * 100);

  // Perishable rescue recovery (4 bundles @ 6 AZN vs write-off of 2.50 AZN cost each)
  const rescueBundles = Number(state.rescueStock) || 4;
  const rescuePrice = 6.0;
  const rescueNetPerBundle = Number((rescuePrice * (1 - PLATFORM_FEE_RATE)).toFixed(2));
  const rescueRecoveredRevenue = Number((rescueBundles * rescueNetPerBundle).toFixed(2));

  // Break-even extra guests needed if 20% of baseline guests also use the coupon
  const cannibalizedLoss = Number(
    (Math.ceil(baselineGuests * 0.2) * (fullPriceUnitProfit - unitProfit)).toFixed(2)
  );
  const breakEvenExtraGuests =
    unitProfit > 0 ? Math.max(1, Math.ceil(cannibalizedLoss / unitProfit)) : 0;

  return {
    demand,
    opt,
    unit: {
      regularPrice: price,
      discount: activeDiscount,
      customerPrice,
      platformFee: fee,
      netRevenue,
      productCost: cost,
      unitProfit,
      profitMarginPct,
      floorBuffer,
      marginProtected: unitProfit >= floor - 1e-6
    },
    forecast: {
      scenario: state.scenario || 'commute',
      baselineGuests,
      projectedExtraGuests,
      baselineProfit,
      incrementalProfit,
      projectedTotalProfit,
      currentOccupancyPct: Math.round(demand.occupancyRate * 100),
      projectedOccupancyPct,
      breakEvenExtraGuests,
      rescueBundles,
      rescueRecoveredRevenue
    }
  };
}

async function callGrokChat(messages, { temperature = 0.3, maxTokens = 550 } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing XAI_API key in environment');
  }

  for (const model of [DEFAULT_MODEL, FALLBACK_MODEL]) {
    const response = await fetch(XAI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';
      return { content, model };
    }

    if (model === FALLBACK_MODEL) {
      const errText = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errText.slice(0, 200)}`);
    }
  }
}

function extractJsonObject(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }
  return JSON.parse(cleaned);
}

/**
 * Generate a live Grok dynamic pricing & operational guide recommendation.
 */
async function generateDashboardSuggestion(state = {}) {
  const metrics = computeDetailedMetrics(state);
  const hardCap = Math.max(
    0,
    Math.min(metrics.opt.maxCeiling, metrics.opt.maxMarginSafeDiscount)
  );

  const prevSales = Number(state.previousDaySales) || 980;
  const currentSales = Number(state.sales) || 710;
  const salesDeltaPct = Number((((currentSales - prevSales) / prevSales) * 100).toFixed(1));
  const revenueGapAZN = Number(Math.max(0, prevSales - currentSales).toFixed(2));

  const systemPrompt = `You are PeakAI, the dynamic pricing and optimization engine for "Coffee & Co" on Nizami Street, Baku.
PeakOff helps hospitality & leisure venues reverse off-peak sales declines and fill empty tables using margin-protected dynamic discounts and single-use QR coupons (7% platform fee ONLY on verified redeemed sales). Never refer to yourself as Grok or xAI; your name is PeakAI.

STRICT BUSINESS RULES:
1. Recommended discount MUST be an integer between 0 and ${hardCap} (never exceed merchant ceiling ${metrics.opt.maxCeiling}% or margin-safe limit ${metrics.opt.maxMarginSafeDiscount}%).
2. If all 30 tables are occupied and autoPause is enabled, recommendedDiscount should be 0 and advise pausing until tables open.
3. Explicitly note the current off-peak sales decline vs. previous days and how your recommended discount closes that revenue gap while protecting profit margins.

Respond ONLY with valid JSON matching this exact schema:
{
  "recommendedDiscount": <number>,
  "confidence": "<High|Medium>",
  "headline": "<concise 6-10 word insight highlighting sales decline & recovery>",
  "summary": "<2 concise sentences referencing the sales decline %, empty tables, and exact net AZN profit recovery>",
  "actionGuide": [
    "<Step 1: immediate pricing/capacity action to reverse the sales drop>",
    "<Step 2: perishable inventory or upsell tactic>",
    "<Step 3: staff QR verification / table turnover tip>"
  ],
  "bundleTip": "<1 concise sentence on handling the 4 near-expiry pastry bundles>"
}`;

  const userPayload = {
    venue: 'Coffee & Co (Nizami Street, Baku)',
    scenario: state.scenarioLabel || state.scenario || 'Evening Sales Drop-off (17:00–20:00)',
    tablesOccupied: metrics.demand.occupied,
    tablesAvailable: metrics.demand.available,
    totalTables: metrics.demand.totalTables,
    salesTodayAZN: currentSales,
    previousDaySalesAZN: prevSales,
    salesChangeVsYesterdayPct: salesDeltaPct,
    revenueShortfallAZN: revenueGapAZN,
    regularPriceAZN: metrics.unit.regularPrice,
    productCostAZN: metrics.unit.productCost,
    minProfitFloorAZN: Number(state.floor) || 8,
    ownerMaxDiscountPct: metrics.opt.maxCeiling,
    maxMarginSafeDiscountPct: metrics.opt.maxMarginSafeDiscount,
    heuristicSuggestedPct: metrics.opt.recommended,
    unitProfitAtHeuristicAZN: metrics.opt.netProfit,
    couponsClaimed: state.claimed || 7,
    couponsRedeemed: state.redeemed || 5,
    specialPastryRescueActive: Boolean(state.special),
    autoPauseWhenFull: Boolean(state.autoPause),
    projectedExtraGuests: metrics.forecast.projectedExtraGuests,
    projectedIncrementalProfitAZN: metrics.forecast.incrementalProfit
  };

  const { content, model } = await callGrokChat(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze live venue telemetry and output JSON:\n${JSON.stringify(userPayload)}`
      }
    ],
    { temperature: 0.25, maxTokens: 500 }
  );

  const parsed = extractJsonObject(content);
  const clampedDiscount = metrics.opt.paused
    ? 0
    : Math.max(0, Math.min(hardCap, Math.round(Number(parsed.recommendedDiscount) || metrics.opt.recommended)));

  // Recompute unit & forecast for the AI-chosen clamped discount
  const finalMetrics = computeDetailedMetrics({
    ...state,
    customDiscount: clampedDiscount
  });

  return {
    ok: true,
    source: 'peakai-live',
    model,
    recommendedDiscount: clampedDiscount,
    confidence: parsed.confidence || 'High',
    headline: parsed.headline || `${clampedDiscount}% dynamic offer balances seat fill & margin`,
    summary:
      parsed.summary ||
      `With ${metrics.demand.available} empty tables, a ${clampedDiscount}% offer keeps unit profit at ${finalMetrics.unit.unitProfit.toFixed(2)} AZN while attracting nearby commuters.`,
    actionGuide: Array.isArray(parsed.actionGuide) && parsed.actionGuide.length
      ? parsed.actionGuide.slice(0, 3)
      : [
          `Publish a ${clampedDiscount}% offer capped at ${Math.min(15, metrics.demand.available)} single-use QR coupons.`,
          'Activate the 50% Pastry Rescue Bundle until 19:00 to recover 22.32 AZN from expiring stock.',
          'Keep auto-pause enabled so discounts stop automatically if occupancy reaches 30/30.'
        ],
    bundleTip:
      parsed.bundleTip ||
      `Activate the 4 pastry bundles at 6.00 AZN before 19:00 to recover ${finalMetrics.forecast.rescueRecoveredRevenue.toFixed(2)} AZN net revenue.`,
    metrics: finalMetrics
  };
}

/**
 * Interactive AI Business Guide Q&A for the venue owner.
 */
async function askBusinessGuide(question, state = {}) {
  const metrics = computeDetailedMetrics(state);
  const hardCap = Math.max(
    0,
    Math.min(metrics.opt.maxCeiling, metrics.opt.maxMarginSafeDiscount)
  );
  const prevSales = Number(state.previousDaySales) || 980;
  const currentSales = Number(state.sales) || 710;
  const salesDeltaPct = Number((((currentSales - prevSales) / prevSales) * 100).toFixed(1));
  const revenueGapAZN = Number(Math.max(0, prevSales - currentSales).toFixed(2));

  const systemPrompt = `You are PeakAI, the Business Strategy Guide & Financial Co-Pilot for Coffee & Co (Nizami Street, Baku). Never refer to yourself as Grok or xAI; your name is PeakAI.
Give practical, crystal-clear, numbers-first guidance to the business owner in 3–5 short bullet points or 2 short paragraphs (max 120 words).
Reference their exact live metrics:
- Sales Trend Today: ${currentSales.toFixed(2)} AZN vs ${prevSales.toFixed(2)} AZN previous day (${salesDeltaPct}% decline, −${revenueGapAZN.toFixed(2)} AZN shortfall)
- Occupancy: ${metrics.demand.occupied}/30 tables (${metrics.demand.available} empty)
- Regular Price: ${metrics.unit.regularPrice.toFixed(2)} AZN | Cost: ${metrics.unit.productCost.toFixed(2)} AZN | Profit Floor: ${(Number(state.floor) || 8).toFixed(2)} AZN
- Max Safe Discount: ${hardCap}% (Owner ceiling: ${metrics.opt.maxCeiling}%, Margin limit: ${metrics.opt.maxMarginSafeDiscount}%)
- Recommended Discount: ${metrics.opt.recommended}% -> Customer pays ${metrics.opt.customerPrice.toFixed(2)} AZN, 7% PeakOff fee = ${metrics.opt.platformFee.toFixed(2)} AZN, Net Profit = ${metrics.opt.netProfit.toFixed(2)} AZN/sale
- Projected Evening Lift: +${metrics.forecast.projectedExtraGuests} guests (+${metrics.forecast.incrementalProfit.toFixed(2)} AZN net profit recovery)
- Rescue Inventory: 4 pastry bundles expiring at 19:00 (${state.special ? 'Active' : 'Inactive'}, recovers ${metrics.forecast.rescueRecoveredRevenue.toFixed(2)} AZN).`;

  const { content, model } = await callGrokChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: String(question || 'Give me an evening optimization guide.') }
    ],
    { temperature: 0.35, maxTokens: 350 }
  );

  return {
    ok: true,
    source: 'peakai-live',
    model,
    answer: content.trim(),
    metrics
  };
}

/**
 * Mobile Customer AI Route Concierge recommendation.
 */
async function askMobileConcierge({ routeFrom, routeTo, mode, time, offers = [] } = {}) {
  const systemPrompt = `You are PeakAI, the Commuter Route Concierge in Baku. Never refer to yourself as Grok or xAI.
Given the commuter's route, transport mode, departure time, and live nearby off-peak deals, pick the Top 2 stops and explain why in 2 upbeat sentences (max 55 words). Also return the best offer id.
Respond ONLY with JSON: {"bestOfferId": "<id>", "tip": "<2 short sentences>"}`;

  const compactOffers = offers.slice(0, 8).map(o => ({
    id: o.id,
    venue: o.venue,
    name: o.name,
    discount: o.discount,
    priceAZN: o.price,
    walkMin: o.walk
  }));

  const { content, model } = await callGrokChat(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({ routeFrom, routeTo, mode, time, offers: compactOffers })
      }
    ],
    { temperature: 0.35, maxTokens: 220 }
  );

  const parsed = extractJsonObject(content);
  return {
    ok: true,
    source: 'peakai-live',
    model,
    bestOfferId: parsed.bestOfferId || 'coffee-pastry',
    tip: parsed.tip || 'Skip the peak metro crowd at Coffee & Co for 20% off, just a 5-minute walk from your route.'
  };
}

module.exports = {
  loadDotEnv,
  getApiKey,
  computeDetailedMetrics,
  generateDashboardSuggestion,
  askBusinessGuide,
  askMobileConcierge
};
