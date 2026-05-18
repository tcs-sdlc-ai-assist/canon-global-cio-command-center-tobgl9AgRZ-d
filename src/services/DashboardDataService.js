import {
  getItem,
  setItem,
  isArray,
  isPlainObject,
  appendToArray,
} from '../utils/localStorageUtils';
import {
  DASHBOARD_DATA_KEY,
  EVENT_LOG_KEY,
  AI_INSIGHTS_KEY,
  DEFAULT_CONFIG,
  CHART_COLORS,
} from '../utils/constants';

const VALID_SECTIONS = [
  'executive_summary',
  'business_impact',
  'operations',
  'risk_governance',
  'innovation',
  'partnerships',
];

const MONTHS_12 = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Generates the default mock dashboard data for all sections.
 * @returns {Object} The complete dashboard data object keyed by section name.
 */
function generateDefaultDashboardData() {
  return {
    executive_summary: {
      metrics: [
        { label: 'IT Budget Utilization', value: 87, unit: '%', trend: '+2.3%', status: 'Healthy' },
        { label: 'System Uptime', value: 99.97, unit: '%', trend: '+0.02%', status: 'Healthy' },
        { label: 'Active Projects', value: 42, unit: '', trend: '+5', status: 'On Track' },
        { label: 'Open Incidents', value: 7, unit: '', trend: '-3', status: 'Warning' },
        { label: 'Security Score', value: 94, unit: '/100', trend: '+1', status: 'Healthy' },
        { label: 'Employee Satisfaction', value: 4.2, unit: '/5', trend: '+0.1', status: 'Healthy' },
      ],
      charts: {
        budgetTrend: {
          type: 'line',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Budget Spent ($M)',
              data: [8.2, 16.1, 24.5, 33.0, 41.2, 49.8, 58.1, 66.7, 75.0, 83.2, 91.5, 100.0],
              borderColor: CHART_COLORS.primary,
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
            },
            {
              label: 'Budget Planned ($M)',
              data: [8.3, 16.7, 25.0, 33.3, 41.7, 50.0, 58.3, 66.7, 75.0, 83.3, 91.7, 100.0],
              borderColor: CHART_COLORS.muted,
              borderDash: [5, 5],
              fill: false,
            },
          ],
        },
        incidentTrend: {
          type: 'bar',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Incidents',
              data: [12, 9, 15, 8, 11, 7, 10, 6, 9, 5, 8, 7],
              backgroundColor: CHART_COLORS.warning,
            },
          ],
        },
      },
      table: [
        { region: 'North America', status: 'Excellent', uptime: '99.99%', incidents: 2, satisfaction: 4.5 },
        { region: 'EMEA', status: 'Good', uptime: '99.95%', incidents: 3, satisfaction: 4.1 },
        { region: 'APAC', status: 'Good', uptime: '99.96%', incidents: 1, satisfaction: 4.3 },
        { region: 'Latin America', status: 'Fair', uptime: '99.90%', incidents: 1, satisfaction: 3.9 },
      ],
    },
    business_impact: {
      metrics: [
        { label: 'Revenue Enabled', value: 120000000, unit: '$', trend: '+5.2%', status: 'Healthy' },
        { label: 'Cost Avoidance', value: 8000000, unit: '$', trend: '+12%', status: 'Healthy' },
        { label: 'Process Automation Savings', value: 3200000, unit: '$', trend: '+18%', status: 'Healthy' },
        { label: 'Customer Experience Score', value: 92, unit: '/100', trend: '+3', status: 'On Track' },
        { label: 'Digital Revenue Share', value: 34, unit: '%', trend: '+4.1%', status: 'On Track' },
        { label: 'Time to Market', value: 45, unit: 'days', trend: '-8 days', status: 'Healthy' },
      ],
      charts: {
        valueChart: {
          type: 'bar',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Revenue Enabled ($M)',
              data: [28, 30, 31, 31],
              backgroundColor: CHART_COLORS.primary,
            },
            {
              label: 'Cost Savings ($M)',
              data: [1.8, 2.0, 2.1, 2.3],
              backgroundColor: CHART_COLORS.secondary,
            },
          ],
        },
        trendChart: {
          type: 'line',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Digital Revenue %',
              data: [28, 29, 29.5, 30, 30.5, 31, 31.5, 32, 32.5, 33, 33.5, 34],
              borderColor: CHART_COLORS.primary,
              fill: false,
            },
          ],
        },
      },
      table: [
        { initiative: 'E-Commerce Platform', impact: '$45M revenue', status: 'On Track', roi: '320%' },
        { initiative: 'Supply Chain AI', impact: '$8M savings', status: 'On Track', roi: '280%' },
        { initiative: 'Customer Portal', impact: '+15 NPS', status: 'At Risk', roi: '190%' },
        { initiative: 'RPA Deployment', impact: '$3.2M savings', status: 'Completed', roi: '450%' },
      ],
    },
    operations: {
      metrics: [
        { label: 'System Uptime', value: 99.97, unit: '%', trend: '+0.02%', status: 'Healthy' },
        { label: 'Mean Time to Resolve', value: 2.3, unit: 'hrs', trend: '-0.5 hrs', status: 'Healthy' },
        { label: 'Change Success Rate', value: 98.5, unit: '%', trend: '+0.3%', status: 'Healthy' },
        { label: 'Open P1 Incidents', value: 1, unit: '', trend: '-2', status: 'Warning' },
        { label: 'Deployment Frequency', value: 47, unit: '/week', trend: '+8', status: 'Healthy' },
        { label: 'Infrastructure Cost', value: 2100000, unit: '$/mo', trend: '-3.2%', status: 'Healthy' },
      ],
      charts: {
        uptimeChart: {
          type: 'line',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Uptime %',
              data: [99.92, 99.94, 99.95, 99.93, 99.96, 99.95, 99.97, 99.96, 99.98, 99.97, 99.97, 99.97],
              borderColor: CHART_COLORS.secondary,
              fill: false,
            },
          ],
        },
        incidentChart: {
          type: 'bar',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'P1 Incidents',
              data: [3, 2, 4, 2, 3, 1, 2, 1, 2, 1, 1, 1],
              backgroundColor: CHART_COLORS.danger,
            },
            {
              label: 'P2 Incidents',
              data: [8, 7, 10, 6, 8, 5, 7, 5, 6, 4, 5, 4],
              backgroundColor: CHART_COLORS.warning,
            },
            {
              label: 'P3 Incidents',
              data: [15, 12, 18, 11, 14, 10, 12, 9, 11, 8, 10, 9],
              backgroundColor: CHART_COLORS.muted,
            },
          ],
        },
      },
      table: [
        { service: 'Core ERP', uptime: '99.99%', incidents: 0, status: 'Healthy' },
        { service: 'Email & Collaboration', uptime: '99.98%', incidents: 1, status: 'Healthy' },
        { service: 'CRM Platform', uptime: '99.95%', incidents: 2, status: 'Healthy' },
        { service: 'Data Warehouse', uptime: '99.90%', incidents: 3, status: 'Warning' },
        { service: 'VPN / Remote Access', uptime: '99.85%', incidents: 1, status: 'Warning' },
      ],
    },
    risk_governance: {
      metrics: [
        { label: 'Overall Risk Score', value: 23, unit: '/100', trend: '-4', status: 'Healthy' },
        { label: 'Compliance Rate', value: 97.8, unit: '%', trend: '+1.2%', status: 'Healthy' },
        { label: 'Open Audit Findings', value: 5, unit: '', trend: '-2', status: 'Warning' },
        { label: 'Vulnerability Backlog', value: 12, unit: '', trend: '-8', status: 'Warning' },
        { label: 'Policy Adherence', value: 96, unit: '%', trend: '+2%', status: 'Healthy' },
        { label: 'Disaster Recovery RTO', value: 4, unit: 'hrs', trend: '-1 hr', status: 'Healthy' },
      ],
      charts: {
        riskTrend: {
          type: 'line',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Risk Score',
              data: [35, 33, 31, 30, 29, 28, 27, 26, 25, 24, 24, 23],
              borderColor: CHART_COLORS.danger,
              fill: false,
            },
          ],
        },
        complianceChart: {
          type: 'doughnut',
          labels: ['Compliant', 'Non-Compliant', 'In Review'],
          datasets: [
            {
              data: [97.8, 1.2, 1.0],
              backgroundColor: [CHART_COLORS.secondary, CHART_COLORS.danger, CHART_COLORS.warning],
            },
          ],
        },
      },
      table: [
        { risk: 'Ransomware Exposure', severity: 'High', status: 'Mitigating', owner: 'CISO' },
        { risk: 'Legacy System EOL', severity: 'Medium', status: 'In Progress', owner: 'VP Infrastructure' },
        { risk: 'Data Privacy (GDPR)', severity: 'Medium', status: 'Compliant', owner: 'DPO' },
        { risk: 'Third-Party Vendor Risk', severity: 'High', status: 'Monitoring', owner: 'Procurement' },
        { risk: 'Cloud Misconfiguration', severity: 'Low', status: 'Resolved', owner: 'Cloud Ops' },
      ],
    },
    innovation: {
      metrics: [
        { label: 'Innovation Pipeline', value: 18, unit: 'projects', trend: '+3', status: 'Healthy' },
        { label: 'AI/ML Initiatives', value: 8, unit: '', trend: '+2', status: 'On Track' },
        { label: 'Patent Applications', value: 5, unit: '', trend: '+1', status: 'Healthy' },
        { label: 'R&D Investment', value: 15000000, unit: '$', trend: '+10%', status: 'Healthy' },
        { label: 'PoC Success Rate', value: 72, unit: '%', trend: '+5%', status: 'On Track' },
        { label: 'Time to PoC', value: 30, unit: 'days', trend: '-5 days', status: 'Healthy' },
      ],
      charts: {
        portfolioChart: {
          type: 'doughnut',
          labels: ['AI/ML', 'IoT', 'Blockchain', 'Cloud Native', 'Automation', 'Other'],
          datasets: [
            {
              data: [35, 20, 10, 15, 12, 8],
              backgroundColor: CHART_COLORS.palette.slice(0, 6),
            },
          ],
        },
        investmentTrend: {
          type: 'bar',
          labels: ['2020', '2021', '2022', '2023', '2024'],
          datasets: [
            {
              label: 'R&D Investment ($M)',
              data: [8, 10, 11, 13, 15],
              backgroundColor: CHART_COLORS.primary,
            },
          ],
        },
      },
      table: [
        { project: 'Generative AI Assistant', stage: 'Pilot', investment: '$2.5M', expectedROI: '400%', status: 'On Track' },
        { project: 'Predictive Maintenance IoT', stage: 'PoC', investment: '$1.2M', expectedROI: '250%', status: 'On Track' },
        { project: 'Smart Document Processing', stage: 'Production', investment: '$800K', expectedROI: '350%', status: 'Completed' },
        { project: 'Digital Twin Platform', stage: 'Research', investment: '$3M', expectedROI: '200%', status: 'In Progress' },
        { project: 'Edge Computing Network', stage: 'Pilot', investment: '$1.8M', expectedROI: '180%', status: 'At Risk' },
      ],
    },
    partnerships: {
      metrics: [
        { label: 'Strategic Partners', value: 24, unit: '', trend: '+3', status: 'Healthy' },
        { label: 'Partner Satisfaction', value: 4.4, unit: '/5', trend: '+0.2', status: 'Healthy' },
        { label: 'Joint Revenue', value: 35000000, unit: '$', trend: '+8%', status: 'On Track' },
        { label: 'SLA Compliance', value: 99.2, unit: '%', trend: '+0.5%', status: 'Healthy' },
        { label: 'Active Integrations', value: 156, unit: '', trend: '+12', status: 'Healthy' },
        { label: 'Vendor Risk Score', value: 18, unit: '/100', trend: '-3', status: 'Healthy' },
      ],
      charts: {
        partnerPerformance: {
          type: 'bar',
          labels: ['Microsoft', 'AWS', 'SAP', 'Salesforce', 'ServiceNow', 'Oracle'],
          datasets: [
            {
              label: 'Performance Score',
              data: [95, 92, 88, 90, 87, 85],
              backgroundColor: CHART_COLORS.palette.slice(0, 6),
            },
          ],
        },
        spendTrend: {
          type: 'line',
          labels: MONTHS_12,
          datasets: [
            {
              label: 'Partner Spend ($M)',
              data: [2.1, 2.2, 2.3, 2.4, 2.3, 2.5, 2.6, 2.5, 2.7, 2.8, 2.9, 3.0],
              borderColor: CHART_COLORS.primary,
              fill: false,
            },
          ],
        },
      },
      table: [
        { partner: 'Microsoft', type: 'Strategic', spend: '$12M', sla: '99.9%', satisfaction: 4.7, status: 'Excellent' },
        { partner: 'AWS', type: 'Strategic', spend: '$8M', sla: '99.8%', satisfaction: 4.5, status: 'Excellent' },
        { partner: 'SAP', type: 'Strategic', spend: '$6M', sla: '99.5%', satisfaction: 4.2, status: 'Good' },
        { partner: 'Salesforce', type: 'Preferred', spend: '$4M', sla: '99.6%', satisfaction: 4.3, status: 'Good' },
        { partner: 'ServiceNow', type: 'Preferred', spend: '$3M', sla: '99.4%', satisfaction: 4.1, status: 'Good' },
        { partner: 'Oracle', type: 'Standard', spend: '$2M', sla: '99.2%', satisfaction: 3.8, status: 'Fair' },
      ],
    },
  };
}

