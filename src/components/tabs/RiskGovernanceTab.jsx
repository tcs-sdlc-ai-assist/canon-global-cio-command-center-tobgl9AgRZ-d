import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import PerformanceTable from '../common/PerformanceTable';
import AIActionChips from '../ai/AIActionChips';

/**
 * Extracts risk & governance metrics from section data and maps them
 * to a presentation-friendly format for MetricCard components.
 * @param {Object} sectionData - The risk_governance section data object.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractMetrics(sectionData) {
  if (!sectionData || !Array.isArray(sectionData.metrics)) {
    return [];
  }

  const metricMapping = {
    'Overall Risk Score': {
      title: 'Overall Risk Score',
      category: 'risk_governance',
    },
    'Compliance Rate': {
      title: 'Compliance Rate',
      category: 'risk_governance',
    },
    'Open Audit Findings': {
      title: 'Open Audit Findings',
      category: 'risk_governance',
    },
    'Vulnerability Backlog': {
      title: 'Vulnerability Backlog',
      category: 'risk_governance',
    },
    'Policy Adherence': {
      title: 'Policy Adherence',
      category: 'risk_governance',
    },
    'Disaster Recovery RTO': {
      title: 'Disaster Recovery RTO',
      category: 'risk_governance',
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
 * RiskGovernanceTab component.
 * Renders the Risk & Governance dashboard section with:
 * - AI Action Chips bar filtered to risk_governance category
 * - Risk metric cards (Overall Risk Score, Compliance Rate, Open Audit Findings,
 *   Vulnerability Backlog, Policy Adherence, Disaster Recovery RTO) with AI insights
 * - Risk Trend line chart (12-month risk score trend)
 * - Compliance Breakdown doughnut chart
 * - PerformanceTable with risk-level status labels
 *
 * Fetches data from DashboardDataService for the risk_governance section.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function RiskGovernanceTab() {
  const { openChatWithQuery } = useAI();
  const [sectionData, setSectionData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [riskTrendData, setRiskTrendData] = useState(null);
  const [complianceChartData, setComplianceChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([
      getDashboardData('risk_governance').catch((e) => {
        console.error('[RiskGovernanceTab] Failed to load risk governance data:', e);
        return null;
      }),
      getAIInsights('risk_governance').catch((e) => {
        console.error('[RiskGovernanceTab] Failed to load AI insights:', e);
        return null;
      }),
    ])
      .then(([data, insights]) => {
        if (cancelled) return;

        if (data) {
          setSectionData(data);

          const extractedMetrics = extractMetrics(data);
          setMetrics(extractedMetrics);

          if (data.charts && data.charts.riskTrend) {
            const rt = data.charts.riskTrend;
            setRiskTrendData({
              labels: rt.labels,
              datasets: rt.datasets,
            });
          }

          if (data.charts && data.charts.complianceChart) {
            const cc = data.charts.complianceChart;
            setComplianceChartData({
              labels: cc.labels,
              datasets: cc.datasets,
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
          console.error('[RiskGovernanceTab] Failed to load risk governance:', e);
          setError('Failed to load risk & governance data');
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
      category: metric.category || 'risk_governance',
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
      chart: chartInfo.title || 'Risk Governance Chart',
      category: 'risk_governance',
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
      chart: chartInfo.title || 'Risk Governance Chart',
      category: 'risk_governance',
    });

    openChatWithQuery('Show me predictive analysis for risk and governance metrics including risk score trends, compliance rate, and vulnerability backlog projections.');
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

  const riskTrendOptions = {
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

  const complianceChartOptions = {
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

  return (
    <div
      className="space-y-6"
      role="tabpanel"
      id="tabpanel-risk_governance"
      aria-labelledby="tab-risk_governance"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Risk & Governance
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live risk governance data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips filterCategory="risk_governance" />

      {/* Risk Metric Cards */}
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

      {/* Charts Row: Risk Trend + Compliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend Line Chart */}
        {riskTrendData && riskTrendData.datasets && riskTrendData.datasets.length > 0 && (
          <ChartPanel
            type="line"
            data={riskTrendData}
            options={riskTrendOptions}
            title="12-Month Risk Score Trend"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="risk_governance"
          />
        )}

        {/* Compliance Breakdown Doughnut Chart */}
        {complianceChartData && complianceChartData.datasets && complianceChartData.datasets.length > 0 && (
          <ChartPanel
            type="doughnut"
            data={complianceChartData}
            options={complianceChartOptions}
            title="Compliance Breakdown"
            onExport={handleExport}
            category="risk_governance"
          />
        )}
      </div>

      {/* Risk Register Table */}
      {tableData.length > 0 && (
        <PerformanceTable
          data={tableData}
          title="Risk Register Overview"
          category="risk_governance"
        />
      )}
    </div>
  );
}

export default RiskGovernanceTab;