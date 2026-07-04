/**
 * data/mock/systems/systems.js
 *
 * All vessel sub-system (component) definitions.
 * Each entry provides: id, vesselId, name, status, healthScore,
 * daysToFailure, confidence, issue, recommendation, trend[],
 * alerts[], keyIndicators[], prediction.
 *
 * MIGRATION NOTE: Replace this entire file with calls to
 *   GET /api/vessels/:vesselId/systems
 *   GET /api/systems/:systemId
 * The shapes returned must match the System typedef in src/types/index.js.
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a descending health-trend from `start` over 10 weeks.
 * @param {number} start  Starting health score (~last-month value)
 * @param {number} end    Ending health score (~current value)
 */
function trend(start, end) {
  const steps = 10;
  return Array.from({ length: steps }, (_, i) => {
    const week = new Date(2026, 1, 6 + i * 7); // Feb 06 + i*7
    const label = week.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const value = Math.round(start + ((end - start) / (steps - 1)) * i);
    return { label, value };
  });
}

function alerts(total, lastDate, trendDir, trendPct, sparkline) {
  return { totalAlerts: total, lastAlert: lastDate, trendDirection: trendDir, trendValue: trendPct, sparkline };
}

function ki(icon, label, direction, pct, colorClass) {
  return { icon, label, direction, pct, colorClass };
}

function prediction(days, confidence, accuracy, risk, recommendation, suggestedAction) {
  return { estimatedDays: days, confidence, accuracyEstimate: accuracy, risk, recommendation, suggestedAction };
}

// ─── Vessel A  (MV Coastal Star) ────────────────────────────────────────────

export const VA_ENGINE = {
  id: 'va-engine', vesselId: 'va', name: 'Engine System',
  status: 'critical', healthScore: 30, daysToFailure: 7, confidence: 85,
  issue: 'Overheating',
  recommendation: 'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
  trend: trend(88, 30),
  alerts: alerts(12, '5 Apr 2026', 'up', '22%', [3, 5, 2, 7, 4, 6, 8, 5, 9, 12]),
  keyIndicators: [
    ki('🔥', 'Temperature Spike', 'up', '22%', 'ki-fire'),
    ki('〜', 'Vibration Anomaly', 'up', '7%', 'ki-vibe'),
    ki('◬', 'Pressure Fluctuation', 'up', '8%', 'ki-pres'),
  ],
  prediction: prediction(7, 85, 80, 'Critical',
    'High risk of failure detected.',
    'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.'),
};

export const VA_COOLING = {
  id: 'va-cooling', vesselId: 'va', name: 'Cooling System',
  status: 'warning', healthScore: 55, daysToFailure: 18, confidence: 74,
  issue: 'Coolant Pressure Low',
  recommendation: 'Inspect header tank and coolant lines for leaks. Top up with approved antifreeze mix before next voyage.',
  trend: trend(82, 55),
  alerts: alerts(5, '3 Apr 2026', 'up', '10%', [1, 2, 1, 3, 2, 3, 4, 3, 4, 5]),
  keyIndicators: [
    ki('💧', 'Coolant Pressure', 'down', '12%', 'ki-pres'),
    ki('🌡️', 'Temp Delta', 'up', '4%', 'ki-fire'),
    ki('〜', 'Flow Rate', 'down', '8%', 'ki-vibe'),
  ],
  prediction: prediction(18, 74, 70, 'Warning',
    'Coolant pressure trending low.',
    'Inspect header tank and coolant lines for leaks. Top up with approved antifreeze mix before next voyage.'),
};

