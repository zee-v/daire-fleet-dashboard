import React from 'react';
import GrafanaEmbed from '../../components/GrafanaEmbed';
import './MonitoringPages.css';

export default function GrafanaRealtimePage() {
  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>Real-Time Grafana Dashboards</h1>
          <p className="page-description">Live sensor data and system health from EdgeX to Kafka to QuestDB pipeline</p>
        </div>
      </div>

      <div className="grafana-grid-full">
        <GrafanaEmbed
          dashboard="sensor-events-pipeline"
          title="EdgeX Sensor Data (Real-Time)"
          height="500px"
          params={{
            from: 'now-30m',
            to: 'now',
            refresh: '5s'
          }}
        />
        
        <GrafanaEmbed
          dashboard="health-scores"
          title="Equipment Health Scores"
          height="500px"
          params={{
            from: 'now-1h',
            to: 'now',
            refresh: '10s'
          }}
        />

        <GrafanaEmbed
          dashboard="daire-kpi-001"
          title="Fleet-Wide KPI Monitoring"
          height="500px"
          params={{
            from: 'now-6h',
            to: 'now',
            refresh: '30s'
          }}
        />
      </div>
    </div>
  );
}
