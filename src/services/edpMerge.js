import { tailForVesselId } from '../constants/vesselTailMap';

function trendPointForChart(p, i) {
  const v = Number(p?.value);
  return {
    x: i,
    label: String(p?.label ?? ''),
    value: Number.isFinite(v) ? v : 0,
  };
}

/**
 * Prefer `fleetTimeline` from the API. If missing (older server), merge every
 * `byVessel.*.healthTrend` point, sort by `_t` (epoch ms from server), and re-index —
 * so the chart shows the full CSV chronology instead of a single tail (e.g. only 2 points).
 */
function resolveFleetTimeline(edp) {
  if (Array.isArray(edp.fleetTimeline) && edp.fleetTimeline.length) {
    return edp.fleetTimeline.map((p, i) => trendPointForChart(p, i));
  }
  if (!edp.byVessel || typeof edp.byVessel !== 'object') return null;
  const flat = [];
  for (const vb of Object.values(edp.byVessel)) {
    const ht = vb?.healthTrend;
    if (!Array.isArray(ht)) continue;
    for (const p of ht) {
      if (p && typeof p.value === 'number') flat.push(p);
    }
  }
  if (!flat.length) return null;
  flat.sort((a, b) => {
    const ta = Number(a._t);
    const tb = Number(b._t);
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    if (na !== nb) return na - nb;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
  return flat.map((p, i) => trendPointForChart(p, i));
}

function padSparkline(arr, targetLen) {
  const a = [...(arr || [])];
  while (a.length < targetLen) a.push(0);
  return a.slice(0, targetLen);
}

/**
 * Fleet Alerts Summary row + sparkline for the left column. Always align Total alerts with
 * kpi.activeAlerts (CSV Prediction=1 count). If `fleetAlerts` is missing from an older API,
 * derive last/trend/sparkline from `fleetAlertDetails`.
 */
function resolveFleetAlertsForMerge(edp) {
  const detailsEarly = Array.isArray(edp.fleetAlertDetails) ? edp.fleetAlertDetails : [];
  const kpiTotal = Number(edp.kpi?.activeAlerts);
  const totalAlerts =
    Number.isFinite(kpiTotal) && kpiTotal >= 0 ? kpiTotal : detailsEarly.length;

  const fa = edp.fleetAlerts;
  if (fa && typeof fa === 'object' && Array.isArray(fa.sparkline) && fa.sparkline.length) {
    return {
      ...fa,
      totalAlerts,
      lastAlert: fa.lastAlert != null && fa.lastAlert !== '' ? fa.lastAlert : '—',
      trendDirection: fa.trendDirection || 'stable',
      trendValue: fa.trendValue != null ? String(fa.trendValue) : '0% vs earlier',
      sparkline: padSparkline(fa.sparkline, Math.max(fa.sparkline.length, 12)),
    };
  }

  const details = detailsEarly;
  const n = details.length;
  const lastAlert = n ? String(details[n - 1].dateTime) : '—';
  let trendDirection = 'stable';
  let trendValue = '0% vs earlier';
  if (n >= 2) {
    const half = Math.floor(n / 2);
    const firstCount = details.slice(0, half).length;
    const secondCount = details.slice(half).length;
    const denom = Math.max(1, half);
    const delta = Math.round(((secondCount - firstCount) / denom) * 100);
    trendValue = `${Math.abs(delta)}% vs earlier`;
    trendDirection = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
  }
  const sparks = n ? details.map(() => 100) : [];
  const sparkline = padSparkline(sparks, 24);

  return {
    totalAlerts,
    lastAlert,
    trendDirection,
    trendValue,
    sparkline,
  };
}

/**
 * Merges live fleet CSV API payload into dashboard data from mocks.
 * Fleet-level KPIs and alerts summary follow the API when present.
 * Health trend uses full fleet timeline (all tails, chronological) whenever the API supplies data.
 * Per-vessel alerts / prediction override when `byVessel[tail]` exists.
 */
export function mergeEdpIntoDashboard(base, edp, vesselId) {
  if (!edp || !edp.kpi) return base;

  const tail = tailForVesselId(vesselId);
  const vesselBlock = tail && edp.byVessel ? edp.byVessel[tail] : null;
  const fleetTimeline = resolveFleetTimeline(edp);
  const fleetAlertsResolved = resolveFleetAlertsForMerge(edp);

  const kpi = {
    ...base.kpi,
    overallHealth: edp.kpi.overallHealth,
    activeAlerts: edp.kpi.activeAlerts,
    criticalSystems: edp.kpi.criticalAlerts,
  };

  const warnish = Math.max(0, (edp.kpi.activeAlerts || 0) - (edp.kpi.criticalAlerts || 0));
  const alertsSummary = {
    ...base.alertsSummary,
    totalAlerts: edp.kpi.activeAlerts,
    critical: edp.kpi.criticalAlerts,
    warning: warnish,
    trend: `${edp.kpi.activeAlerts} flagged rows fleet-wide`,
  };

  const csvMeta = edp.meta && typeof edp.meta === 'object' ? edp.meta : undefined;
  const useFleetTrend = Boolean(fleetTimeline?.length);
  const fleetAlertDetails = Array.isArray(edp.fleetAlertDetails) ? edp.fleetAlertDetails : [];

  if (!base.system) {
    return { ...base, kpi, alertsSummary, csvMeta, fleetAlertDetails };
  }

  if (!vesselBlock) {
    if (useFleetTrend) {
      return {
        ...base,
        kpi,
        alertsSummary,
        csvMeta,
        fleetAlertDetails,
        system: {
          ...base.system,
          trend: fleetTimeline,
          alerts: {
            ...base.system.alerts,
            ...fleetAlertsResolved,
          },
        },
      };
    }
    return {
      ...base,
      kpi,
      alertsSummary,
      csvMeta,
      fleetAlertDetails,
      system: {
        ...base.system,
        alerts: {
          ...base.system.alerts,
          ...fleetAlertsResolved,
        },
      },
    };
  }

  const system = {
    ...base.system,
    trend: useFleetTrend ? fleetTimeline : (vesselBlock.healthTrend?.length ? vesselBlock.healthTrend : base.system.trend),
    alerts: {
      ...base.system.alerts,
      ...vesselBlock.alerts,
      ...fleetAlertsResolved,
    },
    prediction: {
      ...base.system.prediction,
      ...vesselBlock.prediction,
    },
  };

  return { ...base, kpi, alertsSummary, csvMeta, fleetAlertDetails, system };
}
