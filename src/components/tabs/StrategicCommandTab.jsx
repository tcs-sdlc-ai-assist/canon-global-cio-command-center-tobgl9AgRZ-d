import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import AIActionChips from '../ai/AIActionChips';
import AIInsightsPanel from '../ai/AIInsightsPanel';
import { CHART_COLORS } from '../../utils/constants';

/**
 * Generates the 12-month strategic trends chart data combining key metrics
 * from multiple dashboard sections.
 * @param {Object} execData - Executive summary section data.
 * @param {Object} bizData - Business impact section data.
 * @param {Object} riskData - Risk & governance section data.
 * @param {Object} innovData - Innovation section data.
 * @returns {Object} Chart.js data object for the trends line chart.
 */
function buildTrendsChartData(execData, bizData, riskData, innovData) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const datasets = [];

  if (execData && execData.charts && execData.charts.budgetTrend) {
    const budgetDataset = execData.charts.budgetTrend.datasets.find(
      (ds) => ds.label === 'Budget Spent ($M)'
    );
    if (budgetDataset) {
      datasets.push({
        label: 'Budget Spent ($M)',
        data: budgetDataset.data,
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: false,
        tension: 0.3,
      });
    }
  }

  if (riskData && riskData.charts && riskData.charts.riskTrend) {
    const riskDataset = riskData.charts.riskTrend.datasets[0];
    if (riskDataset) {
      datasets.push({
        label: 'Risk Score',
        data: riskDataset.data,
        borderColor: CHART_COLORS.danger,
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: false,
        tension: 0.3,
      });
    }
  }

  if (bizData && bizData.charts && bizData.charts.trendChart) {
    const digitalDataset = bizData.charts.trendChart.datasets[0];
    if (digitalDataset) {
      datasets.push({
        label: 'Digital Revenue %',
        data: digitalDataset.data,
        borderColor: CHART_COLORS.secondary,
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: false,
        tension: 0.3,
      });
    }
  }

  if (innovData && innovData.charts && innovData.charts.investmentTrend) {
    const rdData = innovData.charts.investmentTrend.datasets[0];
    if (rdData) {
      const paddedData = new Array(12).fill(null);
      const rdValues = rdData.data;
      const startIdx = 12 - rdValues.length;
      for (let i = 0; i < rdValues.length; i++) {
        paddedData[startIdx + i] = rdValues[i];
      }
      datasets.push({
        label: 'R&D Investment ($M)',
        data: paddedData,
        borderColor: CHART_COLORS.info,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.3,
        spanGaps: true,
      });
    }
  }

  return {
    labels: months,
    datasets,
  };
}

