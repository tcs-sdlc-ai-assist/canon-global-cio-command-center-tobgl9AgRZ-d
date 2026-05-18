import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAI } from '../../context/AIContext';
import { getAIInsights } from '../../services/AIEngine';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Returns Tailwind color classes for a priority level.
 * @param {string} priority - The priority string ('High', 'Medium', 'Low').
 * @returns {{ bg: string, text: string, border: string, dot: string }} Tailwind class strings.
 */
function getPriorityClasses(priority) {
  switch (priority) {
    case 'High':
      return {
        bg: 'bg-executive-red-50',
        text: 'text-executive-red-700',
        border: 'border-executive-red-300',
        dot: 'bg-executive-red-500',
      };
    case 'Medium':
      return {
        bg: 'bg-executive-amber-50',
        text: 'text-executive-amber-700',
        border: 'border-executive-amber-300',
        dot: 'bg-executive-amber-500',
      };
    case 'Low':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        border: 'border-executive-blue-300',
        dot: 'bg-executive-blue-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      };
  }
}

/**
 * Returns Tailwind color classes for a category.
 * @param {string} category - The category string.
 * @returns {{ bg: string, text: string, hoverBg: string }} Tailwind class strings.
 */
function getCategoryClasses(category) {
  switch (category) {
    case 'business_impact':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        hoverBg: 'hover:bg-executive-green-100',
      };
    case 'risk_governance':
      return {
        bg: 'bg-executive-red-50',
        text: 'text-executive-red-700',
        hoverBg: 'hover:bg-executive-red-100',
      };
    case 'operations':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        hoverBg: 'hover:bg-executive-blue-100',
      };
    case 'innovation':
      return {
        bg: 'bg-executive-amber-50',
        text: 'text-executive-amber-700',
        hoverBg: 'hover:bg-executive-amber-100',
      };
    case 'partnerships':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        hoverBg: 'hover:bg-executive-green-100',
      };
    case 'executive_summary':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        hoverBg: 'hover:bg-executive-blue-100',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        hoverBg: 'hover:bg-gray-100',
      };
  }
}

/**
 * Generates a quick action query string from an insight object.
 * @param {Object} insight - The insight object.
 * @returns {string} A query string for the AI assistant.
 */
function getQuickActionQuery(insight) {
  if (!insight || !insight.title) {
    return 'Tell me more about this insight.';
  }
  return `Tell me more about: ${insight.title}`;
}

/**
 * Quick action button definitions for the panel footer.
 * @type {Array<{label: string, query: string, category: string}>}
 */
const QUICK_ACTIONS = [
  {
    label: 'Review Budget',
    query: 'What is the current budget utilization status?',
    category: 'executive_summary',
  },
  {
    label: 'Assess Risk',
    query: 'What are the top security risks this quarter?',
    category: 'risk_governance',
  },
  {
    label: 'Innovation Status',
    query: 'Show me the innovation pipeline summary.',
    category: 'innovation',
  },
  {
    label: 'Partner Overview',
    query: 'How are our strategic partners performing?',
    category: 'partnerships',
  },
];

/**
 * AIInsightsPanel component.
 * Fetches strategic AI insights from AIEngine and renders them as a
 * prioritized list with quick action buttons.
 * Quick action buttons and insight items trigger the AI chat panel
 * via AIContext.openChatWithQuery.
 * Tracks interactions via EngagementAnalytics.
 *
 * @param {Object} props
 * @param {string} [props.filterCategory=''] - Optional category filter to show only insights of a specific category.
 * @param {number} [props.maxItems=5] - Maximum number of insights to display.
 * @returns {React.ReactElement}
 */
