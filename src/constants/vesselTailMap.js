/** Maps mock vessel ids to CSV FlightName / vessel labels. */
export const VESSEL_ID_TO_TAIL = {
  va: 'Vessel 1',
  vb: 'Vessel 2',
  vc: 'Vessel 3',
  vd: 'Vessel 4',
  ve: 'Vessel 5',
  vf: 'Vessel 6',
  vg: 'Vessel 7',
  vh: 'Vessel 8',
  vi: 'Vessel 9',
  vj: 'Vessel 10',
  vk: 'Vessel 11',
};

export function tailForVesselId(vesselId) {
  return VESSEL_ID_TO_TAIL[vesselId] || null;
}
