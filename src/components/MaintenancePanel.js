import React, { useState } from 'react';
import './MaintenancePanel.css';

const CORRECTIVE_ACTIONS = [
  {
    vessel: 'Vessel A',
    component: 'Engine',
    issue: 'Overheating',
    severity: 'critical',
    priority: 'Critical',
    recommendedAction: 'Inspect and flush cooling system',
  },
  {
    vessel: 'Vessel B',
    component: 'Pump',
    issue: 'Excessive Vibration',
    severity: 'warning',
    priority: 'Warning',
    recommendedAction: 'Check bearing alignment & lubrication',
  },
  {
    vessel: 'Vessel C',
    component: 'Electrical',
    issue: 'Voltage Drop',
    severity: 'warning',
    priority: 'Warning',
    recommendedAction: 'Inspect and replace voltage regulator',
  },
  {
    vessel: 'Vessel D',
    component: 'Cooling',
    issue: 'Flow Inefficiency',
    severity: 'informational',
    priority: 'Informational',
    recommendedAction: 'Replace circulation pump impeller',
  },
];

const SCHEDULE_WEEKS = ['Now', '11 Mar', '18 Mar', '25 Mar', '1 Apr', '8 Apr', '15 Apr', '22 Apr', '29 Apr'];
const SLOTS = 9;

const SCHEDULE = [
  {
    vessel: 'Vessel A',
    tasks: [{ label: 'Engine Maintenance', start: 0, duration: 2, color: '#3b82f6' }],
  },
  {
    vessel: 'Vessel B',
    tasks: [
      { label: 'Fleet Operation', start: 0, duration: 3, color: '#22c55e' },
      { label: 'Engine Maintenance', start: 3, duration: 2, color: '#3b82f6', popup: true },
    ],
  },
  {
    vessel: 'Vessel C',
    tasks: [{ label: '', start: 1, duration: 5, color: '#6366f1' }],
  },
  {
    vessel: 'Vessel D',
    tasks: [
      { label: 'Routine Maintenance', start: 2, duration: 2, color: '#22c55e' },
      { label: 'Dry Dock', start: 5, duration: 2, color: '#f59e0b' },
    ],
  },
];

const SUMMARY = [
  {
    vessel: 'Vessel A',
    action: 'Engine Overhaul – 12 Mar',
    col: 'Revenue Impact',
    colVal: 'Low',
    colClass: 'low',
    icon: '🔧',
  },
  {
    vessel: 'Vessel B',
    action: 'Temporary coverage for Vessel A',
    col: 'Operational Delay',
    colVal: 'None',
    colClass: 'none',
    icon: '⛵',
  },
  {
    vessel: 'Vessel C',
    action: 'Route Adjustment – Port Reroute',
    col: 'Risk Reduction',
    colVal: 'High',
    colClass: 'high',
    icon: '⚠',
  },
  {
    vessel: 'Vessel D',
    action: 'Scheduled Preventive Maintenance',
    col: null,
    colVal: null,
    icon: '✓',
  },
];

const NAV_TABS = ['Fleet Summary', 'Components', 'Fleet Snapshot', 'Fleet Atlantic', 'Fleet Pacific', 'All Fleets'];

// Context data keyed by vessel for the reschedule panel
const VESSEL_RESCHEDULE_CONTEXT = {
  'Vessel A': {
    vessel: 'Vessel A', component: 'Engine System',
    healthScore: 30, daysToFailure: 7, confidence: 85, risk: 'Critical',
    recommendation: 'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
  },
  'Vessel B': {
    vessel: 'Vessel B', component: 'Pump Assembly',
    healthScore: 52, daysToFailure: 18, confidence: 78, risk: 'Warning',
    recommendation: 'Inspect pump bearing alignment and apply lubrication. Monitor vibration levels daily until maintenance completed.',
  },
  'Vessel C': {
    vessel: 'Vessel C', component: 'Electrical System',
    healthScore: 61, daysToFailure: 25, confidence: 72, risk: 'Warning',
    recommendation: 'Inspect voltage regulator and generator output. Check shore-power connectors for corrosion.',
  },
  'Vessel D': {
    vessel: 'Vessel D', component: 'Cooling Circuit',
    healthScore: 74, daysToFailure: 42, confidence: 65, risk: 'Informational',
    recommendation: 'Replace circulation pump impeller during next scheduled dry dock. Continue monitoring coolant flow rate.',
  },
};

