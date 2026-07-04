/**
 * Reads EDP.csv from ./data/EDP.csv and exposes aggregated metrics for the React app.
 * Default port 5000. (SIADEMO mock fleet API is separate — often on 5001.)
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const envPort = parseInt(process.env.PORT, 10);
const PORT = Number.isFinite(envPort) && envPort > 0 ? envPort : 5000;
const CSV_PATH =
  process.env.EDP_CSV_PATH || path.join(__dirname, 'data', 'EDP.csv');

// Component configuration mapping
const COMPONENTS = [
  { id: 'engine-system', name: 'Engine System', fileName: 'EDP.csv' },
  { id: 'cooling-system', name: 'Cooling System', fileName: 'EDP - Copy.csv' },
  { id: 'electrical-system', name: 'Electrical System', fileName: 'EDP - Copy (2).csv' },
];

function normalizeTail(name) {
  if (!name) return '';
  const m = String(name).trim().match(/^tail\s*(\d+)$/i);
  if (m) return `Tail ${m[1]}`;
  return String(name).trim();
}

function parseDate(d) {
  const s = String(d).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
  if (!m) return new Date(0);
  const [, dd, mm, yyyy, hh, min] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = line.split(',');
    const row = {};
    headers.forEach((h, idx) => {
      const key = h || `col${idx}`;
      row[key] = (parts[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function rowHealthValue(row) {
  const pred = Number(row.Prediction || 0);
  const re = Number(String(row['Recons Error'] || '0').replace(/,/g, ''));
  if (Number.isNaN(re)) return pred ? 35 : 88;
  if (pred === 1) return Math.max(15, Math.min(55, Math.round(50 - (re - 2.2) * 12)));
  return Math.max(55, Math.min(100, Math.round(92 - re * 8)));
}

/** CSV "Normalized Values" is treated as 0–1 anomaly/badness; map to health score 0–100 (higher = healthier). */
function normalizedHealthFromRow(row) {
  const raw = String(row['Normalized Values'] ?? '').trim().replace(/,/g, '');
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  const t = Math.max(0, Math.min(1, n));
  return Math.round((1 - t) * 100);
}

function trendHealthValue(row) {
  const fromNorm = normalizedHealthFromRow(row);
  return fromNorm !== null ? fromNorm : rowHealthValue(row);
}

