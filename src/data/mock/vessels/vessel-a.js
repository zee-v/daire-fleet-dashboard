/**
 * data/mock/vessels/vessel-a.js  (MV Coastal Star — Fleet Atlantic)
 *
 * MIGRATION NOTE: Replace with GET /api/vessels/va
 * Shape must match the Vessel typedef in src/types/index.js.
 */
export const VESSEL_A = {
  id: 'va',
  fleetId: 'fleet-atlantic',
  name: 'MV Coastal Star',
  shortName: 'Vessel A',
  status: 'critical',
  healthScore: 30,
  systemIds: ['va-engine', 'va-cooling', 'va-electrical', 'va-fuel', 'va-navigation'],
};
