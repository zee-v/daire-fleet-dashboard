# 🚢 Unified Maritime Predictive Maintenance Dashboard

## ✅ Implementation Complete!

Your professional unified dashboard combining React and Grafana has been successfully implemented.

---

## 🎯 What Was Built

### **New Components Created:**

1. **`GrafanaEmbed.js`** - Reusable component for embedding Grafana dashboards
   - Location: `src/components/GrafanaEmbed.js`
   - Features: Kiosk mode, custom parameters, unified styling

2. **`UnifiedDashboardPage.js`** - Main unified dashboard with 5 tabs
   - Location: `src/pages/UnifiedDashboardPage.js`
   - Integrates React visualizations + Grafana panels seamlessly

3. **Styling** - Professional dark theme matching dAIRE design
   - `src/components/GrafanaEmbed.css`
   - `src/pages/UnifiedDashboardPage.css`

### **Updated Files:**

- **`App.js`** - Added unified dashboard route (now default landing page)
- **`Sidebar.js`** - Added navigation link to unified dashboard

---

## 📊 Dashboard Features

### **Tab 1: Fleet Overview** 🚢
- **KPI Cards**: Total vessels, active alerts, fleet health, total events
- **Fleet Timeline Chart**: Last 30 health readings across all vessels
- **Vessel Health Distribution**: Bar chart showing health scores
- **Critical Vessels List**: Vessels requiring immediate attention
- **Quick Actions**: Navigate to maintenance scheduling

**Data Source**: Your EDP CSV backend (port 5002)

### **Tab 2: Real-Time Monitoring** ⚡
- **Live Sensor Events**: Temperature, pressure, vibration from EdgeX
- **Ship System Summary**: Real-time system health
- **Thermal Health**: Temperature monitoring across systems
- **Kafka Analytics**: Data pipeline health metrics

**Data Source**: Grafana → QuestDB → Kafka pipeline

### **Tab 3: Analytics & Insights** 📊
- **Equipment Health Scores**: Historical health score trends
- **Historical Sensor Trends**: 7-day sensor data analysis
- **Operational KPIs**: Uptime, MTBF, availability metrics (30-day view)

**Data Source**: Grafana dashboards with QuestDB queries

### **Tab 4: Predictive Alerts** 🔮
- **Active Predictive Alerts**: AI-powered anomaly detection
- **Maintenance Recommendations**: Flink/AI-generated actions
- **Ship Alert History**: 7-day alert timeline
- **Generator Performance**: Performance monitoring

**Data Source**: Grafana + FastAPI analytics service

### **Tab 5: Vessel Deep Dive** 🔍
- **Vessel Stats**: Health score, alerts, risk level, predicted maintenance
- **Ship Overview**: Complete system status for selected vessel
- **Shaft Telemetry**: Detailed shaft performance
- **Energy Efficiency**: Power consumption analysis
- **Historical Trends**: 30-day performance data
- **AI Recommendations**: Vessel-specific maintenance suggestions

**Data Source**: Combined EDP CSV + Grafana ship-specific dashboards

---

## 🌐 Access the Dashboard

### **Primary Dashboard (NEW)**
```
http://localhost:3002/unified-dashboard
```
This is now your default landing page with everything integrated!

### **Other Pages (Still Available)**
- **Fleet Health**: http://localhost:3002/fleet-health
- **Maintenance Actions**: http://localhost:3002/maintenance-actions

### **Standalone Grafana (For Operations Team)**
```
http://localhost:3001
Username: admin
Password: admin
```

---

## 🎨 Design Features