function formatTrendLabel(row) {
  const dt = parseDate(row.DateTime);
  const raw = String(row.DateTime || '').trim();
  if (Number.isNaN(dt.getTime())) return raw.slice(0, 22);
  return dt.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function rowSortMs(row) {
  const ms = parseDate(row.DateTime).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function toAlertDetailRow(r) {
  const tail = normalizeTail(r.FlightName);
  return {
    dateTime: String(r.DateTime || '').trim(),
    tail: tail || '—',
    active: Number(r.Active) === 1,
    rootCause: String(r.RootCause || '').trim() || '—',
    rcComponent: String(r.RCComponent || '').trim() || '—',
    reconsError: String(r['Recons Error'] || '').trim(),
  };
}

/** Fleet-wide Alerts Summary row + sparkline (all CSV rows, same rules as per-tail). */
function buildFleetAlertsSummary(allRows) {
  const sorted = [...allRows]
    .filter((r) => String(r.DateTime || '').trim())
    .sort((a, b) => parseDate(a.DateTime) - parseDate(b.DateTime));
  const alertsHere = sorted.filter((r) => Number(r.Prediction) === 1);
  const lastAlertRow = [...sorted].reverse().find((r) => Number(r.Prediction) === 1);
  const lastAlert = lastAlertRow ? String(lastAlertRow.DateTime).trim() : '—';
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half).filter((r) => Number(r.Prediction) === 1).length;
  const secondHalf = sorted.slice(half).filter((r) => Number(r.Prediction) === 1).length;
  const denom = Math.max(1, half);
  const delta = Math.round(((secondHalf - firstHalf) / denom) * 100);
  const trendValue = `${Math.abs(delta)}% vs earlier`;
  const sparkline = sorted.map((r) => (Number(r.Prediction) === 1 ? 100 : 0));
  return {
    totalAlerts: alertsHere.length,
    lastAlert,
    trendDirection: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
    trendValue,
    sparkline,
  };
}

function buildDashboard(rows) {
  const n = rows.length;
  const predOnes = rows.filter((r) => Number(r.Prediction) === 1);
  const critical = rows.filter(
    (r) => Number(r.Prediction) === 1 && Number(r.Active) === 1,
  );
  const activeAlerts = predOnes.length;
  const criticalAlerts = critical.length;
  const overallHealth =
    n === 0
      ? 0
      : Math.round(rows.reduce((sum, r) => sum + trendHealthValue(r), 0) / n);

  const byTail = {};
  for (const row of rows) {
    const tail = normalizeTail(row.FlightName);
    if (!tail) continue;
    if (!byTail[tail]) byTail[tail] = [];
    byTail[tail].push(row);
  }

  const byVessel = {};
  for (const [tail, list] of Object.entries(byTail)) {
    const sorted = [...list].sort(
      (a, b) => parseDate(a.DateTime) - parseDate(b.DateTime),
    );
    const healthTrend = sorted.map((r, i) => ({
      x: i,
      label: `${formatTrendLabel(r)} · ${tail}`,
      value: trendHealthValue(r),
      _t: rowSortMs(r),
    }));

    const alertsHere = sorted.filter((r) => Number(r.Prediction) === 1);
    const alertDetails = [...alertsHere]
      .sort((a, b) => parseDate(a.DateTime) - parseDate(b.DateTime))
      .map(toAlertDetailRow);
    const lastAlertRow = [...sorted].reverse().find((r) => Number(r.Prediction) === 1);
    const lastAlert = lastAlertRow
      ? String(lastAlertRow.DateTime)
      : '—';
    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half).filter((r) => Number(r.Prediction) === 1).length;
    const secondHalf = sorted.slice(half).filter((r) => Number(r.Prediction) === 1).length;
    const denom = Math.max(1, half);
    const delta = Math.round(((secondHalf - firstHalf) / denom) * 100);
    const trendValue = `${Math.abs(delta)}% vs earlier`;

    const sparkline = sorted.map((r) => (Number(r.Prediction) === 1 ? 100 : 0));

    const latest = sorted[sorted.length - 1] || {};
    const lastPred = Number(latest.Prediction || 0);
    const lastRe = Number(String(latest['Recons Error'] || '0').replace(/,/g, '')) || 0;
    const estimatedDays = lastPred
      ? Math.max(3, Math.min(21, Math.round(14 - (lastRe - 2.2) * 3)))
      : Math.max(25, Math.round(45 - lastRe * 5));
    const confidence = lastPred ? Math.max(62, Math.min(92, Math.round(88 - lastRe * 4))) : 91;
    const risk = lastPred ? 'Critical' : 'Healthy';
    const rc = latest.RootCause || 'Fleet monitoring';
    const comp = latest.RCComponent || 'Component';

    byVessel[tail] = {
      healthTrend,
      alerts: {
        totalAlerts: alertsHere.length,
        lastAlert,
        trendDirection: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
        trendValue,
        sparkline,
        alertDetails,
      },
      prediction: {
        estimatedDays,
        confidence,
        accuracyEstimate: Math.max(70, Math.min(95, confidence - 5)),
        risk,
        recommendation: lastPred
          ? `Alert condition on ${tail}: ${rc} (${comp}). Review thresholds and schedule inspection.`
          : `No active prediction alert for ${tail}. Continue routine monitoring.`,
        suggestedAction: lastPred
          ? 'Review latest readings and plan a maintenance window.'
          : 'Maintain current operating profile.',
      },
    };
  }

  const fleetRows = [...rows]
    .filter((r) => normalizeTail(r.FlightName))
    .sort((a, b) => parseDate(a.DateTime) - parseDate(b.DateTime));
  const fleetTimeline = fleetRows.map((r, i) => {
    const tail = normalizeTail(r.FlightName);
    return {
      x: i,
      label: `${formatTrendLabel(r)} · ${tail}`,
      value: trendHealthValue(r),
      _t: rowSortMs(r),
    };
  });

  const fleetAlertDetails = rows
    .filter((r) => normalizeTail(r.FlightName) && Number(r.Prediction) === 1)
    .sort((a, b) => parseDate(a.DateTime) - parseDate(b.DateTime))
    .map(toAlertDetailRow);

  const fleetAlerts = buildFleetAlertsSummary(rows);

  return {
    kpi: {
      overallHealth,
      activeAlerts,
      criticalAlerts,
    },
    byVessel,
    fleetTimeline,
    fleetAlertDetails,
    fleetAlerts,
    meta: {
      rowCount: n,
      source: path.basename(CSV_PATH),
      dateFrom: fleetRows[0] ? String(fleetRows[0].DateTime).trim() : null,
      dateTo: fleetRows.length ? String(fleetRows[fleetRows.length - 1].DateTime).trim() : null,
    },
  };
}

