import React, { useState } from 'react';
import './GrafanaEmbed.css';

// Public dashboard access tokens (generated via Grafana Cloud API)
const PUBLIC_TOKENS = {
  'health-scores':           'c28ba79d198d4127997ad70282e198e2',
  'historical-replay':       '3f68b9e74d264184a04c414c03b54320',
  'daire-hist-trends-001':   '5f9f39c99b454a2099041fd86b2a5177',
  'daire-kafka-001':         'b036b3be30ae4101b953ce8f86e197d8',
  'daire-kpi-001':           'ddf8add352744a4d8973d3e4b1eed0ab',
  'daire-maint-001':         '25a4fa34c0a9455ca1744d277ff531ed',
  'daire-pred-alerts-001':   '3bd58f8e3d024bc59bc68e46feab3ecf',
  'sensor-events-pipeline':  '57e2a70b78874697a9ef2836747a9a20',
  'ship-alerts-01':          '59aea8d3ec6948d7ab5d9033ed4e8d46',
  'ship-energy-01':          '009f665c186240ebbdbc3c5e3ce8499e',
  'ship-gen-perf-01':        'eb66e04907da4cdaa33ec45678ebc15c',
  'ship-hist-trends-01':     '28cdb8c8bc5045e1a827ec3893136aef',
  'ship-overview-01':        '1b09c705b9904943bc98fb2f8ad5dcd3',
  'ship-shaft-tel-01':       '2d385afa89524140bdea366dd42ba073',
  'ship-summary-01':         '14967c3acd0b439f8e4dc0c5e2de01e9',
  'ship-thermal-01':         '70ad5db105224b848137d0e02e9ce675',
  'ship2-alerts-01':         '2b11ce3a473d48d4a07c25206ec11de1',
  'ship2-energy-01':         '01ef4977f9434bcd9aae618ee350293e',
  'ship2-gen-perf-01':       '9d230e407fe0417cb35d9d236c669195',
  'ship2-hist-trends-01':    '9bc2c96502964490b455a122c7543542',
  'ship2-overview-01':       '6c8dfd18a20d4d8385a3d3ccb40d44dd',
  'ship2-shaft-tel-01':      'd33d5936409c49af81a4111ad9acab6c',
  'ship2-summary-01':        '60215b262ce84f79a180f88d36d9dbad',
  'ship2-thermal-01':        '92bd1ca97d4d46f98a4e157edd5850b4',
};

export default function GrafanaEmbed({
  dashboard,
  title,
  height = '600px',
  params = {},
  kiosk = true,
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
  const baseUrl = (grafanaUrl || '').replace(/\/$/, '');
  const token = PUBLIC_TOKENS[dashboard];

  // Local Grafana (localhost) uses direct /d/<uid> embed URL
  // Grafana Cloud uses /public-dashboards/<token>
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  let embedUrl = '';
  if (isLocal) {
    const queryParams = new URLSearchParams({
      orgId: '1',
      from: params.from || 'now-6h',
      to: params.to || 'now',
      refresh: params.refresh || '30s',
      ...(kiosk && { kiosk: 'tv' }),
      ...params,
    });
    embedUrl = `${baseUrl}/d/${dashboard}?${queryParams.toString()}`;
  } else if (token) {
    embedUrl = `${baseUrl}/public-dashboards/${token}`;
  }

  const showPlaceholder = !baseUrl || (!isLocal && !token) || loadFailed;

  return (
    <div className="grafana-embed-container">
      {title && <h3 className="grafana-embed-title">{title}</h3>}

      {showPlaceholder ? (
        <div className="grafana-placeholder" style={{ height }}>
          <div className="grafana-placeholder-icon">📊</div>
          <div className="grafana-placeholder-title">Grafana Dashboard</div>
          <div className="grafana-placeholder-text">
            {!baseUrl
              ? 'Grafana URL is not configured.'
              : !token
              ? `Dashboard "${dashboard}" has no public access token configured.`
              : 'This dashboard could not be loaded.'}
          </div>
          <div className="grafana-placeholder-hint">
            Dashboard ID: <code>{dashboard}</code>
          </div>
          {baseUrl && token && (
            <a
              className="grafana-placeholder-link"
              href={`${baseUrl}/public-dashboards/${token}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Grafana →
            </a>
          )}
        </div>
      ) : (
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          title={title || 'Grafana Dashboard'}
          className="grafana-embed-frame"
          onError={() => setLoadFailed(true)}
        />
      )}
    </div>
  );
}
