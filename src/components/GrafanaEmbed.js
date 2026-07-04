import React from 'react';
import './GrafanaEmbed.css';

/**
 * GrafanaEmbed - Embeds Grafana dashboards with unified styling
 * @param {string} dashboard - Grafana dashboard UID
 * @param {string} title - Optional title for the embed container
 * @param {string} height - Height of the iframe (default: 600px)
 * @param {object} params - Additional URL parameters (time range, variables, etc.)
 * @param {boolean} kiosk - Enable kiosk mode to hide Grafana UI (default: true)
 */
export default function GrafanaEmbed({ 
  dashboard, 
  title, 
  height = '600px',
  params = {},
  kiosk = true 
}) {
  const baseUrl = (process.env.REACT_APP_GRAFANA_URL || 'http://localhost:3001').replace(/\/$/, '');
  
  // Build query parameters
  const queryParams = new URLSearchParams({
    orgId: '1',
    from: params.from || 'now-6h',
    to: params.to || 'now',
    refresh: params.refresh || '30s',
    ...(kiosk && { kiosk: 'tv' }),
    ...params
  });
  
  const embedUrl = `${baseUrl}/d/${dashboard}?${queryParams.toString()}`;
  
  return (
    <div className="grafana-embed-container">
      {title && <h3 className="grafana-embed-title">{title}</h3>}
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        title={title || 'Grafana Dashboard'}
        className="grafana-embed-frame"
      />
    </div>
  );
}
