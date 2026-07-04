/**
 * services/vesselService.js
 *
 * Vessel and system data access.
 * MIGRATION NOTE: Replace mock imports with API calls.
 */
import { FLEET_MAP, VESSEL_MAP, ALL_SYSTEMS } from '../data/mock/index';

/**
 * Returns all vessels belonging to a fleet, in definition order.
 * @param {string} fleetId
 * @returns {import('../types/index').Vessel[]}
 */
export function getVesselsByFleet(fleetId) {
  const fleet = FLEET_MAP[fleetId];
  if (!fleet) return [];
  return fleet.vesselIds.map((id) => VESSEL_MAP[id]).filter(Boolean);
}

/**
 * @param {string} vesselId
 * @returns {import('../types/index').Vessel | undefined}
 */
export function getVesselById(vesselId) {
  return VESSEL_MAP[vesselId];
}

/**
 * Returns all systems for a vessel in definition order.
 * @param {string} vesselId
 * @returns {import('../types/index').System[]}
 */
export function getSystemsByVessel(vesselId) {
  const vessel = VESSEL_MAP[vesselId];
  if (!vessel) return [];
  return vessel.systemIds.map((id) => ALL_SYSTEMS[id]).filter(Boolean);
}

/**
 * @param {string} systemId
 * @returns {import('../types/index').System | undefined}
 */
export function getSystemById(systemId) {
  return ALL_SYSTEMS[systemId];
}
