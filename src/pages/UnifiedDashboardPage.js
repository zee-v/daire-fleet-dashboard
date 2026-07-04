import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './UnifiedDashboardPage.css';

function UnifiedDashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5002/api/edp/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="unified-dashboard">
      <div className="unified-header">
        <div>
          <h1 className="unified-title">dAIRE Maritime Predictive Maintenance</h1>
          <p className="unified-subtitle">Fleet Overview Dashboard</p>
        </div>
      </div>

      <div className="unified-content">
        <OverviewTab data={dashboardData} loading={loading} navigate={navigate} />
      </div>
    </div>
  );
}

// TAB 1: FLEET OVERVIEW
function OverviewTab({ data, loading, navigate }) {
  if (loading) return <div className="loading-state">Loading fleet data...</div>;
  if (!data) return <div className="error-state">Failed to load data. Check backend server.</div>;

  const stats = [
    { 
      label: 'Total Vessels', 
      value: Object.keys(data.byVessel || {}).length, 
      unit: '', 
      icon: 'V',
      color: '#3b82f6',
      trend: 'Across fleet'
    },
    { 
      label: 'Active Alerts', 
      value: data.kpi?.activeAlerts || 0, 
      unit: '', 
      icon: '!',
      color: '#f59e0b',
      trend: `${data.kpi?.criticalAlerts || 0} critical`
    },
    { 
      label: 'Avg Fleet Health', 
      value: data.kpi?.overallHealth || 0, 
      unit: '%', 
      icon: 'H',
      color: '#22c55e',
      trend: 'Overall status'
    },
    { 
      label: 'Total Events', 
      value: data.fleetTimeline?.length || 0, 
      unit: '', 
      icon: 'E',
      color: '#8b5cf6',
      trend: 'Health readings'
    },
  ];

  const timelineData = (data.fleetTimeline || []).slice(-30).map(point => ({
    time: point?._t ? new Date(point._t).toLocaleDateString() : 'Unknown',
    health: point?.value || 0,
    vessel: point?.label?.split(' · ')?.[1] || 'Unknown'
  }));

  const vesselHealthData = Object.entries(data.byVessel || {}).map(([name, vessel]) => {
    const latestHealth = vessel?.healthTrend?.[vessel.healthTrend.length - 1]?.value || 0;
    return {
      name: name,
      health: latestHealth,
      alerts: vessel?.alerts?.totalAlerts || 0
    };
  }).sort((a, b) => a.health - b.health);

  return (
    <div className="tab-content">
      <div className="kpi-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="kpi-card" style={{ borderTopColor: stat.color }}>
            <div className="kpi-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="kpi-body">
              <div className="kpi-label">{stat.label}</div>
              <div className="kpi-value">
                {stat.value}<span className="kpi-unit">{stat.unit}</span>
              </div>
              <div className="kpi-trend">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-card--full">
          <h3 className="chart-title">Fleet Health Timeline (Last 30 Events)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#22c55e" 
                fill="url(#healthGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card--half">
          <h3 className="chart-title">Vessel Health Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vesselHealthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="health" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card--half">
          <h3 className="chart-title">Vessels Requiring Attention</h3>
          <div className="vessel-list">
            {vesselHealthData.filter(v => v.health < 70 || v.alerts > 0).length > 0 ? (
              vesselHealthData.filter(v => v.health < 70 || v.alerts > 0).map((vessel, idx) => (
                <div key={idx} className="vessel-list-item">
                  <div className="vessel-list-info">
                    <span className="vessel-list-name">{vessel.name}</span>
                    <span className={`vessel-list-status ${vessel.health < 50 ? 'critical' : 'warning'}`}>
                      {vessel.health < 50 ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <div className="vessel-list-metrics">
                    <span className="vessel-metric">Health: {vessel.health}%</span>
                    <span className="vessel-metric">Alerts: {vessel.alerts}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-critical-vessels">
                <p>All vessels operating normally</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn action-btn--primary" onClick={() => navigate('/maintenance-actions')}>
            Schedule Maintenance
          </button>
          <button className="action-btn action-btn--secondary" onClick={() => navigate('/fleet-overview/health-report')}>
            Detailed Health Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnifiedDashboardPage;
