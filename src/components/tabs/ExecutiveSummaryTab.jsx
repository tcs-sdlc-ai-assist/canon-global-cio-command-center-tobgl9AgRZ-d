import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import PerformanceTable from '../common/PerformanceTable';
import AIActionChips from '../ai/AIActionChips';
import { CHART_COLORS } from '../../utils/constants';

/**
 * Extracts executive summary metrics from section data and maps them
 * to a presentation-friendly format for MetricCard components.
 * @param {Object} sectionData - The executive_summary section data object.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractMetrics(sectionData) {
  if (!sectionData || !Array.isArray(sectionData.metrics)) {
    return [];
  }

  const metricMapping = {
    'IT Budget Utilization': {
      title: 'IT Health Score',
      category: 'executive_summary',
    },
    'System Uptime': {
      title: 'Availability',
      category: 'operations',
    },
    'Security Score': {
      title: 'Security Posture',
      category: 'risk_governance',
    },
    'Active Projects': {
      title: 'Transformation Index',
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
 * Builds a radar chart data object comparing regions across KPIs.
 * @param {Array<Object>} tableData - The region table data from the section.
 * @returns {Object|null} Chart.js data object for the radar chart, or null if data is insufficient.
 */
function buildRegionalRadarData(tableData) {
  if (!Array.isArray(tableData) || tableData.length === 0) {
    return null;
  }

  const kpiLabels = ['Uptime', 'Incidents', 'Satisfaction'];

  const datasets = tableData.map((row, index) => {
    const uptimeValue = parseFloat(String(row.uptime).replace('%', '')) || 0;
    const uptimeNormalized = ((uptimeValue - 99.5) / 0.5) * 100;

    const incidentMax = 5;
    const incidentValue = typeof row.incidents === 'number' ? row.incidents : 0;
    const incidentNormalized = Math.max(0, ((incidentMax - incidentValue) / incidentMax) * 100);

    const satisfactionValue = typeof row.satisfaction === 'number' ? row.satisfaction : 0;
    const satisfactionNormalized = (satisfactionValue / 5) * 100;

    const colorIndex = index % CHART_COLORS.palette.length;
    const color = CHART_COLORS.palette[colorIndex];

    return {
      label: row.region || `Region ${index + 1}`,
      data: [
        Math.round(uptimeNormalized * 10) / 10,
        Math.round(incidentNormalized * 10) / 10,
        Math.round(satisfactionNormalized * 10) / 10,
      ],
      borderColor: color,
      backgroundColor: `${color}20`,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color,
    };
  });

  return {
    labels: kpiLabels,
    datasets,
  };
}

/**
 * ExecutiveSummaryTab component.
 * Renders the Executive Summary dashboard section with:
 * - AI Action Chips bar filtered to executive_summary category
 * - Operations metric cards (IT Health Score, Availability, Security Posture, Transformation Index) with AI insights
 * - Regional Radar Chart comparing regions across KPIs
 * - Budget Trend line chart
 * - PerformanceTable with region-wise status labels
 *
 * Fetches data from DashboardDataService for the executive_summary section.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function ExecutiveSummaryTab() {
  const { openChatWithQuery } = useAI();
  const [sectionData, setSectionData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [radarChartData, setRadarChartData] = useState(null);
  const [budgetChartData, setBudgetChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([
      getDashboardData('executive_summary').catch((e) => {
        console.error('[ExecutiveSummaryTab] Failed to load executive summary data:', e);
        return null;
      }),
      getAIInsights('executive_summary').catch((e) => {
        console.error('[ExecutiveSummaryTab] Failed to load AI insights:', e);
        return null;
      }),
    ])
      .then(([data, insights]) => {
        if (cancelled) return;

        if (data) {
          setSectionData(data);

          const extractedMetrics = extractMetrics(data);
          setMetrics(extractedMetrics);

          if (data.charts && data.charts.budgetTrend) {
            const bt = data.charts.budgetTrend;
            setBudgetChartData({
              labels: bt.labels,
              datasets: bt.datasets,
            });
          }

          if (Array.isArray(data.table)) {
            setTableData(data.table);
            const radar = buildRegionalRadarData(data.table);
            setRadarChartData(radar);
          }
        }

        if (insights && insights.metricInsights) {
          const iMap = {};
          const labelToTitle = {
            'IT Budget Utilization': 'IT Health Score',
            'System Uptime': 'Availability',
            'Security Score': 'Security Posture',
            'Active Projects': 'Transformation Index',
          };

          for (const [originalLabel, insightText] of Object.entries(insights.metricInsights)) {
            const mappedTitle = labelToTitle[originalLabel];
            if (mappedTitle) {
              iMap[mappedTitle] = insightText;
            }
          }

          setInsightMap(iMap);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[ExecutiveSummaryTab] Failed to load executive summary:', e);
          setError('Failed to load executive summary data');
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
      category: metric.category || 'executive_summary',
      action: 'metric_card_click',
    });

    openChatWithQuery(`Tell me more about ${metric.title}`);
  }, [openChatWithQuery]);

  /**
   * Handles the Export Data button click on the budget trend chart.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handleExport = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'export_data',
      chart: chartInfo.title || 'Budget Trend',
      category: 'executive_summary',
    });
  }, []);

  /**
   * Handles the Predictive Analysis button click on the budget trend chart.
   * @param {Object} chartInfo - Chart info object.
   * @returns {void}
   */
  const handlePredictiveAnalysis = useCallback((chartInfo) => {
    trackEvent('action_trigger', {
      action: 'predictive_analysis',
      chart: chartInfo.title || 'Budget Trend',
      category: 'executive_summary',
    });

    openChatWithQuery('Show me predictive analysis for IT budget utilization and spending trends.');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  const radarChartOptions = {
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
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
          color: '#6b7280',
        },
        pointLabels: {
          font: { size: 12 },
          color: '#374151',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.15)',
        },
        angleLines: {
          color: 'rgba(107, 114, 128, 0.15)',
        },
      },
    },
  };

  const budgetChartOptions = {
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
      id="tabpanel-executive_summary"
      aria-labelledby="tab-executive_summary"
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
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Executive Summary
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live executive data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips filterCategory="executive_summary" />

      {/* Operations Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts Row: Regional Radar + Budget Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Radar Chart */}
        {radarChartData && radarChartData.datasets && radarChartData.datasets.length > 0 && (
          <ChartPanel
            type="radar"
            data={radarChartData}
            options={radarChartOptions}
            title="Regional Performance Comparison"
            category="executive_summary"
          />
        )}

        {/* Budget Trend Line Chart */}
        {budgetChartData && budgetChartData.datasets && budgetChartData.datasets.length > 0 && (
          <ChartPanel
            type="line"
            data={budgetChartData}
            options={budgetChartOptions}
            title="12-Month Budget Trend"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="executive_summary"
          />
        )}
      </div>

      {/* Regional Performance Table */}
      {tableData.length > 0 && (
        <PerformanceTable
          data={tableData}
          title="Regional Performance Overview"
          category="executive_summary"
        />
      )}
    </div>
  );
}

export default ExecutiveSummaryTab;