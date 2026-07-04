/**
 * data/mock/kpis/dashboardKpis.js
 *
 * Per-fleet KPI summaries shown at the top of the Fleet Health page.
 * MIGRATION NOTE: Replace with GET /api/fleets/:fleetId/kpis
 */

/**
 * @type {Record<string, import('../../../types/index').KpiSummary>}
 */
export const FLEET_KPIS = {
  'fleet-atlantic': {
    overallHealth: 54,
    activeAlerts: 23,
    criticalSystems: 4,
    scheduledMaintenance: 6,
    avgDaysToFailure: 28,
    vessels: 4,
  },
  'fleet-pacific': {
    overallHealth: 68,
    activeAlerts: 12,
    criticalSystems: 1,
    scheduledMaintenance: 5,
    avgDaysToFailure: 45,
    vessels: 4,
  },
  'fleet-mediterranean': {
    overallHealth: 77,
    activeAlerts: 8,
    criticalSystems: 1,
    scheduledMaintenance: 4,
    avgDaysToFailure: 52,
    vessels: 3,
  },
};

/**
 * Alerts summary block shown in the top-right card.
 * Keyed by fleetId.
 */
export const FLEET_ALERTS_SUMMARY = {
  'fleet-atlantic': {
    totalAlerts: 23,
    critical: 7,
    warning: 11,
    informational: 5,
    trend: '+4 since last week',
  },
  'fleet-pacific': {
    totalAlerts: 12,
    critical: 2,
    warning: 6,
    informational: 4,
    trend: '-1 since last week',
  },
  'fleet-mediterranean': {
    totalAlerts: 8,
    critical: 1,
    warning: 4,
    informational: 3,
    trend: '-3 since last week',
  },
};
