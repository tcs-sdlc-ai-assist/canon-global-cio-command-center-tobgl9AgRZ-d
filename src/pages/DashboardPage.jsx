import { useState, useEffect, useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { trackEvent } from '../services/EngagementAnalytics';
import { initializeMockData } from '../utils/mockDataInit';
import Header from '../components/layout/Header';
import TabNavigation from '../components/layout/TabNavigation';
import StrategicCommandTab from '../components/tabs/StrategicCommandTab';
import ExecutiveSummaryTab from '../components/tabs/ExecutiveSummaryTab';
import BusinessImpactTab from '../components/tabs/BusinessImpactTab';
import OperationsTab from '../components/tabs/OperationsTab';
import RiskGovernanceTab from '../components/tabs/RiskGovernanceTab';
import InnovationTab from '../components/tabs/InnovationTab';
import PartnershipsTab from '../components/tabs/PartnershipsTab';
import AIChatPanel from '../components/ai/AIChatPanel';
import AIChatToggle from '../components/ai/AIChatToggle';

/**
 * Returns the active tab content component based on the tab id.
 * @param {string} activeTab - The active tab id string.
 * @returns {React.ReactElement|null} The tab content component.
 */
function renderTabContent(activeTab) {
  switch (activeTab) {
    case 'strategic_command':
      return <StrategicCommandTab />;
    case 'executive_summary':
      return <ExecutiveSummaryTab />;
    case 'business_impact':
      return <BusinessImpactTab />;
    case 'operations':
      return <OperationsTab />;
    case 'risk_governance':
      return <RiskGovernanceTab />;
    case 'innovation':
      return <InnovationTab />;
    case 'partnerships':
      return <PartnershipsTab />;
    default:
      return <StrategicCommandTab />;
  }
}

/**
 * DashboardPage component (DashboardShell).
 * Main dashboard page that composes Header, TabNavigation, and conditionally
 * renders the active tab content component. Includes AIChatToggle and AIChatPanel
 * overlays. Manages active tab state, passes onTabSwitch callback.
 * Initializes mock data on mount and tracks page views.
 * Includes a live indicator timer for periodic UI refresh animations.
 *
 * @returns {React.ReactElement}
 */
function DashboardPage() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState('strategic_command');
  const [liveTimestamp, setLiveTimestamp] = useState(Date.now());

  /**
   * Initialize mock data on first mount and track page view.
   */
  useEffect(() => {
    initializeMockData();

    trackEvent('page_view', {
      page: 'dashboard',
      section: 'strategic_command',
      username: user?.username || 'unknown',
    });
  }, [user]);

  /**
   * Live indicator timer for periodic UI refresh animations.
   * Updates every 5 minutes to simulate live data refresh.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveTimestamp(Date.now());
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  /**
   * Handles tab switch events from TabNavigation.
   * Updates active tab state and tracks the tab click event.
   * @param {string} tabId - The id of the selected tab.
   * @returns {void}
   */
  const handleTabSwitch = useCallback((tabId) => {
    setActiveTab(tabId);

    trackEvent('page_view', {
      page: 'dashboard',
      section: tabId,
      username: user?.username || 'unknown',
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header />

      {/* Tab Navigation - positioned below fixed header */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <TabNavigation
          activeTab={activeTab}
          onTabSwitch={handleTabSwitch}
        />
      </div>

      {/* Main Content Area */}
      <main
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        role="main"
        aria-label="Dashboard content"
      >
        {renderTabContent(activeTab)}
      </main>

      {/* AI Chat Overlay Components */}
      <AIChatPanel />
      <AIChatToggle />
    </div>
  );
}

export default DashboardPage;