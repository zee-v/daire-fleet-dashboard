import React from 'react';
import GrafanaEmbed from '../components/GrafanaEmbed';
import './monitoring/MonitoringPages.css';

export default function DashboardTabPage({ title, description, dashboard, params, height = '640px' }) {
  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
      </div>

      <div className="grafana-grid-full">
        <GrafanaEmbed
          dashboard={dashboard}
          title={title}
          height={height}
          params={params}
        />
      </div>
    </div>
  );
}
