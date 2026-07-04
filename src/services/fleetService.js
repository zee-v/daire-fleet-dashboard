/**
 * services/fleetService.js
 *
 * Fleet-level data access.
 * MIGRATION NOTE: Replace the mock-barrel imports with
 *   const res = await fetch('/api/fleets');
 * All callers remain unchanged because they use these functions,
 * not the raw data directly.
 */
import { ALL_FLEETS, FLEET_MAP } from '../data/mock/index';

/** @returns {import('../types/index').Fleet[]} */
export function getFleets() {
  return ALL_FLEETS;
}

/**
 * @param {string} id
 * @returns {import('../types/index').Fleet | undefined}
 */
export function getFleetById(id) {
  return FLEET_MAP[id];
}