### **Unified Visual Experience**
- ✅ Consistent dark theme (#0f172a background)
- ✅ Professional gradient headers
- ✅ Smooth animations and transitions
- ✅ Responsive grid layouts
- ✅ Color-coded status indicators
- ✅ Interactive hover effects
- ✅ Mobile-responsive design

### **Navigation**
- Tab-based interface for easy switching
- Sidebar navigation for cross-page access
- Breadcrumb context from vessel selector
- Quick action buttons for common tasks

---

## 🔧 How It Works

### **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│  UNIFIED DASHBOARD (React - Port 3002)                      │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  React Charts   │  │ Grafana iframes │                  │
│  │  (Recharts)     │  │  (Embedded)     │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
└───────────┼────────────────────┼──────────────────────────────┘
            │                    │
            ▼                    ▼
    ┌───────────────┐    ┌──────────────┐
    │  Node.js API  │    │   Grafana    │
    │  Port 5002    │    │  Port 3001   │
    └───────┬───────┘    └──────┬───────┘
            │                   │
            ▼                   ▼
    ┌───────────────┐    ┌──────────────┐
    │   EDP CSV     │    │   QuestDB    │
    │  (Vessel Data)│    │ (Sensor Data)│
    └───────────────┘    └──────┬───────┘
                                │
                                ▼
                        ┌──────────────┐
                        │    Kafka     │
                        │   (Events)   │
                        └──────────────┘
```

### **Embedding Technique**

Grafana dashboards are embedded using iframes with:
- **Kiosk mode** (`?kiosk=tv`) - Hides Grafana UI chrome
- **Dynamic parameters** - Time ranges, vessel IDs, refresh rates
- **Unified styling** - CSS wrapper makes them look native to React app
- **No authentication conflicts** - Same browser session

---

## 📱 Features Implemented

### **✅ Single-Page Experience**
- All functionality in one unified interface
- No context switching between apps
- Consistent navigation and branding

### **✅ Real-Time Data**
- Grafana auto-refresh (10-30s intervals)
- Live sensor monitoring
- Dynamic KPI updates

### **✅ Historical Analysis**
- 30-day trend charts
- Fleet timeline visualization
- Health score progression

### **✅ Predictive Intelligence**
- AI-powered maintenance recommendations
- Risk level assessments
- Confidence scores and accuracy metrics

### **✅ Actionable Insights**
- Quick action buttons
- Direct links to maintenance scheduling
- Vessel-specific recommendations

---

## 🚀 Usage Guide

### **For Fleet Managers:**
1. **Start at Overview Tab**
   - See fleet-wide KPIs at a glance
   - Identify vessels needing attention
   - Review fleet health timeline

2. **Check Predictive Tab**
   - Review active alerts
   - Read AI maintenance recommendations
   - Prioritize actions

3. **Use Quick Actions**
   - Click "Schedule Maintenance" for immediate action
   - Navigate to detailed health reports

### **For Operations Team:**
1. **Monitor Real-Time Tab**
   - Watch live sensor feeds
   - Check thermal health
   - Monitor Kafka pipeline

2. **Analyze with Analytics Tab**
   - Review historical trends
   - Check KPIs (uptime, MTBF)
   - Identify patterns

### **For Vessel Engineers:**
1. **Use Vessel Deep Dive Tab**
   - Select specific vessel from dropdown
   - Review all systems for that vessel
   - Check shaft telemetry, energy efficiency
   - Read vessel-specific recommendations

---

## 🎯 Next Steps (Optional Enhancements)

### **Phase 2 Recommendations:**

1. **User Authentication**
   - Add role-based access control
   - Implement Grafana API tokens for secure embedding

2. **Real-Time Alerts**
   - Add WebSocket connection for instant notifications
   - Browser notifications for critical alerts

3. **Export Features**
   - PDF report generation
   - CSV data export
   - Email scheduled reports

4. **Advanced Filtering**
   - Multi-vessel selection
   - Date range picker for historical views
   - Component-level drill-down

5. **Mobile App**
   - Progressive Web App (PWA) support
   - Native mobile notifications
   - Offline mode for critical data

---

## 🔍 Troubleshooting

### **If Grafana Panels Don't Load:**
```bash
# Check Grafana is running
curl http://localhost:3001/api/health

# Check dashboard exists
curl http://localhost:3001/api/dashboards/uid/sensor-events
```

### **If No Data Appears:**
```bash
# Check backend is running
curl http://localhost:5002/api/health

# Check QuestDB is accessible
curl http://localhost:9000
```

### **If React App Crashes:**
```bash
# Check console for errors
# Common fix: restart the dev server
cd /Users/vignesh/Python/savitha/Maersk/daire_fleet_level_dashboard
npm start
```

---

## 📊 Data Sources Summary

| Tab | React Data | Grafana Dashboards |
|-----|------------|-------------------|
| Overview | ✅ EDP CSV | ❌ |
| Real-Time | ❌ | ✅ sensor-events, ship-summary, ship-thermal-health, kafka-analytics |
| Analytics | ❌ | ✅ health-scores, historical-trends, kpi-monitoring |
| Predictive | ❌ | ✅ predictive-alerts, maintenance-recommendations, ship-alerts-events |
| Vessel Deep Dive | ✅ EDP CSV | ✅ ship-overview, ship-shaft-telemetry, ship-energy-efficiency |

---

## 🎉 Success Metrics

Your unified dashboard now provides:

- **Single Interface**: One URL for all stakeholders
- **Comprehensive View**: Fleet + Vessel + Sensor data combined
- **Professional UX**: Polished, consistent design
- **Real-Time + Historical**: Both perspectives in one place
- **Actionable Intelligence**: From data to decisions seamlessly

---

## 📞 Support

For issues or enhancements:
1. Check browser console for errors
2. Verify all services are running (ports 3002, 5002, 3001, 9000)
3. Review this guide's troubleshooting section

---

**Built with**: React 18, Recharts, Grafana 10.4, Node.js, QuestDB, Kafka
**Architecture**: Hybrid React + Embedded Grafana for best of both worlds
**Design**: Professional dark theme with unified maritime branding