export const VA_ELECTRICAL = {
  id: 'va-electrical', vesselId: 'va', name: 'Electrical System',
  status: 'healthy', healthScore: 82, daysToFailure: 90, confidence: 60,
  issue: null,
  recommendation: 'No immediate action required. Continue scheduled inspections.',
  trend: trend(88, 82),
  alerts: alerts(1, '20 Mar 2026', 'stable', '0%', [0, 0, 1, 0, 0, 0, 1, 0, 0, 1]),
  keyIndicators: [
    ki('⚡', 'Voltage Stability', 'up', '1%', 'ki-fire'),
    ki('🔋', 'Battery Health', 'up', '2%', 'ki-vibe'),
    ki('◬', 'Load Balance', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(90, 60, 55, 'Healthy',
    'System operating normally.',
    'No immediate action required. Continue scheduled inspections.'),
};

export const VA_FUEL = {
  id: 'va-fuel', vesselId: 'va', name: 'Fuel System',
  status: 'informational', healthScore: 72, daysToFailure: 45, confidence: 66,
  issue: 'Fuel Filter Saturation',
  recommendation: 'Replace primary fuel filters at next port stop. Secondary filters within 45 days.',
  trend: trend(85, 72),
  alerts: alerts(3, '28 Mar 2026', 'up', '5%', [0, 1, 0, 1, 1, 1, 2, 2, 2, 3]),
  keyIndicators: [
    ki('⛽', 'Filter Saturation', 'up', '5%', 'ki-fire'),
    ki('◬', 'Fuel Pressure', 'down', '2%', 'ki-pres'),
    ki('〜', 'Injector Spray', 'stable', '1%', 'ki-vibe'),
  ],
  prediction: prediction(45, 66, 60, 'Informational',
    'Fuel filter reaching end of life.',
    'Replace primary fuel filters at next port stop.'),
};

export const VA_NAVIGATION = {
  id: 'va-navigation', vesselId: 'va', name: 'Navigation Suite',
  status: 'healthy', healthScore: 94, daysToFailure: 180, confidence: 52,
  issue: null,
  recommendation: 'All navigation systems nominal. Next calibration due in 180 days.',
  trend: trend(95, 94),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS Accuracy', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar Status', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS Uptime', 'up', '1%', 'ki-fire'),
  ],
  prediction: prediction(180, 52, 50, 'Healthy',
    'Navigation suite fully operational.',
    'All navigation systems nominal. Next calibration due in 180 days.'),
};

// ─── Vessel B  (MV Ocean Prince) ────────────────────────────────────────────

export const VB_ENGINE = {
  id: 'vb-engine', vesselId: 'vb', name: 'Engine System',
  status: 'healthy', healthScore: 78, daysToFailure: 60, confidence: 63,
  issue: null,
  recommendation: 'Engine performing within normal parameters. Schedule routine service in 60 days.',
  trend: trend(85, 78),
  alerts: alerts(2, '1 Apr 2026', 'stable', '0%', [0, 0, 1, 0, 0, 1, 0, 0, 1, 2]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'RPM Stability', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'up', '2%', 'ki-pres'),
  ],
  prediction: prediction(60, 63, 58, 'Healthy',
    'Engine healthy.',
    'Schedule routine service in 60 days.'),
};

export const VB_COOLING = {
  id: 'vb-cooling', vesselId: 'vb', name: 'Cooling System',
  status: 'warning', healthScore: 52, daysToFailure: 18, confidence: 78,
  issue: 'Excessive Vibration – Pump Assembly',
  recommendation: 'Inspect pump bearing alignment and apply lubrication. Monitor vibration levels daily until maintenance is completed.',
  trend: trend(78, 52),
  alerts: alerts(6, '4 Apr 2026', 'up', '15%', [1, 2, 2, 3, 3, 4, 4, 5, 5, 6]),
  keyIndicators: [
    ki('〜', 'Pump Vibration', 'up', '15%', 'ki-vibe'),
    ki('💧', 'Coolant Flow', 'down', '8%', 'ki-pres'),
    ki('🌡️', 'Temp Rise', 'up', '5%', 'ki-fire'),
  ],
  prediction: prediction(18, 78, 72, 'Warning',
    'Pump vibration increasing.',
    'Inspect pump bearing alignment and apply lubrication. Monitor vibration levels daily.'),
};

export const VB_ELECTRICAL = {
  id: 'vb-electrical', vesselId: 'vb', name: 'Electrical System',
  status: 'healthy', healthScore: 80, daysToFailure: 75, confidence: 62,
  issue: null,
  recommendation: 'Electrical systems nominal. Routine check in 75 days.',
  trend: trend(84, 80),
  alerts: alerts(1, '22 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Batteries', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Switchboard', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(75, 62, 58, 'Healthy', 'Electrical healthy.', 'Routine check in 75 days.'),
};

export const VB_FUEL = {
  id: 'vb-fuel', vesselId: 'vb', name: 'Fuel System',
  status: 'healthy', healthScore: 85, daysToFailure: 80, confidence: 60,
  issue: null,
  recommendation: 'Fuel system nominal. Scheduled filter change in 30 days.',
  trend: trend(88, 85),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow Rate', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(80, 60, 55, 'Healthy', 'Fuel system nominal.', 'Filter change in 30 days.'),
};

export const VB_NAVIGATION = {
  id: 'vb-navigation', vesselId: 'vb', name: 'Navigation Suite',
  status: 'healthy', healthScore: 92, daysToFailure: 150, confidence: 55,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(93, 92),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(150, 55, 50, 'Healthy', 'Navigation suite OK.', 'Next calibration in 150 days.'),
};

// ─── Vessel C  (MV Northern Light) ──────────────────────────────────────────

export const VC_ENGINE = {
  id: 'vc-engine', vesselId: 'vc', name: 'Engine System',
  status: 'healthy', healthScore: 76, daysToFailure: 55, confidence: 65,
  issue: null,
  recommendation: 'Engine normal. Routine service due in 55 days.',
  trend: trend(82, 76),
  alerts: alerts(2, '30 Mar 2026', 'stable', '1%', [0, 0, 0, 1, 0, 0, 1, 0, 1, 2]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'RPM', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'stable', '1%', 'ki-pres'),
  ],
  prediction: prediction(55, 65, 60, 'Healthy', 'Engine healthy.', 'Routine service in 55 days.'),
};

