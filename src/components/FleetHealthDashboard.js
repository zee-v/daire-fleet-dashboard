import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import './FleetHealthDashboard.css';

const HEALTH_TREND = [
  { label: 'Feb 06', value: 88 },
  { label: 'Feb 13', value: 82 },
  { label: 'Feb 20', value: 78 },
  { label: 'Feb 27', value: 74 },
  { label: 'Mar 06', value: 68 },
  { label: 'Mar 13', value: 62 },
  { label: 'Mar 20', value: 55 },
  { label: 'Mar 27', value: 46 },
  { label: 'Apr 03', value: 38 },
  { label: 'Apr 05', value: 30 },
];

const SPARKLINE_DATA = [
  { v: 3 }, { v: 5 }, { v: 2 }, { v: 7 }, { v: 4 },
  { v: 6 }, { v: 8 }, { v: 5 }, { v: 9 }, { v: 6 },
];

function StatCard({ icon, label, value, unit, sub, iconColor, badge }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color: iconColor }}>
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-value">
          {value}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        <div className="stat-label">{label}</div>
      </div>
      {badge && <span className={`stat-badge stat-badge--${badge.type}`}>{badge.label}</span>}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, value } = props;
  if (value === undefined) return null;
  const color = value > 65 ? '#22c55e' : value > 45 ? '#f59e0b' : '#ef4444';
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0f172a" strokeWidth={2} />;
}

const VESSEL_CONTEXT = {
  vessel: 'Vessel A',
  component: 'Engine System',
  healthScore: 30,
  daysToFailure: 7,
  confidence: 85,
  risk: 'Critical',
  recommendation: 'Schedule immediate cooling system inspection and flush. High thermal stress detected — risk of catastrophic failure within 7 days.',
};