function SeverityBadge({ level }) {
  const cls = {
    critical: 'badge--critical',
    warning: 'badge--warning',
    informational: 'badge--meeting',
  }[level] || 'badge--info';
  return <span className={`badge ${cls}`}>{level === 'critical' ? '🔺' : level === 'warning' ? '⚠' : 'ℹ'}</span>;
}

function PriorityBadge({ label, severity }) {
  if (severity === 'critical') return <span className="sesoc-badge sesoc-clip">{label}</span>;
  if (severity === 'warning') return <span className="sesoc-badge sesoc-warning">{label}</span>;
  return <span className="sesoc-badge sesoc-meeting">{label}</span>;
}

function GanttRow({ vessel, tasks }) {
  const [activePopup, setActivePopup] = useState(null);
  const slotWidth = 100 / SLOTS;

  return (
    <div className="gantt-row">
      <div className="gantt-vessel-name">{vessel}</div>
      <div className="gantt-bar-area">
        {tasks.map((task, i) => (
          <div
            key={i}
            className="gantt-task"
            style={{
              left: `${(task.start / SLOTS) * 100}%`,
              width: `${(task.duration / SLOTS) * 100}%`,
              background: task.color,
            }}
            onClick={() => setActivePopup(activePopup === i ? null : i)}
          >
            {task.label && <span className="gantt-task-label">{task.label}</span>}
            {task.popup && activePopup === i && (
              <div className="gantt-popup">
                <div className="popup-title">Engine Maintenance</div>
                <div className="popup-row">
                  <span>🗂</span> Estimated completion: 2 days
                </div>
                <div className="popup-row">
                  <span>🗂</span> Assigned: Service Team 2
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MaintenancePanel({ onReschedule }) {
  const [activeTab, setActiveTab] = useState('Fleet Summary');
  const [expertMode, setExpertMode] = useState('Expert');
  const [matchMode, setMatchMode] = useState('Match');

  const handleRowReschedule = (vesselName) => {
    const ctx = VESSEL_RESCHEDULE_CONTEXT[vesselName];
    if (ctx && onReschedule) onReschedule(ctx);
  };

  const handleAcceptPlan = () => {
    const ctx = VESSEL_RESCHEDULE_CONTEXT['Vessel A'];
    if (onReschedule) onReschedule(ctx);
  };

  return (
    <div className="mp-panel">
      {/* Header */}
      <div className="mp-header">
        <h2 className="mp-title">Maintenance Actions & Fleet Rescheduling</h2>
        <div className="mp-header-right">
          <select
            className="mp-dropdown"
            value={expertMode}
            onChange={(e) => setExpertMode(e.target.value)}
          >
            <option>Expert</option>
            <option>Basic</option>
          </select>
          <button className="hdr-btn">🔔</button>
          <button className="hdr-btn">⚙</button>
          <div className="avatar">
            <div className="avatar-img">JD</div>
            <span className="avatar-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="mp-tabs">
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            className={`mp-tab ${activeTab === tab ? 'mp-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Fleet Summary' && <span className="tab-icon">📋</span>}
            {tab === 'Components' && <span className="tab-icon">🔧</span>}
            {tab === 'Fleet Snapshot' && <span className="tab-icon">📊</span>}
            {tab === 'Fleet Atlantic' && <span className="tab-icon">⬡</span>}
            {tab === 'Fleet Pacific' && <span className="tab-icon">⬡</span>}
            {tab === 'All Fleets' && <span className="tab-icon">⬡</span>}
            {tab}
          </button>
        ))}
      </div>

      <div className="mp-body">
        {/* Corrective Actions */}
        <section className="mp-section">
          <h3 className="section-title">Corrective Actions</h3>
          <div className="table-wrap">
            <table className="ca-table">
              <thead>
                <tr>
                  <th>Vessel</th>
                  <th>Component</th>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Priority</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {CORRECTIVE_ACTIONS.map((row, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? 'row-even' : ''} row-clickable`}
                    onClick={() => handleRowReschedule(row.vessel)}
                    title={`Click to reschedule maintenance for ${row.vessel}`}
                  >
                    <td className="vessel-cell">
                      <span className="vessel-dot" />
                      {row.vessel}
                    </td>
                    <td>
                      <span className="comp-icon">
                        {row.component === 'Engine' ? '⚙' :
                         row.component === 'Pump' ? '💧' :
                         row.component === 'Electrical' ? '⚡' : '❄'}
                      </span>{' '}
                      {row.component}
                    </td>
                    <td>{row.issue}</td>
                    <td>
                      <SeverityBadge level={row.severity} />
                    </td>
                    <td>
                      <PriorityBadge label={row.priority} severity={row.severity} />
                    </td>
                    <td className="action-cell">{row.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rescheduling Planner */}
        <section className="mp-section">
          <div className="section-header">
            <h3 className="section-title">Rescheduling Planner</h3>
            <div className="section-dropdown">
              <select className="mp-dropdown">
                <option>Weekly View</option>
                <option>Bi-Weekly View</option>
                <option>Monthly View</option>
              </select>
            </div>
          </div>

          <div className="gantt-wrap">
            {/* Week headers */}
            <div className="gantt-week-row">
              <div className="gantt-vessel-name gantt-vessel-header" />
              <div className="gantt-bar-area gantt-weeks">
                {SCHEDULE_WEEKS.map((w, i) => (
                  <div key={i} className="gantt-week-cell" style={{ width: `${100 / SLOTS}%` }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt rows */}
            {SCHEDULE.map((row, i) => (
              <GanttRow key={i} vessel={row.vessel} tasks={row.tasks} />
            ))}
          </div>
        </section>

        {/* Fleet Rescheduling Summary */}
        <section className="mp-section">
          <div className="section-header">
            <h3 className="section-title">Fleet Rescheduling Summary</h3>
            <div className="section-actions">
              <select
                className="mp-dropdown"
                value={expertMode}
                onChange={(e) => setExpertMode(e.target.value)}
              >
                <option>Expert</option>
                <option>Basic</option>
              </select>
              <select
                className="mp-dropdown"
                value={matchMode}
                onChange={(e) => setMatchMode(e.target.value)}
              >
                <option>Match</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="impact-header">
            <span className="impact-label">Impact Analysis</span>
            <span className="impact-info">ⓘ ⊕</span>
            <span style={{ flex: 1 }} />
            <span className="impact-col-label">Impact Pasalbe</span>
            <button className="icon-btn">📤</button>
            <button className="icon-btn">📋</button>
          </div>

          <div className="summary-table-wrap">
            {SUMMARY.map((row, i) => (
              <div key={i} className="summary-row">
                <span className="summary-icon">{row.icon}</span>
                <div className="summary-info">
                  <div className="summary-vessel">{row.vessel}</div>
                  <div className="summary-action">{row.action}</div>
                </div>
                <div className="summary-metrics">
                  {row.col && (
                    <>
                      <span className="summary-col-name">{row.col}</span>
                      <span className={`summary-col-val val--${row.colClass}`}>{row.colVal}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-footer">
            <button className="btn btn-outline" onClick={handleAcceptPlan}>Accept Plan</button>
            <button className="btn btn-primary" onClick={handleAcceptPlan}>Healthy Plan</button>
          </div>
        </section>
      </div>
    </div>
  );
}
