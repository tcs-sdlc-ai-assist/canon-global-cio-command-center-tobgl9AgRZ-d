import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { loginUser as sessionLogin, logoutUser as sessionLogout, getSession } from '../services/SessionManager';
import { getUser } from '../services/UserManager';

/**
 * @typedef {Object} SessionContextValue
 * @property {{ username: string, role: string, avatarUrl: string } | null} user - The current authenticated user object, or null.
 * @property {boolean} isAuthenticated - Whether a user is currently authenticated.
 * @property {function(string, string): { success: boolean, error?: string }} login - Authenticates a user with username and password.
 * @property {function(): void} logout - Logs out the current user and clears session state.
 * @property {boolean} loading - Whether the session is being restored from localStorage.
 */

const SessionContext = createContext(null);

/**
 * SessionProvider component that wraps the app and provides authentication state
 * and actions to all children via SessionContext.
 * Checks localStorage for an existing session on mount.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = getSession();
      if (session && session.username) {
        const storedUser = getUser(session.username);
        if (storedUser) {
          setUser({
            username: storedUser.username,
            role: storedUser.role,
            avatarUrl: storedUser.avatarUrl,
          });
        }
      }
    } catch (e) {
      console.error('[SessionContext] Failed to restore session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Authenticates a user with the given username and password.
   * @param {string} username - The username to authenticate.
   * @param {string} password - The password to verify.
   * @returns {{ success: boolean, error?: string }} Result of the login attempt.
   */
  const login = useCallback((username, password) => {
    try {
      const result = sessionLogin(username, password);
      if (result.success && result.user) {
        setUser({
          username: result.user.username,
          role: result.user.role,
          avatarUrl: result.user.avatarUrl,
        });
      }
      return result;
    } catch (e) {
      console.error('[SessionContext] Login failed:', e);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  }, []);

  /**
   * Logs out the current user and clears session state.
   * @returns {void}
   */
  const logout = useCallback(() => {
    try {
      sessionLogout();
    } catch (e) {
      console.error('[SessionContext] Logout failed:', e);
    }
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the session context.
 * Must be used within a SessionProvider.
 * @returns {SessionContextValue} The session context value.
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export default SessionContext;