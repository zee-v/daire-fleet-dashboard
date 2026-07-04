import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { useSelection } from '../context/SelectionContext';
import { buildRescheduleContext } from '../services/dashboardService';
import { getSystemsByVessel } from '../services/vesselService';
import { loadComponentData, getVesselGraphData, getFleetSummaryForComponent, getComponents } from '../services/componentService';
import { tailForVesselId } from '../constants/vesselTailMap';
import VesselSelector from '../components/VesselSelector';
import './FleetHealthPage.css';

/* ── sub-components ─────────────────────────────────────── */

function StatCard({ icon, label, value, unit, badge, iconColor }) {
  return (
    <div className="fh-stat-card">
      <div className="fh-stat-icon" style={{ color: iconColor }}>{icon}</div>
      <div className="fh-stat-body">
        <div className="fh-stat-value">
          {value}
          {unit && <span className="fh-stat-unit">{unit}</span>}
        </div>
        <div className="fh-stat-label">{label}</div>
      </div>
      {badge && <span className={`fh-badge fh-badge--${badge.type}`}>{badge.label}</span>}
    </div>
  );
}

function CustomDot({ cx, cy, value }) {
  if (value === undefined) return null;
  const color = value > 65 ? '#22c55e' : value > 45 ? '#f59e0b' : '#ef4444';
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0f172a" strokeWidth={2} />;
}

/** X tick indices: show every point up to 40 (e.g. full 2022–2023 CSV run); subsample beyond that. */
function trendTickIndices(n) {
  if (n <= 0) return [0];
  if (n <= 40) return Array.from({ length: n }, (_, i) => i);
  const maxTicks = 16;
  const out = new Set([0, n - 1]);
  const inner = maxTicks - 2;
  for (let k = 1; k <= inner; k += 1) {
    out.add(Math.round((k * (n - 1)) / (inner + 1)));
  }
  return [...out].sort((a, b) => a - b);
}

/* ── page component ─────────────────────────────────────── */

