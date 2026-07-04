/**
 * types/index.js
 *
 * Central type-documentation file.  Because this is a JS/JSX project (no
 * TypeScript compiler), we document shapes here with JSDoc @typedef so IDEs
 * provide autocomplete and callers know what to expect.
 *
 * MIGRATION NOTE: When switching to a real backend, move these definitions
 * to a proper .ts file and replace JSDoc with TypeScript interfaces.
 */

/**
 * @typedef {'critical' | 'warning' | 'informational' | 'healthy'} HealthStatus
 */

/**
 * @typedef {{ label: string; value: number }} TrendPoint
 * One data-point on the health-trend sparkline / line-chart.
 */

/**
 * @typedef {{
 *   icon: string;
 *   label: string;
 *   direction: 'up' | 'down';
 *   pct: string;
 *   colorClass: string;
 * }} KeyIndicator
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   status: HealthStatus;
 *   healthScore: number;          // 0-100
 *   daysToFailure: number;
 *   confidence: number;           // 0-100
 *   issue: string | null;
 *   recommendation: string;
 *   trend: TrendPoint[];
 *   alerts: import('./alert').Alert[];
 *   keyIndicators: KeyIndicator[];
 *   prediction: import('./system').Prediction;
 * }} System
 *
 * Represents one sub-system on a vessel (engine, cooling, electrical, …).
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   shortName: string;
 *   fleetId: string;
 *   status: HealthStatus;
 *   healthScore: number;
 *   systems: System[];
 * }} Vessel
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   region: string;
 *   vessels: Vessel[];
 * }} Fleet
 */

/**
 * @typedef {{
 *   healthyAssets: number;
 *   activeAlerts: number;
 *   criticalAlerts: number;
 *   avgDaysToFailure: number;
 * }} KpiSummary
 */

/**
 * @typedef {{
 *   id: string;
 *   vessel: string;
 *   shortName: string;
 *   component: string;
 *   issue: string;
 *   severity: HealthStatus;
 *   priority: string;
 *   daysToFailure: number;
 *   confidence: number;
 *   recommendedAction: string;
 *   recommendation: string;
 *   healthScore: number;
 * }} CorrectiveAction
 */

/**
 * @typedef {{
 *   vessel: string;
 *   tasks: import('./schedule').ScheduleTask[];
 * }} ScheduleRow
 */

/**
 * @typedef {{
 *   vessel: string;
 *   shortName: string;
 *   component: string;
 *   fleet: string;
 *   healthScore: number;
 *   daysToFailure: number;
 *   confidence: number;
 *   risk: string;
 *   issue: string;
 *   recommendation: string;
 * }} RescheduleContext
 */

// Re-export nothing — this file is documentation only.
export {};
