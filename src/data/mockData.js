// ─────────────────────────────────────────────────────────────────────────────
// dAIRE Fleet Management – Centralized Mock Data
// All display values in the application are sourced from this file only.
// ─────────────────────────────────────────────────────────────────────────────

// ── KPI Summary Cards ────────────────────────────────────────────────────────
export const KPI_SUMMARY = {
  healthyAssets: 78,
  healthyAssetsUnit: '%',
  activeAlerts: 18,
  criticalAlerts: 5,
  avgDaysToFailure: 8.2,
};

// ── Health Trend (Engine System – Vessel A) ───────────────────────────────────
export const HEALTH_TREND = [
  { label: 'Feb 06', value: 88 },
  { label: 'Feb 13', value: 82 },
  { label: 'Feb 20', value: 78 },
  { label: 'Feb 27', value: 74 },
  { label: 'Mar 06', value: 68 },
  { label: 'Mar 13', value: 62 },
  { label: 'Mar 20', value: 55 },
  { label: 'Mar 27', value: 46 },
  { label: 'Apr 03', value: 38 },
  { label: 'Apr 05', value: 30 },
];

// ── Alerts Summary ────────────────────────────────────────────────────────────
export const ALERTS_SUMMARY = {
  totalAlerts: 12,
  lastAlert: '12 Mar 2026',
  trendDirection: 'up',
  trendValue: '5%',
  sparkline: [3, 5, 2, 7, 4, 6, 8, 5, 9, 6],
};

// ── Key Indicators ────────────────────────────────────────────────────────────
export const KEY_INDICATORS = [
  { icon: '🔥', label: 'Temperature Spike',    direction: 'up',   pct: '7%',  colorClass: 'ki-fire' },
  { icon: '〜', label: 'Vibration Anomaly',    direction: 'up',   pct: '7%',  colorClass: 'ki-vibe' },
  { icon: '◬', label: 'Pressure Fluctuation', direction: 'up',   pct: '8%',  colorClass: 'ki-pres' },
];

// ── Prediction (for Fleet Health page) ───────────────────────────────────────
export const PREDICTION = {
  estimatedDays: 7,
  confidence: 85,
  accuracyEstimate: 80,
  selectedVessel: 'Vessel A',
  selectedComponent: 'Engine System',
  risk: 'Critical',
  recommendation: 'High risk of failure detected.',
  suggestedAction:
    'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
};

