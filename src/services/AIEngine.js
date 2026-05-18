import {
  getItem,
  setItem,
  isArray,
} from '../utils/localStorageUtils';
import {
  AI_CHAT_HISTORY_KEY,
  AI_ACTION_CHIPS_KEY,
  AI_INSIGHTS_KEY,
  DEFAULT_CONFIG,
} from '../utils/constants';

/**
 * Default action chips for the AI assistant.
 * @type {Array<{id: string, label: string, query: string, category: string}>}
 */
const DEFAULT_ACTION_CHIPS = [
  {
    id: 'chip_cloud_roi',
    label: 'Show Cloud Migration ROI',
    query: 'What is the ROI of cloud migration?',
    category: 'business_impact',
  },
  {
    id: 'chip_security_risks',
    label: 'Highlight Security Risks',
    query: 'What are the top security risks this quarter?',
    category: 'risk_governance',
  },
  {
    id: 'chip_budget_status',
    label: 'Budget Utilization Status',
    query: 'What is the current budget utilization status?',
    category: 'executive_summary',
  },
  {
    id: 'chip_innovation_pipeline',
    label: 'Innovation Pipeline Summary',
    query: 'Show me the innovation pipeline summary.',
    category: 'innovation',
  },
  {
    id: 'chip_system_uptime',
    label: 'System Uptime Report',
    query: 'What is the current system uptime?',
    category: 'operations',
  },
  {
    id: 'chip_partner_performance',
    label: 'Partner Performance Overview',
    query: 'How are our strategic partners performing?',
    category: 'partnerships',
  },
  {
    id: 'chip_ai_initiatives',
    label: 'AI/ML Initiatives Status',
    query: 'What is the status of AI and ML initiatives?',
    category: 'innovation',
  },
  {
    id: 'chip_cost_savings',
    label: 'Cost Savings Breakdown',
    query: 'Show me the cost savings breakdown.',
    category: 'business_impact',
  },
];

/**
 * Rule map for keyword-based AI response matching.
 * Keys are lowercase keywords; values are response objects.
 * @type {Object<string, {response: string, actions: string[]}>}
 */
