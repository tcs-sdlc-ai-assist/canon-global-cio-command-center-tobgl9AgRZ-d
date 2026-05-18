import { describe, it, expect, beforeEach } from 'vitest';
import { loginUser, getSession, getCurrentUser, logoutUser } from './SessionManager';
import { registerUser } from './UserManager';

describe('SessionManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loginUser', () => {
    it('creates a session with valid credentials', () => {
      registerUser('test_user', 'password123');

      const result = loginUser('test_user', 'password123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('test_user');
      expect(result.user.role).toBe('CIO');
    });

    it('returns error with invalid password', () => {
      registerUser('test_user', 'password123');

      const result = loginUser('test_user', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeUndefined();
    });

    it('returns error with non-existent username', () => {
      const result = loginUser('nonexistent', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeUndefined();
    });

    it('returns error when username is empty', () => {
      const result = loginUser('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is empty', () => {
      registerUser('test_user', 'password123');

      const result = loginUser('test_user', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is null', () => {
      const result = loginUser(null, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is null', () => {
      const result = loginUser('test_user', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('stores session in localStorage after successful login', () => {
      registerUser('test_user', 'password123');

      loginUser('test_user', 'password123');

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('test_user');
      expect(session.timestamp).toBeDefined();
    });

    it('returns user object with correct role and avatarUrl', () => {
      registerUser('cio_admin', 'securepass');

      const result = loginUser('cio_admin', 'securepass');

      expect(result.success).toBe(true);
      expect(result.user.username).toBe('cio_admin');
      expect(result.user.role).toBe('CIO');
      expect(result.user.avatarUrl).toBe('');
    });
  });

  describe('getSession', () => {
    it('returns session object when user is logged in', () => {
      registerUser('session_user', 'password123');
      loginUser('session_user', 'password123');

      const session = getSession();

      expect(session).not.toBeNull();
      expect(session.username).toBe('session_user');
      expect(session.timestamp).toBeDefined();
    });

    it('returns null when no user is logged in', () => {
      const session = getSession();

      expect(session).toBeNull();
    });

    it('returns null after localStorage is cleared', () => {
      registerUser('session_user', 'password123');
      loginUser('session_user', 'password123');

      localStorage.clear();

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session data is invalid', () => {
      localStorage.setItem('canon_cio_session', JSON.stringify('invalid'));

      const session = getSession();

      expect(session).toBeNull();
    });

    it('returns null when session has no username', () => {
      localStorage.setItem('canon_cio_session', JSON.stringify({ timestamp: new Date().toISOString() }));

      const session = getSession();

      expect(session).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns username from active session', () => {
      registerUser('current_user', 'password123');
      loginUser('current_user', 'password123');

      const username = getCurrentUser();

      expect(username).toBe('current_user');
    });

    it('returns null when no session exists', () => {
      const username = getCurrentUser();

      expect(username).toBeNull();
    });

    it('returns null after logout', () => {
      registerUser('current_user', 'password123');
      loginUser('current_user', 'password123');
      logoutUser();

      const username = getCurrentUser();

      expect(username).toBeNull();
    });
  });

  describe('logoutUser', () => {
    it('clears the session from localStorage', () => {
      registerUser('logout_user', 'password123');
      loginUser('logout_user', 'password123');

      expect(getSession()).not.toBeNull();

      logoutUser();

      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logoutUser()).not.toThrow();
    });

    it('can log in again after logout', () => {
      registerUser('relogin_user', 'password123');
      loginUser('relogin_user', 'password123');
      logoutUser();

      const result = loginUser('relogin_user', 'password123');

      expect(result.success).toBe(true);
      expect(getSession()).not.toBeNull();
      expect(getSession().username).toBe('relogin_user');
    });
  });
});