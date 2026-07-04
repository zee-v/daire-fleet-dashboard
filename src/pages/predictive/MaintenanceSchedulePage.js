import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import '../monitoring/MonitoringPages.css';

export default function MaintenanceSchedulePage() {
  const navigate = useNavigate();
  const { data, loading, lastUpdated } = useRealtimeData('/api/edp/dashboard', 30000);

  const maintenance = useMemo(() => [
    { id: 1, vessel: 'Tail 2', component: 'Engine System', priority: 'critical', scheduledDate: '2026-07-05', status: 'pending', estimatedHours: 8 },
    { id: 2, vessel: 'Tail 1', component: 'Cooling System', priority: 'critical', scheduledDate: '2026-07-06', status: 'scheduled', estimatedHours: 6 },
    { id: 3, vessel: 'Tail 6', component: 'Electrical System', priority: 'medium', scheduledDate: '2026-07-10', status: 'scheduled', estimatedHours: 4 },
    { id: 4, vessel: 'Tail 4', component: 'Hydraulic System', priority: 'medium', scheduledDate: '2026-07-12', status: 'scheduled', estimatedHours: 5 },
    { id: 5, vessel: 'Tail 9', component: 'Navigation System', priority: 'low', scheduledDate: '2026-07-15', status: 'planned', estimatedHours: 3 }
  ], [data]);

  if (loading) return <div className="monitoring-page"><div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Maintenance Schedule & Recommendations</h1>
          <p className="page-description">Predictive maintenance planning and scheduling</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>!</div>
          <div className="kpi-title">Urgent Maintenance</div>
          <div className="kpi-value">{maintenance.filter(m => m.priority === 'critical').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📅</div>
          <div className="kpi-title">Scheduled This Week</div>
          <div className="kpi-value">{maintenance.filter(m => m.status === 'scheduled').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>⏱</div>
          <div className="kpi-title">Estimated Hours</div>
          <div className="kpi-value">{maintenance.reduce((sum, m) => sum + m.estimatedHours, 0)}h</div>
        </div>
      </div>

      <div className="events-table-container">
        <h3>Maintenance Schedule</h3>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Vessel</th>
                <th>Component</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Est. Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className={`status-badge status-${item.priority === 'critical' ? 'anomaly' : item.priority === 'medium' ? 'warning' : 'normal'}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </td>
                  <td><span className="vessel-badge">{item.vessel}</span></td>
                  <td>{item.component}</td>
                  <td>{item.scheduledDate}</td>
                  <td>{item.status}</td>
                  <td>{item.estimatedHours}h</td>
                  <td>
                    <button 
                      style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                      onClick={() => navigate('/maintenance-actions', {
                        state: {
                          vesselName: item.vessel,
                          systemName: item.component,
                          issue: `${item.priority.toUpperCase()} maintenance required`,
                          healthScore: item.priority === 'critical' ? 35 : item.priority === 'medium' ? 55 : 75,
                          recommendation: `Schedule ${item.component} maintenance`,
                        }
                      })}
                    >
                      Reschedule
                    </button>
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
