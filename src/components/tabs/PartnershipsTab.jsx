import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getAIInsights } from '../../services/DashboardDataService';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import MetricCard from '../common/MetricCard';
import ChartPanel from '../common/ChartPanel';
import PerformanceTable from '../common/PerformanceTable';
import AIActionChips from '../ai/AIActionChips';

/**
 * Extracts partnerships metrics from section data and maps them
 * to a presentation-friendly format for MetricCard components.
 * @param {Object} sectionData - The partnerships section data object.
 * @returns {Array<Object>} Array of metric objects for display.
 */
function extractMetrics(sectionData) {
  if (!sectionData || !Array.isArray(sectionData.metrics)) {
    return [];
  }

  const metricMapping = {
    'Strategic Partners': {
      title: 'Strategic Partners',
      category: 'partnerships',
    },
    'Partner Satisfaction': {
      title: 'Partner Satisfaction',
      category: 'partnerships',
    },
    'Joint Revenue': {
      title: 'Joint Revenue',
      category: 'partnerships',
    },
    'SLA Compliance': {
      title: 'SLA Compliance',
      category: 'partnerships',
    },
    'Active Integrations': {
      title: 'Active Integrations',
      category: 'partnerships',
    },
    'Vendor Risk Score': {
      title: 'Vendor Risk Score',
      category: 'partnerships',
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
 * Expansion opportunity card definitions for the Strategic Intelligence section.
 * @type {Array<{title: string, description: string, impact: string, category: string}>}
 */
const EXPANSION_OPPORTUNITIES = [
  {
    title: 'Joint AI Innovation Program',
    description: 'Establish joint innovation programs with Microsoft and AWS to co-develop AI solutions for imaging and document processing.',
    impact: '$5M new revenue potential',
    category: 'innovation',
  },
  {
    title: 'Multi-Cloud Optimization',
    description: 'Negotiate multi-year strategic agreements with top 3 cloud partners for 15-20% cost optimization.',
    impact: '$2.4M annual savings',
    category: 'operations',
  },
  {
    title: 'Partner Ecosystem Expansion',
    description: 'Onboard 5 new cybersecurity and edge computing partners to strengthen the technology portfolio.',
    impact: '30% capability expansion',
    category: 'partnerships',
  },
];

/**
 * PartnershipsTab component.
 * Renders the Partnerships dashboard section with:
 * - AI Action Chips bar filtered to partnerships category
 * - Partnership KPI metric cards (Strategic Partners, Partner Satisfaction, Joint Revenue,
 *   SLA Compliance, Active Integrations, Vendor Risk Score) with AI insights
 * - Partner Performance bar chart
 * - Partner Spend Trend line chart (investment vs value over time)
 * - Strategic Intelligence section with performance summary, expansion opportunities, and action buttons
 * - PerformanceTable with partner-level status labels
 *
 * Fetches data from DashboardDataService for the partnerships section.
 * Integrates with AIContext for metric card click-to-chat functionality.
 *
 * @returns {React.ReactElement}
 */
function PartnershipsTab() {
  const { openChatWithQuery } = useAI();
  const [sectionData, setSectionData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [performanceChartData, setPerformanceChartData] = useState(null);
  const [spendTrendData, setSpendTrendData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [insightMap, setInsightMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([
      getDashboardData('partnerships').catch((e) => {
        console.error('[PartnershipsTab] Failed to load partnerships data:', e);
        return null;
      }),
      getAIInsights('partnerships').catch((e) => {
        console.error('[PartnershipsTab] Failed to load AI insights:', e);
        return null;
      }),
    ])
      .then(([data, insights]) => {
        if (cancelled) return;

        if (data) {
          setSectionData(data);

          const extractedMetrics = extractMetrics(data);
          setMetrics(extractedMetrics);

          if (data.charts && data.charts.partnerPerformance) {
            const pp = data.charts.partnerPerformance;
            setPerformanceChartData({
              labels: pp.labels,
              datasets: pp.datasets,
            });
          }

          if (data.charts && data.charts.spendTrend) {
            const st = data.charts.spendTrend;
            setSpendTrendData({
              labels: st.labels,
              datasets: st.datasets,
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
          console.error('[PartnershipsTab] Failed to load partnerships:', e);
          setError('Failed to load partnerships data');
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
      category: metric.category || 'partnerships',
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
      chart: chartInfo.title || 'Partnerships Chart',
      category: 'partnerships',
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
      chart: chartInfo.title || 'Partnerships Chart',
      category: 'partnerships',
    });

    openChatWithQuery('Show me predictive analysis for partnership metrics including joint revenue trends, SLA compliance, and partner satisfaction projections.');
  }, [openChatWithQuery]);

  /**
   * Handles clicking on an expansion opportunity card.
   * Tracks the event and opens the AI chat with a query about the opportunity.
   * @param {Object} opportunity - The expansion opportunity object.
   * @returns {void}
   */
  const handleOpportunityClick = useCallback((opportunity) => {
    trackEvent('action_trigger', {
      action: 'expansion_opportunity_click',
      title: opportunity.title,
      category: 'partnerships',
    });

    openChatWithQuery(`Tell me more about the expansion opportunity: ${opportunity.title}`);
  }, [openChatWithQuery]);

  /**
   * Handles the "Review All Partners" action button click.
   * @returns {void}
   */
  const handleReviewPartners = useCallback(() => {
    trackEvent('action_trigger', {
      action: 'review_all_partners',
      category: 'partnerships',
    });

    openChatWithQuery('Give me a comprehensive review of all strategic partner performance and recommendations.');
  }, [openChatWithQuery]);

  /**
   * Handles the "Optimize Spend" action button click.
   * @returns {void}
   */
  const handleOptimizeSpend = useCallback(() => {
    trackEvent('action_trigger', {
      action: 'optimize_partner_spend',
      category: 'partnerships',
    });

    openChatWithQuery('How can we optimize partner spend and negotiate better terms with our strategic vendors?');
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

        {/* Strategic Intelligence skeleton */}
        <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
          <div className="h-5 w-48 bg-gray-100 rounded-executive animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-executive animate-pulse" />
            ))}
          </div>
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

  const performanceChartOptions = {
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
        min: 80,
        max: 100,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const spendTrendOptions = {
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
      id="tabpanel-partnerships"
      aria-labelledby="tab-partnerships"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-lg font-bold text-executive-blue-900">
            Partnerships
          </h2>
        </div>
        <span
          className="inline-flex items-center space-x-1.5"
          role="status"
          aria-label="Live partnerships data"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* AI Action Chips */}
      <AIActionChips filterCategory="partnerships" />

      {/* Partnership KPI Metric Cards */}
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

      {/* Charts Row: Partner Performance + Spend Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Performance Bar Chart */}
        {performanceChartData && performanceChartData.datasets && performanceChartData.datasets.length > 0 && (
          <ChartPanel
            type="bar"
            data={performanceChartData}
            options={performanceChartOptions}
            title="Partner Performance Scores"
            onExport={handleExport}
            category="partnerships"
          />
        )}

        {/* Partner Spend Trend Line Chart */}
        {spendTrendData && spendTrendData.datasets && spendTrendData.datasets.length > 0 && (
          <ChartPanel
            type="line"
            data={spendTrendData}
            options={spendTrendOptions}
            title="12-Month Partner Spend Trend"
            onExport={handleExport}
            onPredictiveAnalysis={handlePredictiveAnalysis}
            category="partnerships"
          />
        )}
      </div>

      {/* Strategic Intelligence Section */}
      <div
        className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100 transition-all duration-200 hover:shadow-executive-md"
        role="region"
        aria-label="Strategic Intelligence"
      >
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
            <path d="M18 14l1.05 3.13L22.18 18l-3.13.87L18 22l-1.05-3.13L13.82 18l3.13-.87L18 14z" opacity="0.6" />
            <path d="M6 14l1.05 3.13L10.18 18l-3.13.87L6 22l-1.05-3.13L1.82 18l3.13-.87L6 14z" opacity="0.4" />
          </svg>
          <h3 className="text-sm font-semibold text-executive-blue-900">
            Strategic Intelligence
          </h3>
        </div>

        {/* Performance Summary */}
        <div className="mb-5 p-3 rounded-executive bg-executive-green-50 border border-executive-green-200">
          <div className="flex items-start space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-executive-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-executive-green-800 mb-1">
                Partner Ecosystem Performance Summary
              </p>
              <p className="text-xs text-executive-green-700 leading-relaxed">
                Partner ecosystem is strong with 24 strategic partners and 99.2% SLA compliance. Partner satisfaction at 4.4/5 with joint revenue growing 8% to $35M. Microsoft and AWS partnerships contribute 60% of joint revenue. API-first strategy enabling faster partner onboarding with 156 active integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Expansion Opportunity Cards */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Expansion Opportunities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EXPANSION_OPPORTUNITIES.map((opportunity) => (
              <div
                key={opportunity.title}
                className="p-3 rounded-executive border border-gray-100 hover:border-executive-blue-200 hover:bg-gray-50 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-offset-1"
                role="button"
                tabIndex={0}
                aria-label={`Expansion opportunity: ${opportunity.title}`}
                onClick={() => handleOpportunityClick(opportunity)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpportunityClick(opportunity);
                  }
                }}
              >
                <h5 className="text-sm font-medium text-executive-blue-900 mb-1">
                  {opportunity.title}
                </h5>
                <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                  {opportunity.description}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-executive-green-50 text-executive-green-700">
                  Impact: {opportunity.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReviewPartners}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-executive-blue-700 bg-executive-blue-50 hover:bg-executive-blue-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500"
            aria-label="Review all partners"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Review All Partners
          </button>
          <button
            type="button"
            onClick={handleOptimizeSpend}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-executive-green-700 bg-executive-green-50 hover:bg-executive-green-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-green-500"
            aria-label="Optimize partner spend"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Optimize Spend
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent('action_trigger', {
                action: 'assess_vendor_risk',
                category: 'partnerships',
              });
              openChatWithQuery('Assess the current vendor risk landscape and provide recommendations for risk mitigation.');
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-executive-amber-700 bg-executive-amber-50 hover:bg-executive-amber-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-amber-500"
            aria-label="Assess vendor risk"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
            </svg>
            Assess Vendor Risk
          </button>
        </div>
      </div>

      {/* Partner Performance Table */}
      {tableData.length > 0 && (
        <PerformanceTable
          data={tableData}
          title="Strategic Partner Overview"
          category="partnerships"
        />
      )}
    </div>
  );
}

export default PartnershipsTab;