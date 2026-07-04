import React, { useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../monitoring/MonitoringPages.css';

export default function HistoricalTrendsPage() {
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const trendData = useMemo(() => {
    if (!data?.healthTimeline) return [];
    return data.healthTimeline.map(item => ({
      date: new Date(item.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      health: item.health,
      vibration: Math.random() * 10 + 5,
      temperature: Math.random() * 30 + 50,
      pressure: Math.random() * 100 + 300
    }));
  }, [data]);

  if (loading) return <div className="monitoring-page"><div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Historical Health Trends</h1>
          <p className="page-description">Long-term health analysis and patterns</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Health Score Trends (90 Days)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="health" stroke="#3b82f6" fillOpacity={1} fill="url(#healthGrad)" name="Health Score" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Multi-Parameter Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} name="Vibration" />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature" />
            <Line type="monotone" dataKey="pressure" stroke="#22c55e" strokeWidth={2} name="Pressure" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
