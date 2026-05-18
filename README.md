# Canon CIO Command Center

An executive dashboard application for IT leadership insights and metrics, built with React, Vite, and Tailwind CSS.

## Overview

The Canon CIO Command Center provides a comprehensive, real-time executive dashboard for CIO-level IT leadership. It features a 7-tab dashboard layout with strategic metrics, interactive charts, AI-powered insights, and engagement analytics — all backed by a localStorage-based data layer for rapid prototyping and demonstration.

## Tech Stack

- **React 18** — Component-based UI framework
- **Vite 6** — Fast build tool and development server
- **Tailwind CSS 3** — Utility-first CSS framework with custom executive color palette
- **Chart.js 4 + react-chartjs-2** — Interactive data visualization (line, bar, doughnut, radar charts)
- **react-router-dom 6** — Client-side routing with protected routes
- **prop-types** — Runtime prop validation for React components
- **Vitest** — Unit and integration testing framework
- **React Testing Library** — Component testing utilities

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

Available environment variables:

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Canon CIO Command Center` | Application title displayed in the header and browser tab |

### Development

Start the development server on port 3000:

```bash
npm run dev
```

The application will open automatically at [http://localhost:3000](http://localhost:3000).

### Build

Create a production build:

```bash
npm run build
```

The output is written to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

### Test Coverage

The test suite includes:

- **Unit tests** for `UserManager`, `SessionManager`, `AIEngine`, `DashboardDataService`, and `EngagementAnalytics`
- **Integration tests** for `LoginForm` and `RegistrationForm` components
- Tests use **Vitest** with **jsdom** environment, **React Testing Library**, and a localStorage mock

## Folder Structure

```
canon-cio-command-center/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite build configuration
├── vitest.config.js                    # Vitest test configuration
├── tailwind.config.js                  # Tailwind CSS theme and plugins
├── postcss.config.js                   # PostCSS with Tailwind and Autoprefixer
├── vercel.json                         # Vercel deployment SPA rewrite rules
├── .env.example                        # Environment variable template
├── CHANGELOG.md                        # Version history
├── README.md                           # Project documentation (this file)
└── src/
    ├── main.jsx                        # React DOM entry point
    ├── App.jsx                         # Root component with routing
    ├── index.css                       # Tailwind directives and global styles
    ├── components/
    │   ├── ai/
    │   │   ├── AIActionChips.jsx       # AI action chip buttons bar
    │   │   ├── AIChatPanel.jsx         # Slide-in AI chat panel
    │   │   ├── AIChatToggle.jsx        # Floating AI chat toggle button
    │   │   └── AIInsightsPanel.jsx     # Strategic AI insights panel
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx      # Route guard for authenticated users
    │   ├── common/
    │   │   ├── ChartPanel.jsx          # Reusable Chart.js wrapper component
    │   │   ├── LiveIndicator.jsx       # Pulsing live data indicator
    │   │   ├── MetricCard.jsx          # KPI metric display card
    │   │   └── PerformanceTable.jsx    # Auto-column data table with status badges
    │   ├── layout/
    │   │   ├── Header.jsx              # Fixed header with branding and user controls
    │   │   └── TabNavigation.jsx       # Dashboard section tab bar
    │   └── tabs/
    │       ├── StrategicCommandTab.jsx  # Cross-section KPI overview tab
    │       ├── ExecutiveSummaryTab.jsx  # IT health and regional metrics tab
    │       ├── BusinessImpactTab.jsx    # Revenue and cost metrics tab
    │       ├── OperationsTab.jsx        # System uptime and incidents tab
    │       ├── RiskGovernanceTab.jsx     # Risk score and compliance tab
    │       ├── InnovationTab.jsx        # Innovation pipeline and R&D tab
    │       └── PartnershipsTab.jsx      # Partner KPIs and intelligence tab
    ├── context/
    │   ├── AIContext.jsx               # AI assistant state and actions provider
    │   └── SessionContext.jsx          # Authentication state and session provider
    ├── pages/
    │   ├── DashboardPage.jsx           # Main dashboard shell page
    │   ├── LoginForm.jsx               # Login page
    │   ├── LoginForm.test.jsx          # Login form integration tests
    │   ├── RegistrationForm.jsx        # Registration page
    │   └── RegistrationForm.test.jsx   # Registration form integration tests
    ├── services/
    │   ├── AIEngine.js                 # AI response engine and chat history
    │   ├── AIEngine.test.js            # AI engine unit tests
    │   ├── DashboardDataService.js     # Mock dashboard data and event logging
    │   ├── DashboardDataService.test.js# Dashboard data service unit tests
    │   ├── EngagementAnalytics.js      # User interaction tracking service
    │   ├── EngagementAnalytics.test.js # Engagement analytics unit tests
    │   ├── SessionManager.js           # Session creation and retrieval
    │   ├── SessionManager.test.js      # Session manager unit tests
    │   ├── UserManager.js              # User registration and lookup
    │   └── UserManager.test.js         # User manager unit tests
    ├── test/
    │   └── setup.js                    # Test setup with localStorage mock
    └── utils/
        ├── constants.js                # App-wide constants and configuration
        ├── localStorageUtils.js        # Safe localStorage read/write utilities
        └── mockDataInit.js             # First-load mock data seeding
