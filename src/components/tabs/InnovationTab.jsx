import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import PerformanceTable from '../common/PerformanceTable';
import AIActionChips from '../ai/AIActionChips';

/**
 * Extracts innovation metrics from section data and maps them
 * to a presentation-friendly format for MetricCard components.
 * @param {Object} sectionData - The innovation section data object.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractMetrics(sectionData) {
  if (!sectionData || !Array.isArray(sectionData.metrics)) {
    return [];
  }

  const metricMapping = {
    'Innovation Pipeline': {
      title: 'Innovation Pipeline',
      category: 'innovation',
    },
    'AI/ML Initiatives': {
      title: 'AI/ML Initiatives',
      category: 'innovation',
    },
    'Patent Applications': {
      title: 'Patent Applications',
      category: 'innovation',
    },
    'R&D Investment': {
      title: 'R&D Investment',
      category: 'innovation',
    },
    'PoC Success Rate': {
      title: 'PoC Success Rate',
      category: 'innovation',
    },
    'Time to PoC': {
      title: 'Time to PoC',
      category: 'innovation',
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
 * InnovationTab component.
 * Renders the Innovation dashboard section with:
 * - AI Action Chips bar filtered to innovation category
 * - Innovation metric cards (Innovation Pipeline, AI/ML Initiatives, Patent Applications,
 *   R&D Investment, PoC Success Rate, Time to PoC) with AI insights
 * - Portfolio Chart (doughnut chart for innovation domain distribution)
 * - R&D Investment Trend bar chart
 * - PerformanceTable with project-level status labels
 *
 * Fetches data from DashboardDataService for the innovation section.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function InnovationTab() {
  const { openChatWithQuery } = useAI();
  const [sectionData, setSectionData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [portfolioChartData, setPortfolioChartData] = useState(null);
  const [investmentChartData, setInvestmentChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([
      getDashboardData('innovation').catch((e) => {
        console.error('[InnovationTab] Failed to load innovation data:', e);
        return null;
      }),
      getAIInsights('innovation').catch((e) => {
        console.error('[InnovationTab] Failed to load AI insights:', e);
        return null;
      }),
    ])
      .then(([data, insights]) => {
        if (cancelled) return;

        if (data) {
          setSectionData(data);

          const extractedMetrics = extractMetrics(data);
          setMetrics(extractedMetrics);

          if (data.charts && data.charts.portfolioChart) {
            const pc = data.charts.portfolioChart;
            setPortfolioChartData({
              labels: pc.labels,
              datasets: pc.datasets,
            });
          }

          if (data.charts && data.charts.investmentTrend) {
            const it = data.charts.investmentTrend;
            setInvestmentChartData({
              labels: it.labels,
              datasets: it.datasets,
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
          console.error('[InnovationTab] Failed to load innovation:', e);
          setError('Failed to load innovation data');
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
      category: metric.category || 'innovation',
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
      chart: chartInfo.title || 'Innovation Chart',
      category: 'innovation',
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
      chart: chartInfo.title || 'Innovation Chart',
      category: 'innovation',
    });

    openChatWithQuery('Show me predictive analysis for innovation metrics including pipeline growth, R&D investment trends, and PoC success rate projections.');
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

  const portfolioChartOptions = {
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
    cutout: '60%',
  };

  const investmentChartOptions = {
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
      id="tabpanel-innovation"
      aria-labelledby="tab-innovation"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Innovation
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live innovation data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips filterCategory="innovation" />

      {/* Innovation Metric Cards */}
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

      {/* Charts Row: Portfolio Chart + R&D Investment Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Innovation Portfolio Doughnut Chart */}
        {portfolioChartData && portfolioChartData.datasets && portfolioChartData.datasets.length > 0 && (
          <ChartPanel
            type="doughnut"
            data={portfolioChartData}
            options={portfolioChartOptions}
            title="Innovation Portfolio Distribution"
            onExport={handleExport}
            category="innovation"
          />
        )}

        {/* R&D Investment Trend Bar Chart */}
        {investmentChartData && investmentChartData.datasets && investmentChartData.datasets.length > 0 && (
          <ChartPanel
            type="bar"
            data={investmentChartData}
            options={investmentChartOptions}
            title="R&D Investment Trend"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="innovation"
          />
        )}
      </div>

      {/* Innovation Project Table */}
      {tableData.length > 0 && (
        <PerformanceTable
          data={tableData}
          title="Innovation Project Pipeline"
          category="innovation"
        />
      )}
    </div>
  );
}

export default InnovationTab;