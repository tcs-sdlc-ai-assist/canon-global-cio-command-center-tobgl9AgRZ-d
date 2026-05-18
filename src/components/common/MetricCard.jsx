import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Determines the trend direction from a trend string.
 * @param {string} trend - The trend string (e.g., '+2.3%', '-0.5 hrs', '+5').
 * @returns {'up' | 'down' | 'neutral'} The trend direction.
 */
function getTrendDirection(trend) {
  if (!trend || typeof trend !== 'string') {
    return 'neutral';
  }
  const trimmed = trend.trim();
  if (trimmed.startsWith('+')) {
    return 'up';
  }
  if (trimmed.startsWith('-')) {
    return 'down';
  }
  return 'neutral';
}

/**
 * Returns Tailwind classes for the trend indicator based on direction and context.
 * For most metrics, up is good (green) and down is bad (red).
 * For metrics like incidents, risk score, cost — down is good.
 * @param {'up' | 'down' | 'neutral'} direction - The trend direction.
 * @param {string} status - The metric status label.
 * @returns {{ textClass: string, bgClass: string }} Tailwind class strings.
 */
function getTrendClasses(direction, status) {
  if (direction === 'neutral') {
    return { textClass: 'text-gray-500', bgClass: 'bg-gray-50' };
  }

  const isHealthy = status === 'Healthy' || status === 'On Track' || status === 'Completed';

  if (isHealthy) {
    return { textClass: 'text-executive-green-700', bgClass: 'bg-executive-green-50' };
  }

  if (status === 'Warning') {
    return { textClass: 'text-executive-amber-700', bgClass: 'bg-executive-amber-50' };
  }

  if (status === 'Critical') {
    return { textClass: 'text-executive-red-700', bgClass: 'bg-executive-red-50' };
  }

  if (direction === 'up') {
    return { textClass: 'text-executive-green-700', bgClass: 'bg-executive-green-50' };
  }

  if (direction === 'down') {
    return { textClass: 'text-executive-red-700', bgClass: 'bg-executive-red-50' };
  }

  return { textClass: 'text-gray-500', bgClass: 'bg-gray-50' };
}

/**
 * Returns a status dot color class based on the status label.
 * @param {string} status - The metric status label.
 * @returns {string} Tailwind background color class for the status dot.
 */
function getStatusDotClass(status) {
  switch (status) {
    case 'Healthy':
    case 'On Track':
      return 'bg-executive-green-500';
    case 'Warning':
      return 'bg-executive-amber-500';
    case 'Critical':
      return 'bg-executive-red-500';
    case 'Completed':
      return 'bg-executive-blue-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Formats a metric value for display.
 * Handles large numbers with abbreviations and unit formatting.
 * @param {number|string} value - The metric value.
 * @param {string} unit - The unit string.
 * @returns {string} The formatted value string.
 */
function formatValue(value, unit) {
  if (value === null || value === undefined) {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof numValue !== 'number' || !isFinite(numValue)) {
    return String(value);
  }

  if (unit === '$' || unit === '$/mo') {
    if (numValue >= 1000000000) {
      return `$${(numValue / 1000000000).toFixed(1)}B`;
    }
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    }
    if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    }
    if (unit === '$/mo') {
      return `$${numValue.toLocaleString()}/mo`;
    }
    return `$${numValue.toLocaleString()}`;
  }

  if (unit === '%') {
    return `${numValue}%`;
  }

  if (unit && unit.startsWith('/')) {
    return `${numValue}${unit}`;
  }

  if (unit) {
    return `${numValue.toLocaleString()} ${unit}`;
  }

  return numValue.toLocaleString();
}

/**
 * MetricCard component.
 * Displays a single metric with its value, trend indicator, status, and optional AI insight.
 * Supports click interaction for drill-down or AI assistant integration.
 *
 * @param {Object} props
 * @param {string} props.title - The metric label/title.
 * @param {number|string} props.value - The metric value.
 * @param {string} [props.unit=''] - The unit of measurement.
 * @param {string} [props.trend=''] - The trend string (e.g., '+2.3%', '-0.5 hrs').
 * @param {string} [props.status=''] - The status label (e.g., 'Healthy', 'Warning').
 * @param {string} [props.aiInsight=''] - AI-generated insight text for this metric.
 * @param {string} [props.category=''] - Category for color coding context.
 * @param {function} [props.onClick] - Click handler for the card.
 * @param {boolean} [props.live=false] - Whether to show a live pulse animation.
 * @returns {React.ReactElement}
 */
function MetricCard({ title, value, unit, trend, status, aiInsight, category, onClick, live }) {
  const direction = getTrendDirection(trend);
  const { textClass, bgClass } = getTrendClasses(direction, status);
  const statusDotClass = getStatusDotClass(status);
  const formattedValue = formatValue(value, unit);

  /**
   * Handles card click. Tracks the event and calls the onClick callback.
   * @returns {void}
   */
  const handleClick = useCallback(() => {
    if (onClick) {
      trackEvent('chart_interaction', { metric: title, category: category || 'unknown' });
      onClick({ title, value, unit, trend, status, aiInsight, category });
    }
  }, [onClick, title, value, unit, trend, status, aiInsight, category]);

  /**
   * Handles keyboard activation (Enter/Space) for accessibility.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @returns {void}
   */
  const handleKeyDown = useCallback((e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  }, [onClick, handleClick]);

  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={[
        'relative bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100 transition-all duration-200',
        isClickable ? 'cursor-pointer hover:shadow-executive-md hover:border-executive-blue-200 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-offset-1' : '',
      ].join(' ')}
      role={isClickable ? 'button' : 'region'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${title}: ${formattedValue}${trend ? `, trend ${trend}` : ''}${status ? `, status ${status}` : ''}`}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {/* Header row: title + status dot */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate pr-2">
          {title}
        </h3>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {live && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-executive-green-500" />
            </span>
          )}
          {status && (
            <span
              className={`inline-block w-2 h-2 rounded-full ${statusDotClass}`}
              title={status}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-xl sm:text-2xl font-bold text-executive-blue-900 tracking-tight">
          {formattedValue}
        </span>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center space-x-1.5 mb-3">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${bgClass} ${textClass}`}
          >
            {direction === 'up' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            )}
            {direction === 'down' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {direction === 'neutral' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            )}
            {trend}
          </span>
          {status && (
            <span className="text-xs text-gray-400">{status}</span>
          )}
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <div className="flex items-start space-x-1.5 pt-2 border-t border-gray-100">
          {/* AI sparkle icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-executive-amber-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
            <path d="M18 14l1.05 3.13L22.18 18l-3.13.87L18 22l-1.05-3.13L13.82 18l3.13-.87L18 14z" opacity="0.6" />
            <path d="M6 14l1.05 3.13L10.18 18l-3.13.87L6 22l-1.05-3.13L1.82 18l3.13-.87L6 14z" opacity="0.4" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {aiInsight}
          </p>
        </div>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  unit: PropTypes.string,
  trend: PropTypes.string,
  status: PropTypes.string,
  aiInsight: PropTypes.string,
  category: PropTypes.string,
  onClick: PropTypes.func,
  live: PropTypes.bool,
};

MetricCard.defaultProps = {
  unit: '',
  trend: '',
  status: '',
  aiInsight: '',
  category: '',
  onClick: undefined,
  live: false,
};

export default MetricCard;