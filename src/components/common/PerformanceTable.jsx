import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Returns Tailwind classes for a status label based on its value.
 * @param {string} status - The status string.
 * @returns {{ bg: string, text: string, border: string }} Tailwind class strings for the status badge.
 */
function getStatusClasses(status) {
  switch (status) {
    case 'Excellent':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        border: 'border-executive-green-300',
      };
    case 'Good':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        border: 'border-executive-blue-300',
      };
    case 'Healthy':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        border: 'border-executive-green-300',
      };
    case 'On Track':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        border: 'border-executive-green-300',
      };
    case 'Warning':
    case 'At Risk':
    case 'Fair':
      return {
        bg: 'bg-executive-amber-50',
        text: 'text-executive-amber-700',
        border: 'border-executive-amber-300',
      };
    case 'Critical':
    case 'Delayed':
      return {
        bg: 'bg-executive-red-50',
        text: 'text-executive-red-700',
        border: 'border-executive-red-300',
      };
    case 'Completed':
    case 'In Progress':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        border: 'border-executive-blue-300',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-300',
      };
  }
}

/**
 * Extracts column headers from the first row of data.
 * Returns an array of { key, label } objects.
 * @param {Object} row - A single data row object.
 * @returns {Array<{ key: string, label: string }>} Column definitions.
 */
function getColumnsFromRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return [];
  }
  return Object.keys(row).map((key) => ({
    key,
    label: formatColumnLabel(key),
  }));
}

/**
 * Formats a camelCase or snake_case key into a human-readable column label.
 * @param {string} key - The object key.
 * @returns {string} The formatted label.
 */
function formatColumnLabel(key) {
  if (!key || typeof key !== 'string') {
    return '';
  }
  // Handle camelCase
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Handle snake_case
  const desnaked = spaced.replace(/_/g, ' ');
  // Capitalize first letter of each word
  return desnaked
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Checks if a cell value looks like a status string that should be rendered as a badge.
 * @param {string} key - The column key.
 * @param {*} value - The cell value.
 * @returns {boolean} True if the value should be rendered as a status badge.
 */
function isStatusColumn(key, value) {
  const statusKeys = ['status'];
  if (statusKeys.includes(key.toLowerCase())) {
    return true;
  }
  const statusValues = [
    'Excellent', 'Good', 'Fair', 'Healthy', 'Warning', 'Critical',
    'On Track', 'At Risk', 'Delayed', 'Completed', 'In Progress',
    'Mitigating', 'Monitoring', 'Compliant', 'Resolved',
  ];
  if (typeof value === 'string' && statusValues.includes(value)) {
    return true;
  }
  return false;
}

/**
 * Renders a cell value. Status values get a colored badge; others are plain text.
 * @param {string} key - The column key.
 * @param {*} value - The cell value.
 * @returns {React.ReactElement} The rendered cell content.
 */
function renderCellValue(key, value) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  if (isStatusColumn(key, value)) {
    const { bg, text, border } = getStatusClasses(String(value));
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
      >
        {String(value)}
      </span>
    );
  }

  if (typeof value === 'number') {
    return <span>{value.toLocaleString()}</span>;
  }

  return <span>{String(value)}</span>;
}

/**
 * PerformanceTable component.
 * Renders a responsive, accessible table from an array of row objects.
 * Automatically derives columns from the first row's keys.
 * Status values are rendered as color-coded badges.
 * Supports keyboard navigation and screen reader labels.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of row objects. Each object's keys become columns.
 * @param {string} [props.title=''] - Optional table title displayed above the table.
 * @param {string} [props.category=''] - Category string for analytics tracking.
 * @returns {React.ReactElement}
 */
function PerformanceTable({ data, title, category }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        {title && (
          <h3 className="text-sm font-semibold text-executive-blue-900 mb-3">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  const columns = getColumnsFromRow(data[0]);

  if (columns.length === 0) {
    return (
      <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100">
        {title && (
          <h3 className="text-sm font-semibold text-executive-blue-900 mb-3">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          No columns available
        </div>
      </div>
    );
  }

  /**
   * Handles row click for analytics tracking.
   * @param {Object} row - The clicked row data.
   * @param {number} rowIndex - The index of the clicked row.
   * @returns {void}
   */
  const handleRowClick = useCallback((row, rowIndex) => {
    const rowLabel = row.region || row.service || row.partner || row.initiative || row.project || row.risk || `Row ${rowIndex + 1}`;
    trackEvent('chart_interaction', {
      action: 'table_row_click',
      row: rowLabel,
      category: category || 'unknown',
      table: title || 'unknown',
    });
  }, [category, title]);

  /**
   * Handles keyboard activation (Enter/Space) on a row.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @param {Object} row - The row data.
   * @param {number} rowIndex - The row index.
   * @returns {void}
   */
  const handleRowKeyDown = useCallback((e, row, rowIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(row, rowIndex);
    }
  }, [handleRowClick]);

  return (
    <div className="bg-white rounded-executive-md shadow-executive p-4 sm:p-5 border border-gray-100 transition-all duration-200 hover:shadow-executive-md">
      {title && (
        <h3 className="text-sm font-semibold text-executive-blue-900 mb-4">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto scrollbar-thin">
        <table
          className="min-w-full divide-y divide-gray-200"
          role="table"
          aria-label={title || 'Performance data table'}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 first:rounded-tl-executive last:rounded-tr-executive"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:bg-executive-blue-50"
                tabIndex={0}
                role="row"
                aria-label={`Row ${rowIndex + 1}`}
                onClick={() => handleRowClick(row, rowIndex)}
                onKeyDown={(e) => handleRowKeyDown(e, row, rowIndex)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap"
                    role="cell"
                  >
                    {renderCellValue(col.key, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

PerformanceTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  category: PropTypes.string,
};

PerformanceTable.defaultProps = {
  title: '',
  category: '',
};

export default PerformanceTable;