const RULE_MAP = {
  cloud: {
    response: 'Cloud migration is progressing well. Current ROI stands at 280% with $8M in cost avoidance achieved through cloud optimization and license rationalization. We recommend accelerating migration for remaining on-premise workloads to capture an additional $2.5M in annual savings.',
    actions: ['Show Cloud Migration ROI', 'Budget Utilization Status'],
  },
  migration: {
    response: 'The cloud migration program has moved 72% of workloads to cloud infrastructure. Remaining on-premise systems are scheduled for migration in Q2-Q3. Expected cost reduction of 3.2% in infrastructure spending upon completion.',
    actions: ['Show Cloud Migration ROI', 'System Uptime Report'],
  },
  security: {
    response: 'Security posture is strong with an overall score of 94/100. Key focus areas include ransomware exposure mitigation (High severity, actively mitigating), third-party vendor risk monitoring, and completing the zero-trust architecture rollout. Vulnerability backlog reduced from 20 to 12 this quarter.',
    actions: ['Highlight Security Risks', 'Partner Performance Overview'],
  },
  risk: {
    response: 'Overall risk score improved to 23/100, down from 35 over the past 12 months. Compliance rate is at 97.8% across SOX, GDPR, and ISO 27001 frameworks. 5 open audit findings remain, all medium severity with remediation plans in place. Recommend conducting quarterly tabletop exercises for ransomware scenarios.',
    actions: ['Highlight Security Risks', 'Budget Utilization Status'],
  },
  budget: {
    response: 'IT budget utilization is at 87%, tracking within 2% of plan. Year-to-date spend is $83.2M against a $100M annual budget. Infrastructure costs are down 3.2% through reserved instance optimization. Recommend reallocating 3% from infrastructure savings to innovation projects.',
    actions: ['Budget Utilization Status', 'Cost Savings Breakdown'],
  },
  cost: {
    response: 'Total cost avoidance this year: $8M. Process automation (RPA) saved $3.2M across 45 automated processes. Cloud optimization contributed $2.8M in savings. License rationalization added $2M. Expanding RPA to finance and HR next quarter for an additional $1.5M projected savings.',
    actions: ['Cost Savings Breakdown', 'Budget Utilization Status'],
  },
  saving: {
    response: 'Cost savings are on track with $8M in total avoidance. Key contributors: RPA deployment ($3.2M), cloud optimization ($2.8M), and license rationalization ($2M). Infrastructure costs reduced 3.2% month-over-month through right-sizing and reserved instances.',
    actions: ['Cost Savings Breakdown', 'Show Cloud Migration ROI'],
  },
  innovation: {
    response: 'The innovation pipeline has 18 active projects spanning AI/ML, IoT, blockchain, and cloud-native technologies. PoC success rate is 72%, above industry average. R&D investment increased 10% to $15M. The Generative AI Assistant pilot is showing 40% productivity improvement. Recommend scaling to all business units.',
    actions: ['Innovation Pipeline Summary', 'AI/ML Initiatives Status'],
  },
  pipeline: {
    response: 'Innovation pipeline overview: 18 projects total — 8 AI/ML, 4 IoT, 2 Blockchain, 2 Cloud Native, 2 Automation. 5 patent applications filed this year. Average PoC timeline reduced to 30 days through reusable platform components. Top project: Generative AI Assistant (Pilot stage, $2.5M investment, 400% expected ROI).',
    actions: ['Innovation Pipeline Summary', 'AI/ML Initiatives Status'],
  },
  uptime: {
    response: 'System uptime is at 99.97%, exceeding the 99.95% SLA target. Core ERP leads at 99.99% uptime with zero incidents. Mean Time to Resolve improved to 2.3 hours from 2.8 hours through AI-assisted triage. 1 open P1 incident related to data warehouse performance, resolution expected within 4 hours.',
    actions: ['System Uptime Report', 'Highlight Security Risks'],
  },
  incident: {
    response: 'Current open incidents: 7 total (1 P1, 4 P2, 2 P3). P1 incident count reduced by 67% quarter-over-quarter. The open P1 is related to data warehouse performance degradation. MTTR improved to 2.3 hours. Recommend implementing AIOps for predictive incident management.',
    actions: ['System Uptime Report', 'Highlight Security Risks'],
  },
  partner: {
    response: 'Partner ecosystem is strong with 24 strategic partners and 99.2% SLA compliance. Partner satisfaction at 4.4/5. Joint revenue grew 8% to $35M. Top performers: Microsoft (95/100), AWS (92/100), Salesforce (90/100). Recommend establishing joint innovation programs with top 5 partners.',
    actions: ['Partner Performance Overview', 'Cost Savings Breakdown'],
  },
  vendor: {
    response: 'Vendor risk score is low at 18/100. 156 active integrations across the partner ecosystem. SLA compliance at 99.2%. Oracle SLA under review for improvement. Continuous monitoring program detecting issues proactively. Recommend implementing automated vendor risk scoring and alerting.',
    actions: ['Partner Performance Overview', 'Highlight Security Risks'],
  },
  ai: {
    response: '8 AI/ML initiatives are currently active. The Generative AI Assistant pilot shows 40% productivity improvement and is recommended for scaling. Predictive Maintenance IoT is in PoC stage with $1.2M investment. Smart Document Processing is in production with 350% ROI. Total AI/ML investment: $7.5M with average ROI of 300%.',
    actions: ['AI/ML Initiatives Status', 'Innovation Pipeline Summary'],
  },
  ml: {
    response: 'Machine learning initiatives are progressing well. 8 active projects with a combined investment of $7.5M. Key highlights: Generative AI Assistant (Pilot, 400% expected ROI), Predictive Maintenance IoT (PoC, 250% expected ROI), Smart Document Processing (Production, 350% ROI achieved).',
    actions: ['AI/ML Initiatives Status', 'Innovation Pipeline Summary'],
  },
  revenue: {
    response: 'IT-enabled revenue grew 5.2% YoY to $120M. Digital revenue share reached 34%, exceeding the 30% target. Mobile commerce growing fastest at +22% YoY. E-Commerce Platform contributing $45M in revenue. Recommend investing in personalization engine to boost digital conversion rates.',
    actions: ['Cost Savings Breakdown', 'Budget Utilization Status'],
  },
  compliance: {
    response: 'Compliance rate is at 97.8% across all frameworks including SOX, GDPR, and ISO 27001. Two minor findings are in remediation. Policy adherence at 96% with automated enforcement reducing violations by 30%. Recommend automating compliance monitoring and reporting for continuous assurance.',
    actions: ['Highlight Security Risks', 'Partner Performance Overview'],
  },
  project: {
    response: '42 active projects with 85% on track. Key initiatives: E-Commerce Platform ($45M revenue impact, On Track), Supply Chain AI ($8M savings, On Track), Customer Portal (+15 NPS, At Risk), RPA Deployment ($3.2M savings, Completed). Recommend prioritizing the 3 at-risk projects for executive review.',
    actions: ['Innovation Pipeline Summary', 'Budget Utilization Status'],
  },
  employee: {
    response: 'IT employee satisfaction is at 4.2/5, above the industry benchmark of 3.8. New collaboration tools are driving improvement. Deployment frequency increased 20% indicating strong DevOps culture. Recommend continuing investment in developer experience and automation tooling.',
    actions: ['System Uptime Report', 'Innovation Pipeline Summary'],
  },
  disaster: {
    response: 'Disaster Recovery RTO improved to 4 hours from 5 hours. Annual DR test completed successfully. Backup systems are fully operational across all regions. Recommend implementing automated failover for top 10 critical services and conducting quarterly DR exercises.',
    actions: ['System Uptime Report', 'Highlight Security Risks'],
  },
  recovery: {
    response: 'Disaster Recovery capabilities are strong. RTO at 4 hours, improved from 5 hours. RPO targets met across all critical systems. Annual DR test passed with no issues. Multi-region redundancy in place for core services.',
    actions: ['System Uptime Report', 'Highlight Security Risks'],
  },
};

