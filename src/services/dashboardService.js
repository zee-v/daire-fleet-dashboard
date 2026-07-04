/**
 * services/dashboardService.js
 *
 * Assembles all data needed to render the Fleet Health and
 * Maintenance pages for a given selection.
 *
 * REFACTORED: Now component-centric instead of vessel-system-centric.
 *
 * MIGRATION NOTE: Replace the helper imports with API calls.
 * The shapes returned must remain stable — the UI never touches
 * the raw data layer directly.
 */
import { getFleetById } from './fleetService';
import { getVesselById, getSystemById, getVesselsByFleet, getSystemsByVessel } from './vesselService';
import { getComponentById } from './componentService';
import { FLEET_KPIS, FLEET_ALERTS_SUMMARY } from '../data/mock/kpis/dashboardKpis';
import { CORRECTIVE_ACTIONS } from '../data/mock/alerts/correctiveActions';
import {
  SCHEDULE, SCHEDULE_WEEKS, SCHEDULE_SLOTS,
  MAINTENANCE_WINDOWS, MAINTENANCE_TEAMS,
  PRIORITIES, IMPACT_SUMMARY,
} from '../data/mock/schedules/maintenanceSchedule';

/**
 * Primary dashboard data for the Fleet Health page.
 * REFACTORED: Now uses componentId as primary context.
 *
 * @param {string} fleetId
 * @param {string} componentId
 * @param {string|null} vesselId - for graph-specific selection
 * @returns {{
 *   fleet:        import('../types/index').Fleet,
 *   component:    object,
 *   vessel:       import('../types/index').Vessel | null,
 *   system:       import('../types/index').System | null,
 *   kpi:          import('../types/index').KpiSummary,
 *   alertsSummary: object,
 *   vessels:      import('../types/index').Vessel[],
 *   systems:      import('../types/index').System[],
 * }}
 */
export function getDashboardData(fleetId, componentId, vesselId) {
  const fleet  = getFleetById(fleetId);
  const component = getComponentById(componentId);
  
  // For backward compatibility with old vessel-based flow
  const vessel = vesselId ? getVesselById(vesselId) : null;
  
  // Map componentId to systemId for backward compatibility
  // In the real implementation, this would use component data directly
  const systemIdMap = {
    'engine-system': 'va-engine',
    'cooling-system': 'va-cooling',
    'electrical-system': 'va-electrical',
  };
  const systemId = systemIdMap[componentId] || 'va-engine';
  const system = getSystemById(systemId);

  return {
    fleet,
    component,
    vessel,
    system,
    kpi:          FLEET_KPIS[fleetId]          || FLEET_KPIS['fleet-atlantic'],
    alertsSummary: FLEET_ALERTS_SUMMARY[fleetId] || FLEET_ALERTS_SUMMARY['fleet-atlantic'],
    vessels:      getVesselsByFleet(fleetId),
    systems:      vessel ? getSystemsByVessel(vesselId) : [],
  };
}

/**
 * Data for the Maintenance Actions page (fleet-scoped).
 *
 * @param {string} [fleetId]  undefined → all fleets
 * @returns {{
 *   correctiveActions: import('../types/index').CorrectiveAction[],
 *   schedule:          object[],
 *   scheduleWeeks:     string[],
 *   scheduleSlots:     object[],
 *   maintenanceWindows: object[],
 *   maintenanceTeams:  object[],
 *   priorities:        object[],
 *   impactSummary:     object,
 * }}
 */
export function getMaintenanceData(fleetId) {
  const ca = fleetId
    ? CORRECTIVE_ACTIONS.filter((a) => a.fleetId === fleetId)
    : CORRECTIVE_ACTIONS;

  return {
    correctiveActions:  ca,
    schedule:           SCHEDULE,
    scheduleWeeks:      SCHEDULE_WEEKS,
    scheduleSlots:      SCHEDULE_SLOTS,
    maintenanceWindows: MAINTENANCE_WINDOWS,
    maintenanceTeams:   MAINTENANCE_TEAMS,
    priorities:         PRIORITIES,
    impactSummary:      IMPACT_SUMMARY,
  };
}

/**
 * Builds a RescheduleContext passed to MaintenancePage via router state
 * or constructed on-the-fly from a system record.
 *
 * @param {string} fleetId
 * @param {string} vesselId
 * @param {string} systemId
 * @returns {import('../types/index').RescheduleContext}
 */
export function buildRescheduleContext(fleetId, vesselId, systemId) {
  const fleet  = getFleetById(fleetId);
  const vessel = getVesselById(vesselId);
  const system = getSystemById(systemId);

  return {
    fleetId,
    fleetName:   fleet?.name  ?? 'Unknown Fleet',
    vesselId,
    vesselName:  vessel?.name ?? 'Unknown Vessel',
    systemId,
    systemName:  system?.name ?? 'Unknown System',
    issue:       system?.issue ?? null,
    healthScore: system?.healthScore ?? 0,
    daysToFailure: system?.daysToFailure ?? null,
    recommendation: system?.recommendation ?? '',
  };
}