/**
 * Extracts strategic command metrics from multiple section data objects.
 * @param {Object} execData - Executive summary section data.
 * @param {Object} bizData - Business impact section data.
 * @param {Object} riskData - Risk & governance section data.
 * @param {Object} innovData - Innovation section data.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractStrategicMetrics(execData, bizData, riskData, innovData) {
  const metrics = [];

  if (bizData && Array.isArray(bizData.metrics)) {
    const revenueMetric = bizData.metrics.find((m) => m.label === 'Revenue Enabled');
    if (revenueMetric) {
      metrics.push({
        title: 'Revenue Enabled',
        value: revenueMetric.value,
        unit: revenueMetric.unit || '$',
        trend: revenueMetric.trend || '',
        status: revenueMetric.status || '',
        category: 'business_impact',
      });
    }

    const costMetric = bizData.metrics.find((m) => m.label === 'Cost Avoidance');
    if (costMetric) {
      metrics.push({
        title: 'Cost Avoidance',
        value: costMetric.value,
        unit: costMetric.unit || '$',
        trend: costMetric.trend || '',
        status: costMetric.status || '',
        category: 'business_impact',
      });
    }
  }

  if (riskData && Array.isArray(riskData.metrics)) {
    const riskMetric = riskData.metrics.find((m) => m.label === 'Overall Risk Score');
    if (riskMetric) {
      metrics.push({
        title: 'Overall Risk Score',
        value: riskMetric.value,
        unit: riskMetric.unit || '/100',
        trend: riskMetric.trend || '',
        status: riskMetric.status || '',
        category: 'risk_governance',
      });
    }

    const complianceMetric = riskData.metrics.find((m) => m.label === 'Compliance Rate');
    if (complianceMetric) {
      metrics.push({
        title: 'Compliance Rate',
        value: complianceMetric.value,
        unit: complianceMetric.unit || '%',
        trend: complianceMetric.trend || '',
        status: complianceMetric.status || '',
        category: 'risk_governance',
      });
    }
  }

  if (innovData && Array.isArray(innovData.metrics)) {
    const pipelineMetric = innovData.metrics.find((m) => m.label === 'Innovation Pipeline');
    if (pipelineMetric) {
      metrics.push({
        title: 'Innovation Pipeline',
        value: pipelineMetric.value,
        unit: pipelineMetric.unit || 'projects',
        trend: pipelineMetric.trend || '',
        status: pipelineMetric.status || '',
        category: 'innovation',
      });
    }

    const aiMetric = innovData.metrics.find((m) => m.label === 'AI/ML Initiatives');
    if (aiMetric) {
      metrics.push({
        title: 'AI/ML Initiatives',
        value: aiMetric.value,
        unit: aiMetric.unit || '',
        trend: aiMetric.trend || '',
        status: aiMetric.status || '',
        category: 'innovation',
      });
    }
  }

  return metrics;
}

/**
 * Maps metric titles to their AI insight strings from section insights.
 * @param {Object} bizInsights - Business impact AI insights.
 * @param {Object} riskInsights - Risk & governance AI insights.
 * @param {Object} innovInsights - Innovation AI insights.
 * @returns {Object} Map of metric title to AI insight string.
 */
function buildInsightMap(bizInsights, riskInsights, innovInsights) {
  const map = {};

  if (bizInsights && bizInsights.metricInsights) {
    if (bizInsights.metricInsights['Revenue Enabled']) {
      map['Revenue Enabled'] = bizInsights.metricInsights['Revenue Enabled'];
    }
    if (bizInsights.metricInsights['Cost Avoidance']) {
      map['Cost Avoidance'] = bizInsights.metricInsights['Cost Avoidance'];
    }
  }

  if (riskInsights && riskInsights.metricInsights) {
    if (riskInsights.metricInsights['Overall Risk Score']) {
      map['Overall Risk Score'] = riskInsights.metricInsights['Overall Risk Score'];
    }
    if (riskInsights.metricInsights['Compliance Rate']) {
      map['Compliance Rate'] = riskInsights.metricInsights['Compliance Rate'];
    }
  }

  if (innovInsights && innovInsights.metricInsights) {
    if (innovInsights.metricInsights['Innovation Pipeline']) {
      map['Innovation Pipeline'] = innovInsights.metricInsights['Innovation Pipeline'];
    }
    if (innovInsights.metricInsights['AI/ML Initiatives']) {
      map['AI/ML Initiatives'] = innovInsights.metricInsights['AI/ML Initiatives'];
    }
  }

  return map;
}

