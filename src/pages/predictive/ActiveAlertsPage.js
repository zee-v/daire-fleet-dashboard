import React, { useMemo } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import '../monitoring/MonitoringPages.css';

export default function ActiveAlertsPage() {
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const alerts = useMemo(() => {
    if (!data?.alerts) return [];
    // Generate mock alerts from data
    const mockAlerts = [
      { id: 1, vessel: 'Tail 2', severity: 'critical', component: 'Engine System', message: 'Critical health drop detected', time: '2 min ago' },
      { id: 2, vessel: 'Tail 1', severity: 'critical', component: 'Cooling System', message: 'Temperature threshold exceeded', time: '15 min ago' },
      { id: 3, vessel: 'Tail 6', severity: 'warning', component: 'Electrical System', message: 'Voltage fluctuation detected', time: '1 hour ago' },
      { id: 4, vessel: 'Tail 4', severity: 'warning', component: 'Hydraulic System', message: 'Pressure anomaly', time: '2 hours ago' },
      { id: 5, vessel: 'Tail 8', severity: 'info', component: 'Monitoring System', message: 'Scheduled maintenance due', time: '3 hours ago' }
    ];
    return mockAlerts;
  }, [data]);

  if (loading) return <div className="monitoring-page"><div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Active Alerts & Predictions</h1>
          <p className="page-description">AI-powered anomaly detection and alerts</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</div>
          <div className="realtime-indicator"><span className="pulse-dot"></span>Live</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>!</div>
          <div className="kpi-title">Critical Alerts</div>
          <div className="kpi-value">{alerts.filter(a => a.severity === 'critical').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⚠</div>
          <div className="kpi-title">Warning Alerts</div>
          <div className="kpi-value">{alerts.filter(a => a.severity === 'warning').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>i</div>
          <div className="kpi-title">Informational</div>
          <div className="kpi-value">{alerts.filter(a => a.severity === 'info').length}</div>
        </div>
      </div>

      <div className="events-table-container">
        <h3>All Active Alerts</h3>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Vessel</th>
                <th>Component</th>
                <th>Message</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td>
                    <span className={`status-badge status-${alert.severity === 'critical' ? 'anomaly' : alert.severity === 'warning' ? 'warning' : 'normal'}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td><span className="vessel-badge">{alert.vessel}</span></td>
                  <td>{alert.component}</td>
                  <td>{alert.message}</td>
                  <td>{alert.time}</td>
                  <td><button style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
