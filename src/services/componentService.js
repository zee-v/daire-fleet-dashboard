/**
 * services/componentService.js
 *
 * Component-centric data service layer.
 * Maps component files from backend/data to component structure.
 * Loads real CSV data for each component and provides vessel options.
 */

const COMPONENT_CONFIG = [
  {
    id: 'engine-system',
    name: 'Engine System',
    fileName: 'EDP.csv',
    status: 'warning',
    defaultStatus: 'warning',
  },
  {
    id: 'cooling-system',
    name: 'Cooling System',
    fileName: 'EDP - Copy.csv',
    status: 'healthy',
    defaultStatus: 'healthy',
  },
  {
    id: 'electrical-system',
    name: 'Electrical System',
    fileName: 'EDP - Copy (2).csv',
    status: 'healthy',
    defaultStatus: 'healthy',
  },
];

// Fleet-specific component status overrides
const FLEET_COMPONENT_STATUS = {
  'fleet-atlantic': {
    'engine-system': 'critical',
    'cooling-system': 'healthy',
    'electrical-system': 'warning',
  },
  'fleet-pacific': {
    'engine-system': 'warning',
    'cooling-system': 'healthy',
    'electrical-system': 'healthy',
  },
  'fleet-mediterranean': {
    'engine-system': 'healthy',
    'cooling-system': 'warning',
    'electrical-system': 'healthy',
  },
};

/**
 * Get all available components for a fleet
 * @param {string} fleetId
 * @returns {Array<{id: string, name: string, status: string}>}
 */
export function getComponents(fleetId) {
  const fleetStatuses = FLEET_COMPONENT_STATUS[fleetId] || {};
  return COMPONENT_CONFIG.map(({ id, name, defaultStatus }) => ({ 
    id, 
    name, 
    status: fleetStatuses[id] || defaultStatus 
  }));
}

/**
 * Get component by ID
 * @param {string} componentId
 * @returns {{id: string, name: string, fileName: string, status: string} | null}
 */
export function getComponentById(componentId) {
  return COMPONENT_CONFIG.find((c) => c.id === componentId) || null;
}

/**
 * Get the CSV file name for a component
 * @param {string} componentId
 * @returns {string | null}
 */
export function getComponentFileName(componentId) {
  const component = getComponentById(componentId);
  return component ? component.fileName : null;
}

/**
 * Parse CSV text into structured data
 * @param {string} csvText
 * @returns {Array<object>}
 */
function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    const row = {};
    headers.forEach((header, idx) => {
      const key = header || `col${idx}`;
      row[key] = (parts[idx] ?? '').trim();
    });
    rows.push(row);
  }
  
  return rows;
}

/**
 * Normalize vessel identifier
 * @param {string} name
 * @returns {string}
 */
function normalizeTail(name) {
  if (!name) return '';
  const trimmed = String(name).trim();
  // Handle variations like "Tail 1", "TAil 4", "tail 2", "TAIL 5", "Vessel 1", etc.
  const match = trimmed.match(/^(?:tail|vessel)\s*(\d+)$/i);
  if (match) return `Vessel ${match[1]}`;
  // If it doesn't match the pattern, return as-is
  return trimmed;
}

/**
 * Parse date from CSV format (DD/MM/YYYY HH:MM)
 * @param {string} dateStr
 * @returns {Date}
 */
