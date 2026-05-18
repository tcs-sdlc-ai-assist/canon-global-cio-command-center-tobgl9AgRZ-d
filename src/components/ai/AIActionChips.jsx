import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAI } from '../../context/AIContext';
import { getActionChips } from '../../services/AIEngine';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Returns Tailwind color classes for a chip based on its category.
 * @param {string} category - The chip category string.
 * @returns {{ bg: string, text: string, hoverBg: string, ring: string }} Tailwind class strings.
 */
function getCategoryClasses(category) {
  switch (category) {
    case 'business_impact':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        hoverBg: 'hover:bg-executive-green-100',
        ring: 'focus:ring-executive-green-500',
      };
    case 'risk_governance':
      return {
        bg: 'bg-executive-red-50',
        text: 'text-executive-red-700',
        hoverBg: 'hover:bg-executive-red-100',
        ring: 'focus:ring-executive-red-500',
      };
    case 'executive_summary':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        hoverBg: 'hover:bg-executive-blue-100',
        ring: 'focus:ring-executive-blue-500',
      };
    case 'innovation':
      return {
        bg: 'bg-executive-amber-50',
        text: 'text-executive-amber-700',
        hoverBg: 'hover:bg-executive-amber-100',
        ring: 'focus:ring-executive-amber-500',
      };
    case 'operations':
      return {
        bg: 'bg-executive-blue-50',
        text: 'text-executive-blue-700',
        hoverBg: 'hover:bg-executive-blue-100',
        ring: 'focus:ring-executive-blue-500',
      };
    case 'partnerships':
      return {
        bg: 'bg-executive-green-50',
        text: 'text-executive-green-700',
        hoverBg: 'hover:bg-executive-green-100',
        ring: 'focus:ring-executive-green-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        hoverBg: 'hover:bg-gray-100',
        ring: 'focus:ring-gray-500',
      };
  }
}

/**
 * AIActionChips component.
 * Fetches predefined action chips from AIEngine and renders them as a
 * horizontal scrollable row of chip buttons categorized by color.
 * On click, opens the AI chat panel with the chip's query pre-filled
 * and triggers a mock AI response via AIContext.
 * Tracks chip clicks via EngagementAnalytics.
 *
 * @param {Object} props
 * @param {string} [props.filterCategory=''] - Optional category filter to show only chips of a specific category.
 * @returns {React.ReactElement}
 */
function AIActionChips({ filterCategory }) {
  const { openChatWithQuery } = useAI();
  const [chips, setChips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getActionChips()
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data)) {
            setChips(data);
          } else {
            setChips([]);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[AIActionChips] Failed to load action chips:', e);
          setError('Failed to load action chips');
          setChips([]);
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
   * Handles a chip button click.
   * Tracks the event and opens the AI chat with the chip's query.
   * @param {Object} chip - The action chip object.
   * @returns {void}
   */
  const handleChipClick = useCallback((chip) => {
    trackEvent('action_trigger', {
      action: 'ai_chip_click',
      chip: chip.label,
      query: chip.query,
      category: chip.category || 'unknown',
    });

    openChatWithQuery(chip.query);
  }, [openChatWithQuery]);

  const displayedChips = filterCategory
    ? chips.filter((chip) => chip.category === filterCategory)
    : chips;

  if (loading) {
    return (
      <div className="flex items-center space-x-2 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-32 bg-gray-100 rounded-executive animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 text-xs text-gray-400">
        {error}
      </div>
    );
  }

  if (displayedChips.length === 0) {
    return null;
  }

  return (
    <div
      className="overflow-x-auto scrollbar-thin py-2"
      role="toolbar"
      aria-label="AI action chips"
    >
      <div className="flex items-center space-x-2 min-w-max">
        {/* AI sparkle icon label */}
        <span className="flex items-center space-x-1 flex-shrink-0 pr-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-executive-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">AI Actions</span>
        </span>

        {displayedChips.map((chip) => {
          const { bg, text, hoverBg, ring } = getCategoryClasses(chip.category);

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-executive transition-colors focus:outline-none focus:ring-2 ${bg} ${text} ${hoverBg} ${ring} flex-shrink-0`}
              aria-label={chip.label}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

AIActionChips.propTypes = {
  filterCategory: PropTypes.string,
};

AIActionChips.defaultProps = {
  filterCategory: '',
};

export default AIActionChips;