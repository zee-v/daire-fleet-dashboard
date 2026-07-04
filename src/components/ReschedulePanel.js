import React, { useState, useEffect } from 'react';
import './ReschedulePanel.css';

const MAINTENANCE_WINDOWS = [
  { id: 'w1', label: '8 Apr – 10 Apr 2026', available: true, type: 'Scheduled Port Stop' },
  { id: 'w2', label: '15 Apr – 17 Apr 2026', available: true, type: 'Dry Dock Window' },
  { id: 'w3', label: '22 Apr – 25 Apr 2026', available: false, type: 'Emergency Slot' },
];

const TEAMS = [
  'Service Team 1 – Engine Specialists',
  'Service Team 2 – General Maintenance',
  'Port Authority Technical Crew',
  'OEM Support – Engine Division',
  'Contractor: Maritime Services Ltd.',
];

const PRIORITIES = [
  { label: 'Critical – Immediate action required', value: 'critical', color: '#ef4444' },
  { label: 'High – Within 7 days', value: 'high', color: '#f59e0b' },
  { label: 'Medium – Within 30 days', value: 'medium', color: '#60a5fa' },
  { label: 'Low – Routine scheduling', value: 'low', color: '#22c55e' },
];

function RiskBadge({ score }) {
  if (score >= 65) return <span className="rp-risk-badge rp-risk--healthy">Healthy ({score}%)</span>;
  if (score >= 40) return <span className="rp-risk-badge rp-risk--warning">Warning ({score}%)</span>;
  return <span className="rp-risk-badge rp-risk--critical">Critical ({score}%)</span>;
}

export default function ReschedulePanel({ isOpen, onClose, context }) {
  const [selectedWindow, setSelectedWindow] = useState('w1');
  const [selectedTeam, setSelectedTeam] = useState(TEAMS[0]);
  const [selectedPriority, setSelectedPriority] = useState('critical');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [monitoring, setMonitoring] = useState(false);

  // Reset form state when context changes
  useEffect(() => {
    if (context) {
      setSelectedWindow('w1');
      setSelectedTeam(TEAMS[0]);
      setSelectedPriority(context.risk === 'Critical' ? 'critical' : context.risk === 'Warning' ? 'high' : 'medium');
      setNotes('');
      setConfirmed(false);
      setMonitoring(false);
    }
  }, [context?.vessel, context?.component]);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1800);
  };

  const handleMonitor = () => {
    setMonitoring(true);
    setTimeout(() => {
      setMonitoring(false);
      onClose();
    }, 1500);
  };

  const activePriority = PRIORITIES.find((p) => p.value === selectedPriority);

  if (!context) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`rp-backdrop ${isOpen ? 'rp-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className={`rp-panel ${isOpen ? 'rp-panel--open' : ''}`}>
        {/* Panel header */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-header-icon">🗓</div>
            <div>
              <h2 className="rp-title">Reschedule Maintenance</h2>
              <p className="rp-subtitle">Configure and confirm the maintenance window</p>
            </div>
          </div>
          <button className="rp-close-btn" onClick={onClose} title="Close panel">
            ✕
          </button>
        </div>

        <div className="rp-body">
          {/* Asset Info */}
          <div className="rp-card">
            <div className="rp-card-label">Selected Asset</div>
            <div className="rp-asset-row">
              <div className="rp-asset-icon">⚙</div>
              <div className="rp-asset-info">
                <div className="rp-asset-vessel">{context.vessel}</div>
                <div className="rp-asset-component">{context.component}</div>
              </div>
              <RiskBadge score={context.healthScore} />
            </div>
          </div>

          {/* Health / Risk Summary */}
          <div className="rp-card">
            <div className="rp-card-label">Health & Risk Summary</div>
            <div className="rp-summary-grid">
              <div className="rp-summary-item">
                <div className="rp-summary-val rp-val--danger">{context.daysToFailure} days</div>
                <div className="rp-summary-key">Est. Days to Failure</div>
              </div>
              <div className="rp-summary-item">
                <div className="rp-summary-val rp-val--info">{context.confidence}%</div>
                <div className="rp-summary-key">Confidence Score</div>
              </div>
              <div className="rp-summary-item">
                <div className={`rp-summary-val rp-val--${context.risk === 'Critical' ? 'danger' : context.risk === 'Warning' ? 'warn' : 'safe'}`}>
                  {context.risk}
                </div>
                <div className="rp-summary-key">Risk Level</div>
              </div>
            </div>
            <div className="rp-conf-bar-wrap">
              <div className="rp-conf-bar-track">
                <div
                  className="rp-conf-bar-fill"
                  style={{ width: `${context.confidence}%` }}
                />
              </div>
              <span className="rp-conf-bar-label">{context.confidence}% prediction confidence</span>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="rp-card rp-rec-card">
            <div className="rp-card-label">Recommended Action</div>
            <div className="rp-rec-body">
              <span className="rp-rec-icon">💡</span>
              <p className="rp-rec-text">{context.recommendation}</p>
            </div>
          </div>

          {/* Maintenance Window Selector */}
          <div className="rp-card">
            <div className="rp-card-label">Suggested Maintenance Windows</div>
            <div className="rp-windows">
              {MAINTENANCE_WINDOWS.map((win) => (
                <button
                  key={win.id}
                  className={`rp-window-btn ${selectedWindow === win.id ? 'rp-window-btn--active' : ''} ${!win.available ? 'rp-window-btn--blocked' : ''}`}
                  onClick={() => win.available && setSelectedWindow(win.id)}
                  disabled={!win.available}
                >
                  <div className="rp-window-date">{win.label}</div>
                  <div className="rp-window-type">
                    {!win.available && <span className="rp-window-unavail">Unavailable · </span>}
                    {win.type}
                  </div>
                  {selectedWindow === win.id && win.available && (
                    <span className="rp-window-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Team & Priority */}
          <div className="rp-card">
            <div className="rp-card-label">Assignment</div>
            <div className="rp-field">
              <label className="rp-field-label">Maintenance Team</label>
              <select
                className="rp-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="rp-field">
              <label className="rp-field-label">Priority</label>
              <select
                className="rp-select"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{ borderColor: activePriority?.color + '55' }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="rp-card">
            <div className="rp-card-label">Notes & Instructions</div>
            <textarea
              className="rp-textarea"
              placeholder="Add notes for the maintenance team, special requirements, access restrictions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary line */}
          <div className="rp-confirmation-summary">
            <span className="rp-cs-icon">📋</span>
            <div className="rp-cs-body">
              <div className="rp-cs-vessel">{context.vessel} · {context.component}</div>
              <div className="rp-cs-detail">
                {MAINTENANCE_WINDOWS.find((w) => w.id === selectedWindow)?.label}
                &nbsp;·&nbsp;{selectedTeam.split(' –')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="rp-footer">
          {confirmed ? (
            <div className="rp-success-msg">
              <span>✓</span> Maintenance rescheduled successfully
            </div>
          ) : monitoring ? (
            <div className="rp-monitor-msg">
              <span>👁</span> Asset marked for monitoring
            </div>
          ) : (
            <>
              <button className="rp-btn rp-btn--primary" onClick={handleConfirm}>
                Confirm Reschedule
              </button>
              <button className="rp-btn rp-btn--outline" onClick={handleMonitor}>
                Monitor Instead
              </button>
              <button className="rp-btn rp-btn--ghost" onClick={onClose}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
