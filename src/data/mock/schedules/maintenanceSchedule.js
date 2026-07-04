/**
 * data/mock/schedules/maintenanceSchedule.js
 *
 * Maintenance schedule data for the Gantt / table view.
 * MIGRATION NOTE: Replace with GET /api/fleets/:fleetId/schedule
 */

/** @type {string[]} 12-week column labels shown on the Gantt chart */
export const SCHEDULE_WEEKS = [
  'Feb 6','Feb 13','Feb 20','Feb 27',
  'Mar 6','Mar 13','Mar 20','Mar 27',
  'Apr 3','Apr 10','Apr 17','Apr 24',
];

/**
 * Slot definitions for colour-coding bars.
 * id matches slot values in SCHEDULE rows.
 */
export const SCHEDULE_SLOTS = [
  { id: 'slot1', label: 'Engine Overhaul',         color: '#2563eb' },
  { id: 'slot2', label: 'Cooling System Flush',    color: '#16a34a' },
  { id: 'slot3', label: 'Electrical Inspection',   color: '#d97706' },
  { id: 'slot4', label: 'Fuel System Service',     color: '#9333ea' },
  { id: 'slot5', label: 'Navigation Calibration',  color: '#0891b2' },
  { id: 'slot6', label: 'Hull Inspection',         color: '#be123c' },
];

/**
 * One row per vessel — which slot lands in which week column.
 * weeks[] is sparse: [weekIndex, slotId, spanInWeeks]
 * (week index is 0-based from SCHEDULE_WEEKS)
 *
 * @type {Array<{
 *   vessel: string,
 *   vesselId: string,
 *   tasks: Array<{weekIdx: number, slotId: string, span: number}>
 * }>}
 */
export const SCHEDULE = [
  {
    vessel: 'MV Coastal Star',   vesselId: 'va',
    tasks: [
      { weekIdx: 0, slotId: 'slot1', span: 3 },
      { weekIdx: 4, slotId: 'slot6', span: 2 },
      { weekIdx: 9, slotId: 'slot4', span: 1 },
    ],
  },
  {
    vessel: 'MV Ocean Prince',   vesselId: 'vb',
    tasks: [
      { weekIdx: 1, slotId: 'slot2', span: 2 },
      { weekIdx: 6, slotId: 'slot3', span: 1 },
    ],
  },
  {
    vessel: 'MV Northern Light', vesselId: 'vc',
    tasks: [
      { weekIdx: 2, slotId: 'slot3', span: 2 },
      { weekIdx: 7, slotId: 'slot5', span: 1 },
    ],
  },
  {
    vessel: 'MV Atlantic Dawn',  vesselId: 'vd',
    tasks: [
      { weekIdx: 0, slotId: 'slot4', span: 1 },
      { weekIdx: 5, slotId: 'slot6', span: 2 },
    ],
  },
  {
    vessel: 'MV Pacific Explorer', vesselId: 've',
    tasks: [
      { weekIdx: 0, slotId: 'slot1', span: 3 },
      { weekIdx: 5, slotId: 'slot2', span: 2 },
    ],
  },
  {
    vessel: 'MV Island Trader',  vesselId: 'vf',
    tasks: [
      { weekIdx: 2, slotId: 'slot2', span: 2 },
      { weekIdx: 8, slotId: 'slot3', span: 1 },
    ],
  },
  {
    vessel: 'MV Coral Spirit',   vesselId: 'vg',
    tasks: [
      { weekIdx: 3, slotId: 'slot5', span: 1 },
      { weekIdx: 9, slotId: 'slot4', span: 1 },
    ],
  },
  {
    vessel: 'MV Pacific Dawn',   vesselId: 'vh',
    tasks: [
      { weekIdx: 1, slotId: 'slot1', span: 2 },
      { weekIdx: 7, slotId: 'slot6', span: 1 },
    ],
  },
  {
    vessel: 'MV Aegean Star',    vesselId: 'vi',
    tasks: [
      { weekIdx: 4, slotId: 'slot5', span: 1 },
      { weekIdx: 10, slotId: 'slot3', span: 1 },
    ],
  },
  {
    vessel: 'MV Adriatic Wind',  vesselId: 'vj',
    tasks: [
      { weekIdx: 0, slotId: 'slot1', span: 2 },
      { weekIdx: 6, slotId: 'slot2', span: 2 },
    ],
  },
  {
    vessel: 'MV Ligurian Sun',   vesselId: 'vk',
    tasks: [
      { weekIdx: 0, slotId: 'slot1', span: 4 },
      { weekIdx: 8, slotId: 'slot6', span: 2 },
    ],
  },
];

/** Maintenance availability windows (used by the schedule modal) */
export const MAINTENANCE_WINDOWS = [
  { id: 'mw1', label: 'Window A', start: 'Apr 06', end: 'Apr 12', crew: 3 },
  { id: 'mw2', label: 'Window B', start: 'Apr 14', end: 'Apr 20', crew: 4 },
  { id: 'mw3', label: 'Window C', start: 'Apr 21', end: 'Apr 27', crew: 2 },
];

/** Maintenance teams available for assignment */
export const MAINTENANCE_TEAMS = [
  { id: 'team-alpha',   name: 'Team Alpha',   specialisation: 'Engine & Propulsion' },
  { id: 'team-bravo',   name: 'Team Bravo',   specialisation: 'Cooling & HVAC' },
  { id: 'team-charlie', name: 'Team Charlie', specialisation: 'Electrical & Navigation' },
  { id: 'team-delta',   name: 'Team Delta',   specialisation: 'Hull & Structural' },
];

/** Priority labels for corrective action cards */
export const PRIORITIES = [
  { id: 'critical',      label: 'Critical',      color: '#ef4444' },
  { id: 'high',          label: 'High',           color: '#f97316' },
  { id: 'medium',        label: 'Medium',         color: '#eab308' },
  { id: 'low',           label: 'Low',            color: '#22c55e' },
];

/** Impact summary for the rescheduling modal */
export const IMPACT_SUMMARY = {
  totalAffectedVessels: 4,
  estimatedDowntimeDays: 12,
  estimatedCostImpact: '$48,000',
  riskLevel: 'High',
};
