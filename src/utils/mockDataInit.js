import { getItem, setItem, isArray, isPlainObject } from './localStorageUtils';
import {
  USERS_KEY,
  EVENT_LOG_KEY,
} from './constants';
import { initializeDashboardData } from '../services/DashboardDataService';
import { getActionChips, getAIInsights as getStrategicInsights } from '../services/AIEngine';

/**
 * Default seed users for the application.
 * @type {Array<{username: string, password: string, role: string, avatarUrl: string, createdAt: string}>}
 */
const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'CIO',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  },
  {
    username: 'cio_user',
    password: 'canon2024',
    role: 'CIO',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Default sample event log entries for initial seeding.
 * @type {Array<{eventType: string, timestamp: number, details: Object}>}
 */
const DEFAULT_EVENT_LOG = [
  {
    eventType: 'login',
    timestamp: Date.now() - 3600000,
    details: { username: 'admin' },
  },
  {
    eventType: 'page_view',
    timestamp: Date.now() - 3500000,
    details: { page: 'dashboard', section: 'executive_summary' },
  },
  {
    eventType: 'tab_click',
    timestamp: Date.now() - 3400000,
    details: { tab: 'business_impact' },
  },
  {
    eventType: 'chart_interaction',
    timestamp: Date.now() - 3300000,
    details: { chart: 'budgetTrend', action: 'hover' },
  },
  {
    eventType: 'ai_usage',
    timestamp: Date.now() - 3200000,
    details: { query: 'What is the current budget utilization status?' },
  },
  {
    eventType: 'tab_click',
    timestamp: Date.now() - 3100000,
    details: { tab: 'operations' },
  },
  {
    eventType: 'insight_view',
    timestamp: Date.now() - 3000000,
    details: { insight: 'insight_cloud_acceleration' },
  },
  {
    eventType: 'action_trigger',
    timestamp: Date.now() - 2900000,
    details: { action: 'Show Cloud Migration ROI' },
  },
  {
    eventType: 'tab_click',
    timestamp: Date.now() - 2800000,
    details: { tab: 'risk_governance' },
  },
  {
    eventType: 'chart_interaction',
    timestamp: Date.now() - 2700000,
    details: { chart: 'complianceChart', action: 'click' },
  },
];

/**
 * Seeds default users into localStorage if not already present.
 * Does not overwrite existing user data.
 * @returns {void}
 */
function seedUsers() {
  const existing = getItem(USERS_KEY, null);
  if (isArray(existing) && existing.length > 0) {
    return;
  }
  setItem(USERS_KEY, DEFAULT_USERS);
}

/**
 * Seeds sample event log entries into localStorage if not already present.
 * Does not overwrite existing event log data.
 * @returns {void}
 */
function seedEventLog() {
  const existing = getItem(EVENT_LOG_KEY, null);
  if (isArray(existing) && existing.length > 0) {
    return;
  }
  setItem(EVENT_LOG_KEY, DEFAULT_EVENT_LOG);
}

/**
 * Seeds AI action chips and strategic insights into localStorage.
 * These functions internally check for existing data before writing.
 * @returns {void}
 */
function seedAIData() {
  // getActionChips checks localStorage and seeds defaults if missing
  getActionChips().catch((e) => {
    console.error('[mockDataInit] Failed to seed AI action chips:', e);
  });

  // getStrategicInsights checks localStorage and seeds defaults if missing
  getStrategicInsights().catch((e) => {
    console.error('[mockDataInit] Failed to seed AI strategic insights:', e);
  });
}

/**
 * Initializes all mock data in localStorage on first app load.
 * Checks for existing data before overwriting to avoid data loss.
 * Safe to call multiple times — only writes data that is missing or invalid.
 *
 * Seeds the following:
 * - Default users (admin, cio_user)
 * - Dashboard metrics, charts, and tables for all 6 sections
 * - AI insights keyed by section
 * - AI action chips
 * - AI strategic insights
 * - Sample event log entries
 *
 * @returns {void}
 */
export function initializeMockData() {
  try {
    // Seed default users
    seedUsers();

    // Initialize dashboard data (metrics, charts, tables) and section-keyed AI insights
    // This function from DashboardDataService handles all 6 sections and AI insights
    initializeDashboardData();

    // Seed AI action chips and strategic insights
    seedAIData();

    // Seed sample event log entries
    seedEventLog();
  } catch (e) {
    console.error('[mockDataInit] Failed to initialize mock data:', e);
  }
}