// ── Fleet / Vessel / Component Hierarchy ─────────────────────────────────────
export const FLEETS = [
  {
    id: 'fleet-atlantic',
    name: 'Fleet Atlantic',
    region: 'North Atlantic',
    vessels: [
      {
        id: 'va',
        name: 'MV Coastal Star',
        shortName: 'Vessel A',
        status: 'critical',
        healthScore: 30,
        components: [
          {
            id: 'va-eng',
            name: 'Engine System',
            status: 'critical',
            healthScore: 30,
            daysToFailure: 7,
            confidence: 85,
            issue: 'Overheating',
            recommendation:
              'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
          },
          {
            id: 'va-cool',
            name: 'Cooling System',
            status: 'warning',
            healthScore: 55,
            daysToFailure: 18,
            confidence: 74,
            issue: 'Coolant Pressure Low',
            recommendation:
              'Inspect header tank and coolant lines for leaks. Top up with approved antifreeze mix before next voyage.',
          },
          {
            id: 'va-elec',
            name: 'Electrical',
            status: 'healthy',
            healthScore: 82,
            daysToFailure: 90,
            confidence: 60,
            issue: null,
            recommendation: 'No immediate action required. Continue scheduled inspections.',
          },
        ],
      },
      {
        id: 'vb',
        name: 'MV Ocean Prince',
        shortName: 'Vessel B',
        status: 'warning',
        healthScore: 52,
        components: [
          {
            id: 'vb-pump',
            name: 'Pump Assembly',
            status: 'warning',
            healthScore: 52,
            daysToFailure: 18,
            confidence: 78,
            issue: 'Excessive Vibration',
            recommendation:
              'Inspect pump bearing alignment and apply lubrication. Monitor vibration levels daily until maintenance is completed.',
          },
          {
            id: 'vb-hyd',
            name: 'Hydraulics',
            status: 'healthy',
            healthScore: 79,
            daysToFailure: 60,
            confidence: 65,
            issue: null,
            recommendation: 'System operating within normal parameters. Schedule routine fluid change in 60 days.',
          },
        ],
      },
      {
        id: 'vc',
        name: 'MV Northern Light',
        shortName: 'Vessel C',
        status: 'warning',
        healthScore: 61,
        components: [
          {
            id: 'vc-elec',
            name: 'Electrical System',
            status: 'warning',
            healthScore: 61,
            daysToFailure: 25,
            confidence: 72,
            issue: 'Voltage Drop',
            recommendation:
              'Inspect voltage regulator and generator output. Check shore-power connectors for corrosion and replace if necessary.',
          },
          {
            id: 'vc-nav',
            name: 'Navigation Suite',
            status: 'healthy',
            healthScore: 91,
            daysToFailure: 120,
            confidence: 55,
            issue: null,
            recommendation: 'All navigation systems nominal. Next calibration due in 120 days.',
          },
        ],
      },
      {
        id: 'vd',
        name: 'MV Atlantic Dawn',
        shortName: 'Vessel D',
        status: 'informational',
        healthScore: 74,
        components: [
          {
            id: 'vd-cool',
            name: 'Cooling Circuit',
            status: 'informational',
            healthScore: 74,
            daysToFailure: 42,
            confidence: 65,
            issue: 'Flow Inefficiency',
            recommendation:
              'Replace circulation pump impeller during next scheduled dry dock. Continue monitoring coolant flow rate.',
          },
          {
            id: 'vd-fuel',
            name: 'Fuel System',
            status: 'healthy',
            healthScore: 88,
            daysToFailure: 100,
            confidence: 62,
            issue: null,
            recommendation: 'Fuel system operating normally. Scheduled filter replacement in 30 days.',
          },
        ],
      },
    ],
  },
  {
    id: 'fleet-pacific',
    name: 'Fleet Pacific',
    region: 'South Pacific',
    vessels: [
      {
        id: 've',
        name: 'MV Pacific Explorer',
        shortName: 'Vessel E',
        status: 'critical',
        healthScore: 28,
        components: [
          {
            id: 've-eng',
            name: 'Main Engine',
            status: 'critical',
            healthScore: 28,
            daysToFailure: 5,
            confidence: 91,
            issue: 'Lubrication Failure',
            recommendation:
              'Immediate lubrication system overhaul required. Oil pressure critically low — do not operate at full load.',
          },
          {
            id: 've-shaft',
            name: 'Drive Shaft',
            status: 'warning',
            healthScore: 48,
            daysToFailure: 14,
            confidence: 80,
            issue: 'Bearing Wear',
            recommendation:
              'Replace intermediate shaft bearing at next port stop. Avoid speeds above 12 knots until replacement.',
          },
        ],
      },
      {
        id: 'vf',
        name: 'MV Island Trader',
        shortName: 'Vessel F',
        status: 'warning',
        healthScore: 65,
        components: [
          {
            id: 'vf-eng',
            name: 'Engine',
            status: 'healthy',
            healthScore: 80,
            daysToFailure: 75,
            confidence: 62,
            issue: null,
            recommendation: 'Engine in good condition. Maintain current maintenance schedule.',
          },
          {
            id: 'vf-cool',
            name: 'Cooling System',
            status: 'warning',
            healthScore: 58,
            daysToFailure: 22,
            confidence: 76,
            issue: 'Heat Exchanger Fouling',
            recommendation:
              'Clean heat exchanger at next scheduled port stop. Efficiency at 68% of rated capacity.',
          },
        ],
      },
      {
        id: 'vg',
        name: 'MV Coral Spirit',
        shortName: 'Vessel G',
        status: 'healthy',
        healthScore: 87,
        components: [
          {
            id: 'vg-prop',
            name: 'Propulsion',
            status: 'healthy',
            healthScore: 89,
            daysToFailure: 90,
            confidence: 58,
            issue: null,
            recommendation: 'Propulsion system fully operational. Next service in 90 days.',
          },
          {
            id: 'vg-elec',
            name: 'Electrical',
            status: 'healthy',
            healthScore: 85,
            daysToFailure: 110,
            confidence: 55,
            issue: null,
            recommendation: 'All electrical systems nominal.',
          },
        ],
      },
      {
        id: 'vh',
        name: 'MV Pacific Dawn',
        shortName: 'Vessel H',
        status: 'warning',
        healthScore: 59,
        components: [
          {
            id: 'vh-eng',
            name: 'Engine',
            status: 'warning',
            healthScore: 59,
            daysToFailure: 20,
            confidence: 73,
            issue: 'Exhaust Temperature High',
            recommendation:
              'Inspect turbocharger and fuel injectors. Exhaust temperatures elevated by 12% above baseline.',
          },
          {
            id: 'vh-fuel',
            name: 'Fuel System',
            status: 'healthy',
            healthScore: 83,
            daysToFailure: 85,
            confidence: 61,
            issue: null,
            recommendation: 'Fuel system nominal. Scheduled filter change in 30 days.',
          },
        ],
      },
    ],
  },
];

