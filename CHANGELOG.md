# Changelog

All notable changes to the Canon CIO Command Center project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-15

### Added

#### Authentication & Session Management
- User registration with username and password validation (3–32 characters, alphanumeric/underscore, minimum 6-character password)
- Case-insensitive duplicate username detection during registration
- Login form with credential validation against localStorage-backed user store
- Persistent session management with auto-login on page reload via localStorage
- Protected route guard redirecting unauthenticated users to the login page
- Logout functionality with session cleanup and redirect

#### Executive Dashboard
- 7-tab dashboard layout with tab navigation and keyboard accessibility (arrow keys, Home, End, Enter/Space)
  - **Strategic Command** — cross-section KPI overview with 12-month strategic trends line chart and AI insights panel
  - **Executive Summary** — IT health metrics, regional radar chart, budget trend line chart, and regional performance table
  - **Business Impact** — revenue, cost avoidance, and digital revenue metrics with quarterly bar chart and trend line chart
  - **Operations** — system uptime, MTTR, deployment frequency metrics with uptime trend and incident breakdown charts
  - **Risk & Governance** — risk score, compliance rate, vulnerability metrics with risk trend and compliance doughnut charts
  - **Innovation** — pipeline, AI/ML initiatives, R&D investment metrics with portfolio doughnut and investment trend charts
  - **Partnerships** — partner KPIs, performance bar chart, spend trend, strategic intelligence section with expansion opportunities
- Reusable MetricCard component with value formatting, trend indicators, status dots, live pulse animation, and AI insight display
- Reusable ChartPanel component wrapping Chart.js (line, bar, doughnut, radar) with Export Data and Predictive Analysis action buttons
- Reusable PerformanceTable component with auto-derived columns, color-coded status badges, and row click tracking
- LiveIndicator component with pulsing green dot animation for real-time data simulation
- Fixed header with Canon branding, notification bell, user avatar with initials, role badge, and responsive mobile hamburger menu

#### AI Assistant
- Floating AI chat toggle button (bottom-right FAB) with unread message pulse indicator
- Slide-in AI chat panel with message history, user/assistant message styling, typing indicator, and auto-scroll
- Keyword-based AI response engine matching 20+ IT leadership topics (cloud, security, budget, innovation, operations, partnerships, compliance, disaster recovery, and more)
- AI action chips bar with category-based color coding and one-click chat query integration
- AI strategic insights panel with prioritized insight cards (High/Medium/Low), quick action buttons, and click-to-chat drill-down
- Chat history persistence in localStorage with configurable max history limit (50 messages)
- Input sanitization stripping HTML/script tags and enforcing 256-character max length

#### Engagement Analytics
- Event tracking service logging user interactions to localStorage (tab clicks, chart interactions, AI usage, action triggers, page views, login/logout, insight views)
- Analytics summary aggregation with event type breakdown and last active timestamp
- Configurable max event log entries (200) with automatic oldest-entry trimming
- Event log retrieval and clearing utilities

#### Data & Services
- Mock dashboard data service generating realistic metrics, charts, and tables for all 6 dashboard sections
- Section-keyed AI insights with per-metric insight strings and strategic recommendations
- localStorage utility layer with safe JSON parse/stringify, quota exceeded detection, schema validation, array append with max length, object merge, and storage size estimation
- Storage version checking with automatic data reset on version mismatch
- Mock data initialization seeding default users (admin/admin123, cio_user/canon2024), dashboard data, AI data, and sample event log on first load

#### UI & Design
- Responsive Tailwind CSS design with executive color palette (blue, green, red, amber) and custom shadow/border-radius tokens
- Mobile-first responsive grid layouts for metric cards and charts
- Custom scrollbar styling for WebKit and Firefox browsers
- Smooth scroll behavior and antialiased text rendering
- Accessible ARIA roles, labels, live regions, keyboard navigation, and focus management throughout all components

#### Testing
- Unit tests for UserManager (registration, retrieval, validation, case-insensitive lookup)
- Unit tests for SessionManager (login, session persistence, getCurrentUser, logout)
- Unit tests for AIEngine (action chips, keyword response matching, chat history round-trip, input sanitization)
- Unit tests for DashboardDataService (section data retrieval, event logging, AI insights, initialization, error recovery)
- Unit tests for EngagementAnalytics (event tracking, summary aggregation, event log CRUD, max entry enforcement)
- Integration tests for LoginForm (rendering, validation errors, invalid credentials, successful login redirect, error clearing)
- Integration tests for RegistrationForm (rendering, validation errors, duplicate detection, successful registration, form clearing, redirect)
- Vitest configuration with jsdom environment, React Testing Library, and localStorage mock setup

#### Infrastructure & Deployment
- Vite build configuration with React plugin, path aliases, source maps, and dev server on port 3000
- PostCSS configuration with Tailwind CSS and Autoprefixer plugins
- Vercel deployment configuration with SPA rewrite rules for client-side routing
- Environment variable support via `.env` with `VITE_APP_TITLE` configuration