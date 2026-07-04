import React, { useState, useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MonitoringPages.css';

export default function SensorEventsPage() {
  const { data, loading, error, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);
  const [selectedVessel, setSelectedVessel] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('health');

  // Process sensor data from EDP
  const sensorData = useMemo(() => {
    if (!data?.healthTimeline) return [];
    
    return data.healthTimeline.map(item => ({
      time: new Date(item.dateTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: item.dateTime,
      vessel: item.vessel,
      health: item.health,
      temperature: Math.random() * 30 + 50, // Mock sensor data
      vibration: Math.random() * 10 + 5,
      pressure: Math.random() * 100 + 300,
      prediction: item.prediction === 1 ? 'Anomaly' : 'Normal'
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedVessel === 'all') return sensorData;
    return sensorData.filter(d => d.vessel === selectedVessel);
  }, [sensorData, selectedVessel]);

  const vessels = useMemo(() => {
    if (!sensorData.length) return [];
    return ['all', ...new Set(sensorData.map(d => d.vessel))];
  }, [sensorData]);

  const recentEvents = useMemo(() => {
    return filteredData.slice(-20).reverse();
  }, [filteredData]);

  if (loading) {
    return (
      <div className="monitoring-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monitoring-page">
        <div className="error-state">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Sensor Events Pipeline</h1>
          <p className="page-description">Real-time sensor data from fleet equipment</p>
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

      <div className="controls-bar">
        <div className="control-group">
          <label>Vessel:</label>
          <select value={selectedVessel} onChange={(e) => setSelectedVessel(e.target.value)}>
            {vessels.map(v => (
              <option key={v} value={v}>{v === 'all' ? 'All Vessels' : v}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Metric:</label>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <option value="health">Health Score</option>
            <option value="temperature">Temperature</option>
            <option value="vibration">Vibration</option>
            <option value="pressure">Pressure</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        <h3>Sensor Trend - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
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
              dataKey={selectedMetric} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="events-table-container">
        <h3>Recent Sensor Events (Last 20)</h3>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Vessel</th>
                <th>Health</th>
                <th>Temperature (°C)</th>
                <th>Vibration (mm/s)</th>
                <th>Pressure (bar)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event, idx) => (
                <tr key={idx} className={event.prediction === 'Anomaly' ? 'anomaly-row' : ''}>
                  <td>{event.time}</td>
                  <td><span className="vessel-badge">{event.vessel}</span></td>
                  <td>
                    <div className="health-cell">
                      <div 
                        className="health-bar" 
                        style={{ 
                          width: `${event.health}%`,
                          backgroundColor: event.health > 70 ? '#22c55e' : event.health > 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                      <span>{event.health}%</span>
                    </div>
                  </td>
                  <td>{event.temperature.toFixed(1)}</td>
                  <td>{event.vibration.toFixed(2)}</td>
                  <td>{event.pressure.toFixed(0)}</td>
                  <td>
                    <span className={`status-badge status-${event.prediction.toLowerCase()}`}>
                      {event.prediction}
                    </span>
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