function parseDate(dateStr) {
  const s = String(dateStr).trim();
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
  if (!match) return new Date(0);
  const [, day, month, year, hour, minute] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

/**
 * Load and parse component data from backend
 * @param {string} componentId
 * @returns {Promise<{
 *   component: object,
 *   vessels: string[],
 *   data: Array<object>,
 *   dateRange: {from: string, to: string}
 * }>}
 */
function getApiBase() {
  const fromEnv = process.env.REACT_APP_EDP_API_URL;
  return (fromEnv || '').replace(/\/$/, '');
}

export async function loadComponentData(componentId) {
  const component = getComponentById(componentId);
  if (!component) {
    throw new Error(`Component not found: ${componentId}`);
  }

  try {
    // Fetch CSV data from backend
    const response = await fetch(`${getApiBase()}/api/component/${componentId}/data`);
    if (!response.ok) {
      throw new Error(`Failed to load component data: ${response.status}`);
    }
    
    const csvText = await response.text();
    const csvData = parseCsv(csvText);
    
    console.log(`Parsed ${csvData.length} rows from ${componentId}`);
    
    // Extract unique vessels
    const vesselSet = new Set();
    csvData.forEach((row) => {
      const rawTail = row.FlightName || row.tail || '';
      const tail = normalizeTail(rawTail);
      if (tail) {
        vesselSet.add(tail);
      }
    });
    const vessels = Array.from(vesselSet).sort((a, b) => {
      // Sort numerically by vessel number
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return aNum - bNum;
    });
    
    console.log(`Extracted ${vessels.length} unique vessels:`, vessels);
    
    // Parse dates and find range
    let minDate = null;
    let maxDate = null;
    
    const processedData = csvData.map((row, index) => {
      const date = parseDate(row.DateTime || '');
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
      
      return {
        index,
        date,
        dateStr: row.DateTime || '',
        vessel: normalizeTail(row.FlightName || row.tail || ''),
        normalizedValue: parseFloat(row['Normalized Values'] || row.normalizedValue || 0),
        reconsError: parseFloat(row['Recons Error'] || 0),
        prediction: parseInt(row.Prediction || 0, 10),
        active: parseInt(row.Active || 0, 10),
        rootCause: row.RootCause || '',
        rcComponent: row.RCComponent || '',
      };
    });
    
    const dateRange = {
      from: minDate ? minDate.toLocaleDateString('en-GB') : '',
      to: maxDate ? maxDate.toLocaleDateString('en-GB') : '',
    };
    
    return {
      component,
      vessels,
      data: processedData,
      dateRange,
    };
  } catch (error) {
    console.error(`Error loading component data for ${componentId}:`, error);
    // Return empty structure on error
    return {
      component,
      vessels: [],
      data: [],
      dateRange: { from: '', to: '' },
    };
  }
}

/**
 * Get graph data for a specific vessel within a component
 * @param {string} componentId
 * @param {string} vesselId
 * @returns {Promise<Array<{x: number, y: number, label: string, value: number}>>}
 */
export async function getVesselGraphData(componentId, vesselId) {
  const { data } = await loadComponentData(componentId);
  
  console.log(`Filtering graph data for vessel: "${vesselId}" from ${data.length} total rows`);
  
  const vesselData = data
    .filter((row) => {
      const matches = row.vessel === vesselId;
      return matches;
    })
    .sort((a, b) => a.date - b.date);
  
  console.log(`Found ${vesselData.length} data points for vessel "${vesselId}"`);
  
  // Convert normalized values to health percentage
  // Normalized values: 0 = best (no anomaly), 1 = worst (full anomaly)
  // Health: 100% = best, 0% = worst
  // So: Health = (1 - normalizedValue) * 100
  const graphData = vesselData.map((row, idx) => ({
    x: idx,
    y: (1 - row.normalizedValue) * 100, // Invert: lower normalized value = better health
    label: row.dateStr,
    value: (1 - row.normalizedValue) * 100,
  }));
  
  return graphData;
}

/**
 * Get fleet-level aggregated summary for a component
 * @param {string} componentId
 * @returns {Promise<{
 *   totalVessels: number,
 *   healthyVessels: number,
 *   warningVessels: number,
 *   criticalVessels: number,
 *   averageHealth: number,
 *   activeAlerts: number,
 *   predictions: Array<object>
 * }>}
 */
export async function getFleetSummaryForComponent(componentId) {
  const { vessels, data } = await loadComponentData(componentId);
  
  console.log(`Calculating fleet summary for ${componentId} with ${vessels.length} vessels and ${data.length} data points`);
  
  // Calculate latest health status per vessel
  const vesselLatestHealth = {};
  data.forEach((row) => {
    if (!row.vessel) return; // Skip rows without vessel ID
    if (!vesselLatestHealth[row.vessel] || row.date > vesselLatestHealth[row.vessel].date) {
      vesselLatestHealth[row.vessel] = row;
    }
  });
  
  let healthyCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  let totalHealth = 0;
  let activeAlerts = 0;
  const predictions = [];
  
  // Count all active alerts across all data (not just latest)
  data.forEach((row) => {
    if (row.active === 1) activeAlerts++;
  });
  
  Object.values(vesselLatestHealth).forEach((latest) => {
    // Health calculation: (1 - normalizedValue) * 100
    // Because normalizedValue 0 = good, 1 = bad
    const health = (1 - latest.normalizedValue) * 100;
    totalHealth += health;
    
    // Use Recons Error thresholds for status classification
    // Threshold 1 = 2.2 (warning threshold)
    // Threshold 2 = 3.0 (critical threshold)
    const reconsError = latest.reconsError;
    if (reconsError < 2.2) {
      healthyCount++;
    } else if (reconsError < 3.0) {
      warningCount++;
    } else {
      criticalCount++;
    }
  });
  
  // Collect all active predictions across the entire dataset
  // Group by vessel to get unique vessels with active predictions
  const vesselPredictions = {};
  data.forEach((row) => {
    if (row.prediction === 1 && row.active === 1 && row.vessel) {
      // Keep the most recent prediction data for each vessel
      if (!vesselPredictions[row.vessel] || row.date > vesselPredictions[row.vessel].date) {
        vesselPredictions[row.vessel] = row;
      }
    }
  });
  
  Object.values(vesselPredictions).forEach((pred) => {
    predictions.push({
      vessel: pred.vessel,
      rootCause: pred.rootCause,
      component: pred.rcComponent,
      dateStr: pred.dateStr,
      reconsError: pred.reconsError,
    });
  });
  
  // Sort predictions by vessel name
  predictions.sort((a, b) => {
    const aNum = parseInt(a.vessel.match(/\d+/)?.[0] || '0', 10);
    const bNum = parseInt(b.vessel.match(/\d+/)?.[0] || '0', 10);
    return aNum - bNum;
  });
  
  const vesselCount = Object.keys(vesselLatestHealth).length;
  const averageHealth = vesselCount > 0 ? Math.round(totalHealth / vesselCount) : 0;
  
  console.log(`Fleet summary: ${vesselCount} vessels, Avg Health: ${averageHealth}%, Active Alerts: ${activeAlerts}, H:${healthyCount} W:${warningCount} C:${criticalCount}`);
  
  return {
    totalVessels: vesselCount,
    healthyVessels: healthyCount,
    warningVessels: warningCount,
    criticalVessels: criticalCount,
    averageHealth,
    activeAlerts,
    predictions,
  };
}
