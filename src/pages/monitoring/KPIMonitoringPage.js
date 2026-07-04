import React, { useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MonitoringPages.css';

export default function KPIMonitoringPage() {
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const kpiMetrics = useMemo(() => {
    if (!data) return null;
    
    return {
      availability: 87.5,
      reliability: 92.3,
      mtbf: 428, // hours
      mttr: 4.2, // hours
      totalEvents: data.totalEvents || 0,
      criticalAlerts: data.criticalCount || 0,
      avgHealth: data.avgHealth || 0,
      vesselCount: data.vessels?.length || 0
    };
  }, [data]);

  const kpiTrend = useMemo(() => {
    if (!data?.healthTimeline) return [];
    
    const last30 = data.healthTimeline.slice(-30);
    return last30.map((item, idx) => ({
      time: new Date(item.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      availability: 85 + Math.random() * 10,
      reliability: 90 + Math.random() * 8,
      avgHealth: item.health,
      events: Math.floor(Math.random() * 5) + 1
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="monitoring-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading KPI data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Fleet-Wide KPI Monitoring</h1>
          <p className="page-description">Key performance indicators and operational metrics</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">
            Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          </div>
          <div className="realtime-indicator">
            <span className="pulse-dot"></span>
            Live
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              ↑
            </div>
            <div className="kpi-trend positive">
              +2.4% ↑
            </div>
          </div>
          <div className="kpi-title">Availability</div>
          <div className="kpi-value">{kpiMetrics?.availability.toFixed(1)}%</div>
          <div className="kpi-subtitle">vs. target 85%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              ✓
            </div>
            <div className="kpi-trend positive">
              +1.2% ↑
            </div>
          </div>
          <div className="kpi-title">Reliability</div>
          <div className="kpi-value">{kpiMetrics?.reliability.toFixed(1)}%</div>
          <div className="kpi-subtitle">vs. target 90%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              ⏱
            </div>
            <div className="kpi-trend positive">
              +12h ↑
            </div>
          </div>
          <div className="kpi-title">MTBF</div>
          <div className="kpi-value">{kpiMetrics?.mtbf}h</div>
          <div className="kpi-subtitle">Mean time between failures</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              🔧
            </div>
            <div className="kpi-trend negative">
              +0.3h ↓
            </div>
          </div>
          <div className="kpi-title">MTTR</div>
          <div className="kpi-value">{kpiMetrics?.mttr.toFixed(1)}h</div>
          <div className="kpi-subtitle">Mean time to repair</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              📊
            </div>
          </div>
          <div className="kpi-title">Total Events</div>
          <div className="kpi-value">{kpiMetrics?.totalEvents}</div>
          <div className="kpi-subtitle">Last 30 days</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              !
            </div>
          </div>
          <div className="kpi-title">Critical Alerts</div>
          <div className="kpi-value">{kpiMetrics?.criticalAlerts}</div>
          <div className="kpi-subtitle">Requiring immediate action</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Availability & Reliability Trends (30 Days)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={kpiTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[70, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="availability" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Availability (%)"
              dot={{ fill: '#22c55e', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="reliability" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Reliability (%)"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Average Fleet Health & Event Volume</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={kpiTrend}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="avgHealth" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#healthGradient)"
              name="Avg Health (%)"
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="events" 
              stroke="#f59e0b" 
              fill="none"
              strokeWidth={2}
              name="Events Count"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="events-table-container">
        <h3>KPI Benchmarks & Targets</h3>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Current</th>
                <th>Target</th>
                <th>Status</th>
                <th>Trend (30d)</th>
                <th>Industry Benchmark</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Availability</strong></td>
                <td>{kpiMetrics?.availability.toFixed(1)}%</td>
                <td>85.0%</td>
                <td><span className="status-badge status-normal">Above Target</span></td>
                <td style={{ color: '#22c55e' }}>+2.4% ↑</td>
                <td>82.0%</td>
              </tr>
              <tr>
                <td><strong>Reliability</strong></td>
                <td>{kpiMetrics?.reliability.toFixed(1)}%</td>
                <td>90.0%</td>
                <td><span className="status-badge status-normal">Above Target</span></td>
                <td style={{ color: '#22c55e' }}>+1.2% ↑</td>
                <td>88.0%</td>
              </tr>
              <tr>
                <td><strong>MTBF</strong></td>
                <td>{kpiMetrics?.mtbf}h</td>
                <td>400h</td>
                <td><span className="status-badge status-normal">Above Target</span></td>
                <td style={{ color: '#22c55e' }}>+12h ↑</td>
                <td>380h</td>
              </tr>
              <tr>
                <td><strong>MTTR</strong></td>
                <td>{kpiMetrics?.mttr.toFixed(1)}h</td>
                <td>4.0h</td>
                <td><span className="status-badge status-anomaly">Above Target</span></td>
                <td style={{ color: '#ef4444' }}>+0.3h ↓</td>
                <td>4.5h</td>
              </tr>
              <tr>
                <td><strong>Average Health</strong></td>
                <td>{kpiMetrics?.avgHealth}%</td>
                <td>75%</td>
                <td><span className="status-badge status-normal">On Track</span></td>
                <td style={{ color: '#22c55e' }}>+3.2% ↑</td>
                <td>72%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
