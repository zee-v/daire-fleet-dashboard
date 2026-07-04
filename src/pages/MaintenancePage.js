import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMaintenanceData } from '../services/dashboardService';
import { useSelection } from '../context/SelectionContext';
import './MaintenancePage.css';

/* ── helpers ───────────────────────────────────────────── */

function deriveRisk(healthScore) {
  if (healthScore < 40) return 'critical';
  if (healthScore < 65) return 'warning';
  return 'informational';
}

/**
 * Convert new task shape { weekIdx, slotId, span } into renderable slot cells.
 * @param {object[]} tasks
 * @param {number}   weekCount  total columns (= SCHEDULE_WEEKS.length)
 * @param {object[]} slotDefs   SCHEDULE_SLOTS for color/label lookup
 */
function buildSlots(tasks, weekCount, slotDefs) {
  const slots = [];
  const sorted = [...tasks].sort((a, b) => a.weekIdx - b.weekIdx);
  let cursor = 0;
  for (const task of sorted) {
    if (cursor < task.weekIdx) {
      slots.push({ key: `gap-${cursor}`, empty: true, span: task.weekIdx - cursor });
    }
    const def = slotDefs.find((s) => s.id === task.slotId) || {};
    slots.push({
      key: `task-${task.weekIdx}`,
      empty: false,
      color: def.color || '#2563eb',
      label: def.label || task.slotId,
      span: task.span,
    });
    cursor = task.weekIdx + task.span;
  }
  if (cursor < weekCount) {
    slots.push({ key: 'end-gap', empty: true, span: weekCount - cursor });
  }
  return slots;
}

/* ── Gantt chart ───────────────────────────────────────── */

