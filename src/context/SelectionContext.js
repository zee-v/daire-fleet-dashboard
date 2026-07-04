/**
 * context/SelectionContext.js
 *
 * Global selection state: which fleet / component / vessel is currently viewed.
 * REFACTORED: Now component-centric instead of vessel-centric.
 * - selectedFleetId: which fleet
 * - selectedComponentId: which component (drives page context)
 * - selectedVesselId: which vessel (drives graph only)
 *
 * Usage:
 *   const { selection, setSelection, dashboardData } = useSelection();
 *
 * MIGRATION NOTE: switching from mock to real APIs requires only
 * changes inside dashboardService.js and componentService.js.
 */
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { getDashboardData } from '../services/dashboardService';
import { getFleets } from '../services/fleetService';
import { getComponents } from '../services/componentService';
import { mergeEdpIntoDashboard } from '../services/edpMerge';
import { getEdpDashboardUrl } from '../config/edpApi';

const SelectionContext = createContext(null);

const DEFAULT_SELECTION = {
  fleetId: 'fleet-atlantic',
  componentId: 'engine-system',
  vesselId: null, // null = show first vessel from component data
};

/**
 * Wrap <App> (or <Layout>) with this provider.
 */
export function SelectionProvider({ children }) {
  const [selection, setSelectionRaw] = useState(DEFAULT_SELECTION);
  const [edpPayload, setEdpPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const url = getEdpDashboardUrl();
    fetch(url, { credentials: 'omit' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Fleet API ${res.status}`))))
      .then((data) => {
        if (!cancelled) setEdpPayload(data);
      })
      .catch(() => {
        if (!cancelled) setEdpPayload(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Merge a partial selection.
   * - When fleetId changes, reset to first component
   * - When componentId changes, reset vesselId to null (will pick first vessel)
   *
   * @param {Partial<typeof DEFAULT_SELECTION>} patch
   */
  function setSelection(patch) {
    setSelectionRaw((prev) => {
      const next = { ...prev, ...patch };

      // If fleet changed, pick first component of new fleet, reset vessel
      if (patch.fleetId && patch.fleetId !== prev.fleetId) {
        const components = getComponents(patch.fleetId);
        const requestedComponentId = components.some((c) => c.id === patch.componentId)
          ? patch.componentId
          : components[0]?.id ?? prev.componentId;
        return {
          fleetId: patch.fleetId,
          componentId: requestedComponentId,
          vesselId: null,
        };
      }

      // If component changed (same fleet), reset vessel to null
      if (patch.componentId && patch.componentId !== prev.componentId && !patch.vesselId) {
        return {
          ...next,
          vesselId: null,
        };
      }

      return next;
    });
  }

  const dashboardData = useMemo(() => {
    // For backward compatibility, we still use the old getDashboardData
    // but now driven by componentId instead of systemId
    const base = getDashboardData(
      selection.fleetId,
      selection.componentId,
      selection.vesselId,
    );
    if (!edpPayload) return base;
    return mergeEdpIntoDashboard(base, edpPayload, selection.vesselId);
  }, [selection.fleetId, selection.componentId, selection.vesselId, edpPayload]);

  const value = { selection, setSelection, dashboardData, edpPayload };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

/** @returns {{ selection: typeof DEFAULT_SELECTION, setSelection: Function, dashboardData: object, edpPayload: object|null }} */
export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used inside <SelectionProvider>');
  return ctx;
}

export default SelectionContext;