/**
 * Generates the default AI insights keyed by section.
 * @returns {Object} AI insights object keyed by section name.
 */
function generateDefaultAIInsights() {
  return {
    executive_summary: {
      summary: 'Overall IT health is strong with 99.97% uptime and budget tracking within 2% of plan. Focus areas: reduce open incidents and accelerate digital transformation initiatives.',
      metricInsights: {
        'IT Budget Utilization': 'Budget utilization is on track at 87%. Consider reallocating 3% from infrastructure savings to innovation projects.',
        'System Uptime': 'Uptime exceeds SLA targets. The recent infrastructure modernization is paying dividends.',
        'Active Projects': '42 active projects with 85% on track. Recommend prioritizing the 3 at-risk projects for executive review.',
        'Open Incidents': '7 open incidents, down from 10 last month. P1 incident count reduced by 67% quarter-over-quarter.',
        'Security Score': 'Security posture improved to 94/100. Remaining gaps are in third-party vendor assessments.',
        'Employee Satisfaction': 'IT satisfaction at 4.2/5, above industry benchmark of 3.8. New collaboration tools driving improvement.',
      },
      recommendations: [
        'Accelerate cloud migration for remaining on-premise workloads',
        'Invest in AI-driven incident prediction to further reduce MTTR',
        'Expand automation in procurement and HR processes',
      ],
    },
    business_impact: {
      summary: 'IT-enabled revenue grew 5.2% YoY to $120M. Digital revenue share reached 34%, exceeding the 30% target. Cost avoidance programs saved $8M.',
      metricInsights: {
        'Revenue Enabled': 'Revenue enabled by IT grew 5.2% driven by e-commerce platform enhancements and new digital channels.',
        'Cost Avoidance': '$8M in cost avoidance achieved through cloud optimization and license rationalization.',
        'Process Automation Savings': 'RPA deployment saved $3.2M across 45 automated processes. Expanding to finance and HR next quarter.',
        'Customer Experience Score': 'CX score at 92/100. Customer portal redesign contributed +5 points.',
        'Digital Revenue Share': 'Digital revenue at 34% of total, up from 30% last year. Mobile commerce growing fastest at +22% YoY.',
        'Time to Market': 'Average time to market reduced to 45 days from 53 days through DevOps improvements.',
      },
      recommendations: [
        'Scale successful RPA use cases to additional business units',
        'Invest in personalization engine to boost digital conversion rates',
        'Establish data monetization strategy for partner ecosystem',
      ],
    },
    operations: {
      summary: 'Operations are performing well with 99.97% uptime and improving MTTR. Deployment frequency increased 20% with maintained quality. Focus on reducing P1 incidents to zero.',
      metricInsights: {
        'System Uptime': 'Uptime at 99.97% exceeds the 99.95% SLA. Redundancy improvements in APAC region contributed to gains.',
        'Mean Time to Resolve': 'MTTR improved to 2.3 hours from 2.8 hours through AI-assisted triage and runbook automation.',
        'Change Success Rate': '98.5% change success rate. Automated testing in CI/CD pipeline reduced failed deployments by 40%.',
        'Open P1 Incidents': '1 open P1 incident related to data warehouse performance. Resolution expected within 4 hours.',
        'Deployment Frequency': '47 deployments per week, up from 39. Microservices architecture enabling faster releases.',
        'Infrastructure Cost': 'Infrastructure costs down 3.2% through reserved instance optimization and right-sizing.',
      },
      recommendations: [
        'Implement AIOps for predictive incident management',
        'Migrate remaining monolithic applications to microservices',
        'Establish SRE practices for top 10 critical services',
      ],
    },
    risk_governance: {
      summary: 'Risk posture improved with overall score dropping to 23/100. Compliance rate at 97.8%. Key focus: close remaining audit findings and reduce vulnerability backlog.',
      metricInsights: {
        'Overall Risk Score': 'Risk score improved from 35 to 23 over 12 months through systematic risk remediation program.',
        'Compliance Rate': '97.8% compliance across all frameworks (SOX, GDPR, ISO 27001). Two minor findings in remediation.',
        'Open Audit Findings': '5 open findings, down from 7. All are medium severity with remediation plans in place.',
        'Vulnerability Backlog': '12 open vulnerabilities, down from 20. Critical and high vulnerabilities resolved within SLA.',
        'Policy Adherence': '96% policy adherence. New automated policy enforcement reduced violations by 30%.',
        'Disaster Recovery RTO': 'DR RTO improved to 4 hours from 5 hours. Annual DR test completed successfully.',
      },
      recommendations: [
        'Implement zero-trust architecture for all critical systems',
        'Automate compliance monitoring and reporting',
        'Conduct tabletop exercises for ransomware scenarios quarterly',
      ],
    },
    innovation: {
      summary: 'Innovation pipeline is healthy with 18 projects across AI, IoT, and cloud-native technologies. PoC success rate at 72%, above industry average. R&D investment increased 10%.',
      metricInsights: {
        'Innovation Pipeline': '18 projects in pipeline spanning AI/ML, IoT, blockchain, and cloud-native technologies.',
        'AI/ML Initiatives': '8 AI/ML initiatives active. Generative AI assistant pilot showing 40% productivity improvement.',
        'Patent Applications': '5 patent applications filed this year, up from 4. Focus on AI-driven imaging and document processing.',
        'R&D Investment': 'R&D investment at $15M, representing 15% of IT budget. ROI on completed projects averaging 300%.',
        'PoC Success Rate': '72% PoC success rate, up from 67%. Improved evaluation framework reducing failed experiments.',
        'Time to PoC': 'Average PoC timeline reduced to 30 days through reusable platform components and sandbox environments.',
      },
      recommendations: [
        'Scale generative AI assistant to all business units',
        'Establish innovation lab partnerships with universities',
        'Create fast-track funding process for high-potential PoCs',
      ],
    },
    partnerships: {
      summary: 'Partner ecosystem is strong with 24 strategic partners and 99.2% SLA compliance. Joint revenue grew 8% to $35M. Focus on deepening AI/cloud partnerships.',
      metricInsights: {
        'Strategic Partners': '24 strategic partners, up from 21. New partnerships in AI and cybersecurity domains.',
        'Partner Satisfaction': 'Partner satisfaction at 4.4/5. Improved onboarding process and dedicated partner success managers driving gains.',
        'Joint Revenue': 'Joint revenue at $35M, up 8% YoY. Microsoft and AWS partnerships contributing 60% of joint revenue.',
        'SLA Compliance': '99.2% SLA compliance across all partners. Oracle SLA under review for improvement.',
        'Active Integrations': '156 active integrations, up from 144. API-first strategy enabling faster partner onboarding.',
        'Vendor Risk Score': 'Vendor risk score at 18/100 (low risk). Continuous monitoring program detecting issues proactively.',
      },
      recommendations: [
        'Establish joint innovation programs with top 5 partners',
        'Implement automated vendor risk scoring and alerting',
        'Negotiate multi-year strategic agreements for cost optimization',
      ],
    },
  };
}

