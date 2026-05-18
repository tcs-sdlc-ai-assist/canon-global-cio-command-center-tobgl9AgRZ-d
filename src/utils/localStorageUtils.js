import {
  USERS_KEY,
  SESSION_KEY,
  DASHBOARD_DATA_KEY,
  AI_CHAT_HISTORY_KEY,
  AI_INSIGHTS_KEY,
  AI_ACTION_CHIPS_KEY,
  EVENT_LOG_KEY,
  DEFAULT_CONFIG,
} from './constants';

const STORAGE_VERSION_KEY = 'canon_cio_storage_version';
const CURRENT_STORAGE_VERSION = '1.0.0';

/**
 * Safely retrieves and parses a JSON value from localStorage.
 * @param {string} key - The localStorage key to retrieve.
 * @param {*} [defaultValue=null] - The default value to return if the key does not exist or parsing fails.
 * @returns {*} The parsed value, or defaultValue on failure.
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[localStorageUtils] Failed to read key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Serializes a value to JSON and stores it in localStorage.
 * @param {string} key - The localStorage key to set.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error(`[localStorageUtils] Storage quota exceeded when writing key "${key}".`);
    } else {
      console.error(`[localStorageUtils] Failed to write key "${key}":`, error);
    }
    return false;
  }
}

/**
 * Removes a key from localStorage.
 * @param {string} key - The localStorage key to remove.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[localStorageUtils] Failed to remove key "${key}":`, error);
    return false;
  }
}

/**
 * Checks whether a given error is a QuotaExceededError.
 * @param {Error} error - The error to check.
 * @returns {boolean} True if the error indicates storage quota exceeded.
 */
export function isQuotaExceededError(error) {
  if (error instanceof DOMException) {
    return (
      error.code === 22 ||
      error.code === 1014 ||
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
  }
  return false;
}

/**
 * Validates that a value is a non-null object (not an array).
 * @param {*} value - The value to validate.
 * @returns {boolean} True if the value is a plain object.
 */
export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validates that a value is an array.
 * @param {*} value - The value to validate.
 * @returns {boolean} True if the value is an array.
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Validates that an object has all required keys.
 * @param {Object} obj - The object to validate.
 * @param {string[]} requiredKeys - The keys that must be present.
 * @returns {boolean} True if all required keys are present.
 */
export function hasRequiredKeys(obj, requiredKeys) {
  if (!isPlainObject(obj)) {
    return false;
  }
  return requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(obj, key));
}

/**
 * Validates a schema for a stored value. Returns the value if valid, or defaultValue if not.
 * @param {string} key - The localStorage key.
 * @param {function} validator - A function that returns true if the value is valid.
 * @param {*} [defaultValue=null] - The default value to return if validation fails.
 * @returns {*} The validated value or defaultValue.
 */
export function getValidatedItem(key, validator, defaultValue = null) {
  const value = getItem(key, defaultValue);
  if (value === defaultValue) {
    return defaultValue;
  }
  try {
    if (validator(value)) {
      return value;
    }
    console.warn(`[localStorageUtils] Validation failed for key "${key}". Returning default.`);
    return defaultValue;
  } catch (error) {
    console.error(`[localStorageUtils] Validator threw for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Appends an item to an array stored in localStorage, enforcing a max length.
 * Oldest items are removed when the max is exceeded.
 * @param {string} key - The localStorage key containing the array.
 * @param {*} item - The item to append.
 * @param {number} [maxLength=DEFAULT_CONFIG.MAX_CHAT_HISTORY] - Maximum array length.
 * @returns {boolean} True if the operation succeeded.
 */
export function appendToArray(key, item, maxLength = DEFAULT_CONFIG.MAX_CHAT_HISTORY) {
  try {
    const existing = getItem(key, []);
    const arr = isArray(existing) ? existing : [];
    arr.push(item);
    while (arr.length > maxLength) {
      arr.shift();
    }
    return setItem(key, arr);
  } catch (error) {
    console.error(`[localStorageUtils] Failed to append to array key "${key}":`, error);
    return false;
  }
}

/**
 * Merges an object into an existing object stored in localStorage.
 * @param {string} key - The localStorage key containing the object.
 * @param {Object} updates - The properties to merge.
 * @returns {boolean} True if the operation succeeded.
 */
export function mergeObject(key, updates) {
  try {
    const existing = getItem(key, {});
    const obj = isPlainObject(existing) ? existing : {};
    const merged = { ...obj, ...updates };
    return setItem(key, merged);
  } catch (error) {
    console.error(`[localStorageUtils] Failed to merge object key "${key}":`, error);
    return false;
  }
}

/**
 * Checks the stored version and clears data if it does not match the current version.
 * @returns {void}
 */
export function checkStorageVersion() {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (storedVersion !== CURRENT_STORAGE_VERSION) {
      clearAllAppData();
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    }
  } catch (error) {
    console.error('[localStorageUtils] Failed to check storage version:', error);
  }
}

/**
 * Clears all application-specific data from localStorage.
 * Does not remove the storage version key.
 * @returns {void}
 */
export function clearAllAppData() {
  const appKeys = [
    USERS_KEY,
    SESSION_KEY,
    DASHBOARD_DATA_KEY,
    AI_CHAT_HISTORY_KEY,
    AI_INSIGHTS_KEY,
    AI_ACTION_CHIPS_KEY,
    EVENT_LOG_KEY,
  ];
  appKeys.forEach((key) => {
    removeItem(key);
  });
}

/**
 * Returns an estimate of the total size (in bytes) of all application keys in localStorage.
 * @returns {number} Approximate size in bytes.
 */
export function getStorageSize() {
  try {
    let total = 0;
    const appKeys = [
      USERS_KEY,
      SESSION_KEY,
      DASHBOARD_DATA_KEY,
      AI_CHAT_HISTORY_KEY,
      AI_INSIGHTS_KEY,
      AI_ACTION_CHIPS_KEY,
      EVENT_LOG_KEY,
    ];
    appKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        total += key.length + value.length;
      }
    });
    return total * 2; // approximate bytes (UTF-16)
  } catch (error) {
    console.error('[localStorageUtils] Failed to calculate storage size:', error);
    return 0;
  }
}