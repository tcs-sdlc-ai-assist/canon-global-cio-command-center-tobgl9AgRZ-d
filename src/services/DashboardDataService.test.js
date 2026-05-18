import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDashboardData,
  saveEvent,
  getAIInsights,
  getEventLog,
  getValidSections,
  initializeDashboardData,
} from './DashboardDataService';

describe('DashboardDataService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getValidSections', () => {
    it('returns all valid section names', () => {
      const sections = getValidSections();

      expect(Array.isArray(sections)).toBe(true);
      expect(sections).toContain('executive_summary');
      expect(sections).toContain('business_impact');
      expect(sections).toContain('operations');
      expect(sections).toContain('risk_governance');
      expect(sections).toContain('innovation');
      expect(sections).toContain('partnerships');
      expect(sections.length).toBe(6);
    });

    it('returns a new array each time (not a reference)', () => {
      const a = getValidSections();
      const b = getValidSections();

      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('initializeDashboardData', () => {
    it('initializes dashboard data in localStorage', () => {
      initializeDashboardData();

      const raw = localStorage.getItem('canon_cio_dashboard_data');
      expect(raw).not.toBeNull();

      const data = JSON.parse(raw);
      expect(typeof data).toBe('object');
      expect(data).not.toBeNull();
      expect(data.executive_summary).toBeDefined();
      expect(data.business_impact).toBeDefined();
      expect(data.operations).toBeDefined();
      expect(data.risk_governance).toBeDefined();
      expect(data.innovation).toBeDefined();
      expect(data.partnerships).toBeDefined();
    });

    it('initializes AI insights in localStorage', () => {
      initializeDashboardData();

      const raw = localStorage.getItem('canon_cio_ai_insights');
      expect(raw).not.toBeNull();

      const insights = JSON.parse(raw);
      expect(typeof insights).toBe('object');
      expect(insights).not.toBeNull();
      expect(insights.executive_summary).toBeDefined();
      expect(insights.business_impact).toBeDefined();
    });

    it('initializes event log in localStorage', () => {
      initializeDashboardData();

      const raw = localStorage.getItem('canon_cio_event_log');
      expect(raw).not.toBeNull();

      const log = JSON.parse(raw);
      expect(Array.isArray(log)).toBe(true);
    });

    it('does not overwrite existing dashboard data', () => {
      const customData = {
        executive_summary: { metrics: [{ label: 'Custom', value: 999 }] },
        business_impact: {},
        operations: {},
        risk_governance: {},
        innovation: {},
        partnerships: {},
      };
      localStorage.setItem('canon_cio_dashboard_data', JSON.stringify(customData));

      initializeDashboardData();

      const data = JSON.parse(localStorage.getItem('canon_cio_dashboard_data'));
      expect(data.executive_summary.metrics[0].label).toBe('Custom');
      expect(data.executive_summary.metrics[0].value).toBe(999);
    });
  });

  describe('getDashboardData', () => {
    it('returns data for executive_summary section', async () => {
      const data = await getDashboardData('executive_summary');

      expect(data).toBeDefined();
      expect(data).not.toBeNull();
      expect(typeof data).toBe('object');
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('returns data for business_impact section', async () => {
      const data = await getDashboardData('business_impact');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(data.charts.valueChart).toBeDefined();
      expect(data.charts.trendChart).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('returns data for operations section', async () => {
      const data = await getDashboardData('operations');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(data.charts.uptimeChart).toBeDefined();
      expect(data.charts.incidentChart).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('returns data for risk_governance section', async () => {
      const data = await getDashboardData('risk_governance');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(data.charts.riskTrend).toBeDefined();
      expect(data.charts.complianceChart).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('returns data for innovation section', async () => {
      const data = await getDashboardData('innovation');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(data.charts.portfolioChart).toBeDefined();
      expect(data.charts.investmentTrend).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('returns data for partnerships section', async () => {
      const data = await getDashboardData('partnerships');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
      expect(data.charts).toBeDefined();
      expect(data.charts.partnerPerformance).toBeDefined();
      expect(data.charts.spendTrend).toBeDefined();
      expect(Array.isArray(data.table)).toBe(true);
    });

    it('initializes defaults on first call when localStorage is empty', async () => {
      expect(localStorage.getItem('canon_cio_dashboard_data')).toBeNull();

      const data = await getDashboardData('executive_summary');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);

      const stored = localStorage.getItem('canon_cio_dashboard_data');
      expect(stored).not.toBeNull();
    });

    it('rejects with error for invalid section name', async () => {
      await expect(getDashboardData('invalid_section')).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for empty string section', async () => {
      await expect(getDashboardData('')).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for null section', async () => {
      await expect(getDashboardData(null)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for undefined section', async () => {
      await expect(getDashboardData(undefined)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for numeric section', async () => {
      await expect(getDashboardData(123)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('returns metrics with expected properties for business_impact', async () => {
      const data = await getDashboardData('business_impact');

      for (const metric of data.metrics) {
        expect(metric).toHaveProperty('label');
        expect(metric).toHaveProperty('value');
        expect(typeof metric.label).toBe('string');
      }
    });

    it('returns chart data with labels and datasets for business_impact', async () => {
      const data = await getDashboardData('business_impact');

      const valueChart = data.charts.valueChart;
      expect(Array.isArray(valueChart.labels)).toBe(true);
      expect(valueChart.labels.length).toBeGreaterThan(0);
      expect(Array.isArray(valueChart.datasets)).toBe(true);
      expect(valueChart.datasets.length).toBeGreaterThan(0);

      const trendChart = data.charts.trendChart;
      expect(Array.isArray(trendChart.labels)).toBe(true);
      expect(trendChart.labels.length).toBeGreaterThan(0);
      expect(Array.isArray(trendChart.datasets)).toBe(true);
      expect(trendChart.datasets.length).toBeGreaterThan(0);
    });

    it('returns table data with expected row properties for business_impact', async () => {
      const data = await getDashboardData('business_impact');

      expect(data.table.length).toBeGreaterThan(0);
      for (const row of data.table) {
        expect(row).toHaveProperty('initiative');
        expect(row).toHaveProperty('status');
      }
    });

    it('recovers from corrupt localStorage data by reinitializing defaults', async () => {
      localStorage.setItem('canon_cio_dashboard_data', 'not_valid_json{{{');

      const data = await getDashboardData('executive_summary');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
    });

    it('recovers when stored data is a string instead of object', async () => {
      localStorage.setItem('canon_cio_dashboard_data', JSON.stringify('just_a_string'));

      const data = await getDashboardData('business_impact');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
    });

    it('recovers when section is missing from stored data', async () => {
      const partialData = {
        executive_summary: { metrics: [], charts: {}, table: [] },
      };
      localStorage.setItem('canon_cio_dashboard_data', JSON.stringify(partialData));

      const data = await getDashboardData('business_impact');

      expect(data).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics.length).toBeGreaterThan(0);
    });

    it('returns consistent data across multiple calls for the same section', async () => {
      const data1 = await getDashboardData('operations');
      const data2 = await getDashboardData('operations');

      expect(data1.metrics.length).toBe(data2.metrics.length);
      expect(data1.table.length).toBe(data2.table.length);
    });
  });

  describe('saveEvent', () => {
    it('appends an event to the event log', async () => {
      initializeDashboardData();

      const event = {
        eventType: 'tab_click',
        timestamp: Date.now(),
        details: { tab: 'business_impact' },
      };

      await saveEvent(event);

      const log = getEventLog();
      expect(log.length).toBeGreaterThan(0);

      const lastEvent = log[log.length - 1];
      expect(lastEvent.eventType).toBe('tab_click');
      expect(lastEvent.details.tab).toBe('business_impact');
    });

    it('appends multiple events in order', async () => {
      initializeDashboardData();

      const event1 = {
        eventType: 'tab_click',
        timestamp: Date.now(),
        details: { tab: 'operations' },
      };

      const event2 = {
        eventType: 'chart_interaction',
        timestamp: Date.now() + 1000,
        details: { chart: 'uptimeChart', action: 'click' },
      };

      await saveEvent(event1);
      await saveEvent(event2);

      const log = getEventLog();
      const lastTwo = log.slice(-2);
      expect(lastTwo[0].eventType).toBe('tab_click');
      expect(lastTwo[1].eventType).toBe('chart_interaction');
    });

    it('saves event with correct structure', async () => {
      initializeDashboardData();

      const event = {
        eventType: 'ai_usage',
        timestamp: 1700000000000,
        details: { query: 'What is the budget?' },
      };

      await saveEvent(event);

      const log = getEventLog();
      const savedEvent = log[log.length - 1];
      expect(savedEvent.eventType).toBe('ai_usage');
      expect(savedEvent.timestamp).toBe(1700000000000);
      expect(savedEvent.details.query).toBe('What is the budget?');
    });

    it('assigns current timestamp when event timestamp is missing', async () => {
      initializeDashboardData();

      const before = Date.now();

      const event = {
        eventType: 'action_trigger',
        details: { action: 'export_data' },
      };

      await saveEvent(event);

      const after = Date.now();
      const log = getEventLog();
      const savedEvent = log[log.length - 1];
      expect(savedEvent.timestamp).toBeGreaterThanOrEqual(before);
      expect(savedEvent.timestamp).toBeLessThanOrEqual(after);
    });

    it('assigns empty object for details when details is missing', async () => {
      initializeDashboardData();

      const event = {
        eventType: 'tab_click',
        timestamp: Date.now(),
      };

      await saveEvent(event);

      const log = getEventLog();
      const savedEvent = log[log.length - 1];
      expect(savedEvent.details).toBeDefined();
      expect(typeof savedEvent.details).toBe('object');
    });

    it('rejects with error for null event', async () => {
      await expect(saveEvent(null)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_EVENT',
        })
      );
    });

    it('rejects with error for undefined event', async () => {
      await expect(saveEvent(undefined)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_EVENT',
        })
      );
    });

    it('rejects with error for array event', async () => {
      await expect(saveEvent([1, 2, 3])).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_EVENT',
        })
      );
    });

    it('rejects with error for event without eventType', async () => {
      await expect(saveEvent({ timestamp: Date.now(), details: {} })).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_EVENT',
        })
      );
    });

    it('rejects with error for event with non-string eventType', async () => {
      await expect(saveEvent({ eventType: 123, timestamp: Date.now() })).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_EVENT',
        })
      );
    });

    it('initializes event log if not present before saving', async () => {
      expect(localStorage.getItem('canon_cio_event_log')).toBeNull();

      const event = {
        eventType: 'page_view',
        timestamp: Date.now(),
        details: { page: 'dashboard' },
      };

      await saveEvent(event);

      const log = getEventLog();
      expect(log.length).toBeGreaterThanOrEqual(1);
      expect(log[log.length - 1].eventType).toBe('page_view');
    });
  });

  describe('getAIInsights', () => {
    it('returns insights for executive_summary section', async () => {
      const insights = await getAIInsights('executive_summary');

      expect(insights).toBeDefined();
      expect(typeof insights).toBe('object');
      expect(insights.summary).toBeDefined();
      expect(typeof insights.summary).toBe('string');
      expect(insights.summary.length).toBeGreaterThan(0);
      expect(insights.metricInsights).toBeDefined();
      expect(typeof insights.metricInsights).toBe('object');
    });

    it('returns insights for business_impact section', async () => {
      const insights = await getAIInsights('business_impact');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(typeof insights.summary).toBe('string');
      expect(insights.metricInsights).toBeDefined();
      expect(insights.metricInsights['Revenue Enabled']).toBeDefined();
      expect(insights.metricInsights['Cost Avoidance']).toBeDefined();
    });

    it('returns insights for operations section', async () => {
      const insights = await getAIInsights('operations');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
      expect(insights.metricInsights['System Uptime']).toBeDefined();
      expect(insights.metricInsights['Mean Time to Resolve']).toBeDefined();
    });

    it('returns insights for risk_governance section', async () => {
      const insights = await getAIInsights('risk_governance');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
      expect(insights.metricInsights['Overall Risk Score']).toBeDefined();
      expect(insights.metricInsights['Compliance Rate']).toBeDefined();
    });

    it('returns insights for innovation section', async () => {
      const insights = await getAIInsights('innovation');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
      expect(insights.metricInsights['Innovation Pipeline']).toBeDefined();
      expect(insights.metricInsights['AI/ML Initiatives']).toBeDefined();
    });

    it('returns insights for partnerships section', async () => {
      const insights = await getAIInsights('partnerships');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
      expect(insights.metricInsights['Strategic Partners']).toBeDefined();
      expect(insights.metricInsights['Joint Revenue']).toBeDefined();
    });

    it('returns recommendations array for each section', async () => {
      const sections = getValidSections();

      for (const section of sections) {
        const insights = await getAIInsights(section);
        expect(insights.recommendations).toBeDefined();
        expect(Array.isArray(insights.recommendations)).toBe(true);
        expect(insights.recommendations.length).toBeGreaterThan(0);
      }
    });

    it('initializes defaults on first call when localStorage is empty', async () => {
      expect(localStorage.getItem('canon_cio_ai_insights')).toBeNull();

      const insights = await getAIInsights('executive_summary');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();

      const stored = localStorage.getItem('canon_cio_ai_insights');
      expect(stored).not.toBeNull();
    });

    it('rejects with error for invalid section name', async () => {
      await expect(getAIInsights('invalid_section')).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for empty string section', async () => {
      await expect(getAIInsights('')).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for null section', async () => {
      await expect(getAIInsights(null)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('rejects with error for undefined section', async () => {
      await expect(getAIInsights(undefined)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_SECTION',
        })
      );
    });

    it('recovers from corrupt localStorage data by reinitializing defaults', async () => {
      localStorage.setItem('canon_cio_ai_insights', 'not_valid_json{{{');

      const insights = await getAIInsights('business_impact');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
    });

    it('recovers when stored insights is a string instead of object', async () => {
      localStorage.setItem('canon_cio_ai_insights', JSON.stringify('just_a_string'));

      const insights = await getAIInsights('operations');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
    });

    it('recovers when section is missing from stored insights', async () => {
      const partialInsights = {
        executive_summary: { summary: 'test', metricInsights: {}, recommendations: [] },
      };
      localStorage.setItem('canon_cio_ai_insights', JSON.stringify(partialInsights));

      const insights = await getAIInsights('innovation');

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.metricInsights).toBeDefined();
    });

    it('returns metric insight strings that are non-empty', async () => {
      const insights = await getAIInsights('business_impact');

      for (const [key, value] of Object.entries(insights.metricInsights)) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getEventLog', () => {
    it('returns an empty array when no events exist', () => {
      initializeDashboardData();

      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
    });

    it('returns events after saving them', async () => {
      initializeDashboardData();

      await saveEvent({
        eventType: 'tab_click',
        timestamp: Date.now(),
        details: { tab: 'operations' },
      });

      const log = getEventLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[log.length - 1].eventType).toBe('tab_click');
    });

    it('returns empty array when localStorage contains invalid data', () => {
      localStorage.setItem('canon_cio_event_log', JSON.stringify('not_an_array'));

      const log = getEventLog();

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBe(0);
    });
  });

  describe('getDashboardData and getAIInsights integration', () => {
    it('returns matching metric labels between data and insights for business_impact', async () => {
      const data = await getDashboardData('business_impact');
      const insights = await getAIInsights('business_impact');

      const metricLabels = data.metrics.map((m) => m.label);
      const insightKeys = Object.keys(insights.metricInsights);

      for (const key of insightKeys) {
        expect(metricLabels).toContain(key);
      }
    });

    it('returns matching metric labels between data and insights for operations', async () => {
      const data = await getDashboardData('operations');
      const insights = await getAIInsights('operations');

      const metricLabels = data.metrics.map((m) => m.label);
      const insightKeys = Object.keys(insights.metricInsights);

      for (const key of insightKeys) {
        expect(metricLabels).toContain(key);
      }
    });

    it('returns matching metric labels between data and insights for all sections', async () => {
      const sections = getValidSections();

      for (const section of sections) {
        const data = await getDashboardData(section);
        const insights = await getAIInsights(section);

        const metricLabels = data.metrics.map((m) => m.label);
        const insightKeys = Object.keys(insights.metricInsights);

        for (const key of insightKeys) {
          expect(metricLabels).toContain(key);
        }
      }
    });
  });
});