/**
 * Ensures default dashboard data exists in localStorage.
 * Initializes data if not present or if data is invalid.
 * @returns {void}
 */
function ensureDashboardData() {
  const existing = getItem(DASHBOARD_DATA_KEY, null);
  if (!isPlainObject(existing)) {
    const defaultData = generateDefaultDashboardData();
    setItem(DASHBOARD_DATA_KEY, defaultData);
  }
}

/**
 * Ensures default AI insights exist in localStorage.
 * Initializes insights if not present or if data is invalid.
 * @returns {void}
 */
function ensureAIInsights() {
  const existing = getItem(AI_INSIGHTS_KEY, null);
  if (!isPlainObject(existing)) {
    const defaultInsights = generateDefaultAIInsights();
    setItem(AI_INSIGHTS_KEY, defaultInsights);
  }
}

/**
 * Ensures the event log exists in localStorage as an array.
 * @returns {void}
 */
function ensureEventLog() {
  const existing = getItem(EVENT_LOG_KEY, null);
  if (!isArray(existing)) {
    setItem(EVENT_LOG_KEY, []);
  }
}

/**
 * Initializes all mock data in localStorage on first load.
 * Safe to call multiple times; only writes if data is missing or invalid.
 * @returns {void}
 */
export function initializeDashboardData() {
  ensureDashboardData();
  ensureAIInsights();
  ensureEventLog();
}