export default function FleetHealthPage() {
  const navigate = useNavigate();
  const { fleetId: routeFleetId, componentId: routeComponentId } = useParams();
  const { selection, setSelection, dashboardData, edpPayload } = useSelection();
  const { fleet, component, vessel, system, kpi, vessels, csvMeta, fleetAlertDetails = [] } = dashboardData;
  const selectedCsvTail = tailForVesselId(selection.vesselId);

  // Component-centric state
  const [componentData, setComponentData] = useState(null);
  const [availableVessels, setAvailableVessels] = useState([]);
  const [selectedVessels, setSelectedVessels] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [fleetSummary, setFleetSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routeFleetId || !routeComponentId) return;

    const routeComponentExists = getComponents(routeFleetId).some((c) => c.id === routeComponentId);
    if (!routeComponentExists) {
      navigate('/fleet-overview', { replace: true });
      return;
    }

    if (selection.fleetId !== routeFleetId || selection.componentId !== routeComponentId) {
      setSelection({ fleetId: routeFleetId, componentId: routeComponentId });
    }
  }, [navigate, routeFleetId, routeComponentId, selection.fleetId, selection.componentId, setSelection]);

  // Load component data when component selection changes
  useEffect(() => {
    if (!selection.componentId) return;
    
    setLoading(true);
    loadComponentData(selection.componentId)
      .then((data) => {
        console.log('Loaded component data:', data);
        console.log('Available vessels from CSV:', data.vessels);
        setComponentData(data);
        setAvailableVessels(data.vessels);
        
        // Auto-select first vessel
        const firstVessel = data.vessels[0];
        if (firstVessel) {
          setSelectedVessels([firstVessel]);
          console.log('Auto-selected vessel:', firstVessel);
        }
      })
      .catch((err) => {
        console.error('Failed to load component data:', err);
        setComponentData(null);
        setAvailableVessels([]);
        setSelectedVessels([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selection.componentId]);

  // Load graph data when vessel selection changes
  useEffect(() => {
    if (!selection.componentId || selectedVessels.length === 0) {
      setGraphData([]);
      return;
    }
    
    console.log('Loading graph data for vessels:', selectedVessels, 'in component:', selection.componentId);
    
    // Load data for all selected vessels
    Promise.all(
      selectedVessels.map(vessel => 
        getVesselGraphData(selection.componentId, vessel)
          .then(data => ({ vessel, data }))
      )
    )
      .then((results) => {
        console.log('Graph data loaded for', results.length, 'vessels');
        setGraphData(results);
      })
      .catch((err) => {
        console.error('Failed to load vessel graph data:', err);
        setGraphData([]);
      });
  }, [selection.componentId, selectedVessels]);

  // Load fleet summary for the selected component
  useEffect(() => {
    if (!selection.componentId) {
      setFleetSummary(null);
      return;
    }
    
    getFleetSummaryForComponent(selection.componentId)
      .then((summary) => {
        setFleetSummary(summary);
      })
      .catch((err) => {
        console.error('Failed to load fleet summary:', err);
        setFleetSummary(null);
      });
  }, [selection.componentId]);

  // Handle vessel selection from dropdown
  const handleVesselSelect = (vesselIds) => {
    // vesselIds can be array or single vessel
    const vesselsArray = Array.isArray(vesselIds) ? vesselIds : [vesselIds];
    setSelectedVessels(vesselsArray);
    // Update selection context for graph only, not page context
    setSelection({ vesselId: vesselsArray[0] || null });
  };

  // Prepare chart data for multiple vessels
  const chartTrend = useMemo(() => {
    if (graphData.length > 0 && Array.isArray(graphData)) {
      // Create a unified dataset where each x-point has values for all vessels
      const dataByX = {};
      let maxX = 0;
      
      graphData.forEach(({ vessel, data }) => {
        data.forEach(point => {
          const x = point.x;
          maxX = Math.max(maxX, x);
          
          if (!dataByX[x]) {
            dataByX[x] = {
              x,
              label: point.label,
            };
          }
          
          // Store vessel-specific value with vessel as key
          dataByX[x][vessel] = point.value;
        });
      });
      
      // Convert to array and sort by x
      return Object.values(dataByX).sort((a, b) => a.x - b.x);
    }
    // Fallback to mock data
    return (system?.trend || []).map((p, i) => ({
      ...p,
      x: typeof p.x === 'number' && !Number.isNaN(p.x) ? p.x : i,
    }));
  }, [graphData, system]);

  const sparklineData = (system?.alerts?.sparkline || []).map((v) => ({ v }));

  // Color palette for multiple vessels
  const vesselColors = [
    '#60a5fa', // blue
    '#22c55e', // green
    '#f59e0b', // orange
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange-red
    '#84cc16', // lime
    '#06b6d4', // cyan
    '#8b5cf6', // violet
  ];

  // Get unique vessels from graphData for rendering separate lines
  const vesselsInGraph = useMemo(() => {
    if (Array.isArray(graphData) && graphData.length > 0) {
      return graphData.map(({ vessel }) => vessel);
    }
    return [];
  }, [graphData]);

  const trendPoints = chartTrend.length;
  
  // Calculate max x value for multi-vessel charts
  const maxX = useMemo(() => {
    if (chartTrend.length === 0) return 0;
    return Math.max(...chartTrend.map(point => point.x || 0));
  }, [chartTrend]);
  
  const trendTicks = useMemo(() => trendTickIndices(maxX + 1), [maxX]);
  const chartWidthPx = Math.min(6000, Math.max(800, maxX * 35));

  const handleReschedule = (ctx) => {
    navigate('/maintenance-actions', { state: ctx });
  };

  // Build reschedule context for selected component and vessel
  const buildMaintenanceContext = () => {
    if (!selection.componentId || selectedVessels.length === 0 || !componentData) {
      return null;
    }

    const vesselName = selectedVessels.length === 1 ? selectedVessels[0] : `${selectedVessels.length} vessels`;
    
    // Get latest health data for the selected vessel(s)
    let avgHealth = 0;
    let issue = 'Anomaly Detected';
    let recommendation = 'Schedule inspection and maintenance';
    
    if (selectedVessels.length === 1 && componentData) {
      const vesselDataPoints = componentData.data.filter(d => d.vessel === selectedVessels[0]);
      if (vesselDataPoints.length > 0) {
        const latest = vesselDataPoints[vesselDataPoints.length - 1];
        avgHealth = Math.round((1 - latest.normalizedValue) * 100);
        
        if (latest.rootCause) {
          issue = latest.rootCause;
        }
        if (latest.rcComponent) {
          recommendation = `Inspect ${latest.rcComponent} - ${latest.rootCause}`;
        }
      }
    } else if (fleetSummary) {
      avgHealth = fleetSummary.averageHealth;
    }

    return {
      fleetName: fleet?.name || 'Fleet',
      vesselName: vesselName,
      systemName: componentName,
      issue: issue,
      healthScore: avgHealth,
      daysToFailure: system?.prediction?.estimatedDays || null,
      recommendation: recommendation,
    };
  };

  const handleRescheduleClick = () => {
    const ctx = buildMaintenanceContext();
    if (ctx) {
      handleReschedule(ctx);
    }
  };

  if (!system && !component) {
    return (
      <div className="fh-page">
        <div className="fh-header"><h2 className="fh-title">Loading…</h2></div>
      </div>
    );
  }

  const criticalVessels = vessels.filter((v) => v.status === 'critical');
  const componentName = component?.name || system?.name || 'Component';
  const dateRange = componentData?.dateRange;

  return (
    <div className="fh-page">
      {/* Header */}
      <div className="fh-header">
        <div className="fh-header-left">
          <h2 className="fh-title">Fleet Health Dashboard</h2>
          <span className="fh-breadcrumb">
            dAIRE / {fleet?.name || 'Fleet Overview'}
            {edpPayload && (
              <span className="fh-live-feed" title="Fleet metrics from live data feed">
                {' '}
                · Live
              </span>
            )}
          </span>
        </div>
        <div className="fh-header-right">
          <button className="fh-hdr-btn">🔔</button>
          <button className="fh-hdr-btn">⚙</button>
          <div className="fh-avatar">JD</div>
        </div>
      </div>

      {/* KPI Stats row */}
      <div className="fh-stats-row">
        <StatCard
          icon="✓"
          label="Fleet Health"
          value={`${fleetSummary?.averageHealth ?? kpi.overallHealth}%`}
          iconColor="#22c55e"
        />
        <StatCard
          icon="⚠"
          label="Active Alerts"
          value={fleetSummary?.activeAlerts ?? kpi.activeAlerts}
          iconColor="#f59e0b"
          badge={{ type: 'warning', label: '▲' }}
        />
        <StatCard
          icon="🔴"
          label="Critical Vessels"
          value={fleetSummary?.criticalVessels ?? kpi.criticalSystems}
          iconColor="#ef4444"
          badge={{ type: 'critical', label: '▲' }}
        />
        <StatCard
          icon="◈"
          label="Avg. Days to Failure"
          value={kpi.avgDaysToFailure}
          unit=" days"
          iconColor="#60a5fa"
          badge={{ type: 'info', label: 'Next phase' }}
        />
      </div>

      {/* Main content */}
      <div className="fh-body">
        {/* Left column */}
        <div className="fh-col-left">
          {/* Health trend chart */}
          <div className="fh-card">
            <div className="fh-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className="fh-card-title">Health Trend – {componentName}</span>
                <VesselSelector
                  vessels={availableVessels}
                  selectedVessel={selectedVessels}
                  onVesselSelect={handleVesselSelect}
                />
              </div>
              {dateRange?.from && dateRange?.to && (
                <div className="fh-chart-range">
                  Component data · {dateRange.from} → {dateRange.to} · {chartTrend.length} readings
                  {selectedVessels.length > 0 && ` · ${selectedVessels.join(', ')}`}
                </div>
              )}
              {!dateRange && csvMeta?.dateFrom && csvMeta?.dateTo && (
                <div className="fh-chart-range">
                  Historical CSV · {csvMeta.dateFrom} → {csvMeta.dateTo} · {chartTrend.length} readings — all
                  vessels, chronological
                </div>
              )}
            </div>
            <div className="fh-trend-legend">
              {vesselsInGraph.length > 0 ? (
                <>
                  <span style={{ marginRight: '16px', color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>Vessels:</span>
                  {vesselsInGraph.map((vessel, idx) => (
                    <React.Fragment key={vessel}>
                      <span className="fh-leg-dot" style={{ background: vesselColors[idx % vesselColors.length] }} />
                      <span style={{ marginRight: '12px', fontSize: '11px' }}>{vessel}</span>
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  <span className="fh-leg-dot" style={{ background: '#22c55e' }} /> Healthy
                  <span className="fh-leg-dot" style={{ background: '#f59e0b' }} /> Warning
                  <span className="fh-leg-dot" style={{ background: '#ef4444' }} /> Critical
                </>
              )}
            </div>
            {loading && (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                Loading component data...
              </div>
            )}
            {!loading && chartTrend.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                {selectedVessels.length === 0 ? 'Select a vessel to view data' : `No data available for selected vessels`}
              </div>
            )}
            {!loading && chartTrend.length > 0 && (
              <div className="fh-chart-wrap fh-chart-wrap--scroll">
                <div className="fh-chart-sizer" style={{ width: chartWidthPx, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartTrend}
                      margin={{ top: 8, right: 16, bottom: trendPoints > 8 ? 44 : 12, left: 8 }}
                    >
                    <CartesianGrid stroke="#1e3a5a" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[0, Math.max(0, maxX)]}
                      ticks={trendTicks}
                      tickFormatter={(xi) => {
                        const idx = Math.round(Number(xi));
                        // Find a point with this x value to get the label
                        const row = chartTrend.find(p => Math.abs(p.x - idx) < 0.5);
                        if (!row?.label) return String(idx);
                        const s = String(row.label).replace(/,/g, ' ');
                        return trendPoints > 18 ? s.slice(0, 10) : s.slice(0, 18);
                      }}
                      angle={trendPoints > 5 ? -40 : 0}
                      textAnchor={trendPoints > 5 ? 'end' : 'middle'}
                      height={trendPoints > 5 ? 64 : 28}
                      tick={{ fill: '#64748b', fontSize: trendPoints > 20 ? 7 : 8 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <ReferenceLine y={65} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} />
                    <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#60a5fa' }}
                      formatter={(value, name) => {
                        if (value == null) return null;
                        return [`${value.toFixed(1)}%`, name];
                      }}
                      labelFormatter={(xi) => {
                        const idx = Math.round(Number(xi));
                        const row = chartTrend.find(p => Math.abs(p.x - idx) < 0.5);
                        return row?.label != null ? String(row.label) : String(idx);
                      }}
                    />
                    {vesselsInGraph.length > 0 ? (
                      vesselsInGraph.map((vessel, idx) => (
                        <Line
                          key={vessel}
                          type="monotone"
                          name={vessel}
                          dataKey={vessel}
                          stroke={vesselColors[idx % vesselColors.length]}
                          strokeWidth={2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          dot={trendPoints <= 80 ? <CustomDot /> : false}
                          activeDot={{ r: 6, fill: vesselColors[idx % vesselColors.length] }}
                          connectNulls
                        />
                      ))
                    ) : (
                      <Line
                        type="monotone"
                        name="Health"
                        dataKey="value"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        dot={trendPoints <= 80 ? <CustomDot /> : false}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}
          </div>

          {/* Alerts summary + key indicators */}
          <div className="fh-row-two">
            <div className="fh-card fh-alerts-card">
              <div className="fh-card-title mb-8">Fleet-Level Summary – {componentName}</div>
              {fleetSummary && (
                <div className="fh-alerts-csv-tag">
                  Aggregated across {fleetSummary.totalVessels} vessel{fleetSummary.totalVessels !== 1 ? 's' : ''}
                </div>
              )}
              <div className="fh-alerts-meta">
                <div className="fh-alerts-col">
                  <div className="fh-meta-label">Average Health</div>
                  <div className="fh-meta-val">
                    <span className="fh-alerts-check">✓</span> {fleetSummary?.averageHealth || kpi.overallHealth}%
                  </div>
                </div>
                <div className="fh-alerts-col">
                  <div className="fh-meta-label">Active Alerts</div>
                  <div className="fh-meta-val">{fleetSummary?.activeAlerts || system?.alerts?.totalAlerts || 0}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Rows with Active=1</div>
                </div>
                <div className="fh-alerts-col">
                  <div className="fh-meta-label">Status Distribution</div>
                  <div className="fh-meta-val" style={{ fontSize: '11px' }}>
                    {fleetSummary ? (
                      <>
                        <span style={{ color: '#22c55e' }}>{fleetSummary.healthyVessels}H</span>{' '}
                        <span style={{ color: '#f59e0b' }}>{fleetSummary.warningVessels}W</span>{' '}
                        <span style={{ color: '#ef4444' }}>{fleetSummary.criticalVessels}C</span>
                      </>
                    ) : (
                      system?.alerts?.trendDirection === 'down'
                        ? '▼'
                        : system?.alerts?.trendDirection === 'stable'
                          ? '◆'
                          : '▲'
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>By Recons Error</div>
                </div>
              </div>
              <div className="fh-sparkline-label">Alert Frequency Trend</div>
              <div className="fh-sparkline-wrap">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={sparklineData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#1e3a5a" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {fleetSummary && fleetSummary.predictions.length > 0 && (
                <div id="fh-csv-alerts" className="fh-csv-alerts">
                  <div className="fh-csv-alerts-title">
                    Fleet Predictions ({fleetSummary.predictions.length} vessel{fleetSummary.predictions.length !== 1 ? 's' : ''})
                  </div>
                  <p className="fh-csv-alerts-hint">
                    Vessels with active prediction alerts for {componentName}
                  </p>
                  <div className="fh-csv-alerts-scroll">
                    {fleetSummary.predictions.map((pred, idx) => (
                      <div
                        key={`${pred.vessel}-${idx}`}
                        className="fh-csv-alert-row"
                      >
                        <div className="fh-csv-alert-top">
                          <span className="fh-csv-alert-tail">{pred.vessel}</span>
                          <span className="fh-csv-pill">Active</span>
                        </div>
                        <div className="fh-csv-alert-detail">
                          {pred.rootCause} · {pred.component}
                          {pred.reconsError ? ` · Error: ${pred.reconsError.toFixed(3)}` : ''}
                          {pred.dateStr ? ` · ${pred.dateStr}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {edpPayload && fleetAlertDetails.length > 0 && !fleetSummary?.predictions?.length && (
                <div id="fh-csv-alerts" className="fh-csv-alerts">
                  <div className="fh-csv-alerts-title">
                    CSV rows with Prediction = 1 ({fleetAlertDetails.length})
                  </div>
                  <p className="fh-csv-alerts-hint">
                    Current vessel: <strong>{selectedCsvTail || '—'}</strong> — highlighted rows match this vessel.
                  </p>
                  <div className="fh-csv-alerts-scroll">
                    {fleetAlertDetails.map((row, idx) => (
                      <div
                        key={`${row.dateTime}-${row.vessel}-${idx}`}
                        className={`fh-csv-alert-row${row.vessel === selectedCsvTail ? ' fh-csv-alert-row--current' : ''}`}
                      >
                        <div className="fh-csv-alert-top">
                          <span className="fh-csv-alert-dt">{row.dateTime}</span>
                          <span className="fh-csv-alert-tail">{row.vessel}</span>
                          {row.active ? <span className="fh-csv-pill">Active</span> : null}
                        </div>
                        <div className="fh-csv-alert-detail">
                          {row.rootCause} · {row.rcComponent}
                          {row.reconsError ? ` · Recons ${row.reconsError}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="fh-section-head fh-kick-mt">
                <div className="fh-card-title fh-section-head-title">Fleet Key Indicators</div>
                <span className="fh-next-pill">Next phase</span>
              </div>
              <div className="fh-next-phase-dim-content">
                <div className="fh-ki-list">
                  {system?.keyIndicators?.map((ki) => (
                    <div key={ki.label} className="fh-ki-row">
                      <span className={`fh-ki-icon ${ki.colorClass}`}>{ki.icon}</span>
                      <span className="fh-ki-label">{ki.label}</span>
                      <span className="fh-ki-pct">
                        <span className="fh-ki-arrow">{ki.direction === 'up' ? '▲' : '▼'}</span>
                        {ki.pct}
                      </span>
                    </div>
                  )) || (
                    <div style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>
                      Fleet-level indicators for {componentName}
                    </div>
                  )}
                </div>
              </div>

              <div className="fh-card-title mt-12 mb-8">Fleet Prediction Summary</div>
              <div className="fh-pred-bottom">
                {fleetSummary && (
                  <>
                    <div className="fh-pred-row">
                      <span className="fh-pred-label">Vessels with predictions:</span>
                      <span className="fh-pred-val"> {fleetSummary.predictions.length}</span>
                    </div>
                    <div className="fh-pred-row">
                      <span className="fh-pred-label">Fleet average health:</span>
                      <span className="fh-pred-val"> {fleetSummary.averageHealth}%</span>
                    </div>
                  </>
                )}
                {!fleetSummary && system?.prediction && (
                  <>
                    <div className="fh-pred-row">
                      <span className="fh-pred-label">Estimated days to failure:</span>
                      <span className="fh-pred-val"> {system.prediction.estimatedDays} days</span>
                    </div>
                    <div className="fh-pred-row">
                      <span className="fh-pred-label">Confidence:</span>
                      <span className="fh-pred-val"> {system.prediction.confidence}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Prediction card - updated for component-centric model */}
            <div className="fh-card fh-pred-card">
              <div className="fh-pred-header">
                <span className="fh-card-title">
                  {selectedVessels.length > 0 ? (selectedVessels.length === 1 ? `${selectedVessels[0]} Prediction` : `${selectedVessels.length} Vessels Prediction`) : 'Vessel Prediction'}
                </span>
                <span className="fh-next-pill">Next phase</span>
              </div>
              <div className="fh-pred-csv-note">
                Prediction data below is placeholder. Real prediction engine coming in next phase.
              </div>
              <div className="fh-vessel-info">
                <span className="fh-vessel-tag">
                  {selectedVessels.length > 0 
                    ? (selectedVessels.length === 1 ? selectedVessels[0] : `${selectedVessels.length} vessels`) 
                    : (vessel?.name || 'Select vessel')}
                </span>
                <span className="fh-comp-tag">{componentName}</span>
              </div>
              {system?.prediction && (
                <>
                  <div className="fh-pred-days-row">
                    <span className="fh-pred-days">{system.prediction.estimatedDays} days</span>
                    <span className={`fh-risk-badge fh-risk--${system.prediction.risk.toLowerCase()}`}>
                      {system.prediction.risk}
                    </span>
                  </div>
                  <div className="fh-pred-confidence">
                    Confidence: <strong>{system.prediction.confidence}%</strong>
                  </div>
                  <div className="fh-bar-wrap">
                    <div className="fh-bar">
                      <div className="fh-bar-fill" style={{ width: `${system.prediction.confidence}%` }} />
                    </div>
                  </div>

                  <div className="fh-maintenance-actions">
                    <button 
                      type="button" 
                      className="fh-btn fh-btn--primary mt-12"
                      onClick={handleRescheduleClick}
                      disabled={!componentData || selectedVessels.length === 0}
                    >
                      Reschedule Maintenance
                    </button>

                    <div className="fh-rec-block mt-10">
                      <div className="fh-rec-icon">🔴</div>
                      <div className="fh-rec-body">
                        <div className="fh-rec-label">Recommendation</div>
                        <div className="fh-rec-text">{system.prediction.recommendation}</div>
                      </div>
                    </div>

                    <div className="fh-sug-block mt-8">
                      <div className="fh-sug-icon">📋</div>
                      <div className="fh-sug-body">
                        <div className="fh-sug-label">Suggested Action</div>
                        <div className="fh-sug-text">{system.prediction.suggestedAction}</div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="fh-btn fh-btn--primary mt-8"
                      onClick={handleRescheduleClick}
                      disabled={!componentData || selectedVessels.length === 0}
                    >
                      Reschedule Maintenance
                    </button>

                    <div className="fh-ignore-row mt-8">
                      <button type="button" className="fh-btn-link">
                        Ignore
                      </button>
                      <span className="fh-divider">/</span>
                      <button type="button" className="fh-btn-link">
                        Monitor
                      </button>
                    </div>
                  </div>
                </>
              )}
              {!system?.prediction && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Select a vessel to view prediction details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column – fleet overview */}
        <div className="fh-col-right">
          <div className="fh-card fh-overview-card">
            <div className="fh-section-head fh-fleet-head">
              <div className="fh-card-title fh-section-head-title">{fleet?.name} – Vessels Health</div>
            </div>
            <div>
              <div className="fh-fleet-summary">
                <div className="fh-fleet-card">
                  {componentData && availableVessels.length > 0 ? (
                    <div className="fh-vessel-list">
                      {availableVessels.map((vesselName) => {
                        // Calculate health for this vessel from component data
                        const vesselDataPoints = componentData.data.filter(d => d.vessel === vesselName);
                        let health = 0;
                        let status = 'healthy';
                        
                        if (vesselDataPoints.length > 0) {
                          // Get latest data point
                          const latest = vesselDataPoints[vesselDataPoints.length - 1];
                          health = Math.round((1 - latest.normalizedValue) * 100);
                          
                          // Determine status by recons error
                          if (latest.reconsError >= 3.0) {
                            status = 'critical';
                          } else if (latest.reconsError >= 2.2) {
                            status = 'warning';
                          }
                        }
                        
                        return (
                          <div key={vesselName} className={`fh-vessel-row fh-vessel--${status}`}>
                            <span className={`fh-vessel-dot fh-dot--${status}`} />
                            <span className="fh-vessel-label">{vesselName}</span>
                            <span className="fh-vessel-score">{health}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="fh-vessel-list">
                      {vessels.map((v) => (
                        <div key={v.id} className={`fh-vessel-row fh-vessel--${v.status}`}>
                          <span className={`fh-vessel-dot fh-dot--${v.status}`} />
                          <span className="fh-vessel-label">{v.shortName} – {v.name}</span>
                          <span className="fh-vessel-score">{v.healthScore}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="fh-section-head fh-critical-head">
              <div className="fh-card-title fh-section-head-title">Critical Vessels</div>
            </div>
            <div>
              {(() => {
                // Get critical vessels from component data
                const criticalVesselsData = [];
                if (componentData && availableVessels.length > 0) {
                  availableVessels.forEach((vesselName) => {
                    const vesselDataPoints = componentData.data.filter(d => d.vessel === vesselName);
                    if (vesselDataPoints.length > 0) {
                      const latest = vesselDataPoints[vesselDataPoints.length - 1];
                      const health = Math.round((1 - latest.normalizedValue) * 100);
                      if (latest.reconsError >= 3.0) {
                        criticalVesselsData.push({
                          name: vesselName,
                          health,
                          reconsError: latest.reconsError,
                          rootCause: latest.rootCause,
                          component: latest.rcComponent,
                        });
                      }
                    }
                  });
                }
                
                if (criticalVesselsData.length === 0) {
                  return <div className="fh-critical-empty">No critical vessels detected.</div>;
                }
                
                return criticalVesselsData.map((v) => (
                  <div key={v.name} className="fh-critical-row">
                    <div className="fh-critical-header">
                      <span className="fh-dot-critical" />
                      <span className="fh-critical-name">{v.name}</span>
                      <span className="fh-critical-score">{v.health}%</span>
                    </div>
                    <div className="fh-critical-comp">
                      <div className="fh-cc-top">
                        <span>{componentName}</span>
                        <span className="fh-days-warn" style={{ fontSize: '10px', color: '#94a3b8' }}>Error: {v.reconsError.toFixed(2)}</span>
                      </div>
                      <div className="fh-health-bar-wrap">
                        <div className="fh-health-bar" style={{ width: `${v.health}%`, background: '#ef4444' }} />
                      </div>
                      {v.rootCause && (
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                          {v.rootCause} · {v.component}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