```

## Features

### Authentication & Session Management

- User registration with username validation (3–32 characters, alphanumeric/underscore) and password validation (minimum 6 characters)
- Case-insensitive duplicate username detection
- Login with credential validation against localStorage-backed user store
- Persistent session management with auto-login on page reload
- Protected route guard redirecting unauthenticated users to the login page
- Logout with session cleanup and redirect

### Executive Dashboard

Seven dashboard tabs with full keyboard accessibility (arrow keys, Home, End, Enter/Space):

| Tab | Description |
|---|---|
| **Strategic Command** | Cross-section KPI overview with 12-month strategic trends and AI insights panel |
| **Executive Summary** | IT health metrics, regional radar chart, budget trend, and regional performance table |
| **Business Impact** | Revenue, cost avoidance, and digital revenue metrics with quarterly and trend charts |
| **Operations** | System uptime, MTTR, deployment frequency with uptime trend and incident breakdown |
| **Risk & Governance** | Risk score, compliance rate, vulnerability metrics with risk trend and compliance doughnut |
| **Innovation** | Pipeline, AI/ML initiatives, R&D investment with portfolio doughnut and investment trend |
| **Partnerships** | Partner KPIs, performance bar chart, spend trend, and strategic intelligence section |

### Reusable Components

- **MetricCard** — Value formatting, trend indicators, status dots, live pulse animation, AI insight display
- **ChartPanel** — Chart.js wrapper (line, bar, doughnut, radar) with Export Data and Predictive Analysis buttons
- **PerformanceTable** — Auto-derived columns, color-coded status badges, row click tracking
- **LiveIndicator** — Pulsing green dot animation for real-time data simulation

### AI Assistant

- Floating chat toggle button (bottom-right FAB) with unread message pulse indicator
- Slide-in chat panel with message history, typing indicator, and auto-scroll
- Keyword-based response engine matching 20+ IT leadership topics (cloud, security, budget, innovation, operations, partnerships, compliance, disaster recovery, and more)
- Action chips bar with category-based color coding and one-click chat query integration
- Strategic insights panel with prioritized insight cards (High/Medium/Low) and quick action buttons
- Chat history persistence in localStorage (max 50 messages)
- Input sanitization stripping HTML/script tags with 256-character max length

### Engagement Analytics

- Event tracking service logging user interactions to localStorage (tab clicks, chart interactions, AI usage, action triggers, page views, login/logout, insight views)
- Analytics summary aggregation with event type breakdown and last active timestamp
- Configurable max event log entries (200) with automatic oldest-entry trimming

### Data & Services

- Mock dashboard data service generating realistic metrics, charts, and tables for all 6 dashboard sections
- Section-keyed AI insights with per-metric insight strings and strategic recommendations
- localStorage utility layer with safe JSON parse/stringify, quota exceeded detection, schema validation, array append with max length, object merge, and storage size estimation
- Storage version checking with automatic data reset on version mismatch
- Mock data initialization seeding default users (`admin`/`admin123`, `cio_user`/`canon2024`), dashboard data, AI data, and sample event log on first load

### UI & Design

- Responsive Tailwind CSS design with executive color palette (blue, green, red, amber) and custom shadow/border-radius tokens
- Mobile-first responsive grid layouts for metric cards and charts
- Custom scrollbar styling for WebKit and Firefox browsers
- Smooth scroll behavior and antialiased text rendering
- Accessible ARIA roles, labels, live regions, keyboard navigation, and focus management throughout all components
- Fixed header with Canon branding, notification bell, user avatar with initials, role badge, and responsive mobile hamburger menu

## Default Credentials

The application seeds two default users on first load:

| Username | Password |
|---|---|
| `admin` | `admin123` |
| `cio_user` | `canon2024` |

## Deployment

### Vercel

The project includes a `vercel.json` configuration with SPA rewrite rules for client-side routing. Deploy directly from your Git repository:

1. Connect your repository to [Vercel](https://vercel.com)
2. Vercel auto-detects the Vite framework
3. Set any required environment variables in the Vercel dashboard
4. Deploy

### Manual Deployment

1. Run `npm run build` to generate the `dist/` directory
2. Serve the `dist/` directory with any static file server
3. Configure the server to redirect all routes to `index.html` for client-side routing

## License

This project is private and proprietary.