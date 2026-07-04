/**
 * Fleet CSV dashboard API URL.
 * - Set REACT_APP_EDP_API_URL in .env (e.g. http://localhost:5000) for any environment.
 * - In development, defaults to http://localhost:5000 (CSV metrics server; SIADEMO mock API often uses 5001).
 */
export function getEdpDashboardUrl() {
  const fromEnv = process.env.REACT_APP_EDP_API_URL;
  const base = (fromEnv || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''))
    .replace(/\/$/, '');
  if (base) return `${base}/api/edp/dashboard`;
  return '/api/edp/dashboard';
}
