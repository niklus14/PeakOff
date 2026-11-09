#!/usr/bin/env node
/**
 * PeakOff Unified Demo Server & Live Cross-App Sync Bridge
 *
 * Serves:
 *   - Business Owner Dashboard on http://localhost:3000
 *   - Mobile Customer Application on http://localhost:3001
 *
 * Also exposes a lightweight REST + Server-Sent Events (SSE) API on both ports
 * (/api/state, /api/claim, /api/redeem, /api/reset, /api/events) so actions in
 * the Business Dashboard and Mobile Customer App stay synchronized in real time.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  createInitialState,
  analyzeDemand,
  calculateOptimalDiscount,
  generateCoupon,
  redeemCoupon
} = require('./src/engine');
const {
  loadDotEnv,
  getApiKey,
  computeDetailedMetrics,
  generateDashboardSuggestion,
  askBusinessGuide,
  askMobileConcierge
} = require('./src/grok');

loadDotEnv();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

let sharedState = createInitialState();
const sseClients = new Set();

function broadcastState(eventType = 'state-update') {
  const payload = JSON.stringify({
    type: eventType,
    state: sharedState,
    analysis: analyzeDemand(sharedState),
    optimization: calculateOptimalDiscount(sharedState),
    timestamp: Date.now()
  });

  for (const res of sseClients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(res);
    }
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, pathname) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return true;
  }

  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        state: sharedState,
        analysis: analyzeDemand(sharedState),
        optimization: calculateOptimalDiscount(sharedState)
      })}\n\n`
    );
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return true;
  }

  if (pathname === '/api/state' && req.method === 'GET') {
    sendJson(res, 200, {
      state: sharedState,
      analysis: analyzeDemand(sharedState),
      optimization: calculateOptimalDiscount(sharedState)
    });
    return true;
  }

  if (pathname === '/api/state' && req.method === 'POST') {
    try {
      const updates = await readJsonBody(req);
      sharedState = { ...sharedState, ...updates };
      broadcastState('state-update');
      sendJson(res, 200, {
        ok: true,
        state: sharedState,
        analysis: analyzeDemand(sharedState),
        optimization: calculateOptimalDiscount(sharedState)
      });
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON body' });
    }
    return true;
  }

  if (pathname === '/api/claim' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const coupon = generateCoupon(sharedState, body);
      broadcastState('coupon-claimed');
      sendJson(res, 200, { ok: true, coupon, state: sharedState });
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid claim request' });
    }
    return true;
  }

  if (pathname === '/api/redeem' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const result = redeemCoupon(sharedState, body.code);
      if (result.ok) broadcastState('coupon-redeemed');
      sendJson(res, result.ok ? 200 : 400, result);
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid redeem request' });
    }
    return true;
  }

  if (pathname === '/api/reset' && req.method === 'POST') {
    sharedState = createInitialState();
    broadcastState('state-reset');
    sendJson(res, 200, { ok: true, state: sharedState });
    return true;
  }

  if (pathname === '/api/ai' && req.method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      configured: Boolean(getApiKey()),
      provider: 'PeakAI'
    });
    return true;
  }

  if (pathname === '/api/ai' && req.method === 'POST') {
    let body = {};
    try {
      body = await readJsonBody(req);
      const mode = body.mode || 'suggest';
      const targetState = body.state || sharedState;

      if (mode === 'metrics') {
        sendJson(res, 200, {
          ok: true,
          metrics: computeDetailedMetrics(targetState)
        });
        return true;
      }
      if (mode === 'guide') {
        const result = await askBusinessGuide(body.question, targetState);
        sendJson(res, 200, result);
        return true;
      }
      if (mode === 'mobile-pick') {
        const result = await askMobileConcierge(body);
        sendJson(res, 200, result);
        return true;
      }
      const result = await generateDashboardSuggestion(targetState);
      sendJson(res, 200, result);
      return true;
    } catch (error) {
      const metrics = computeDetailedMetrics(body.state || sharedState);
      sendJson(res, 200, {
        ok: true,
        source: 'engine-fallback',
        warning: error.message,
        recommendedDiscount: metrics.opt.recommended,
        confidence: 'High',
        headline: `${metrics.demand.available} empty tables · ${metrics.opt.recommended}% margin-safe offer`,
        summary: `With ${metrics.demand.occupied}/30 tables occupied, a ${metrics.opt.recommended}% offer keeps unit profit at ${metrics.unit.unitProfit.toFixed(
          2
        )} AZN and projects +${
          metrics.forecast.projectedExtraGuests
        } extra guests (+${metrics.forecast.incrementalProfit.toFixed(2)} AZN).`,
        actionGuide: [
          `Apply ${metrics.opt.recommended}% dynamic discount to capture evening commuters.`,
          `Activate 4 pastry rescue bundles at 6.00 AZN before 19:00 (+${metrics.forecast.rescueRecoveredRevenue.toFixed(
            2
          )} AZN net).`,
          'Verify single-use QR codes at arrival; offers auto-pause at 30/30 tables.'
        ],
        bundleTip: `Clear 4 expiring pastry bundles at 50% off to recover ${metrics.forecast.rescueRecoveredRevenue.toFixed(
          2
        )} AZN.`,
        metrics
      });
      return true;
    }
  }

  return false;
}

function createStaticServer(rootDir) {
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname.startsWith('/api/')) {
      const handled = await handleApi(req, res, pathname);
      if (handled) return;
    }

    const relativePath = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

function startServers({ mode = 'both' } = {}) {
  const dashboardDir = path.join(__dirname, 'dashboard', 'dist');
  const mobileDir = path.join(__dirname, 'mobile', 'dist');

  if (mode === 'both' || mode === 'dashboard') {
    const dashboardServer = createStaticServer(dashboardDir);
    dashboardServer.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.log('Business dashboard already running on http://localhost:3000');
      } else {
        console.error('Dashboard server error:', err);
      }
    });
    dashboardServer.listen(3000, () => {
      console.log('Business dashboard: http://localhost:3000');
    });
  }

  if (mode === 'both' || mode === 'mobile') {
    const mobileServer = createStaticServer(mobileDir);
    mobileServer.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.log('Mobile customer app already running on http://localhost:3001');
      } else {
        console.error('Mobile server error:', err);
      }
    });
    mobileServer.listen(3001, () => {
      console.log('Mobile customer app: http://localhost:3001');
    });
  }
}

if (require.main === module) {
  const arg = process.argv[2] || 'both';
  startServers({ mode: arg });
}

module.exports = { startServers, createStaticServer };
