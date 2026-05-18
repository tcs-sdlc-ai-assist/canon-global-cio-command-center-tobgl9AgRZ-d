import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Dashboard section tab definitions.
 * Each tab has an id (matching DashboardDataService section keys where applicable),
 * a display label, and an icon path for the SVG.
 * @type {Array<{id: string, label: string}>}
 */
const TABS = [
  { id: 'strategic_command', label: 'Strategic Command' },
  { id: 'executive_summary', label: 'Executive Summary' },
  { id: 'business_impact', label: 'Business Impact' },
  { id: 'operations', label: 'Operations' },
  { id: 'risk_governance', label: 'Risk & Governance' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'partnerships', label: 'Partnerships' },
];

/**
 * TabNavigation component for the dashboard.
 * Renders horizontal tabs for all 7 dashboard sections.
 * Manages active tab state, supports keyboard navigation (arrow keys, Enter),
 * tracks tab clicks via EngagementAnalytics.
 * Responsive: horizontally scrollable on mobile.
 *
 * @param {{ activeTab?: string, onTabSwitch?: function(string): void }} props
 * @returns {React.ReactElement}
 */
function TabNavigation({ activeTab, onTabSwitch }) {
  const [focusedIndex, setFocusedIndex] = useState(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  });
  const tabListRef = useRef(null);
  const tabRefs = useRef([]);

  /**
   * Keeps focusedIndex in sync when activeTab prop changes externally.
   */
  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    if (idx >= 0) {
      setFocusedIndex(idx);
    }
  }, [activeTab]);

  /**
   * Scrolls the focused tab into view within the scrollable container.
   * @param {number} index - The index of the tab to scroll into view.
   * @returns {void}
   */
  const scrollTabIntoView = useCallback((index) => {
    const tabEl = tabRefs.current[index];
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, []);

  /**
   * Handles clicking on a tab.
   * Tracks the event and calls the onTabSwitch callback.
   * @param {string} tabId - The id of the clicked tab.
   * @param {number} index - The index of the clicked tab.
   * @returns {void}
   */
  const handleTabClick = useCallback((tabId, index) => {
    trackEvent('tab_click', { tab: tabId });
    setFocusedIndex(index);
    if (onTabSwitch) {
      onTabSwitch(tabId);
    }
  }, [onTabSwitch]);

  /**
   * Handles keyboard navigation within the tab list.
   * Supports ArrowLeft, ArrowRight, Home, End, and Enter/Space for activation.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @returns {void}
   */
  const handleKeyDown = useCallback((e) => {
    const tabCount = TABS.length;
    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (focusedIndex + 1) % tabCount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (focusedIndex - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabCount - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(TABS[focusedIndex].id, focusedIndex);
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    scrollTabIntoView(newIndex);

    const tabEl = tabRefs.current[newIndex];
    if (tabEl) {
      tabEl.focus();
    }
  }, [focusedIndex, handleTabClick, scrollTabIntoView]);

  const currentActiveTab = activeTab || TABS[0].id;

  return (
    <nav
      className="bg-white border-b border-gray-200 shadow-executive-sm"
      aria-label="Dashboard sections"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="overflow-x-auto scrollbar-thin"
          ref={tabListRef}
        >
          <div
            className="flex space-x-1 min-w-max"
            role="tablist"
            aria-label="Dashboard section tabs"
            onKeyDown={handleKeyDown}
          >
            {TABS.map((tab, index) => {
              const isActive = currentActiveTab === tab.id;
              const isFocused = focusedIndex === index;

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isFocused ? 0 : -1}
                  type="button"
                  onClick={() => handleTabClick(tab.id, index)}
                  className={[
                    'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-inset rounded-t-executive',
                    isActive
                      ? 'text-executive-blue-700 border-b-2 border-executive-blue-600 bg-executive-blue-50'
                      : 'text-gray-500 hover:text-executive-blue-600 hover:bg-gray-50 border-b-2 border-transparent',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

TabNavigation.propTypes = {
  activeTab: PropTypes.string,
  onTabSwitch: PropTypes.func,
};

TabNavigation.defaultProps = {
  activeTab: 'strategic_command',
  onTabSwitch: undefined,
};

export default TabNavigation;