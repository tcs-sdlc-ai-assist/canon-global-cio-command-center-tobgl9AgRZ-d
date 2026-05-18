import { getItem, setItem, isArray } from '../utils/localStorageUtils';
import { USERS_KEY } from '../utils/constants';

/**
 * Validates a username string.
 * Must be 3–32 characters, alphanumeric or underscore only.
 * @param {string} username - The username to validate.
 * @returns {boolean} True if valid.
 */
function isValidUsername(username) {
  if (typeof username !== 'string') {
    return false;
  }
  if (username.length < 3 || username.length > 32) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Validates a password string.
 * Must be at least 6 characters.
 * @param {string} password - The password to validate.
 * @returns {boolean} True if valid.
 */
function isValidPassword(password) {
  if (typeof password !== 'string') {
    return false;
  }
  return password.length >= 6;
}

/**
 * Retrieves all users from localStorage.
 * @returns {Array<Object>} Array of user objects.
 */
function getUsersFromStorage() {
  const users = getItem(USERS_KEY, []);
  return isArray(users) ? users : [];
}

/**
 * Saves the users array to localStorage.
 * @param {Array<Object>} users - The users array to persist.
 * @returns {boolean} True if the operation succeeded.
 */
function saveUsersToStorage(users) {
  return setItem(USERS_KEY, users);
}

/**
 * Registers a new user with the given username and password.
 * Validates input, checks for duplicate usernames, and stores the user in localStorage.
 * @param {string} username - The desired username (3–32 chars, alphanumeric/underscore).
 * @param {string} password - The desired password (min 6 chars).
 * @returns {{ success: boolean, error?: string }} Result of the registration attempt.
 */
export function registerUser(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  if (!isValidUsername(username)) {
    return {
      success: false,
      error: 'Username must be 3–32 characters and contain only letters, numbers, or underscores',
    };
  }

  if (!isValidPassword(password)) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const users = getUsersFromStorage();

  const duplicate = users.find(
    (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  if (duplicate) {
    return { success: false, error: 'Username already exists' };
  }

  const newUser = {
    username,
    password,
    role: 'CIO',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const saved = saveUsersToStorage(users);
  if (!saved) {
    return { success: false, error: 'Failed to save user. Storage may be full.' };
  }

  return { success: true };
}

/**
 * Retrieves a user object by username.
 * @param {string} username - The username to look up.
 * @returns {Object|null} The user object if found, or null.
 */
export function getUser(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }

  const users = getUsersFromStorage();

  const user = users.find(
    (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
  );

  return user || null;
}