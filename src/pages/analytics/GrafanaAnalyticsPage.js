import React from 'react';
import GrafanaEmbed from '../../components/GrafanaEmbed';
import '../monitoring/MonitoringPages.css';

export default function GrafanaAnalyticsPage() {
  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Analytics Grafana Dashboards</h1>
          <p className="page-description">Historical trends, health scores, and operational KPIs</p>
        </div>
      </div>

      <div className="grafana-grid-full">
        <GrafanaEmbed
          dashboard="daire-hist-trends-001"
          title="Historical Health Trends"
          height="500px"
          params={{
            from: 'now-7d',
            to: 'now',
            refresh: '1m'
          }}
        />

        <GrafanaEmbed
          dashboard="health-scores"
          title="Equipment Health Scores"
          height="500px"
          params={{
            from: 'now-30d',
            to: 'now',
            refresh: '5m'
          }}
        />

        <GrafanaEmbed
          dashboard="daire-kpi-001"
          title="Operational KPIs & Benchmarks"
          height="500px"
          params={{
            from: 'now-24h',
            to: 'now',
            refresh: '1m'
          }}
        />
      </div>
    </div>
  );
}