export const VC_COOLING = {
  id: 'vc-cooling', vesselId: 'vc', name: 'Cooling System',
  status: 'healthy', healthScore: 80, daysToFailure: 70, confidence: 62,
  issue: null,
  recommendation: 'Cooling system nominal.',
  trend: trend(84, 80),
  alerts: alerts(1, '25 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 1, 0, 1]),
  keyIndicators: [
    ki('💧', 'Coolant Level', 'stable', '0%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(70, 62, 58, 'Healthy', 'Cooling nominal.', 'No immediate action.'),
};

export const VC_ELECTRICAL = {
  id: 'vc-electrical', vesselId: 'vc', name: 'Electrical System',
  status: 'warning', healthScore: 61, daysToFailure: 25, confidence: 72,
  issue: 'Voltage Drop',
  recommendation: 'Inspect voltage regulator and generator output. Check shore-power connectors for corrosion and replace if necessary.',
  trend: trend(80, 61),
  alerts: alerts(4, '4 Apr 2026', 'up', '12%', [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]),
  keyIndicators: [
    ki('⚡', 'Voltage Drop', 'down', '12%', 'ki-fire'),
    ki('🔋', 'Battery Drain', 'up', '8%', 'ki-vibe'),
    ki('◬', 'Generator Load', 'up', '5%', 'ki-pres'),
  ],
  prediction: prediction(25, 72, 68, 'Warning',
    'Voltage drop trending.',
    'Inspect voltage regulator and generator output. Check connectors for corrosion.'),
};

export const VC_FUEL = {
  id: 'vc-fuel', vesselId: 'vc', name: 'Fuel System',
  status: 'healthy', healthScore: 83, daysToFailure: 90, confidence: 58,
  issue: null,
  recommendation: 'Fuel system operating normally.',
  trend: trend(86, 83),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(90, 58, 54, 'Healthy', 'Fuel system normal.', 'No immediate action.'),
};

export const VC_NAVIGATION = {
  id: 'vc-navigation', vesselId: 'vc', name: 'Navigation Suite',
  status: 'healthy', healthScore: 91, daysToFailure: 120, confidence: 55,
  issue: null,
  recommendation: 'All navigation systems nominal. Next calibration due in 120 days.',
  trend: trend(92, 91),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(120, 55, 50, 'Healthy', 'Navigation OK.', 'Calibration in 120 days.'),
};

// ─── Vessel D  (MV Atlantic Dawn) ───────────────────────────────────────────

export const VD_ENGINE = {
  id: 'vd-engine', vesselId: 'vd', name: 'Engine System',
  status: 'healthy', healthScore: 81, daysToFailure: 75, confidence: 64,
  issue: null,
  recommendation: 'Engine healthy. Next service in 75 days.',
  trend: trend(86, 81),
  alerts: alerts(1, '29 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 0, 1, 0, 0, 0, 1]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'RPM', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(75, 64, 60, 'Healthy', 'Engine healthy.', 'Service in 75 days.'),
};

export const VD_COOLING = {
  id: 'vd-cooling', vesselId: 'vd', name: 'Cooling Circuit',
  status: 'informational', healthScore: 74, daysToFailure: 42, confidence: 65,
  issue: 'Flow Inefficiency',
  recommendation: 'Replace circulation pump impeller during next scheduled dry dock. Continue monitoring coolant flow rate.',
  trend: trend(84, 74),
  alerts: alerts(2, '2 Apr 2026', 'up', '4%', [0, 0, 0, 1, 1, 1, 1, 1, 2, 2]),
  keyIndicators: [
    ki('💧', 'Flow Rate', 'down', '4%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'Impeller', 'down', '3%', 'ki-vibe'),
  ],
  prediction: prediction(42, 65, 60, 'Informational',
    'Cooling flow slightly reduced.',
    'Replace circulation pump impeller at next dry dock.'),
};

export const VD_ELECTRICAL = {
  id: 'vd-electrical', vesselId: 'vd', name: 'Electrical System',
  status: 'healthy', healthScore: 86, daysToFailure: 100, confidence: 60,
  issue: null,
  recommendation: 'Electrical systems normal.',
  trend: trend(88, 86),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(100, 60, 55, 'Healthy', 'Electrical normal.', 'Routine check in 100 days.'),
};

export const VD_FUEL = {
  id: 'vd-fuel', vesselId: 'vd', name: 'Fuel System',
  status: 'healthy', healthScore: 88, daysToFailure: 100, confidence: 62,
  issue: null,
  recommendation: 'Fuel system nominal. Scheduled filter replacement in 30 days.',
  trend: trend(90, 88),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(100, 62, 57, 'Healthy', 'Fuel normal.', 'Filter change in 30 days.'),
};

export const VD_NAVIGATION = {
  id: 'vd-navigation', vesselId: 'vd', name: 'Navigation Suite',
  status: 'healthy', healthScore: 90, daysToFailure: 130, confidence: 54,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(91, 90),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(130, 54, 50, 'Healthy', 'Navigation OK.', 'Calibration in 130 days.'),
};

// ─── Vessel E  (MV Pacific Explorer) ────────────────────────────────────────

export const VE_ENGINE = {
  id: 've-engine', vesselId: 've', name: 'Engine System',
  status: 'critical', healthScore: 28, daysToFailure: 5, confidence: 91,
  issue: 'Lubrication Failure',
  recommendation: 'Immediate lubrication system overhaul required. Oil pressure critically low — do not operate at full load.',
  trend: trend(85, 28),
  alerts: alerts(14, '5 Apr 2026', 'up', '30%', [2, 3, 4, 5, 6, 7, 8, 10, 12, 14]),
  keyIndicators: [
    ki('🔥', 'Oil Temp', 'up', '30%', 'ki-fire'),
    ki('◬', 'Oil Pressure', 'down', '25%', 'ki-pres'),
    ki('〜', 'Vibration', 'up', '18%', 'ki-vibe'),
  ],
  prediction: prediction(5, 91, 88, 'Critical',
    'Lubrication critical — imminent failure.',
    'Immediate lubrication system overhaul required. Oil pressure critically low.'),
};

export const VE_COOLING = {
  id: 've-cooling', vesselId: 've', name: 'Cooling System',
  status: 'warning', healthScore: 48, daysToFailure: 14, confidence: 80,
  issue: 'Bearing Wear – Drive Shaft',
  recommendation: 'Replace intermediate shaft bearing at next port stop. Avoid speeds above 12 knots until replacement.',
  trend: trend(72, 48),
  alerts: alerts(7, '4 Apr 2026', 'up', '18%', [1, 2, 2, 3, 4, 4, 5, 6, 6, 7]),
  keyIndicators: [
    ki('〜', 'Bearing Vibration', 'up', '18%', 'ki-vibe'),
    ki('🌡️', 'Shaft Temp', 'up', '9%', 'ki-fire'),
    ki('💧', 'Coolant Flow', 'down', '6%', 'ki-pres'),
  ],
  prediction: prediction(14, 80, 75, 'Warning',
    'Shaft bearing wear accelerating.',
    'Replace intermediate shaft bearing at next port stop. Avoid speeds > 12 knots.'),
};

export const VE_ELECTRICAL = {
  id: 've-electrical', vesselId: 've', name: 'Electrical System',
  status: 'healthy', healthScore: 75, daysToFailure: 65, confidence: 60,
  issue: null,
  recommendation: 'Electrical systems normal.',
  trend: trend(80, 75),
  alerts: alerts(2, '28 Mar 2026', 'stable', '0%', [0, 0, 0, 1, 0, 0, 1, 0, 1, 2]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(65, 60, 55, 'Healthy', 'Electrical normal.', 'Routine check in 65 days.'),
};

export const VE_FUEL = {
  id: 've-fuel', vesselId: 've', name: 'Fuel System',
  status: 'healthy', healthScore: 79, daysToFailure: 70, confidence: 62,
  issue: null,
  recommendation: 'Fuel system normal.',
  trend: trend(83, 79),
  alerts: alerts(1, '25 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 1, 0, 1]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(70, 62, 57, 'Healthy', 'Fuel normal.', 'Filter change scheduled.'),
};

export const VE_NAVIGATION = {
  id: 've-navigation', vesselId: 've', name: 'Navigation Suite',
  status: 'healthy', healthScore: 88, daysToFailure: 110, confidence: 56,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(89, 88),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(110, 56, 52, 'Healthy', 'Navigation OK.', 'Next calibration in 110 days.'),
};

// ─── Vessel F  (MV Island Trader) ───────────────────────────────────────────

export const VF_ENGINE = {
  id: 'vf-engine', vesselId: 'vf', name: 'Engine System',
  status: 'healthy', healthScore: 80, daysToFailure: 75, confidence: 62,
  issue: null,
  recommendation: 'Engine in good condition. Maintain current maintenance schedule.',
  trend: trend(85, 80),
  alerts: alerts(2, '31 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 1, 0, 0, 1, 1, 2]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'RPM', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(75, 62, 58, 'Healthy', 'Engine in good condition.', 'Maintain current schedule.'),
};

export const VF_COOLING = {
  id: 'vf-cooling', vesselId: 'vf', name: 'Cooling System',
  status: 'warning', healthScore: 58, daysToFailure: 22, confidence: 76,
  issue: 'Heat Exchanger Fouling',
  recommendation: 'Clean heat exchanger at next scheduled port stop. Efficiency at 68% of rated capacity.',
  trend: trend(80, 58),
  alerts: alerts(5, '4 Apr 2026', 'up', '14%', [0, 1, 1, 2, 2, 3, 3, 4, 4, 5]),
  keyIndicators: [
    ki('🌡️', 'Exchanger Efficiency', 'down', '14%', 'ki-fire'),
    ki('💧', 'Fouling Index', 'up', '10%', 'ki-pres'),
    ki('〜', 'Flow Resistance', 'up', '8%', 'ki-vibe'),
  ],
  prediction: prediction(22, 76, 70, 'Warning',
    'Heat exchanger fouling.',
    'Clean heat exchanger at next port stop. Efficiency at 68%.'),
};

export const VF_ELECTRICAL = {
  id: 'vf-electrical', vesselId: 'vf', name: 'Electrical System',
  status: 'healthy', healthScore: 83, daysToFailure: 90, confidence: 60,
  issue: null,
  recommendation: 'Electrical systems nominal.',
  trend: trend(86, 83),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(90, 60, 55, 'Healthy', 'Electrical normal.', 'Routine check in 90 days.'),
};

export const VF_FUEL = {
  id: 'vf-fuel', vesselId: 'vf', name: 'Fuel System',
  status: 'healthy', healthScore: 86, daysToFailure: 95, confidence: 61,
  issue: null,
  recommendation: 'Fuel system nominal.',
  trend: trend(88, 86),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(95, 61, 56, 'Healthy', 'Fuel nominal.', 'Filter change in 30 days.'),
};

export const VF_NAVIGATION = {
  id: 'vf-navigation', vesselId: 'vf', name: 'Navigation Suite',
  status: 'healthy', healthScore: 90, daysToFailure: 140, confidence: 55,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(91, 90),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(140, 55, 50, 'Healthy', 'Navigation OK.', 'Calibration in 140 days.'),
};

// ─── Vessel G  (MV Coral Spirit) ────────────────────────────────────────────

export const VG_ENGINE = {
  id: 'vg-engine', vesselId: 'vg', name: 'Engine System',
  status: 'healthy', healthScore: 90, daysToFailure: 100, confidence: 64,
  issue: null,
  recommendation: 'Engine excellent. Next service in 100 days.',
  trend: trend(92, 90),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'RPM', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(100, 64, 60, 'Healthy', 'Engine excellent.', 'Service in 100 days.'),
};

export const VG_COOLING = {
  id: 'vg-cooling', vesselId: 'vg', name: 'Cooling System',
  status: 'healthy', healthScore: 88, daysToFailure: 110, confidence: 62,
  issue: null,
  recommendation: 'Cooling system optimal.',
  trend: trend(90, 88),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('💧', 'Coolant Level', 'stable', '0%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(110, 62, 58, 'Healthy', 'Cooling optimal.', 'No action required.'),
};

export const VG_ELECTRICAL = {
  id: 'vg-electrical', vesselId: 'vg', name: 'Electrical System',
  status: 'healthy', healthScore: 85, daysToFailure: 110, confidence: 55,
  issue: null,
  recommendation: 'All electrical systems nominal.',
  trend: trend(87, 85),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(110, 55, 50, 'Healthy', 'Electrical nominal.', 'No action.'),
};

export const VG_FUEL = {
  id: 'vg-fuel', vesselId: 'vg', name: 'Fuel System',
  status: 'healthy', healthScore: 91, daysToFailure: 120, confidence: 60,
  issue: null,
  recommendation: 'Fuel system optimal.',
  trend: trend(92, 91),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(120, 60, 55, 'Healthy', 'Fuel optimal.', 'No action.'),
};

export const VG_NAVIGATION = {
  id: 'vg-navigation', vesselId: 'vg', name: 'Navigation Suite',
  status: 'healthy', healthScore: 89, daysToFailure: 90, confidence: 58,
  issue: null,
  recommendation: 'Propulsion system fully operational. Next service in 90 days.',
  trend: trend(90, 89),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(90, 58, 54, 'Healthy', 'Navigation excellent.', 'Service in 90 days.'),
};

// ─── Vessel H  (MV Pacific Dawn) ────────────────────────────────────────────

export const VH_ENGINE = {
  id: 'vh-engine', vesselId: 'vh', name: 'Engine System',
  status: 'warning', healthScore: 59, daysToFailure: 20, confidence: 73,
  issue: 'Exhaust Temperature High',
  recommendation: 'Inspect turbocharger and fuel injectors. Exhaust temperatures elevated by 12% above baseline.',
  trend: trend(80, 59),
  alerts: alerts(5, '4 Apr 2026', 'up', '13%', [0, 1, 1, 2, 2, 3, 3, 4, 4, 5]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'up', '12%', 'ki-fire'),
    ki('〜', 'Turbo RPM', 'down', '6%', 'ki-vibe'),
    ki('◬', 'Back Pressure', 'up', '8%', 'ki-pres'),
  ],
  prediction: prediction(20, 73, 68, 'Warning',
    'Exhaust temp elevated.',
    'Inspect turbocharger and fuel injectors. Exhaust temperatures elevated by 12%.'),
};

export const VH_COOLING = {
  id: 'vh-cooling', vesselId: 'vh', name: 'Cooling System',
  status: 'healthy', healthScore: 78, daysToFailure: 65, confidence: 62,
  issue: null,
  recommendation: 'Cooling normal.',
  trend: trend(82, 78),
  alerts: alerts(1, '28 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  keyIndicators: [
    ki('💧', 'Coolant Level', 'stable', '0%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(65, 62, 58, 'Healthy', 'Cooling normal.', 'No action.'),
};

export const VH_ELECTRICAL = {
  id: 'vh-electrical', vesselId: 'vh', name: 'Electrical System',
  status: 'healthy', healthScore: 82, daysToFailure: 85, confidence: 60,
  issue: null,
  recommendation: 'Electrical systems nominal.',
  trend: trend(85, 82),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(85, 60, 55, 'Healthy', 'Electrical normal.', 'No action.'),
};

export const VH_FUEL = {
  id: 'vh-fuel', vesselId: 'vh', name: 'Fuel System',
  status: 'healthy', healthScore: 83, daysToFailure: 85, confidence: 61,
  issue: null,
  recommendation: 'Fuel system nominal. Scheduled filter change in 30 days.',
  trend: trend(86, 83),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(85, 61, 56, 'Healthy', 'Fuel nominal.', 'Filter change in 30 days.'),
};

export const VH_NAVIGATION = {
  id: 'vh-navigation', vesselId: 'vh', name: 'Navigation Suite',
  status: 'healthy', healthScore: 87, daysToFailure: 100, confidence: 57,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(88, 87),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(100, 57, 52, 'Healthy', 'Navigation OK.', 'Calibration in 100 days.'),
};

// ─── Vessel I  (MV Aegean Star) ─────────────────────────────────────────────

export const VI_ENGINE = {
  id: 'vi-engine', vesselId: 'vi', name: 'Engine System',
  status: 'healthy', healthScore: 93, daysToFailure: 120, confidence: 66,
  issue: null,
  recommendation: 'Engine in excellent condition.',
  trend: trend(94, 93),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'RPM', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Oil Pressure', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(120, 66, 62, 'Healthy', 'Engine excellent.', 'Service in 120 days.'),
};

export const VI_COOLING = {
  id: 'vi-cooling', vesselId: 'vi', name: 'Cooling System',
  status: 'healthy', healthScore: 90, daysToFailure: 130, confidence: 63,
  issue: null,
  recommendation: 'Cooling system optimal.',
  trend: trend(91, 90),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('💧', 'Coolant Level', 'stable', '0%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '0%', 'ki-fire'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(130, 63, 58, 'Healthy', 'Cooling optimal.', 'No action.'),
};

export const VI_ELECTRICAL = {
  id: 'vi-electrical', vesselId: 'vi', name: 'Electrical System',
  status: 'healthy', healthScore: 91, daysToFailure: 150, confidence: 60,
  issue: null,
  recommendation: 'Electrical systems excellent.',
  trend: trend(92, 91),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(150, 60, 55, 'Healthy', 'Electrical excellent.', 'No action.'),
};

export const VI_FUEL = {
  id: 'vi-fuel', vesselId: 'vi', name: 'Fuel System',
  status: 'healthy', healthScore: 92, daysToFailure: 140, confidence: 62,
  issue: null,
  recommendation: 'Fuel system optimal.',
  trend: trend(93, 92),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(140, 62, 57, 'Healthy', 'Fuel optimal.', 'No action.'),
};

export const VI_NAVIGATION = {
  id: 'vi-navigation', vesselId: 'vi', name: 'Navigation Suite',
  status: 'healthy', healthScore: 95, daysToFailure: 180, confidence: 58,
  issue: null,
  recommendation: 'Navigation suite excellent.',
  trend: trend(96, 95),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(180, 58, 53, 'Healthy', 'Navigation excellent.', 'Calibration in 180 days.'),
};

// ─── Vessel J  (MV Adriatic Wind) ───────────────────────────────────────────

export const VJ_ENGINE = {
  id: 'vj-engine', vesselId: 'vj', name: 'Engine System',
  status: 'warning', healthScore: 54, daysToFailure: 20, confidence: 74,
  issue: 'Injector Fouling',
  recommendation: 'Clean or replace fuel injectors. Fuel consumption elevated by 9%.',
  trend: trend(78, 54),
  alerts: alerts(5, '4 Apr 2026', 'up', '12%', [0, 1, 1, 2, 2, 3, 3, 4, 4, 5]),
  keyIndicators: [
    ki('🔥', 'Exhaust Temp', 'up', '9%', 'ki-fire'),
    ki('〜', 'RPM Stability', 'down', '5%', 'ki-vibe'),
    ki('⛽', 'Fuel Consumption', 'up', '9%', 'ki-pres'),
  ],
  prediction: prediction(20, 74, 70, 'Warning',
    'Injector fouling detected.',
    'Clean or replace fuel injectors. Fuel consumption elevated by 9%.'),
};

export const VJ_COOLING = {
  id: 'vj-cooling', vesselId: 'vj', name: 'Cooling System',
  status: 'healthy', healthScore: 76, daysToFailure: 65, confidence: 62,
  issue: null,
  recommendation: 'Cooling normal.',
  trend: trend(80, 76),
  alerts: alerts(1, '30 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 0, 1, 0, 0, 0, 1]),
  keyIndicators: [
    ki('💧', 'Coolant Level', 'stable', '0%', 'ki-pres'),
    ki('🌡️', 'Temp', 'stable', '1%', 'ki-fire'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(65, 62, 57, 'Healthy', 'Cooling normal.', 'No action.'),
};

export const VJ_ELECTRICAL = {
  id: 'vj-electrical', vesselId: 'vj', name: 'Electrical System',
  status: 'informational', healthScore: 70, daysToFailure: 40, confidence: 66,
  issue: 'Battery Bank Degradation',
  recommendation: 'Battery bank showing capacity reduction of 15%. Schedule replacement at next dry dock.',
  trend: trend(82, 70),
  alerts: alerts(3, '3 Apr 2026', 'up', '6%', [0, 0, 0, 1, 1, 1, 2, 2, 2, 3]),
  keyIndicators: [
    ki('🔋', 'Battery Capacity', 'down', '6%', 'ki-vibe'),
    ki('⚡', 'Voltage Stability', 'down', '3%', 'ki-fire'),
    ki('◬', 'Charge Rate', 'down', '4%', 'ki-pres'),
  ],
  prediction: prediction(40, 66, 62, 'Informational',
    'Battery bank degrading.',
    'Schedule replacement at next dry dock. Capacity at 85%.'),
};

export const VJ_FUEL = {
  id: 'vj-fuel', vesselId: 'vj', name: 'Fuel System',
  status: 'healthy', healthScore: 80, daysToFailure: 80, confidence: 60,
  issue: null,
  recommendation: 'Fuel system nominal.',
  trend: trend(83, 80),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('⛽', 'Fuel Quality', 'stable', '0%', 'ki-fire'),
    ki('◬', 'Pressure', 'stable', '0%', 'ki-pres'),
    ki('〜', 'Flow', 'stable', '0%', 'ki-vibe'),
  ],
  prediction: prediction(80, 60, 55, 'Healthy', 'Fuel nominal.', 'Filter change in 30 days.'),
};

export const VJ_NAVIGATION = {
  id: 'vj-navigation', vesselId: 'vj', name: 'Navigation Suite',
  status: 'healthy', healthScore: 88, daysToFailure: 120, confidence: 56,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(89, 88),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(120, 56, 52, 'Healthy', 'Navigation OK.', 'Calibration in 120 days.'),
};

// ─── Vessel K  (MV Ligurian Sun) ────────────────────────────────────────────

export const VK_ENGINE = {
  id: 'vk-engine', vesselId: 'vk', name: 'Engine System',
  status: 'critical', healthScore: 35, daysToFailure: 6, confidence: 88,
  issue: 'Crankshaft Bearing Failure',
  recommendation: 'Immediate shutdown and inspection recommended. Severe vibration pattern indicates imminent bearing failure.',
  trend: trend(82, 35),
  alerts: alerts(11, '5 Apr 2026', 'up', '28%', [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]),
  keyIndicators: [
    ki('〜', 'Crankshaft Vibration', 'up', '28%', 'ki-vibe'),
    ki('🔥', 'Bearing Temp', 'up', '22%', 'ki-fire'),
    ki('◬', 'Oil Pressure', 'down', '20%', 'ki-pres'),
  ],
  prediction: prediction(6, 88, 85, 'Critical',
    'Imminent bearing failure.',
    'Immediate shutdown and inspection recommended. Severe vibration — imminent bearing failure.'),
};

export const VK_COOLING = {
  id: 'vk-cooling', vesselId: 'vk', name: 'Cooling System',
  status: 'warning', healthScore: 55, daysToFailure: 16, confidence: 76,
  issue: 'Thermostat Malfunction',
  recommendation: 'Replace cooling thermostat. Temperature regulation failing at high load.',
  trend: trend(75, 55),
  alerts: alerts(6, '4 Apr 2026', 'up', '15%', [0, 1, 1, 2, 3, 3, 4, 5, 5, 6]),
  keyIndicators: [
    ki('🌡️', 'Temp Regulation', 'down', '15%', 'ki-fire'),
    ki('💧', 'Coolant Flow', 'down', '8%', 'ki-pres'),
    ki('〜', 'Thermostat Lag', 'up', '10%', 'ki-vibe'),
  ],
  prediction: prediction(16, 76, 72, 'Warning',
    'Thermostat failing.',
    'Replace cooling thermostat. Temperature regulation failing at high load.'),
};

export const VK_ELECTRICAL = {
  id: 'vk-electrical', vesselId: 'vk', name: 'Electrical System',
  status: 'healthy', healthScore: 75, daysToFailure: 60, confidence: 62,
  issue: null,
  recommendation: 'Electrical systems normal.',
  trend: trend(79, 75),
  alerts: alerts(2, '29 Mar 2026', 'stable', '0%', [0, 0, 0, 0, 1, 0, 0, 1, 1, 2]),
  keyIndicators: [
    ki('⚡', 'Voltage', 'stable', '0%', 'ki-fire'),
    ki('🔋', 'Battery', 'stable', '0%', 'ki-vibe'),
    ki('◬', 'Load', 'stable', '0%', 'ki-pres'),
  ],
  prediction: prediction(60, 62, 57, 'Healthy', 'Electrical normal.', 'Routine check in 60 days.'),
};

export const VK_FUEL = {
  id: 'vk-fuel', vesselId: 'vk', name: 'Fuel System',
  status: 'informational', healthScore: 68, daysToFailure: 35, confidence: 65,
  issue: 'Fuel Contamination Risk',
  recommendation: 'Fuel sample analysis recommended. Trace water detected at last bunkering.',
  trend: trend(80, 68),
  alerts: alerts(3, '3 Apr 2026', 'up', '8%', [0, 0, 1, 1, 1, 2, 2, 2, 3, 3]),
  keyIndicators: [
    ki('⛽', 'Water Content', 'up', '8%', 'ki-fire'),
    ki('◬', 'Fuel Clarity', 'down', '5%', 'ki-pres'),
    ki('〜', 'Filter Load', 'up', '7%', 'ki-vibe'),
  ],
  prediction: prediction(35, 65, 60, 'Informational',
    'Fuel contamination risk.',
    'Fuel sample analysis recommended. Trace water detected at last bunkering.'),
};

export const VK_NAVIGATION = {
  id: 'vk-navigation', vesselId: 'vk', name: 'Navigation Suite',
  status: 'healthy', healthScore: 86, daysToFailure: 100, confidence: 57,
  issue: null,
  recommendation: 'Navigation suite fully operational.',
  trend: trend(87, 86),
  alerts: alerts(0, 'N/A', 'stable', '0%', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  keyIndicators: [
    ki('🧭', 'GPS', 'stable', '0%', 'ki-vibe'),
    ki('📡', 'Radar', 'stable', '0%', 'ki-pres'),
    ki('⚡', 'AIS', 'stable', '0%', 'ki-fire'),
  ],
  prediction: prediction(100, 57, 52, 'Healthy', 'Navigation OK.', 'Calibration in 100 days.'),
};

// ─── Master registry ─────────────────────────────────────────────────────────
// MIGRATION NOTE: This map will be replaced by API lookups.
export const ALL_SYSTEMS = {
  // Vessel A
  'va-engine': VA_ENGINE, 'va-cooling': VA_COOLING, 'va-electrical': VA_ELECTRICAL,
  'va-fuel': VA_FUEL, 'va-navigation': VA_NAVIGATION,
  // Vessel B
  'vb-engine': VB_ENGINE, 'vb-cooling': VB_COOLING, 'vb-electrical': VB_ELECTRICAL,
  'vb-fuel': VB_FUEL, 'vb-navigation': VB_NAVIGATION,
  // Vessel C
  'vc-engine': VC_ENGINE, 'vc-cooling': VC_COOLING, 'vc-electrical': VC_ELECTRICAL,
  'vc-fuel': VC_FUEL, 'vc-navigation': VC_NAVIGATION,
  // Vessel D
  'vd-engine': VD_ENGINE, 'vd-cooling': VD_COOLING, 'vd-electrical': VD_ELECTRICAL,
  'vd-fuel': VD_FUEL, 'vd-navigation': VD_NAVIGATION,
  // Vessel E
  've-engine': VE_ENGINE, 've-cooling': VE_COOLING, 've-electrical': VE_ELECTRICAL,
  've-fuel': VE_FUEL, 've-navigation': VE_NAVIGATION,
  // Vessel F
  'vf-engine': VF_ENGINE, 'vf-cooling': VF_COOLING, 'vf-electrical': VF_ELECTRICAL,
  'vf-fuel': VF_FUEL, 'vf-navigation': VF_NAVIGATION,
  // Vessel G
  'vg-engine': VG_ENGINE, 'vg-cooling': VG_COOLING, 'vg-electrical': VG_ELECTRICAL,
  'vg-fuel': VG_FUEL, 'vg-navigation': VG_NAVIGATION,
  // Vessel H
  'vh-engine': VH_ENGINE, 'vh-cooling': VH_COOLING, 'vh-electrical': VH_ELECTRICAL,
  'vh-fuel': VH_FUEL, 'vh-navigation': VH_NAVIGATION,
  // Vessel I
  'vi-engine': VI_ENGINE, 'vi-cooling': VI_COOLING, 'vi-electrical': VI_ELECTRICAL,
  'vi-fuel': VI_FUEL, 'vi-navigation': VI_NAVIGATION,
  // Vessel J
  'vj-engine': VJ_ENGINE, 'vj-cooling': VJ_COOLING, 'vj-electrical': VJ_ELECTRICAL,
  'vj-fuel': VJ_FUEL, 'vj-navigation': VJ_NAVIGATION,
  // Vessel K
  'vk-engine': VK_ENGINE, 'vk-cooling': VK_COOLING, 'vk-electrical': VK_ELECTRICAL,
  'vk-fuel': VK_FUEL, 'vk-navigation': VK_NAVIGATION,
};
