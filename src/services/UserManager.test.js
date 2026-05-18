import { describe, it, expect, beforeEach } from 'vitest';
import { registerUser, getUser } from './UserManager';

describe('UserManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('registerUser', () => {
    it('registers a new user with valid data successfully', () => {
      const result = registerUser('test_user', 'password123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('stores the registered user so it can be retrieved', () => {
      registerUser('test_user', 'password123');

      const user = getUser('test_user');
      expect(user).not.toBeNull();
      expect(user.username).toBe('test_user');
      expect(user.password).toBe('password123');
      expect(user.role).toBe('CIO');
      expect(user.avatarUrl).toBe('');
      expect(user.createdAt).toBeDefined();
    });

    it('returns error when registering a duplicate username', () => {
      registerUser('duplicate_user', 'password123');
      const result = registerUser('duplicate_user', 'otherpass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists');
    });

    it('returns error when registering a duplicate username with different casing', () => {
      registerUser('TestUser', 'password123');
      const result = registerUser('testuser', 'otherpass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists');
    });

    it('returns error when username is empty', () => {
      const result = registerUser('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is empty', () => {
      const result = registerUser('valid_user', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is too short', () => {
      const result = registerUser('ab', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('3–32 characters');
    });

    it('returns error when username is too long', () => {
      const longUsername = 'a'.repeat(33);
      const result = registerUser(longUsername, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('3–32 characters');
    });

    it('returns error when username contains invalid characters', () => {
      const result = registerUser('user@name!', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('letters, numbers, or underscores');
    });

    it('returns error when password is too short', () => {
      const result = registerUser('valid_user', '12345');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('returns error when username is null', () => {
      const result = registerUser(null, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is null', () => {
      const result = registerUser('valid_user', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('allows registering multiple unique users', () => {
      const result1 = registerUser('user_one', 'password123');
      const result2 = registerUser('user_two', 'password456');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      expect(getUser('user_one')).not.toBeNull();
      expect(getUser('user_two')).not.toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns the correct user object for an existing user', () => {
      registerUser('existing_user', 'password123');

      const user = getUser('existing_user');

      expect(user).not.toBeNull();
      expect(user.username).toBe('existing_user');
      expect(user.password).toBe('password123');
      expect(user.role).toBe('CIO');
    });

    it('returns null for a non-existent user', () => {
      const user = getUser('nonexistent_user');

      expect(user).toBeNull();
    });

    it('returns null when username is null', () => {
      const user = getUser(null);

      expect(user).toBeNull();
    });

    it('returns null when username is undefined', () => {
      const user = getUser(undefined);

      expect(user).toBeNull();
    });

    it('returns null when username is an empty string', () => {
      const user = getUser('');

      expect(user).toBeNull();
    });

    it('performs case-insensitive lookup', () => {
      registerUser('CaseSensitive', 'password123');

      const user = getUser('casesensitive');

      expect(user).not.toBeNull();
      expect(user.username).toBe('CaseSensitive');
    });
  });
});