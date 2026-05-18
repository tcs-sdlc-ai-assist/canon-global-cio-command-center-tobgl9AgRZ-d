import { getItem, setItem, removeItem } from '../utils/localStorageUtils';
import { SESSION_KEY } from '../utils/constants';
import { getUser } from './UserManager';

/**
 * Validates user credentials and creates a session in localStorage.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to verify.
 * @returns {{ success: boolean, error?: string, user?: Object }} Result of the login attempt.
 */
export function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { success: false, error: 'Username and password must be strings' };
  }

  const user = getUser(username);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Invalid credentials' };
  }

  const session = {
    username: user.username,
    timestamp: new Date().toISOString(),
  };

  const saved = setItem(SESSION_KEY, session);
  if (!saved) {
    return { success: false, error: 'Failed to create session. Storage may be full.' };
  }

  return {
    success: true,
    user: {
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
}

/**
 * Retrieves the current session from localStorage.
 * @returns {{ username: string, timestamp: string } | null} The session object, or null if no session exists.
 */
export function getSession() {
  const session = getItem(SESSION_KEY, null);

  if (
    session === null ||
    typeof session !== 'object' ||
    Array.isArray(session)
  ) {
    return null;
  }

  if (!session.username || typeof session.username !== 'string') {
    return null;
  }

  return session;
}

/**
 * Returns the username from the current session, or null if no session exists.
 * @returns {string | null} The current user's username, or null.
 */
export function getCurrentUser() {
  const session = getSession();

  if (!session) {
    return null;
  }

  return session.username;
}

/**
 * Clears the current session from localStorage.
 * @returns {void}
 */
export function logoutUser() {
  removeItem(SESSION_KEY);
}