/**
 * Validates that a section name is one of the known dashboard sections.
 * @param {string} section - The section name to validate.
 * @returns {boolean} True if the section is valid.
 */
function isValidSection(section) {
  return typeof section === 'string' && VALID_SECTIONS.includes(section);
}

/**
 * Retrieves mock metric/chart/table data for a given dashboard tab section from localStorage.
 * Initializes defaults if not present.
 * @param {string} section - The section name (e.g., 'executive_summary', 'business_impact').
 * @returns {Promise<Object>} Resolves with the section data object containing metrics, charts, and table.
 */
export function getDashboardData(section) {
  return new Promise((resolve, reject) => {
    try {
      if (!isValidSection(section)) {
        reject({
          error: 'INVALID_SECTION',
          message: `Invalid section "${section}". Must be one of: ${VALID_SECTIONS.join(', ')}`,
        });
        return;
      }

      ensureDashboardData();

      const data = getItem(DASHBOARD_DATA_KEY, null);

      if (!isPlainObject(data)) {
        const defaultData = generateDefaultDashboardData();
        setItem(DASHBOARD_DATA_KEY, defaultData);
        resolve(defaultData[section]);
        return;
      }

      if (!data[section]) {
        const defaultData = generateDefaultDashboardData();
        data[section] = defaultData[section];
        setItem(DASHBOARD_DATA_KEY, data);
        resolve(data[section]);
        return;
      }

      resolve(data[section]);
    } catch (e) {
      saveEvent({
        eventType: 'data_error',
        timestamp: Date.now(),
        details: { section, error: e.message },
      }).catch(() => {});

      reject({
        error: 'DATA_LOAD_FAILED',
        message: e.message || 'Failed to load dashboard data',
      });
    }
  });
}