// ── Corrective Actions (Maintenance Page) ─────────────────────────────────────
export const CORRECTIVE_ACTIONS = [
  {
    vessel: 'MV Coastal Star',
    shortName: 'Vessel A',
    component: 'Engine System',
    issue: 'Overheating',
    severity: 'critical',
    priority: 'Critical',
    daysToFailure: 7,
    confidence: 85,
    recommendedAction: 'Inspect and flush cooling system',
    recommendation:
      'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
    healthScore: 30,
  },
  {
    vessel: 'MV Pacific Explorer',
    shortName: 'Vessel E',
    component: 'Main Engine',
    issue: 'Lubrication Failure',
    severity: 'critical',
    priority: 'Critical',
    daysToFailure: 5,
    confidence: 91,
    recommendedAction: 'Immediate lubrication system overhaul',
    recommendation:
      'Immediate lubrication system overhaul required. Oil pressure critically low — do not operate at full load.',
    healthScore: 28,
  },
  {
    vessel: 'MV Ocean Prince',
    shortName: 'Vessel B',
    component: 'Pump Assembly',
    issue: 'Excessive Vibration',
    severity: 'warning',
    priority: 'Warning',
    daysToFailure: 18,
    confidence: 78,
    recommendedAction: 'Check bearing alignment & lubrication',
    recommendation:
      'Inspect pump bearing alignment and apply lubrication. Monitor vibration levels daily until maintenance is completed.',
    healthScore: 52,
  },
  {
    vessel: 'MV Pacific Explorer',
    shortName: 'Vessel E',
    component: 'Drive Shaft',
    issue: 'Bearing Wear',
    severity: 'warning',
    priority: 'Warning',
    daysToFailure: 14,
    confidence: 80,
    recommendedAction: 'Replace intermediate shaft bearing',
    recommendation:
      'Replace intermediate shaft bearing at next port stop. Avoid speeds above 12 knots until replacement.',
    healthScore: 48,
  },
  {
    vessel: 'MV Northern Light',
    shortName: 'Vessel C',
    component: 'Electrical System',
    issue: 'Voltage Drop',
    severity: 'warning',
    priority: 'Warning',
    daysToFailure: 25,
    confidence: 72,
    recommendedAction: 'Inspect and replace voltage regulator',
    recommendation:
      'Inspect voltage regulator and generator output. Check shore-power connectors for corrosion.',
    healthScore: 61,
  },
  {
    vessel: 'MV Island Trader',
    shortName: 'Vessel F',
    component: 'Cooling System',
    issue: 'Heat Exchanger Fouling',
    severity: 'warning',
    priority: 'Warning',
    daysToFailure: 22,
    confidence: 76,
    recommendedAction: 'Clean heat exchanger at port stop',
    recommendation:
      'Clean heat exchanger at next scheduled port stop. Efficiency at 68% of rated capacity.',
    healthScore: 58,
  },
  {
    vessel: 'MV Pacific Dawn',
    shortName: 'Vessel H',
    component: 'Engine',
    issue: 'Exhaust Temperature High',
    severity: 'warning',
    priority: 'Warning',
    daysToFailure: 20,
    confidence: 73,
    recommendedAction: 'Inspect turbocharger and fuel injectors',
    recommendation:
      'Inspect turbocharger and fuel injectors. Exhaust temperatures elevated by 12% above baseline.',
    healthScore: 59,
  },
  {
    vessel: 'MV Atlantic Dawn',
    shortName: 'Vessel D',
    component: 'Cooling Circuit',
    issue: 'Flow Inefficiency',
    severity: 'informational',
    priority: 'Informational',
    daysToFailure: 42,
    confidence: 65,
    recommendedAction: 'Replace circulation pump impeller at dry dock',
    recommendation:
      'Replace circulation pump impeller during next scheduled dry dock. Continue monitoring coolant flow rate.',
    healthScore: 74,
  },
];