const app = express();
app.disable('x-powered-by');
app.use(cors());

const ROOT_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Fleet data API</title></head>
<body style="font-family:system-ui;padding:24px;max-width:640px">
  <h1>Fleet data API</h1>
  <p>JSON APIs for the fleet dashboard (CSV-backed metrics).</p>
  <ul>
    <li><a href="/api/health"><code>/api/health</code></a> or <a href="/health"><code>/health</code></a> — health check</li>
    <li><a href="/api/edp/dashboard"><code>/api/edp/dashboard</code></a> — EDP dashboard payload</li>
  </ul>
  <p>Open the UI: <strong>http://localhost:3000/fleet-health</strong> (run <code>npm start</code> in <code>daire_fleet_dashboard</code>).</p>
</body></html>`;

function sendRoot(_req, res) {
  res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(ROOT_HTML);
}

app.get('/', sendRoot);
app.get('/index.html', sendRoot);

function sendHealth(_req, res) {
  res.json({ ok: true, service: 'daire-fleet-csv-api' });
}

/** Top-level alias (plain Express “Cannot GET /health” means a different process is bound to this port). */
app.get('/health', sendHealth);

const api = express.Router();
api.get('/health', sendHealth);

api.get('/edp/dashboard', (_req, res) => {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      return res.status(404).json({
        error: 'EDP.csv not found',
        path: CSV_PATH,
      });
    }
    const text = fs.readFileSync(CSV_PATH, 'utf8');
    const rows = parseCsv(text);
    const payload = buildDashboard(rows);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Component API endpoints
api.get('/components',(_req, res) => {
  res.json(COMPONENTS.map(c => ({ id: c.id, name: c.name })));
});

api.get('/component/:componentId/data', (req, res) => {
  try {
    const { componentId } = req.params;
    const component = COMPONENTS.find(c => c.id === componentId);
    
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    const csvPath = path.join(__dirname, 'data', component.fileName);
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        error: 'Component data file not found',
        path: csvPath,
      });
    }
    
    const text = fs.readFileSync(csvPath, 'utf8');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.use('/api', api);

app.use((req, res) => {
  res.status(404).set('Content-Type', 'text/html; charset=utf-8').send(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>404</title></head><body style="font-family:system-ui;padding:24px">
      <h1>404</h1>
      <p>No route for <code>${req.path}</code></p>
      <p><a href="/">Home</a> · <a href="/api/health">/api/health</a> · <a href="/api/edp/dashboard">/api/edp/dashboard</a></p>
    </body></html>`,
  );
});

const server = app.listen(PORT, () => {
  console.log('');
  console.log('======== Fleet CSV backend ========');
  console.log(`  http://localhost:${PORT}/api/health`);
  console.log(`  http://localhost:${PORT}/api/edp/dashboard`);
  console.log(`  http://localhost:${PORT}/api/components`);
  console.log(`  http://localhost:${PORT}/api/component/engine-system/data`);
  console.log(`  CSV: ${CSV_PATH}`);
  console.log(`  Components: ${COMPONENTS.map(c => c.name).join(', ')}`);
  console.log('============================================');
  console.log('');
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `\n[Fleet CSV backend] Port ${PORT} is already in use. Another process is answering — browsers often show plain "Cannot GET /api/health".\n` +
        `Common cause: another \`node server.js\` or Flask on the same port (check 5000 vs SIADEMO mock on 5001).\n` +
        `Fix: stop that PID (Windows: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F)  OR  set PORT=5002 and match package.json "proxy" + REACT_APP_EDP_API_URL.\n`,
    );
    process.exit(1);
  }
  throw err;
});
