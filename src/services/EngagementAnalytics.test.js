import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackEvent,
  getAnalyticsSummary,
  getEventLog,
  clearEventLog,
} from './EngagementAnalytics';

describe('EngagementAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('trackEvent', () => {
    it('logs an event with correct type and timestamp', () => {
      const before = Date.now();

      const result = trackEvent('tab_click', { tab: 'operations' });

      const after = Date.now();

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBe(1);
      expect(log[0].eventType).toBe('tab_click');
      expect(log[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(log[0].timestamp).toBeLessThanOrEqual(after);
      expect(log[0].details.tab).toBe('operations');
    });

    it('logs multiple events in order', () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('chart_interaction', { chart: 'uptimeChart', action: 'click' });
      trackEvent('ai_usage', { query: 'What is the budget?' });

      const log = getEventLog();
      expect(log.length).toBe(3);
      expect(log[0].eventType).toBe('tab_click');
      expect(log[1].eventType).toBe('chart_interaction');
      expect(log[2].eventType).toBe('ai_usage');
    });

    it('returns false when type is empty string', () => {
      const result = trackEvent('', { tab: 'operations' });

      expect(result).toBe(false);
    });

    it('returns false when type is null', () => {
      const result = trackEvent(null, {});

      expect(result).toBe(false);
    });

    it('returns false when type is undefined', () => {
      const result = trackEvent(undefined, {});

      expect(result).toBe(false);
    });

    it('returns false when type is a number', () => {
      const result = trackEvent(123, {});

      expect(result).toBe(false);
    });

    it('handles missing details parameter gracefully', () => {
      const result = trackEvent('page_view');

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBe(1);
      expect(log[0].eventType).toBe('page_view');
      expect(log[0].details).toBeDefined();
      expect(typeof log[0].details).toBe('object');
    });

    it('handles non-object details parameter gracefully', () => {
      const result = trackEvent('tab_click', 'not_an_object');

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBe(1);
      expect(log[0].eventType).toBe('tab_click');
      expect(typeof log[0].details).toBe('object');
    });

    it('handles array details parameter gracefully', () => {
      const result = trackEvent('tab_click', [1, 2, 3]);

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBe(1);
      expect(log[0].eventType).toBe('tab_click');
    });

    it('enforces max event log entries limit', () => {
      for (let i = 0; i < 210; i++) {
        trackEvent('tab_click', { index: i });
      }

      const log = getEventLog();
      expect(log.length).toBeLessThanOrEqual(200);
    });

    it('preserves most recent events when trimming', () => {
      for (let i = 0; i < 210; i++) {
        trackEvent('tab_click', { index: i });
      }

      const log = getEventLog();
      const lastEvent = log[log.length - 1];
      expect(lastEvent.details.index).toBe(209);
    });

    it('logs events with different types correctly', () => {
      trackEvent('login', { username: 'admin' });
      trackEvent('logout', { username: 'admin' });
      trackEvent('insight_view', { insight: 'test_insight' });
      trackEvent('action_trigger', { action: 'export_data' });

      const log = getEventLog();
      expect(log.length).toBe(4);
      expect(log[0].eventType).toBe('login');
      expect(log[1].eventType).toBe('logout');
      expect(log[2].eventType).toBe('insight_view');
      expect(log[3].eventType).toBe('action_trigger');
    });

    it('recovers from corrupt localStorage data', () => {
      localStorage.setItem('canon_cio_event_log', 'not_valid_json{{{');

      const result = trackEvent('tab_click', { tab: 'operations' });

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBeGreaterThanOrEqual(1);
      expect(log[log.length - 1].eventType).toBe('tab_click');
    });

    it('recovers when localStorage contains non-array data', () => {
      localStorage.setItem('canon_cio_event_log', JSON.stringify('just_a_string'));

      const result = trackEvent('page_view', { page: 'dashboard' });

      expect(result).toBe(true);

      const log = getEventLog();
      expect(log.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('returns zero counts when no events exist', async () => {
      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(0);
      expect(summary.chartInteractions).toBe(0);
      expect(summary.aiQueries).toBe(0);
      expect(summary.actionTriggers).toBe(0);
      expect(summary.totalEvents).toBe(0);
      expect(summary.lastActive).toBeNull();
      expect(summary.eventBreakdown).toBeDefined();
      expect(typeof summary.eventBreakdown).toBe('object');
    });

    it('aggregates tab_click events correctly', async () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('tab_click', { tab: 'business_impact' });
      trackEvent('tab_click', { tab: 'innovation' });

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(3);
      expect(summary.totalEvents).toBe(3);
      expect(summary.eventBreakdown.tab_click).toBe(3);
    });

    it('aggregates chart_interaction events correctly', async () => {
      trackEvent('chart_interaction', { chart: 'uptimeChart', action: 'click' });
      trackEvent('chart_interaction', { chart: 'budgetTrend', action: 'hover' });

      const summary = await getAnalyticsSummary();

      expect(summary.chartInteractions).toBe(2);
      expect(summary.eventBreakdown.chart_interaction).toBe(2);
    });

    it('aggregates ai_usage events correctly', async () => {
      trackEvent('ai_usage', { query: 'What is the budget?' });
      trackEvent('ai_usage', { query: 'Show me security risks' });
      trackEvent('ai_usage', { query: 'Innovation pipeline' });
      trackEvent('ai_usage', { query: 'Partner performance' });

      const summary = await getAnalyticsSummary();

      expect(summary.aiQueries).toBe(4);
      expect(summary.eventBreakdown.ai_usage).toBe(4);
    });

    it('aggregates action_trigger events correctly', async () => {
      trackEvent('action_trigger', { action: 'export_data' });
      trackEvent('action_trigger', { action: 'predictive_analysis' });

      const summary = await getAnalyticsSummary();

      expect(summary.actionTriggers).toBe(2);
      expect(summary.eventBreakdown.action_trigger).toBe(2);
    });

    it('aggregates mixed event types correctly', async () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('chart_interaction', { chart: 'uptimeChart' });
      trackEvent('ai_usage', { query: 'budget status' });
      trackEvent('action_trigger', { action: 'export_data' });
      trackEvent('page_view', { page: 'dashboard' });
      trackEvent('login', { username: 'admin' });

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(1);
      expect(summary.chartInteractions).toBe(1);
      expect(summary.aiQueries).toBe(1);
      expect(summary.actionTriggers).toBe(1);
      expect(summary.totalEvents).toBe(6);
      expect(summary.eventBreakdown.tab_click).toBe(1);
      expect(summary.eventBreakdown.chart_interaction).toBe(1);
      expect(summary.eventBreakdown.ai_usage).toBe(1);
      expect(summary.eventBreakdown.action_trigger).toBe(1);
      expect(summary.eventBreakdown.page_view).toBe(1);
      expect(summary.eventBreakdown.login).toBe(1);
    });

    it('tracks lastActive as the most recent timestamp', async () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('chart_interaction', { chart: 'uptimeChart' });

      const summary = await getAnalyticsSummary();

      expect(summary.lastActive).not.toBeNull();
      expect(typeof summary.lastActive).toBe('number');
      expect(summary.lastActive).toBeGreaterThan(0);
    });

    it('returns correct totalEvents count', async () => {
      trackEvent('tab_click', { tab: 'a' });
      trackEvent('tab_click', { tab: 'b' });
      trackEvent('ai_usage', { query: 'test' });
      trackEvent('page_view', { page: 'dashboard' });
      trackEvent('login', { username: 'admin' });

      const summary = await getAnalyticsSummary();

      expect(summary.totalEvents).toBe(5);
    });

    it('handles corrupt localStorage data gracefully', async () => {
      localStorage.setItem('canon_cio_event_log', 'not_valid_json{{{');

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(0);
      expect(summary.chartInteractions).toBe(0);
      expect(summary.aiQueries).toBe(0);
      expect(summary.actionTriggers).toBe(0);
      expect(summary.totalEvents).toBe(0);
      expect(summary.lastActive).toBeNull();
    });

    it('handles non-array localStorage data gracefully', async () => {
      localStorage.setItem('canon_cio_event_log', JSON.stringify('just_a_string'));

      const summary = await getAnalyticsSummary();

      expect(summary.totalEvents).toBe(0);
    });

    it('skips invalid event entries in the log', async () => {
      const events = [
        { eventType: 'tab_click', timestamp: Date.now(), details: { tab: 'operations' } },
        null,
        'invalid_entry',
        { eventType: 123, timestamp: Date.now(), details: {} },
        { eventType: 'ai_usage', timestamp: Date.now(), details: { query: 'test' } },
        [1, 2, 3],
      ];
      localStorage.setItem('canon_cio_event_log', JSON.stringify(events));

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(1);
      expect(summary.aiQueries).toBe(1);
      expect(summary.totalEvents).toBe(6);
    });

    it('includes event breakdown for all event types present', async () => {
      trackEvent('insight_view', { insight: 'test_insight' });
      trackEvent('insight_view', { insight: 'another_insight' });
      trackEvent('data_error', { error: 'test_error' });

      const summary = await getAnalyticsSummary();

      expect(summary.eventBreakdown.insight_view).toBe(2);
      expect(summary.eventBreakdown.data_error).toBe(1);
    });
  });

  describe('getEventLog', () => {
    it('returns an empty array when no events exist', () => {
      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });

    it('returns all logged events', () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('ai_usage', { query: 'budget status' });
      trackEvent('chart_interaction', { chart: 'uptimeChart' });

      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(3);
      expect(log[0].eventType).toBe('tab_click');
      expect(log[1].eventType).toBe('ai_usage');
      expect(log[2].eventType).toBe('chart_interaction');
    });

    it('returns events with correct structure', () => {
      trackEvent('page_view', { page: 'dashboard', section: 'executive_summary' });

      const log = getEventLog();

      expect(log.length).toBe(1);
      expect(log[0]).toHaveProperty('eventType');
      expect(log[0]).toHaveProperty('timestamp');
      expect(log[0]).toHaveProperty('details');
      expect(log[0].eventType).toBe('page_view');
      expect(typeof log[0].timestamp).toBe('number');
      expect(log[0].details.page).toBe('dashboard');
      expect(log[0].details.section).toBe('executive_summary');
    });

    it('returns empty array when localStorage contains invalid data', () => {
      localStorage.setItem('canon_cio_event_log', JSON.stringify('not_an_array'));

      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });

    it('returns empty array when localStorage contains corrupt JSON', () => {
      localStorage.setItem('canon_cio_event_log', 'not_valid_json{{{');

      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });

    it('returns stored events from localStorage', () => {
      const events = [
        { eventType: 'login', timestamp: 1700000000000, details: { username: 'admin' } },
        { eventType: 'tab_click', timestamp: 1700000001000, details: { tab: 'operations' } },
      ];
      localStorage.setItem('canon_cio_event_log', JSON.stringify(events));

      const log = getEventLog();

      expect(log).toEqual(events);
    });
  });

  describe('clearEventLog', () => {
    it('empties the event log', () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('ai_usage', { query: 'budget status' });
      trackEvent('chart_interaction', { chart: 'uptimeChart' });

      expect(getEventLog().length).toBe(3);

      const result = clearEventLog();

      expect(result).toBe(true);

      const log = getEventLog();
      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });

    it('returns true when clearing an already empty log', () => {
      const result = clearEventLog();

      expect(result).toBe(true);

      const log = getEventLog();
      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });

    it('allows new events to be tracked after clearing', () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('ai_usage', { query: 'test' });

      clearEventLog();

      expect(getEventLog().length).toBe(0);

      trackEvent('page_view', { page: 'dashboard' });

      const log = getEventLog();
      expect(log.length).toBe(1);
      expect(log[0].eventType).toBe('page_view');
    });

    it('clears log even when localStorage contains corrupt data', () => {
      localStorage.setItem('canon_cio_event_log', 'not_valid_json{{{');

      const result = clearEventLog();

      expect(result).toBe(true);

      const log = getEventLog();
      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });
  });

  describe('trackEvent and getAnalyticsSummary round-trip', () => {
    it('summary reflects all tracked events accurately', async () => {
      trackEvent('tab_click', { tab: 'executive_summary' });
      trackEvent('tab_click', { tab: 'business_impact' });
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('chart_interaction', { chart: 'budgetTrend', action: 'click' });
      trackEvent('chart_interaction', { chart: 'uptimeChart', action: 'hover' });
      trackEvent('ai_usage', { query: 'What is the budget?' });
      trackEvent('action_trigger', { action: 'export_data' });
      trackEvent('action_trigger', { action: 'predictive_analysis' });
      trackEvent('action_trigger', { action: 'ai_chip_click' });
      trackEvent('page_view', { page: 'dashboard' });
      trackEvent('login', { username: 'admin' });
      trackEvent('logout', { username: 'admin' });

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(3);
      expect(summary.chartInteractions).toBe(2);
      expect(summary.aiQueries).toBe(1);
      expect(summary.actionTriggers).toBe(3);
      expect(summary.totalEvents).toBe(12);
      expect(summary.lastActive).not.toBeNull();
      expect(summary.eventBreakdown.tab_click).toBe(3);
      expect(summary.eventBreakdown.chart_interaction).toBe(2);
      expect(summary.eventBreakdown.ai_usage).toBe(1);
      expect(summary.eventBreakdown.action_trigger).toBe(3);
      expect(summary.eventBreakdown.page_view).toBe(1);
      expect(summary.eventBreakdown.login).toBe(1);
      expect(summary.eventBreakdown.logout).toBe(1);
    });

    it('summary reflects cleared state after clearEventLog', async () => {
      trackEvent('tab_click', { tab: 'operations' });
      trackEvent('ai_usage', { query: 'test' });

      clearEventLog();

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(0);
      expect(summary.chartInteractions).toBe(0);
      expect(summary.aiQueries).toBe(0);
      expect(summary.actionTriggers).toBe(0);
      expect(summary.totalEvents).toBe(0);
      expect(summary.lastActive).toBeNull();
    });

    it('summary updates correctly after adding events post-clear', async () => {
      trackEvent('tab_click', { tab: 'operations' });
      clearEventLog();

      trackEvent('ai_usage', { query: 'cloud migration' });
      trackEvent('chart_interaction', { chart: 'riskTrend' });

      const summary = await getAnalyticsSummary();

      expect(summary.tabClicks).toBe(0);
      expect(summary.aiQueries).toBe(1);
      expect(summary.chartInteractions).toBe(1);
      expect(summary.totalEvents).toBe(2);
    });
  });
});