function GanttRow({ row, weekCount, slotDefs }) {
  const slots = buildSlots(row.tasks, weekCount, slotDefs);
  return (
    <div className="gantt-row">
      <div className="gantt-vessel-label">{row.vessel}</div>
      <div className="gantt-cells">
        {slots.map((s) =>
          s.empty ? (
            <div key={s.key} className="gantt-empty" style={{ gridColumn: `span ${s.span}` }} />
          ) : (
            <div
              key={s.key}
              className="gantt-task"
              style={{ background: s.color, gridColumn: `span ${s.span}` }}
              title={s.label}
            >
              <span className="gantt-task-label">{s.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function GanttChart({ schedule, scheduleWeeks, scheduleSlots }) {
  return (
    <div className="gantt-container">
      {/* Week headers */}
      <div className="gantt-header-row">
        <div className="gantt-vessel-label gantt-header-vessel">Vessel</div>
        <div className="gantt-cells">
          {scheduleWeeks.map((w, i) => (
            <div key={i} className="gantt-week-label">{w}</div>
          ))}
        </div>
      </div>
      {/* Vessel rows */}
      {schedule.map((row) => (
        <GanttRow
          key={row.vessel}
          row={row}
          weekCount={scheduleWeeks.length}
          slotDefs={scheduleSlots}
        />
      ))}
    </div>
  );
}

/* ── Severity badge ────────────────────────────────────── */

function SeverityBadge({ severity }) {
  return (
    <span className={`mp-badge mp-badge--${severity}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

/* ── Health bar ────────────────────────────────────────── */

function HealthBar({ score, status }) {
  const barColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e';
  return (
    <div className="mp-health-bar-wrap">
      <div className="mp-health-bar" style={{ width: `${score}%`, background: barColor }} />
    </div>
  );
}

/* ── page component ────────────────────────────────────── */

export default function MaintenancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardData } = useSelection();

  // Context banner: prefer router state (passed from Fleet Health "Reschedule" button),
  // fall back to currently selected component from context.
  const ctx = location.state || {
    fleetName:   dashboardData.fleet?.name ?? '',
    vesselName:  dashboardData.vessel?.name ?? 'Select Vessel',
    systemName:  (dashboardData.component?.name || dashboardData.system?.name) ?? 'Component',
    issue:       dashboardData.system?.issue ?? 'Anomaly Detected',
    healthScore: dashboardData.system?.healthScore ?? 0,
    daysToFailure: dashboardData.system?.daysToFailure ?? null,
    recommendation: dashboardData.system?.recommendation ?? 'Schedule inspection',
  };

  const ctxRisk = deriveRisk(ctx.healthScore ?? 0);

  const {
    correctiveActions,
    schedule,
    scheduleWeeks,
    scheduleSlots,
    maintenanceWindows,
    maintenanceTeams,
    priorities,
    impactSummary,
  } = getMaintenanceData();

  const [selectedTeam, setSelectedTeam] = useState(maintenanceTeams[0]?.id ?? '');
  const [selectedWindow, setSelectedWindow] = useState(maintenanceWindows[0]?.id ?? '');
  const [selectedPriority, setSelectedPriority] = useState(priorities[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigate('/fleet-health'), 1800);
  };

  return (
    <div className="mp-page">
      {/* ── Header ── */}
      <div className="mp-header">
        <div className="mp-header-left">
          <button className="mp-back-btn" onClick={() => navigate('/fleet-health')}>
            ← Fleet Health
          </button>
          <div className="mp-breadcrumb">dAIRE / Fleet Overview / Maintenance Actions</div>
          <h2 className="mp-title">
            Maintenance Actions &amp; Fleet Scheduling
            <span className="mp-next-phase-pill" style={{ marginLeft: '12px' }}>Next phase</span>
          </h2>
        </div>
        <div className="mp-header-right">
          <button className="mp-hdr-btn">🔔</button>
          <button className="mp-hdr-btn">⚙</button>
          <div className="mp-avatar">JD</div>
        </div>
      </div>

      {/* ── Page Explanation Banner ── */}
      <div className="mp-page-explanation">
        <div className="mp-explain-icon">ℹ️</div>
        <div className="mp-explain-content">
          <strong>How This Page Works:</strong> This page has three connected sections:
          <ul>
            <li><strong>Corrective Actions</strong> - View all pending maintenance items across the fleet</li>
            <li><strong>Fleet Scheduling Planner</strong> - Visual timeline of when maintenance is scheduled</li>
            <li><strong>Maintenance Assignment</strong> (right panel) - Assign team, window, and priority for the issue shown in the banner above</li>
          </ul>
          <em>Next Phase: When you confirm an assignment, it will automatically add to Corrective Actions and update the Gantt chart.</em>
        </div>
      </div>

      {/* ── Context banner ── */}
      <div className={`mp-context-banner mp-context--${ctxRisk}`}>
        <div className="mp-ctx-left">
          <div className="mp-ctx-row1">
            <SeverityBadge severity={ctxRisk} />
            <span className="mp-ctx-vessel">{ctx.vesselName}</span>
            <span className="mp-ctx-sep">›</span>
            <span className="mp-ctx-comp">{ctx.systemName}</span>
            <span className="mp-ctx-fleet">({ctx.fleetName})</span>
          </div>
          <div className="mp-ctx-row2">
            {ctx.issue && <span className="mp-ctx-issue">Issue: {ctx.issue}</span>}
            {ctx.daysToFailure != null && (
              <span className="mp-ctx-stat">
                <span className="mp-ctx-stat-label">Days to Failure</span>
                <span className={`mp-ctx-stat-val mp-stat--${ctxRisk}`}>{ctx.daysToFailure}d</span>
              </span>
            )}
            <span className="mp-ctx-stat">
              <span className="mp-ctx-stat-label">Health Score</span>
              <span className="mp-ctx-stat-val">{ctx.healthScore}%</span>
            </span>
          </div>
          {ctx.recommendation && (
            <div className="mp-ctx-rec">{ctx.recommendation}</div>
          )}
        </div>
        <div className="mp-ctx-right">
          <HealthBar score={ctx.healthScore} status={ctxRisk} />
          <div className="mp-ctx-score-label">{ctx.healthScore}% Health</div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="mp-body">
        
        {/* Two-column responsive layout */}
        <div className="mp-two-column-layout">
          
          {/* Left Column: Maintenance Assignment */}
          <div className="mp-left-column">
            <div className="mp-assignment-section">
          <div className="mp-card">
            <div className="mp-card-title">
              Maintenance Assignment
              <span className="mp-next-phase-pill">Next phase</span>
            </div>
            <div className="mp-info-note mb-12">
              🔧 <strong>Purpose:</strong> Assign team, schedule window, and set priority for the issue shown in the banner above. Once confirmed, this will add a new row to Corrective Actions and update the Gantt chart.
            </div>
            <div className="mp-context-reminder">
              <strong>Scheduling for:</strong> {ctx.vesselName} › {ctx.systemName}
            </div>

            <div className="mp-assignment-grid">
              <div className="mp-assignment-col">
                <label className="mp-field-label">Assign Team</label>
                <select
                  className="mp-select"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  {maintenanceTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.specialisation}</option>
                  ))}
                </select>

                <label className="mp-field-label mt-10">Maintenance Window</label>
                <div className="mp-window-list">
                  {maintenanceWindows.map((w) => (
                    <label key={w.id} className="mp-window-row">
                      <input
                        type="radio"
                        name="window"
                        value={w.id}
                        checked={selectedWindow === w.id}
                        onChange={() => setSelectedWindow(w.id)}
                      />
                      <div className="mp-window-info">
                        <div className="mp-window-date">{w.label}: {w.start}–{w.end}</div>
                        <div className="mp-window-type">{w.crew} crew members</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mp-assignment-col">
                <label className="mp-field-label">Priority</label>
                <div className="mp-priority-list">
                  {priorities.map((p) => (
                    <label key={p.id} className="mp-priority-row">
                      <input
                        type="radio"
                        name="priority"
                        value={p.id}
                        checked={selectedPriority === p.id}
                        onChange={() => setSelectedPriority(p.id)}
                      />
                      <span className="mp-priority-dot" style={{ background: p.color }} />
                      <span className="mp-priority-label">{p.label}</span>
                    </label>
                  ))}
                </div>

                <label className="mp-field-label mt-10">Notes / Special Instructions</label>
                <textarea
                  className="mp-textarea"
                  rows={3}
                  placeholder="Add maintenance notes, part numbers, or special instructions…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="mp-assignment-col">
                {/* Impact Summary - moved here */}
                <div className="mp-card-title" style={{ marginBottom: '10px' }}>
                  Scheduling Impact Summary
                  <span className="mp-next-phase-pill">Next phase</span>
                </div>
                <div className="mp-info-note mb-12" style={{ fontSize: '10px', padding: '6px 10px' }}>
                  📊 Shows the impact of scheduling this maintenance on fleet operations.
                </div>
                <div className="mp-impact-grid">
                  <div className="mp-impact-stat-compact">
                    <div className="mp-impact-stat-val">{impactSummary.totalAffectedVessels}</div>
                    <div className="mp-impact-stat-label">Affected Vessels</div>
                  </div>
                  <div className="mp-impact-stat-compact">
                    <div className="mp-impact-stat-val">{impactSummary.estimatedDowntimeDays}d</div>
                    <div className="mp-impact-stat-label">Est. Downtime</div>
                  </div>
                  <div className="mp-impact-stat-compact">
                    <div className="mp-impact-stat-val">{impactSummary.estimatedCostImpact}</div>
                    <div className="mp-impact-stat-label">Cost Impact</div>
                  </div>
                  <div className="mp-impact-stat-compact">
                    <div className={`mp-impact-stat-val mp-stat--${impactSummary.riskLevel.toLowerCase()}`}>
                      {impactSummary.riskLevel}
                    </div>
                    <div className="mp-impact-stat-label">Risk Level</div>
                  </div>
                </div>
              </div>
            </div>

            {confirmed ? (
              <div className="mp-confirmed">
                <span className="mp-confirmed-icon">✓</span> Maintenance Rescheduled (Demo)
              </div>
            ) : (
              <>
                <div className="mp-workflow-note">
                  <strong>🔄 Workflow (Next Phase):</strong><br/>
                  When you click "Confirm Reschedule", the system will:<br/>
                  • Add a new row to Corrective Actions table<br/>
                  • Update Fleet Scheduling Planner timeline<br/>
                  • Send notifications to assigned team<br/>
                  <em>Currently shows demo confirmation only.</em>
                </div>
                <div className="mp-assignment-btns">
                  <button className="mp-btn mp-btn--primary" onClick={handleConfirm}>
                    Confirm Reschedule
                  </button>
                  <button className="mp-btn mp-btn--secondary">Save Draft</button>
                  <button className="mp-btn mp-btn--ghost" onClick={() => navigate('/fleet-health')}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Right Column: Corrective Actions + Fleet Scheduling */}
        <div className="mp-right-column">

            {/* Corrective Actions table */}
            <div className="mp-section">
            <div className="mp-section-header">
              <span className="mp-section-title">
                Corrective Actions
                <span className="mp-next-phase-pill">Next phase</span>
              </span>
              <span className="mp-section-sub">
                {correctiveActions.length} items requiring attention (Mock Data)
              </span>
            </div>
            <div className="mp-info-note">
              📋 <strong>Purpose:</strong> Lists all maintenance items requiring attention across the fleet. Shows existing work items and their status.
            </div>
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Vessel</th>
                    <th>System</th>
                    <th>Issue / Title</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Team</th>
                    <th>Est. Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {correctiveActions.map((action) => (
                    <tr key={action.id} className={`mp-tr mp-tr--${action.priority}`}>
                      <td className="mp-td-vessel">
                        <div className="mp-vessel-name">{action.vesselName}</div>
                      </td>
                      <td>{action.systemName}</td>
                      <td className="mp-td-issue">{action.title}</td>
                      <td><SeverityBadge severity={action.priority} /></td>
                      <td>
                        <span className={`mp-days mp-days--${action.priority}`}>
                          {action.dueDate}
                        </span>
                      </td>
                      <td>{maintenanceTeams.find((t) => t.id === action.assignedTeam)?.name ?? action.assignedTeam}</td>
                      <td>{action.estimatedHours}h</td>
                      <td>
                        <span className={`mp-badge mp-badge--${action.status === 'overdue' ? 'critical' : action.status === 'pending' ? 'warning' : 'healthy'}`}>
                          {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fleet Scheduling Gantt */}
          <div className="mp-section">
            <div className="mp-section-header">
              <span className="mp-section-title">
                Fleet Scheduling Planner
                <span className="mp-next-phase-pill">Next phase</span>
              </span>
              <div className="mp-gantt-legend">
                {scheduleSlots.map((s) => (
                  <span key={s.id} className="mp-gantt-leg">
                    <span className="mp-gantt-dot" style={{ background: s.color }} />{s.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mp-info-note">
              📅 <strong>Purpose:</strong> Visual timeline showing when maintenance is scheduled for each vessel. Updates when new assignments are confirmed.
            </div>
            <GanttChart
              schedule={schedule}
              scheduleWeeks={scheduleWeeks}
              scheduleSlots={scheduleSlots}
            />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
