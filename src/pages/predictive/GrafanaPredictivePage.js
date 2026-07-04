import React from 'react';
import GrafanaEmbed from '../../components/GrafanaEmbed';
import '../monitoring/MonitoringPages.css';

export default function GrafanaPredictivePage() {
  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Predictive Maintenance Grafana Dashboards</h1>
          <p className="page-description">AI-powered predictions and maintenance recommendations</p>
        </div>
      </div>

      <div className="grafana-grid-full">
        <GrafanaEmbed
          dashboard="daire-pred-alerts-001"
          title="Active Alerts & Predictions"
          height="500px"
          params={{
            from: 'now-24h',
            to: 'now',
            refresh: '30s'
          }}
        />

        <GrafanaEmbed
          dashboard="daire-maint-001"
          title="Maintenance Schedule & Recommendations"
          height="500px"
          params={{
            from: 'now-7d',
            to: 'now+7d',
            refresh: '1m'
          }}
        />
      </div>

      <div className="alert-summary">
        <h3 className="section-title">Alert Summary</h3>
        <div className="alert-cards">
          <div className="alert-card alert-card--critical">
            <div className="alert-card-header">
              <span className="alert-card-icon">!</span>
              <span className="alert-card-title">Critical Alerts</span>
            </div>
            <div className="alert-card-count">3</div>
            <div className="alert-card-description">Require immediate attention</div>
          </div>

          <div className="alert-card alert-card--warning">
            <div className="alert-card-header">
              <span className="alert-card-icon">!</span>
              <span className="alert-card-title">Warning Alerts</span>
            </div>
            <div className="alert-card-count">7</div>
            <div className="alert-card-description">Monitor closely</div>
          </div>

          <div className="alert-card alert-card--info">
            <div className="alert-card-header">
              <span className="alert-card-icon">i</span>
              <span className="alert-card-title">Informational</span>
            </div>
            <div className="alert-card-count">12</div>
            <div className="alert-card-description">For awareness</div>
          </div>
        </div>
      </div>
    </div>
  );
}
