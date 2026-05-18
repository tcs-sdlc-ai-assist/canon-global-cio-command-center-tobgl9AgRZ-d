// localStorage keys
export const USERS_KEY = 'canon_cio_users';
export const SESSION_KEY = 'canon_cio_session';
export const DASHBOARD_DATA_KEY = 'canon_cio_dashboard_data';
export const AI_CHAT_HISTORY_KEY = 'canon_cio_ai_chat_history';
export const AI_INSIGHTS_KEY = 'canon_cio_ai_insights';
export const AI_ACTION_CHIPS_KEY = 'canon_cio_ai_action_chips';
export const EVENT_LOG_KEY = 'canon_cio_event_log';

// Tab names for dashboard navigation
export const TAB_NAMES = [
  'Overview',
  'Infrastructure',
  'Security',
  'Projects',
  'Budget',
  'AI Insights',
];

// Status labels used across the application
export const STATUS_LABELS = {
  HEALTHY: 'Healthy',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
  UNKNOWN: 'Unknown',
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
};

// Color mappings for statuses (Tailwind class-friendly values)
export const STATUS_COLORS = {
  [STATUS_LABELS.HEALTHY]: {
    bg: 'bg-executive-green-50',
    text: 'text-executive-green-700',
    border: 'border-executive-green-300',
    dot: 'bg-executive-green-500',
  },
  [STATUS_LABELS.WARNING]: {
    bg: 'bg-executive-amber-50',
    text: 'text-executive-amber-700',
    border: 'border-executive-amber-300',
    dot: 'bg-executive-amber-500',
  },
  [STATUS_LABELS.CRITICAL]: {
    bg: 'bg-executive-red-50',
    text: 'text-executive-red-700',
    border: 'border-executive-red-300',
    dot: 'bg-executive-red-500',
  },
  [STATUS_LABELS.UNKNOWN]: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500',
  },
  [STATUS_LABELS.ON_TRACK]: {
    bg: 'bg-executive-green-50',
    text: 'text-executive-green-700',
    border: 'border-executive-green-300',
    dot: 'bg-executive-green-500',
  },
  [STATUS_LABELS.AT_RISK]: {
    bg: 'bg-executive-amber-50',
    text: 'text-executive-amber-700',
    border: 'border-executive-amber-300',
    dot: 'bg-executive-amber-500',
  },
  [STATUS_LABELS.DELAYED]: {
    bg: 'bg-executive-red-50',
    text: 'text-executive-red-700',
    border: 'border-executive-red-300',
    dot: 'bg-executive-red-500',
  },
  [STATUS_LABELS.COMPLETED]: {
    bg: 'bg-executive-blue-50',
    text: 'text-executive-blue-700',
    border: 'border-executive-blue-300',
    dot: 'bg-executive-blue-500',
  },
  [STATUS_LABELS.IN_PROGRESS]: {
    bg: 'bg-executive-blue-50',
    text: 'text-executive-blue-700',
    border: 'border-executive-blue-300',
    dot: 'bg-executive-blue-500',
  },
  [STATUS_LABELS.NOT_STARTED]: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500',
  },
};

// Chart color palette for consistent data visualization
export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#3b82f6',
  muted: '#6b7280',
  palette: [
    '#2563eb',
    '#16a34a',
    '#d97706',
    '#dc2626',
    '#8b5cf6',
    '#0891b2',
    '#ea580c',
    '#4f46e5',
  ],
};

// Default configuration values
export const DEFAULT_CONFIG = {
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Canon CIO Command Center',
  REFRESH_INTERVAL_MS: 300000, // 5 minutes
  MAX_CHAT_HISTORY: 50,
  MAX_EVENT_LOG_ENTRIES: 200,
  SESSION_TIMEOUT_MS: 3600000, // 1 hour
  DEFAULT_TAB_INDEX: 0,
  PAGINATION_PAGE_SIZE: 10,
};

// Severity levels for events and alerts
export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Priority levels for projects and tasks
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};