import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/UserManager';
import { DEFAULT_CONFIG } from '../utils/constants';

/**
 * RegistrationForm page component.
 * Renders a registration form with username and password fields,
 * input validation, duplicate username check, success/error feedback,
 * and a link to the login page.
 * @returns {React.ReactElement}
 */
function RegistrationForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Validates form inputs before submission.
   * @returns {string} An error message string, or empty string if valid.
   */
  const validateInputs = useCallback(() => {
    if (!username.trim()) {
      return 'Username is required';
    }

    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters';
    }

    if (username.trim().length > 32) {
      return 'Username must be no more than 32 characters';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return 'Username can only contain letters, numbers, or underscores';
    }

    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  }, [username, password, confirmPassword]);

  /**
   * Handles form submission. Validates inputs, calls registerUser,
   * and displays success or error feedback.
   * @param {React.FormEvent} e - The form submit event.
   * @returns {void}
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = registerUser(username.trim(), password);

      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setUsername('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('[RegistrationForm] Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [username, password, confirmPassword, validateInputs, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-executive-blue-900 tracking-tight">
            {DEFAULT_CONFIG.APP_TITLE}
          </h1>
          <h2 className="mt-2 text-lg text-gray-600">
            Create your account
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

          {success && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 rounded-executive bg-executive-green-50 border border-executive-green-300 text-executive-green-700 text-sm"
            >
              {success}
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
                  setSuccess('');
                }}
                disabled={loading}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border border-gray-300 rounded-executive text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:border-executive-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors sm:text-sm"
                aria-describedby="username-hint"
              />
              <p id="username-hint" className="mt-1 text-xs text-gray-500">
                3–32 characters, letters, numbers, or underscores only
              </p>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-executive text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:border-executive-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors sm:text-sm"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-500">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
                placeholder="Confirm your password"
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
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-executive-blue-600 hover:text-executive-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;