// ── Gantt / Scheduling Planner ────────────────────────────────────────────────
export const SCHEDULE_WEEKS = [
  'Week 1', '11 Apr', '18 Apr', '25 Apr',
  '2 May', '9 May', '16 May', '23 May', '30 May',
];
export const SCHEDULE_SLOTS = 9;

export const SCHEDULE = [
  {
    vessel: 'Vessel A',
    tasks: [
      { label: 'Engine Overhaul', start: 0, duration: 2, color: '#2563eb', type: 'maintenance' },
    ],
  },
  {
    vessel: 'Vessel B',
    tasks: [
      { label: 'Fleet Operations', start: 0, duration: 3, color: '#16a34a', type: 'operation' },
      {
        label: 'Pump Service',
        start: 3,
        duration: 2,
        color: '#2563eb',
        type: 'maintenance',
        popup: true,
        popupDetails: {
          title: 'Pump Assembly Service',
          estimatedDays: 2,
          team: 'Service Team 2',
          conflict: false,
        },
      },
    ],
  },
  {
    vessel: 'Vessel C',
    tasks: [
      { label: 'Electrical Refit', start: 1, duration: 3, color: '#7c3aed', type: 'maintenance' },
      { label: 'Sea Trial', start: 4, duration: 2, color: '#0891b2', type: 'operation' },
    ],
  },
  {
    vessel: 'Vessel D',
    tasks: [
      { label: 'Routine Check', start: 2, duration: 2, color: '#16a34a', type: 'operation' },
      { label: 'Dry Dock', start: 5, duration: 3, color: '#d97706', type: 'drydock' },
    ],
  },
  {
    vessel: 'Vessel E',
    tasks: [
      {
        label: 'URGENT: Engine Overhaul',
        start: 0,
        duration: 3,
        color: '#dc2626',
        type: 'critical',
      },
    ],
  },
  {
    vessel: 'Vessel F',
    tasks: [
      { label: 'Heat Exchanger Clean', start: 2, duration: 2, color: '#2563eb', type: 'maintenance' },
    ],
  },
];