function AIInsightsPanel({ filterCategory, maxItems }) {
  const { openChatWithQuery } = useAI();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getAIInsights()
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data)) {
            setInsights(data);
          } else {
            setInsights([]);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[AIInsightsPanel] Failed to load AI insights:', e);
          setError('Failed to load AI insights');
          setInsights([]);
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
   * Handles clicking on an insight item.
   * Tracks the event and opens the AI chat with a query about the insight.
   * @param {Object} insight - The insight object.
   * @returns {void}
   */
  const handleInsightClick = useCallback((insight) => {
    trackEvent('insight_view', {
      insight: insight.id,
      title: insight.title,
      priority: insight.priority,
      category: insight.category || 'unknown',
    });

    openChatWithQuery(getQuickActionQuery(insight));
  }, [openChatWithQuery]);

  /**
   * Handles clicking on a quick action button.
   * Tracks the event and opens the AI chat with the action's query.
   * @param {Object} action - The quick action object.
   * @returns {void}
   */
  const handleQuickAction = useCallback((action) => {
    trackEvent('action_trigger', {
      action: 'quick_action_click',
      label: action.label,
      query: action.query,
      category: action.category || 'unknown',
    });

    openChatWithQuery(action.query);
  }, [openChatWithQuery]);

  const filteredInsights = filterCategory
    ? insights.filter((insight) => insight.category === filterCategory)
    : insights;

  const displayedInsights = filteredInsights.slice(0, maxItems);

  if (loading) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-5 w-40 bg-gray-100 rounded-executive animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-4 w-4 bg-gray-100 rounded-full animate-pulse flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-100 rounded-executive animate-pulse" />
                <div className="h-3 w-full bg-gray-100 rounded-executive animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-executive-blue-900">
            AI Strategic Insights
          </h3>
        </div>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  if (displayedInsights.length === 0) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-executive-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-executive-blue-900">
            AI Strategic Insights
          </h3>
        </div>
        <p className="text-xs text-gray-400">No insights available for this category.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100 transition-all duration-200 hover:shadow-executive-md"
      role="region"
      aria-label="AI Strategic Insights"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
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
            AI Strategic Insights
          </h3>
        </div>
        {/* Live indicator */}
        <span className="inline-flex items-center space-x-1.5" role="status" aria-label="Live AI insights">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
          </span>
          <span className="text-xs font-medium text-executive-green-700">Live</span>
        </span>
      </div>

      {/* Insights list */}
      <div className="space-y-3 mb-4" role="list" aria-label="Strategic priorities">
        {displayedInsights.map((insight) => {
          const priorityClasses = getPriorityClasses(insight.priority);
          const categoryClasses = getCategoryClasses(insight.category);

          return (
            <div
              key={insight.id}
              className="flex items-start space-x-3 p-3 rounded-executive border border-gray-100 hover:border-executive-blue-200 hover:bg-gray-50 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-offset-1"
              role="listitem"
              tabIndex={0}
              aria-label={`${insight.priority} priority: ${insight.title}`}
              onClick={() => handleInsightClick(insight)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInsightClick(insight);
                }
              }}
            >
              {/* Priority dot */}
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${priorityClasses.dot}`}
                title={`${insight.priority} priority`}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-executive-blue-900 truncate">
                    {insight.title}
                  </h4>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${priorityClasses.bg} ${priorityClasses.text} ${priorityClasses.border} flex-shrink-0`}
                  >
                    {insight.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {insight.summary}
                </p>
                {insight.impact && (
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${categoryClasses.bg} ${categoryClasses.text}`}
                    >
                      Impact: {insight.impact}
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1.5 mb-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-executive-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Quick action buttons">
          {QUICK_ACTIONS.map((action) => {
            const actionClasses = getCategoryClasses(action.category);

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => handleQuickAction(action)}
                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500 ${actionClasses.bg} ${actionClasses.text} ${actionClasses.hoverBg}`}
                aria-label={action.label}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

AIInsightsPanel.propTypes = {
  filterCategory: PropTypes.string,
  maxItems: PropTypes.number,
};

AIInsightsPanel.defaultProps = {
  filterCategory: '',
  maxItems: 5,
};

export default AIInsightsPanel;