/**
 * Default fallback response when no keyword match is found.
 * @type {{response: string, actions: string[]}}
 */
const DEFAULT_RESPONSE = {
  response: 'Thank you for your query. Based on current data, the IT organization is performing well across key metrics. System uptime is at 99.97%, budget utilization at 87%, and security score at 94/100. Would you like me to dive deeper into any specific area? Try asking about budget, security, innovation, operations, or partnerships.',
  actions: ['Budget Utilization Status', 'Highlight Security Risks', 'Innovation Pipeline Summary'],
};

/**
 * Default strategic AI insights for the AI Insights Panel.
 * @type {Array<{id: string, title: string, summary: string, priority: string, category: string, impact: string}>}
 */
const DEFAULT_STRATEGIC_INSIGHTS = [
  {
    id: 'insight_cloud_acceleration',
    title: 'Accelerate Cloud Migration',
    summary: 'Remaining on-premise workloads represent $2.5M in potential annual savings. Accelerating migration timeline by 2 months could capture additional cost avoidance before fiscal year end.',
    priority: 'High',
    category: 'operations',
    impact: '$2.5M annual savings',
  },
  {
    id: 'insight_ai_scaling',
    title: 'Scale Generative AI Assistant',
    summary: 'The Generative AI Assistant pilot shows 40% productivity improvement. Scaling to all business units could yield $5M in productivity gains across 2,000+ knowledge workers.',
    priority: 'High',
    category: 'innovation',
    impact: '$5M productivity gains',
  },
  {
    id: 'insight_zero_trust',
    title: 'Implement Zero-Trust Architecture',
    summary: 'Current security score is 94/100. Implementing zero-trust for all critical systems would address remaining gaps in third-party vendor assessments and reduce ransomware exposure risk by 60%.',
    priority: 'High',
    category: 'risk_governance',
    impact: '60% risk reduction',
  },
  {
    id: 'insight_rpa_expansion',
    title: 'Expand RPA to Finance & HR',
    summary: 'RPA deployment saved $3.2M across 45 processes. Expanding to finance and HR departments could automate 30+ additional processes with projected savings of $1.5M annually.',
    priority: 'Medium',
    category: 'business_impact',
    impact: '$1.5M annual savings',
  },
  {
    id: 'insight_partner_innovation',
    title: 'Joint Innovation with Top Partners',
    summary: 'Microsoft and AWS partnerships contribute 60% of joint revenue ($21M). Establishing joint innovation programs could unlock new revenue streams and accelerate time-to-market by 20%.',
    priority: 'Medium',
    category: 'partnerships',
    impact: '20% faster time-to-market',
  },
  {
    id: 'insight_aiops',
    title: 'Deploy AIOps for Predictive Incident Management',
    summary: 'MTTR improved to 2.3 hours but P1 incidents still occur. AIOps implementation could predict 70% of incidents before impact, reducing MTTR to under 1 hour.',
    priority: 'Medium',
    category: 'operations',
    impact: 'MTTR < 1 hour',
  },
  {
    id: 'insight_data_monetization',
    title: 'Establish Data Monetization Strategy',
    summary: 'Digital revenue share at 34% with growing partner ecosystem. A data monetization strategy for the partner ecosystem could generate $3-5M in new revenue streams within 12 months.',
    priority: 'Low',
    category: 'business_impact',
    impact: '$3-5M new revenue',
  },
  {
    id: 'insight_sre_practices',
    title: 'Establish SRE Practices for Critical Services',
    summary: 'With 99.97% uptime and 47 deployments/week, formalizing SRE practices for the top 10 critical services would ensure reliability scales with increasing deployment velocity.',
    priority: 'Low',
    category: 'operations',
    impact: 'Sustained 99.99% uptime',
  },
];

