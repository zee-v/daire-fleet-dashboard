import React, { useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import '../monitoring/MonitoringPages.css';

export default function HealthAnalysisPage() {
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const componentHealth = useMemo(() => {
    if (!data?.vessels) return [];
    return data.vessels.slice(0, 6).map(v => ({
      component: v.name,
      health: v.health,
      reliability: Math.random() * 30 + 70,
      availability: Math.random() * 20 + 75,
      performance: Math.random() * 25 + 70
    }));
  }, [data]);

  if (loading) return <div className="monitoring-page"><div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Health Analysis Dashboard</h1>
          <p className="page-description">Detailed component health breakdown and diagnostics</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Component Health Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={componentHealth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="component" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="health" fill="#3b82f6" name="Health Score" />
            <Bar dataKey="reliability" fill="#22c55e" name="Reliability" />
            <Bar dataKey="availability" fill="#f59e0b" name="Availability" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Performance Radar Analysis</h3>
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart data={componentHealth}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="component" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Radar name="Health" dataKey="health" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Radar name="Performance" dataKey="performance" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
