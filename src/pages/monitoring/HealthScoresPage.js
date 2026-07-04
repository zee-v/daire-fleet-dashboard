import React, { useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './MonitoringPages.css';

export default function HealthScoresPage() {
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const vesselHealthData = useMemo(() => {
    if (!data?.vessels) return [];
    return data.vessels.map(v => ({
      name: v.name,
      health: v.health,
      components: v.components || 0,
      alerts: v.alerts,
      status: v.health > 70 ? 'healthy' : v.health > 40 ? 'warning' : 'critical'
    }));
  }, [data]);

  const healthDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20, count: 0, color: '#ef4444' },
      { range: '21-40%', min: 21, max: 40, count: 0, color: '#f97316' },
      { range: '41-60%', min: 41, max: 60, count: 0, color: '#f59e0b' },
      { range: '61-80%', min: 61, max: 80, count: 0, color: '#84cc16' },
      { range: '81-100%', min: 81, max: 100, count: 0, color: '#22c55e' }
    ];
    
    vesselHealthData.forEach(v => {
      const bucket = ranges.find(r => v.health >= r.min && v.health <= r.max);
      if (bucket) bucket.count++;
    });
    
    return ranges;
  }, [vesselHealthData]);

  const avgHealth = useMemo(() => {
    if (!vesselHealthData.length) return 0;
    return Math.round(vesselHealthData.reduce((sum, v) => sum + v.health, 0) / vesselHealthData.length);
  }, [vesselHealthData]);

  const criticalVessels = useMemo(() => {
    return vesselHealthData.filter(v => v.health < 50).length;
  }, [vesselHealthData]);

  if (loading) {
    return (
      <div className="monitoring-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading health scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Equipment Health Scores</h1>
          <p className="page-description">Real-time health monitoring across all vessels</p>
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
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              ⚡
            </div>
          </div>
          <div className="kpi-title">Average Fleet Health</div>
          <div className="kpi-value">{avgHealth}%</div>
          <div className="kpi-subtitle">Across {vesselHealthData.length} vessels</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              !
            </div>
          </div>
          <div className="kpi-title">Critical Vessels</div>
          <div className="kpi-value">{criticalVessels}</div>
          <div className="kpi-subtitle">Health below 50%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              ✓
            </div>
          </div>
          <div className="kpi-title">Healthy Vessels</div>
          <div className="kpi-value">{vesselHealthData.filter(v => v.health > 70).length}</div>
          <div className="kpi-subtitle">Health above 70%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              ⚠
            </div>
          </div>
          <div className="kpi-title">Active Alerts</div>
          <div className="kpi-value">{data?.alerts || 0}</div>
          <div className="kpi-subtitle">Requiring attention</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Health Score Distribution</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={healthDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Vessel Health Rankings</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vesselHealthData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={80} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="health" 
              fill="#3b82f6" 
              radius={[0, 8, 8, 0]}
              label={{ position: 'right', fill: '#94a3b8' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="events-table-container">
        <h3>Vessel Health Details</h3>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Vessel</th>
                <th>Health Score</th>
                <th>Status</th>
                <th>Components</th>
                <th>Active Alerts</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {vesselHealthData.map((vessel, idx) => (
                <tr key={idx}>
                  <td><span className="vessel-badge">{vessel.name}</span></td>
                  <td>
                    <div className="health-cell">
                      <div 
                        className="health-bar" 
                        style={{ 
                          width: `${vessel.health}%`,
                          backgroundColor: vessel.health > 70 ? '#22c55e' : vessel.health > 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                      <span>{vessel.health}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${vessel.status}`}>
                      {vessel.status}
                    </span>
                  </td>
                  <td>{vessel.components}</td>
                  <td>
                    <span style={{ 
                      color: vessel.alerts > 0 ? '#ef4444' : '#22c55e',
                      fontWeight: 600 
                    }}>
                      {vessel.alerts}
                    </span>
                  </td>
                  <td>
                    {vessel.health < 50 ? (
                      <span style={{ color: '#ef4444' }}>Immediate inspection required</span>
                    ) : vessel.health < 70 ? (
                      <span style={{ color: '#f59e0b' }}>Schedule maintenance</span>
                    ) : (
                      <span style={{ color: '#22c55e' }}>Continue monitoring</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
