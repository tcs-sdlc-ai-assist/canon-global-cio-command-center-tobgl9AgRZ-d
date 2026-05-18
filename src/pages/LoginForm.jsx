import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { trackEvent } from '../services/EngagementAnalytics';
import { DEFAULT_CONFIG } from '../utils/constants';

/**
 * LoginForm page component.
 * Renders a login form with username and password fields,
 * validates credentials via SessionContext.login,
 * shows error on invalid credentials, redirects to /dashboard on success.
 * Includes a link to the registration page.
 * @returns {React.ReactElement}
 */
function LoginForm() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Validates form inputs before submission.
   * @returns {string} An error message string, or empty string if valid.
   */
  const validateInputs = useCallback(() => {
    if (!username.trim()) {
      return 'Username is required';
    }

    if (!password) {
      return 'Password is required';
    }

    return '';
  }, [username, password]);

  /**
   * Handles form submission. Validates inputs, calls login from SessionContext,
   * and redirects to /dashboard on success or displays error feedback.
   * @param {React.FormEvent} e - The form submit event.
   * @returns {void}
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = login(username.trim(), password);

      if (result.success) {
        trackEvent('login', { username: username.trim() });
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('[LoginForm] Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [username, password, validateInputs, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-executive-blue-900 tracking-tight">
            {DEFAULT_CONFIG.APP_TITLE}
          </h1>
          <h2 className="mt-2 text-lg text-gray-600">
            Sign in to your account
          </h2>
        </div>

        <div className="bg-white rounded-executive-lg shadow-executive-md p-8">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 rounded-executive bg-executive-red-50 border border-executive-red-300 text-executive-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                disabled={loading}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border border-gray-300 rounded-executive text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:border-executive-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                disabled={loading}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-executive text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:border-executive-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-executive shadow-executive-sm text-sm font-semibold text-white bg-executive-blue-600 hover:bg-executive-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-executive-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-executive-blue-600 hover:text-executive-blue-500 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;