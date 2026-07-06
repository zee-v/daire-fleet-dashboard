import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UnifiedDashboardPage from './pages/UnifiedDashboardPage';
import FleetHealthPage from './pages/FleetHealthPage';
import MaintenancePage from './pages/MaintenancePage';
import DashboardTabPage from './pages/DashboardTabPage';

// Real-Time Monitoring Pages
import SensorEventsPage from './pages/monitoring/SensorEventsPage';
import HealthScoresPage from './pages/monitoring/HealthScoresPage';
import KPIMonitoringPage from './pages/monitoring/KPIMonitoringPage';
import GrafanaRealtimePage from './pages/monitoring/GrafanaRealtimePage';

// Analytics Pages
import HistoricalTrendsPage from './pages/analytics/HistoricalTrendsPage';
import HealthAnalysisPage from './pages/analytics/HealthAnalysisPage';
import GrafanaAnalyticsPage from './pages/analytics/GrafanaAnalyticsPage';

// Predictive Pages
import ActiveAlertsPage from './pages/predictive/ActiveAlertsPage';
import MaintenanceSchedulePage from './pages/predictive/MaintenanceSchedulePage';
import GrafanaPredictivePage from './pages/predictive/GrafanaPredictivePage';


import { SelectionProvider } from './context/SelectionContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Layout>
          <Routes>
            {/* Main Dashboard */}
            <Route path="/fleet-overview" element={<UnifiedDashboardPage />} />
            <Route path="/fleet-overview/health-report" element={<HealthScoresPage />} />
            <Route path="/fleet-overview/alerts-summary" element={<ActiveAlertsPage />} />
            <Route path="/fleet-overview/trends-analytics" element={<HistoricalTrendsPage />} />

            {/* Live Monitoring Tabs */}
            <Route path="/live-monitoring/health-score" element={<HealthScoresPage />} />
            <Route path="/live-monitoring/kpi-monitoring" element={<KPIMonitoringPage />} />

            {/* dAIRE Analytics Tabs */}
            <Route path="/daire-analytics/historical-trends" element={<HistoricalTrendsPage />} />
            <Route
              path="/daire-analytics/kafka-analytics"
              element={(
                <DashboardTabPage
                  title="Kafka Analytics"
                  description="Kafka pipeline throughput and sensor event flow"
                  dashboard="sensor-events-pipeline"
                  params={{ from: 'now-6h', to: 'now', refresh: '10s' }}
                />
              )}
            />
            <Route path="/daire-analytics/kpi-monitoring" element={<KPIMonitoringPage />} />
            <Route path="/daire-analytics/maintenance-recommendations" element={<MaintenanceSchedulePage />} />
            <Route path="/daire-analytics/predictive-alerts" element={<ActiveAlertsPage />} />
            <Route path="/daire-analytics/equipment-health-scores" element={<HealthScoresPage />} />
            <Route
              path="/daire-analytics/historical-replay"
              element={(
                <DashboardTabPage
                  title="Historical Replay"
                  description="Replay historical fleet health and anomaly timelines"
                  dashboard="daire-hist-trends-001"
                  params={{ from: 'now-30d', to: 'now', refresh: '5m' }}
                />
              )}
            />
            <Route path="/daire-analytics/sensor-events" element={<SensorEventsPage />} />

            {/* Real-Time Monitoring */}
            <Route path="/monitoring/sensor-events" element={<SensorEventsPage />} />
            <Route path="/monitoring/health-scores" element={<HealthScoresPage />} />
            <Route path="/monitoring/kpi-monitoring" element={<KPIMonitoringPage />} />
            <Route path="/monitoring/grafana-dashboards" element={<GrafanaRealtimePage />} />
            
            {/* Analytics & Insights */}
            <Route path="/analytics/historical-trends" element={<HistoricalTrendsPage />} />
            <Route path="/analytics/health-analysis" element={<HealthAnalysisPage />} />
            <Route path="/analytics/grafana-dashboards" element={<GrafanaAnalyticsPage />} />
            
            {/* Predictive Maintenance */}
            <Route path="/predictive/active-alerts" element={<ActiveAlertsPage />} />
            <Route path="/predictive/maintenance-schedule" element={<MaintenanceSchedulePage />} />
            <Route path="/predictive/grafana-dashboards" element={<GrafanaPredictivePage />} />
            
            {/* Legacy Routes (keeping for backward compatibility) */}
            <Route path="/unified-dashboard" element={<Navigate to="/fleet-overview" replace />} />
            <Route path="/fleet-health" element={<FleetHealthPage />} />
            <Route path="/vessel-components/:fleetId/:componentId" element={<FleetHealthPage />} />
            <Route path="/maintenance-actions" element={<MaintenancePage />} />
            
            {/* Default Route */}
            <Route path="*" element={<Navigate to="/fleet-overview" replace />} />
          </Routes>
        </Layout>
      </SelectionProvider>
    </BrowserRouter>
  );
}

export default App;
