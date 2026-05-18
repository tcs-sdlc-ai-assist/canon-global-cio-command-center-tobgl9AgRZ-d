import { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { trackEvent } from '../../services/EngagementAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

/**
 * Returns the appropriate react-chartjs-2 component for the given chart type.
 * @param {string} type - The chart type string.
 * @returns {React.ComponentType|null} The chart component, or null if unsupported.
 */
function getChartComponent(type) {
  switch (type) {
    case 'line':
      return Line;
    case 'bar':
      return Bar;
    case 'doughnut':
      return Doughnut;
    case 'radar':
      return Radar;
    default:
      return null;
  }
}

/**
 * Default chart options merged with user-provided options.
 * @param {string} type - The chart type.
 * @returns {Object} Default Chart.js options object.
 */
function getDefaultOptions(type) {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  if (type === 'doughnut') {
    base.cutout = '60%';
  }

  if (type === 'line' || type === 'bar') {
    base.scales = {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280',
        },
      },
    };
  }

  return base;
}

/**
 * Deep merges two objects. Source values override target values.
 * @param {Object} target - The target object.
 * @param {Object} source - The source object.
 * @returns {Object} The merged object.
 */
function deepMerge(target, source) {
  const output = { ...target };
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}

/**
 * ChartPanel component.
 * Reusable Chart.js wrapper that renders line, bar, doughnut, or radar charts
 * with a responsive container, title bar, and optional action buttons.
 * Tracks chart interactions via EngagementAnalytics.
 *
 * @param {Object} props
 * @param {string} props.type - The chart type ('line', 'bar', 'doughnut', 'radar').
 * @param {Object} props.data - The Chart.js data object (labels, datasets).
 * @param {Object} [props.options={}] - Additional Chart.js options to merge with defaults.
 * @param {string} [props.title=''] - The chart title displayed above the chart.
 * @param {function} [props.onExport] - Callback when the Export Data button is clicked.
 * @param {function} [props.onPredictiveAnalysis] - Callback when the Predictive Analysis button is clicked.
 * @param {string} [props.category=''] - Category string for analytics tracking.
 * @returns {React.ReactElement}
 */
function ChartPanel({ type, data, options, title, onExport, onPredictiveAnalysis, category }) {
  const chartRef = useRef(null);

  const ChartComponent = getChartComponent(type);

  const mergedOptions = deepMerge(getDefaultOptions(type), options || {});

  /**
   * Handles click events on the chart canvas for interaction tracking.
   * @returns {void}
   */
  const handleChartClick = useCallback(() => {
    trackEvent('chart_interaction', {
      chart: title || 'unknown',
      type: type,
      action: 'click',
      category: category || 'unknown',
    });
  }, [title, type, category]);

  /**
   * Handles the Export Data button click.
   * Tracks the event and calls the onExport callback.
   * @returns {void}
   */
  const handleExport = useCallback(() => {
    trackEvent('action_trigger', {
      action: 'export_data',
      chart: title || 'unknown',
      category: category || 'unknown',
    });
    if (onExport) {
      onExport({ type, data, title });
    }
  }, [onExport, type, data, title, category]);

  /**
   * Handles the Predictive Analysis button click.
   * Tracks the event and calls the onPredictiveAnalysis callback.
   * @returns {void}
   */
  const handlePredictiveAnalysis = useCallback(() => {
    trackEvent('action_trigger', {
      action: 'predictive_analysis',
      chart: title || 'unknown',
      category: category || 'unknown',
    });
    if (onPredictiveAnalysis) {
      onPredictiveAnalysis({ type, data, title });
    }
  }, [onPredictiveAnalysis, type, data, title, category]);

  if (!ChartComponent) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        {title && (
          <h3 className="text-sm font-semibold text-executive-blue-900 mb-3">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Unsupported chart type: {type}
        </div>
      </div>
    );
  }

  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        {title && (
          <h3 className="text-sm font-semibold text-executive-blue-900 mb-3">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No chart data available
        </div>
      </div>
    );
  }

  const hasActions = typeof onExport === 'function' || typeof onPredictiveAnalysis === 'function';

  return (
    <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100 transition-all duration-200 hover:shadow-executive-md">
      {/* Header row: title + action buttons */}
      {(title || hasActions) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-executive-blue-900 truncate pr-2">
              {title}
            </h3>
          )}
          {hasActions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {typeof onExport === 'function' && (
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-executive-blue-600 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500"
                  aria-label={`Export data for ${title || 'chart'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                </button>
              )}
              {typeof onPredictiveAnalysis === 'function' && (
                <button
                  type="button"
                  onClick={handlePredictiveAnalysis}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-executive-amber-700 bg-executive-amber-50 hover:bg-executive-amber-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-amber-500"
                  aria-label={`Predictive analysis for ${title || 'chart'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
                  </svg>
                  Predictive
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart container */}
      <div
        className={type === 'doughnut' || type === 'radar' ? 'relative h-56 sm:h-64' : 'relative h-48 sm:h-64'}
        role="img"
        aria-label={title ? `${title} chart` : `${type} chart`}
        onClick={handleChartClick}
      >
        <ChartComponent
          ref={chartRef}
          data={data}
          options={mergedOptions}
        />
      </div>
    </div>
  );
}

ChartPanel.propTypes = {
  type: PropTypes.oneOf(['line', 'bar', 'doughnut', 'radar']).isRequired,
  data: PropTypes.shape({
    labels: PropTypes.array.isRequired,
    datasets: PropTypes.array.isRequired,
  }).isRequired,
  options: PropTypes.object,
  title: PropTypes.string,
  onExport: PropTypes.func,
  onPredictiveAnalysis: PropTypes.func,
  category: PropTypes.string,
};

ChartPanel.defaultProps = {
  options: {},
  title: '',
  onExport: undefined,
  onPredictiveAnalysis: undefined,
  category: '',
};

export default ChartPanel;