/**
 * Logs a user interaction event to the localStorage event log.
 * Events are stored as an array with a maximum length defined by MAX_EVENT_LOG_ENTRIES.
 * @param {{ eventType: string, timestamp: number, details: Object }} event - The event to log.
 * @returns {Promise<void>} Resolves when the event is saved.
 */
export function saveEvent(event) {
  return new Promise((resolve, reject) => {
    try {
      if (!event || typeof event !== 'object' || Array.isArray(event)) {
        reject({
          error: 'INVALID_EVENT',
          message: 'Event must be a non-null object',
        });
        return;
      }

      if (!event.eventType || typeof event.eventType !== 'string') {
        reject({
          error: 'INVALID_EVENT',
          message: 'Event must have a string eventType property',
        });
        return;
      }

      const eventToSave = {
        eventType: event.eventType,
        timestamp: typeof event.timestamp === 'number' && isFinite(event.timestamp)
          ? event.timestamp
          : Date.now(),
        details: isPlainObject(event.details) ? event.details : {},
      };

      const success = appendToArray(
        EVENT_LOG_KEY,
        eventToSave,
        DEFAULT_CONFIG.MAX_EVENT_LOG_ENTRIES
      );

      if (!success) {
        reject({
          error: 'EVENT_LOG_FAILED',
          message: 'Failed to save event to localStorage',
        });
        return;
      }

      resolve();
    } catch (e) {
      reject({
        error: 'EVENT_LOG_FAILED',
        message: e.message || 'Failed to save event',
      });
    }
  });
}