// ── Maintenance Windows ────────────────────────────────────────────────────────
export const MAINTENANCE_WINDOWS = [
  { id: 'w1', label: '8 Apr – 10 Apr 2026',  available: true,  type: 'Scheduled Port Stop',    conflict: false },
  { id: 'w2', label: '15 Apr – 17 Apr 2026', available: true,  type: 'Dry Dock Window',         conflict: false },
  { id: 'w3', label: '22 Apr – 25 Apr 2026', available: false, type: 'Emergency Reserve Slot',  conflict: true  },
  { id: 'w4', label: '2 May – 5 May 2026',   available: true,  type: 'Routine Scheduling Slot', conflict: false },
];

// ── Maintenance Teams ──────────────────────────────────────────────────────────
export const MAINTENANCE_TEAMS = [
  'Service Team 1 – Engine Specialists',
  'Service Team 2 – General Maintenance',
  'Port Authority Technical Crew',
  'OEM Support – Engine Division',
  'Contractor: Maritime Services Ltd.',
  'Onboard Engineering Staff',
];

// ── Priorities ─────────────────────────────────────────────────────────────────
export const PRIORITIES = [
  { label: 'Critical – Immediate action required', value: 'critical', color: '#ef4444' },
  { label: 'High – Within 7 days',                value: 'high',     color: '#f59e0b' },
  { label: 'Medium – Within 30 days',             value: 'medium',   color: '#60a5fa' },
  { label: 'Low – Routine scheduling',             value: 'low',      color: '#22c55e' },
];

// ── Impact Summary (per vessel) ───────────────────────────────────────────────
export const IMPACT_SUMMARY = [
  {
    vessel: 'Vessel A',
    fullName: 'MV Coastal Star',
    action: 'Engine Overhaul – 8 Apr',
    revenueImpact: 'Low',
    revenueImpactClass: 'low',
    operationalDelay: '2 days',
    delayClass: 'warn',
    riskReduction: 'High',
    riskClass: 'high',
    maintenanceDuration: '2 days',
    icon: '🔧',
  },
  {
    vessel: 'Vessel B',
    fullName: 'MV Ocean Prince',
    action: 'Pump Assembly Service – 15 Apr',
    revenueImpact: 'None',
    revenueImpactClass: 'none',
    operationalDelay: 'None',
    delayClass: 'none',
    riskReduction: 'Medium',
    riskClass: 'medium',
    maintenanceDuration: '2 days',
    icon: '⚙',
  },
  {
    vessel: 'Vessel C',
    fullName: 'MV Northern Light',
    action: 'Electrical Refit – 18 Apr',
    revenueImpact: 'Medium',
    revenueImpactClass: 'medium',
    operationalDelay: '3 days',
    delayClass: 'warn',
    riskReduction: 'High',
    riskClass: 'high',
    maintenanceDuration: '3 days',
    icon: '⚡',
  },
  {
    vessel: 'Vessel D',
    fullName: 'MV Atlantic Dawn',
    action: 'Scheduled Preventive Maintenance',
    revenueImpact: 'None',
    revenueImpactClass: 'none',
    operationalDelay: 'None',
    delayClass: 'none',
    riskReduction: 'Low',
    riskClass: 'low',
    maintenanceDuration: '1 day',
    icon: '✓',
  },
  {
    vessel: 'Vessel E',
    fullName: 'MV Pacific Explorer',
    action: 'URGENT Engine Overhaul – Immediate',
    revenueImpact: 'High',
    revenueImpactClass: 'high',
    operationalDelay: '3 days',
    delayClass: 'danger',
    riskReduction: 'Critical',
    riskClass: 'critical',
    maintenanceDuration: '3 days',
    icon: '🚨',
  },
];

// ── Default reschedule context (pre-selected when navigating from health page) ─
export const DEFAULT_RESCHEDULE_CONTEXT = {
  vessel: 'MV Coastal Star',
  shortName: 'Vessel A',
  component: 'Engine System',
  fleet: 'Fleet Atlantic',
  healthScore: 30,
  daysToFailure: 7,
  confidence: 85,
  risk: 'Critical',
  issue: 'Overheating',
  recommendation:
    'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
};
