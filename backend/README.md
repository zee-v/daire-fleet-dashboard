# EDP backend (dAIRE dashboard)

Serves `GET /api/edp/dashboard` built from `data/EDP.csv`.

## Run

**Important:** start the server from **inside** the `backend` folder so `server.js` and `data/EDP.csv` resolve correctly.

```bash
cd backend
npm install
npm start
```

Default port: **5000** (matches the React app `proxy` and `REACT_APP_EDP_API_URL` in the parent folder).

**Note:** `SIADEMO/backend/server.js` (mock fleet API) often uses **5001**. This EDP server uses **5000** so both can run together.

### If you see “Cannot GET /api/health”

Another process is bound to the URL you opened, or it is not this server. Start **this** backend from `daire_fleet_dashboard/backend` and use the URL from the startup banner (default **`http://localhost:5000/api/health`**).

1. From repo root: `npm run backend`, or `cd daire_fleet_dashboard\backend` then `npm start`.
2. Terminal prints **======== daire-edp-backend** with the real port.
3. If **`EADDRINUSE`**, free the port (`netstat -ano | findstr :5000`) or set `PORT=5002` and update React `proxy` + `REACT_APP_EDP_API_URL` to match.
4. Landing page: **`http://localhost:5000/`** (adjust if you overrode `PORT`).
5. Health: **`/api/health`** or **`/health`** — JSON `{"ok":true,"service":"daire-edp-backend"}`.

## Data file

Place or update `data/EDP.csv`. By default the repo includes a copy synced from the Django project’s `EDP.csv`.

Override path:

```bash
set EDP_CSV_PATH=D:\path\to\EDP.csv
npm start
```

## API

- `GET /api/health` or `GET /health` — service check
- `GET /api/edp/dashboard` — fleet KPIs + per-tail (`Tail 1` …) health trend, alerts summary, and prediction fields used by the Fleet Health page
