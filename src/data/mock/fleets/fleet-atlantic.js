/**
 * data/mock/fleets/fleet-atlantic.js
 *
 * Mock data for Fleet Atlantic (North Atlantic Operations).
 * MIGRATION NOTE: Replace this file's export with an API call to
 *   GET /api/fleets/fleet-atlantic
 * The shape must match the Fleet typedef in src/types/index.js.
 */

// System helpers — full system definitions live in data/mock/systems/
// and are assembled by the data index. Only IDs are listed here.
export const FLEET_ATLANTIC = {
  id: 'fleet-atlantic',
  name: 'Fleet Atlantic',
  region: 'North Atlantic',
  vesselIds: ['va', 'vb', 'vc', 'vd'],
};