/**
 * Retrieves AI insight strings for metric cards for a given dashboard section.
 * Initializes defaults if not present.
 * @param {string} section - The section name (e.g., 'executive_summary', 'business_impact').
 * @returns {Promise<Object>} Resolves with the AI insights object for the section.
 */
export function getAIInsights(section) {
  return new Promise((resolve, reject) => {
    try {
      if (!isValidSection(section)) {
        reject({
          error: 'INVALID_SECTION',
          message: `Invalid section "${section}". Must be one of: ${VALID_SECTIONS.join(', ')}`,
        });
        return;
      }

      ensureAIInsights();

      const insights = getItem(AI_INSIGHTS_KEY, null);

      if (!isPlainObject(insights)) {
        const defaultInsights = generateDefaultAIInsights();
        setItem(AI_INSIGHTS_KEY, defaultInsights);
        resolve(defaultInsights[section]);
        return;
      }

      if (!insights[section]) {
        const defaultInsights = generateDefaultAIInsights();
        insights[section] = defaultInsights[section];
        setItem(AI_INSIGHTS_KEY, insights);
        resolve(insights[section]);
        return;
      }

      resolve(insights[section]);
    } catch (e) {
      reject({
        error: 'INSIGHTS_LOAD_FAILED',
        message: e.message || 'Failed to load AI insights',
      });
    }
  });
}

/**
 * Retrieves the event log from localStorage.
 * @returns {Array<Object>} The array of logged events.
 */
export function getEventLog() {
  ensureEventLog();
  const log = getItem(EVENT_LOG_KEY, []);
  return isArray(log) ? log : [];
}

/**
 * Returns the list of valid section names.
 * @returns {string[]} Array of valid section name strings.
 */
export function getValidSections() {
  return [...VALID_SECTIONS];
}