/**
 * Sanitizes user input by stripping HTML/script tags and trimming whitespace.
 * @param {string} input - The raw user input string.
 * @returns {string} The sanitized input string.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  const stripped = input.replace(/<[^>]*>/g, '').trim();
  if (stripped.length > 256) {
    return stripped.substring(0, 256);
  }
  return stripped;
}

/**
 * Returns predefined AI action chip objects from localStorage or defaults.
 * @returns {Promise<Array<{id: string, label: string, query: string, category: string}>>}
 *   Resolves with an array of action chip objects.
 */
export function getActionChips() {
  return new Promise((resolve) => {
    try {
      const stored = getItem(AI_ACTION_CHIPS_KEY, null);
      if (isArray(stored) && stored.length > 0) {
        resolve(stored);
        return;
      }
      setItem(AI_ACTION_CHIPS_KEY, DEFAULT_ACTION_CHIPS);
      resolve([...DEFAULT_ACTION_CHIPS]);
    } catch (e) {
      console.error('[AIEngine] Failed to get action chips:', e);
      resolve([...DEFAULT_ACTION_CHIPS]);
    }
  });
}

/**
 * Performs keyword matching against a rule map and returns a mock AI response.
 * @param {string} query - The user's query string.
 * @returns {Promise<{response: string, actions: string[]}>}
 *   Resolves with a response string and suggested action labels.
 */
export function getAIResponse(query) {
  return new Promise((resolve, reject) => {
    try {
      const sanitized = sanitizeInput(query);

      if (!sanitized) {
        reject({
          error: 'INVALID_INPUT',
          message: 'Query must be a non-empty string',
        });
        return;
      }

      const normalized = sanitized.toLowerCase();

      for (const keyword of Object.keys(RULE_MAP)) {
        if (normalized.includes(keyword)) {
          resolve({
            response: RULE_MAP[keyword].response,
            actions: [...RULE_MAP[keyword].actions],
          });
          return;
        }
      }

      resolve({
        response: DEFAULT_RESPONSE.response,
        actions: [...DEFAULT_RESPONSE.actions],
      });
    } catch (e) {
      console.error('[AIEngine] Failed to generate AI response:', e);
      reject({
        error: 'AI_RESPONSE_FAILED',
        message: e.message || 'Failed to generate AI response',
      });
    }
  });
}

/**
 * Returns strategic priority objects for the AI Insights Panel.
 * @returns {Promise<Array<{id: string, title: string, summary: string, priority: string, category: string, impact: string}>>}
 *   Resolves with an array of strategic insight objects.
 */
export function getAIInsights() {
  return new Promise((resolve) => {
    try {
      const stored = getItem(AI_INSIGHTS_KEY, null);

      if (isArray(stored) && stored.length > 0) {
        resolve(stored);
        return;
      }

      // AI_INSIGHTS_KEY may contain section-keyed insights from DashboardDataService.
      // For the strategic insights panel, we store and return the array of strategic insights.
      // We do not overwrite the section-keyed insights if they exist as an object.
      if (stored !== null && typeof stored === 'object' && !Array.isArray(stored)) {
        // Section-keyed insights exist; return default strategic insights without overwriting.
        resolve([...DEFAULT_STRATEGIC_INSIGHTS]);
        return;
      }

      resolve([...DEFAULT_STRATEGIC_INSIGHTS]);
    } catch (e) {
      console.error('[AIEngine] Failed to get AI insights:', e);
      resolve([...DEFAULT_STRATEGIC_INSIGHTS]);
    }
  });
}

/**
 * Retrieves chat history from localStorage.
 * @returns {Array<{role: string, content: string, timestamp: number}>}
 *   The array of chat message objects.
 */
export function getChatHistory() {
  try {
    const history = getItem(AI_CHAT_HISTORY_KEY, []);
    return isArray(history) ? history : [];
  } catch (e) {
    console.error('[AIEngine] Failed to get chat history:', e);
    return [];
  }
}

/**
 * Persists chat messages to localStorage, enforcing the max chat history limit.
 * @param {Array<{role: string, content: string, timestamp: number}>} history
 *   The chat history array to save.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function saveChatHistory(history) {
  try {
    if (!isArray(history)) {
      console.error('[AIEngine] saveChatHistory expects an array');
      return false;
    }

    const trimmed = history.length > DEFAULT_CONFIG.MAX_CHAT_HISTORY
      ? history.slice(history.length - DEFAULT_CONFIG.MAX_CHAT_HISTORY)
      : history;

    return setItem(AI_CHAT_HISTORY_KEY, trimmed);
  } catch (e) {
    console.error('[AIEngine] Failed to save chat history:', e);
    return false;
  }
}