/**
 * StrategicCommandTab component.
 * Renders the Strategic Command dashboard section with:
 * - AI Action Chips bar
 * - Strategic metric cards (Business Impact, Risk, Innovation) with AI insights
 * - 12-month Strategic Trends line chart with Export Data and Predictive Analysis buttons
 * - AI Insights Panel
 *
 * Fetches data from multiple dashboard sections via DashboardDataService.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function StrategicCommandTab() {
  const { openChatWithQuery } = useAI();
  const [metrics, setMetrics] = useState([]);
  const [trendsChartData, setTrendsChartData] = useState(null);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    const sections = ['executive_summary', 'business_impact', 'risk_governance', 'innovation'];

    Promise.all([
      ...sections.map((section) =>
        getDashboardData(section).catch((e) => {
          console.error(`[StrategicCommandTab] Failed to load ${section}:`, e);
          return null;
        })
      ),
      ...sections.slice(1).map((section) =>
        getAIInsights(section).catch((e) => {
          console.error(`[StrategicCommandTab] Failed to load insights for ${section}:`, e);
          return null;
        })
      ),
    ])
      .then((results) => {
        if (cancelled) return;

        const [execData, bizData, riskData, innovData, bizInsights, riskInsights, innovInsights] = results;

        const extractedMetrics = extractStrategicMetrics(execData, bizData, riskData, innovData);
        setMetrics(extractedMetrics);

        const chartData = buildTrendsChartData(execData, bizData, riskData, innovData);
        setTrendsChartData(chartData);

        const iMap = buildInsightMap(bizInsights, riskInsights, innovInsights);
        setInsightMap(iMap);
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[StrategicCommandTab] Failed to load strategic command data:', e);
          setError('Failed to load strategic command data');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Handles metric card click. Opens AI chat with a query about the metric.
   * @param {Object} metric - The metric object from the card.
   * @returns {void}
   */
  const handleMetricClick = useCallback((metric) => {
    trackEvent('chart_interaction', {
      metric: metric.title,
      category: metric.category || 'strategic_command',
      action: 'metric_card_click',
    });

    openChatWithQuery(`Tell me more about ${metric.title}`);
  }, [openChatWithQuery]);

  /**
   * Handles the Export Data button click on the trends chart.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handleExport = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'export_data',
      chart: chartInfo.title || 'Strategic Trends',
      category: 'strategic_command',
    });
  }, []);

  /**
   * Handles the Predictive Analysis button click on the trends chart.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handlePredictiveAnalysis = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'predictive_analysis',
      chart: chartInfo.title || 'Strategic Trends',
      category: 'strategic_command',
    });

    openChatWithQuery('Show me predictive analysis for strategic trends across budget, risk, digital revenue, and R&D investment.');
  }, [openChatWithQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* AI Action Chips skeleton */}
        <div className="flex items-center space-x-2 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-32 bg-gray-100 rounded-executive animate-pulse flex-shrink-0"
            />
          ))}
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100"
            >
              <div className="h-4 w-24 bg-gray-100 rounded-executive animate-pulse mb-3" />
              <div className="h-8 w-20 bg-gray-100 rounded-executive animate-pulse mb-2" />
              <div className="h-3 w-16 bg-gray-100 rounded-executive animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
          <div className="h-5 w-48 bg-gray-100 rounded-executive animate-pulse mb-4" />
          <div className="h-64 bg-gray-100 rounded-executive animate-pulse" />
        </div>

        {/* Insights panel skeleton */}
        <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
          <div className="h-5 w-40 bg-gray-100 rounded-executive animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-executive animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div
          role="alert"
          className="bg-white rounded-executive-md shadow-executive p-6 border border-gray-100 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-executive-amber-500 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700 mb-1">{error}</p>
          <p className="text-xs text-gray-400">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const trendsChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#6b7280' },
      },
      y: {
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: { font: { size: 11 }, color: '#6b7280' },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div
      className="space-y-6"
      role="tabpanel"
      id="tabpanel-strategic_command"
      aria-labelledby="tab-strategic_command"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Strategic Command
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live strategic data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips />

      {/* Strategic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            trend={metric.trend}
            status={metric.status}
            aiInsight={insightMap[metric.title] || ''}
            category={metric.category}
            onClick={handleMetricClick}
            live
          />
        ))}
      </div>

      {/* 12-Month Strategic Trends Chart */}
      {trendsChartData && trendsChartData.datasets && trendsChartData.datasets.length > 0 && (
        <ChartPanel
          type="line"
          data={trendsChartData}
          options={trendsChartOptions}
          title="12-Month Strategic Trends"
          onExport={handleExport}
          onPredictiveAnalysis={handlePredictiveAnalysis}
          category="strategic_command"
        />
      )}

      {/* AI Insights Panel */}
      <AIInsightsPanel maxItems={5} />
    </div>
  );
}

export default StrategicCommandTab;