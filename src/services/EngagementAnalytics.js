import {
  getItem,
  setItem,
  isArray,
  isPlainObject,
} from '../utils/localStorageUtils';
import {
  EVENT_LOG_KEY,
  DEFAULT_CONFIG,
} from '../utils/constants';

/**
 * Valid event types for engagement tracking.
 * @type {string[]}
 */
const VALID_EVENT_TYPES = [
  'tab_click',
  'chart_interaction',
  'ai_usage',
  'action_trigger',
  'page_view',
  'login',
  'logout',
  'data_error',
  'insight_view',
];

/**
 * Tracks a user interaction event by logging it to the localStorage event log.
 * @param {string} type - The event type (e.g., 'tab_click', 'chart_interaction', 'ai_usage', 'action_trigger').
 * @param {Object} [details={}] - Additional details about the event.
 * @returns {boolean} True if the event was successfully logged, false otherwise.
 */
export function trackEvent(type, details = {}) {
  try {
    if (!type || typeof type !== 'string') {
      console.error('[EngagementAnalytics] trackEvent requires a non-empty string type');
      return false;
    }

    const eventDetails = isPlainObject(details) ? details : {};

    const event = {
      eventType: type,
      timestamp: Date.now(),
      details: eventDetails,
    };

    const existing = getItem(EVENT_LOG_KEY, []);
    const log = isArray(existing) ? existing : [];

    log.push(event);

    while (log.length > DEFAULT_CONFIG.MAX_EVENT_LOG_ENTRIES) {
      log.shift();
    }

    return setItem(EVENT_LOG_KEY, log);
  } catch (e) {
    console.error('[EngagementAnalytics] Failed to track event:', e);
    return false;
  }
}

/**
 * Aggregates event counts by type from the event log.
 * Returns a summary object with counts for each event type and overall statistics.
 * @returns {Promise<{tabClicks: number, chartInteractions: number, aiQueries: number, actionTriggers: number, totalEvents: number, lastActive: number|null, eventBreakdown: Object}>}
 *   Resolves with the analytics summary object.
 */
export function getAnalyticsSummary() {
  return new Promise((resolve) => {
    try {
      const log = getItem(EVENT_LOG_KEY, []);
      const events = isArray(log) ? log : [];

      let tabClicks = 0;
      let chartInteractions = 0;
      let aiQueries = 0;
      let actionTriggers = 0;
      let lastActive = null;
      const eventBreakdown = {};

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (!event || typeof event !== 'object' || Array.isArray(event)) {
          continue;
        }

        const eventType = event.eventType;
        if (typeof eventType !== 'string') {
          continue;
        }

        // Count by type in breakdown
        if (eventBreakdown[eventType] === undefined) {
          eventBreakdown[eventType] = 0;
        }
        eventBreakdown[eventType] += 1;

        // Aggregate known categories
        if (eventType === 'tab_click') {
          tabClicks += 1;
        } else if (eventType === 'chart_interaction') {
          chartInteractions += 1;
        } else if (eventType === 'ai_usage') {
          aiQueries += 1;
        } else if (eventType === 'action_trigger') {
          actionTriggers += 1;
        }

        // Track last active timestamp
        if (typeof event.timestamp === 'number' && isFinite(event.timestamp)) {
          if (lastActive === null || event.timestamp > lastActive) {
            lastActive = event.timestamp;
          }
        }
      }

      resolve({
        tabClicks,
        chartInteractions,
        aiQueries,
        actionTriggers,
        totalEvents: events.length,
        lastActive,
        eventBreakdown,
      });
    } catch (e) {
      console.error('[EngagementAnalytics] Failed to get analytics summary:', e);
      resolve({
        tabClicks: 0,
        chartInteractions: 0,
        aiQueries: 0,
        actionTriggers: 0,
        totalEvents: 0,
        lastActive: null,
        eventBreakdown: {},
      });
    }
  });
}

/**
 * Retrieves the full event log array from localStorage.
 * @returns {Array<{eventType: string, timestamp: number, details: Object}>} The array of logged events.
 */
export function getEventLog() {
  try {
    const log = getItem(EVENT_LOG_KEY, []);
    return isArray(log) ? log : [];
  } catch (e) {
    console.error('[EngagementAnalytics] Failed to get event log:', e);
    return [];
  }
}

/**
 * Clears the entire event log from localStorage.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function clearEventLog() {
  try {
    return setItem(EVENT_LOG_KEY, []);
  } catch (e) {
    console.error('[EngagementAnalytics] Failed to clear event log:', e);
    return false;
  }
}