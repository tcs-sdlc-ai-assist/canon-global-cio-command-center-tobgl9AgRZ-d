import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { AIProvider } from './context/AIContext';
import LoginForm from './pages/LoginForm';
import RegistrationForm from './pages/RegistrationForm';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initializeMockData } from './utils/mockDataInit';

/**
 * Root application component.
 * Wraps the app in SessionProvider and AIProvider contexts.
 * Configures react-router-dom with routes:
 * - / redirects to /login
 * - /login renders LoginForm
 * - /register renders RegistrationForm
 * - /dashboard renders DashboardPage wrapped in ProtectedRoute
 * Calls mockDataInit on mount to seed localStorage with default data.
 *
 * @returns {React.ReactElement}
 */
function App() {
  /**
   * Initialize mock data on first mount to seed localStorage
   * with default users, dashboard data, AI insights, and event log.
   */
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <BrowserRouter>
      <SessionProvider>
        <AIProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all: redirect unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AIProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;