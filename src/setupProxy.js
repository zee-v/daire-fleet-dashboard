const { createProxyMiddleware } = require('http-proxy-middleware');

/** CRA dev server: forward /api/* to the fleet CSV backend (default http://localhost:5000). */
module.exports = function setupProxy(app) {
  const raw = process.env.REACT_APP_EDP_API_URL || 'http://localhost:5000';
  const target = String(raw).replace(/\/$/, '');

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );
};
