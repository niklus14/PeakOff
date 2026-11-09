/**
 * Vercel Serverless Function: /api/ai
 *
 * Exposes xAI Grok-powered dynamic pricing suggestions, interactive business
 * financial guidance, and mobile commuter route picks.
 */

const {
  getApiKey,
  computeDetailedMetrics,
  generateDashboardSuggestion,
  askBusinessGuide,
  askMobileConcierge
} = require('../src/grok');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      configured: Boolean(getApiKey()),
      provider: 'PeakAI'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const mode = body.mode || 'suggest';

    if (mode === 'metrics') {
      return res.status(200).json({
        ok: true,
        metrics: computeDetailedMetrics(body.state || {})
      });
    }

    if (mode === 'guide') {
      const result = await askBusinessGuide(body.question, body.state || {});
      return res.status(200).json(result);
    }

    if (mode === 'mobile-pick') {
      const result = await askMobileConcierge(body);
      return res.status(200).json(result);
    }

    const result = await generateDashboardSuggestion(body.state || {});
    return res.status(200).json(result);
  } catch (error) {
    // Graceful deterministic fallback with full calculations if network/API hiccups
    const fallbackState =
      (typeof req.body === 'object' && req.body?.state) || {};
    const metrics = computeDetailedMetrics(fallbackState);
    const prevSales = Number(fallbackState.previousDaySales) || 980;
    const curSales = Number(fallbackState.sales) || 710;
    const dropPct = Math.abs(((curSales - prevSales) / prevSales) * 100).toFixed(1);
    return res.status(200).json({
      ok: true,
      source: 'engine-fallback',
      warning: error.message,
      recommendedDiscount: metrics.opt.recommended,
      confidence: 'High',
      headline: `Sales down ${dropPct}% · ${metrics.opt.recommended}% margin-safe recovery offer`,
      summary: `Evening sales (${curSales} AZN) are trailing yesterday (${prevSales} AZN) with ${metrics.demand.available} empty tables. A ${metrics.opt.recommended}% offer protects ${metrics.unit.unitProfit.toFixed(
        2
      )} AZN net profit per sale and projects +${
        metrics.forecast.projectedExtraGuests
      } extra guests (+${metrics.forecast.incrementalProfit.toFixed(2)} AZN recovery).`,
      actionGuide: [
        `Apply ${metrics.opt.recommended}% dynamic discount to reverse the evening sales drop-off.`,
        `Activate the 4 pastry rescue bundles at 6.00 AZN before 19:00 (+${metrics.forecast.rescueRecoveredRevenue.toFixed(
          2
        )} AZN net).`,
        'Verify single-use QR codes at arrival; offers auto-pause if 30/30 tables fill.'
      ],
      bundleTip: `Clear 4 expiring pastry bundles at 50% off to recover ${metrics.forecast.rescueRecoveredRevenue.toFixed(
        2
      )} AZN.`,
      metrics
    });
  }
};
