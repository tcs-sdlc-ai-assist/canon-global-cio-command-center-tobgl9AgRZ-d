import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import PerformanceTable from '../common/PerformanceTable';
import AIActionChips from '../ai/AIActionChips';

/**
 * Extracts operations metrics from section data and maps them
 * to a presentation-friendly format for MetricCard components.
 * @param {Object} sectionData - The operations section data object.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractMetrics(sectionData) {
  if (!sectionData || !Array.isArray(sectionData.metrics)) {
    return [];
  }

  const metricMapping = {
    'System Uptime': {
      title: 'System Uptime',
      category: 'operations',
    },
    'Mean Time to Resolve': {
      title: 'Mean Time to Resolve',
      category: 'operations',
    },
    'Change Success Rate': {
      title: 'Change Success Rate',
      category: 'operations',
    },
    'Open P1 Incidents': {
      title: 'Open P1 Incidents',
      category: 'operations',
    },
    'Deployment Frequency': {
      title: 'Deployment Frequency',
      category: 'operations',
    },
    'Infrastructure Cost': {
      title: 'Infrastructure Cost',
      category: 'operations',
    },
  };

  const metrics = [];

  for (const m of sectionData.metrics) {
    const mapping = metricMapping[m.label];
    if (mapping) {
      metrics.push({
        title: mapping.title,
        value: m.value,
        unit: m.unit || '',
        trend: m.trend || '',
        status: m.status || '',
        category: mapping.category,
        originalLabel: m.label,
      });
    }
  }

  return metrics;
}

/**
 * OperationsTab component.
 * Renders the Operations dashboard section with:
 * - AI Action Chips bar filtered to operations category
 * - Operations metric cards (System Uptime, MTTR, Change Success Rate,
 *   Open P1 Incidents, Deployment Frequency, Infrastructure Cost) with AI insights
 * - System Uptime Trend line chart
 * - Incident Breakdown bar chart (P1, P2, P3 incidents by month)
 * - PerformanceTable with service-level status labels
 *
 * Fetches data from DashboardDataService for the operations section.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function OperationsTab() {
  const { openChatWithQuery } = useAI();
  const [sectionData, setSectionData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [uptimeChartData, setUptimeChartData] = useState(null);
  const [incidentChartData, setIncidentChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([
      getDashboardData('operations').catch((e) => {
        console.error('[OperationsTab] Failed to load operations data:', e);
        return null;
      }),
      getAIInsights('operations').catch((e) => {
        console.error('[OperationsTab] Failed to load AI insights:', e);
        return null;
      }),
    ])
      .then(([data, insights]) => {
        if (cancelled) return;

        if (data) {
          setSectionData(data);

          const extractedMetrics = extractMetrics(data);
          setMetrics(extractedMetrics);

          if (data.charts && data.charts.uptimeChart) {
            const uc = data.charts.uptimeChart;
            setUptimeChartData({
              labels: uc.labels,
              datasets: uc.datasets,
            });
          }

          if (data.charts && data.charts.incidentChart) {
            const ic = data.charts.incidentChart;
            setIncidentChartData({
              labels: ic.labels,
              datasets: ic.datasets,
            });
          }

          if (Array.isArray(data.table)) {
            setTableData(data.table);
          }
        }

        if (insights && insights.metricInsights) {
          setInsightMap(insights.metricInsights);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[OperationsTab] Failed to load operations:', e);
          setError('Failed to load operations data');
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
      category: metric.category || 'operations',
      action: 'metric_card_click',
    });

    openChatWithQuery(`Tell me more about ${metric.title}`);
  }, [openChatWithQuery]);

  /**
   * Handles the Export Data button click on charts.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handleExport = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'export_data',
      chart: chartInfo.title || 'Operations Chart',
      category: 'operations',
    });
  }, []);

  /**
   * Handles the Predictive Analysis button click on charts.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handlePredictiveAnalysis = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'predictive_analysis',
      chart: chartInfo.title || 'Operations Chart',
      category: 'operations',
    });

    openChatWithQuery('Show me predictive analysis for operations metrics including system uptime, incident trends, and MTTR projections.');
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

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100"
            >
              <div className="h-5 w-48 bg-gray-100 rounded-executive animate-pulse mb-4" />
              <div className="h-64 bg-gray-100 rounded-executive animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
          <div className="h-5 w-40 bg-gray-100 rounded-executive animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-executive animate-pulse" />
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

  const uptimeChartOptions = {
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
        min: 99.8,
        max: 100,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const incidentChartOptions = {
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
        stacked: true,
      },
      y: {
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: { font: { size: 11 }, color: '#6b7280' },
        stacked: true,
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
      id="tabpanel-operations"
      aria-labelledby="tab-operations"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Operations
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live operations data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips filterCategory="operations" />

      {/* Operations Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            trend={metric.trend}
            status={metric.status}
            aiInsight={insightMap[metric.originalLabel] || insightMap[metric.title] || ''}
            category={metric.category}
            onClick={handleMetricClick}
            live
          />
        ))}
      </div>

      {/* Charts Row: System Uptime Trend + Incident Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Uptime Trend Line Chart */}
        {uptimeChartData && uptimeChartData.datasets && uptimeChartData.datasets.length > 0 && (
          <ChartPanel
            type="line"
            data={uptimeChartData}
            options={uptimeChartOptions}
            title="12-Month System Uptime Trend"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="operations"
          />
        )}

        {/* Incident Breakdown Bar Chart */}
        {incidentChartData && incidentChartData.datasets && incidentChartData.datasets.length > 0 && (
          <ChartPanel
            type="bar"
            data={incidentChartData}
            options={incidentChartOptions}
            title="Monthly Incident Breakdown"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="operations"
          />
        )}
      </div>

      {/* Service Performance Table */}
      {tableData.length > 0 && (
        <PerformanceTable
          data={tableData}
          title="Service Health Overview"
          category="operations"
        />
      )}
    </div>
  );
}

export default OperationsTab;