export default function FleetHealthDashboard({ onReschedule }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData({
        summary: { healthyAssets: 78, activeAlerts: 18, alertsCritical: 5, avgDaysToFailure: 8.2 },
        prediction: { estimatedDays: 7, confidence: 85, estimatedAccuracy: 80 },
      });
    }, 300);
  }, []);

  const handleReschedule = () => onReschedule && onReschedule(VESSEL_CONTEXT);

  return (
    <div className="fhd-panel">
      {/* Header */}
      <div className="fhd-header">
        <h2 className="fhd-title">Fleet Health Dashboard</h2>
        <div className="fhd-header-actions">
          <button className="hdr-btn">🔔</button>
          <button className="hdr-btn">⚙</button>
          <div className="avatar">
            <div className="avatar-img">JD</div>
            <span className="avatar-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <StatCard
          icon="✓"
          label="Healthy Assets"
          value="78%"
          iconColor="#22c55e"
        />
        <StatCard
          icon="⚠"
          label="Active Alerts"
          value="18"
          iconColor="#f59e0b"
          badge={{ type: 'warning', label: '▲' }}
        />
        <StatCard
          icon="🔴"
          label="Critical Alerts"
          value="5"
          iconColor="#ef4444"
          badge={{ type: 'critical', label: '▲' }}
        />
        <StatCard
          icon="◈"
          label="Avg. Days to Failure"
          value="8.2"
          unit=" days"
          iconColor="#60a5fa"
          badge={{ type: 'info', label: '▴' }}
        />
      </div>

      {/* Health Trend Chart */}
      <div className="card trend-card">
        <div className="card-header">
          <span className="card-title">Health Trend – Vessel A (Engine System)</span>
        </div>
        <div className="trend-legend">
          <span className="legend-dot legend-healthy" /> Healthy
          <span className="legend-dot legend-warning" /> Warning
          <span className="legend-dot legend-critical" /> Critical
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={HEALTH_TREND} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1e3a5a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[20, 40, 60, 80, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={65} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-row">
        {/* Alerts Summary */}
        <div className="card alerts-card">
          <div className="card-title mb-8">Alerts Summary</div>
          <div className="alerts-meta">
            <div className="alerts-col">
              <div className="alerts-meta-label">Total Alerts</div>
              <div className="alerts-meta-value">
                <span className="alerts-check">✓</span> 12
              </div>
            </div>
            <div className="alerts-col">
              <div className="alerts-meta-label">Last alert</div>
              <div className="alerts-meta-value">12 Mar 2024</div>
            </div>
            <div className="alerts-col">
              <div className="alerts-meta-label">Trend</div>
              <div className="alerts-meta-value trend-up">▲ Up 5%</div>
            </div>
          </div>
          <div className="alerts-sparkline-label">Alert Frequency Trend</div>
          <div className="sparkline-wrap">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={SPARKLINE_DATA} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#3b82f6"
                  fill="#1e3a5a"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Indicators */}
          <div className="card-title mt-12 mb-8">Key Indicators</div>
          <div className="key-indicators">
            <div className="ki-row">
              <span className="ki-icon ki-fire">🔥</span>
              <span className="ki-label">Temperature Spike</span>
              <span className="ki-arrows">
                <span className="ki-arrow up">▲</span>
                <span className="ki-pct">7%</span>
              </span>
            </div>
            <div className="ki-row">
              <span className="ki-icon ki-vibe">〜</span>
              <span className="ki-label">Vibration Anomaly</span>
              <span className="ki-arrows">
                <span className="ki-arrow up">▲</span>
                <span className="ki-pct">7%</span>
              </span>
            </div>
            <div className="ki-row">
              <span className="ki-icon ki-pres">◬</span>
              <span className="ki-label">Pressure Fluctuation</span>
              <span className="ki-arrows">
                <span className="ki-arrow up">▲</span>
                <span className="ki-pct">8%</span>
              </span>
            </div>
          </div>

          {/* Prediction (bottom) */}
          <div className="card-title mt-12 mb-8">Prediction</div>
          <div className="pred-bottom">
            <div className="pred-row">
              <span className="pred-label">Estimated days to failure:</span>
              <span className="pred-val">7 days.</span>
            </div>
            <div className="pred-row">
              <span className="pred-label">Confidence:</span>
              <span className="pred-val">85%</span>
            </div>
          </div>
        </div>

        {/* Prediction card */}
        <div className="card prediction-card">
          <div className="pred-header">
            <span className="card-title">Prediction</span>
            <span className="pred-badge">Est: 80%</span>
          </div>

          <div className="pred-days-row">
            <span className="pred-estimated">Estimated</span>
            <span className="pred-days">7 days</span>
            <span className="pred-chevron">⌄</span>
          </div>

          <div className="pred-confidence">
            <span className="pred-conf-label">Confidence:</span>
            <span className="pred-conf-val"> 85%</span>
          </div>

          <div className="pred-bar-wrap">
            <div className="pred-bar">
              <div className="pred-bar-fill" style={{ width: '85%' }} />
            </div>
          </div>

          <button className="btn btn-primary mt-12" onClick={handleReschedule}>Reschedule Maintenance</button>

          <div className="recommendation-block mt-12">
            <div className="rec-icon">🔴</div>
            <div className="rec-body">
              <div className="rec-label">Recommendation:</div>
              <div className="rec-text">High risk of failure detected.</div>
            </div>
          </div>

          <div className="suggested-block mt-8">
            <div className="sug-icon">📋</div>
            <div className="sug-body">
              <div className="sug-label">Suggested Action</div>
              <div className="sug-text">Schedule immediate maintenance to prevent system failure</div>
            </div>
          </div>

          <button className="btn btn-primary mt-8" onClick={handleReschedule}>Reschedule Maintenance</button>

          <div className="ignore-row mt-8">
            <button className="btn-link">Ignore</button>
            <span className="divider">/</span>
            <button className="btn-link">Monitor</button>
          </div>
        </div>
      </div>
    </div>
  );
}
