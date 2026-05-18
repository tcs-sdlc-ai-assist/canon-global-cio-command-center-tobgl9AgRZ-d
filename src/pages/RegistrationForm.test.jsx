import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../context/SessionContext';
import { registerUser } from '../services/UserManager';
import RegistrationForm from './RegistrationForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderRegistrationForm() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <SessionProvider>
        <RegistrationForm />
      </SessionProvider>
    </MemoryRouter>
  );
}

describe('RegistrationForm', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('rendering', () => {
    it('renders the registration form with username, password, and confirm password fields', () => {
      renderRegistrationForm();

      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the create account button', () => {
      renderRegistrationForm();

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders the application title', () => {
      renderRegistrationForm();

      expect(screen.getByText(/Canon CIO Command Center/i)).toBeInTheDocument();
    });

    it('renders the create your account heading', () => {
      renderRegistrationForm();

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
      renderRegistrationForm();

      const link = screen.getByRole('link', { name: /sign in/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/login');
    });

    it('renders username hint text', () => {
      renderRegistrationForm();

      expect(screen.getByText(/3–32 characters, letters, numbers, or underscores only/i)).toBeInTheDocument();
    });

    it('renders password hint text', () => {
      renderRegistrationForm();

      expect(screen.getByText(/minimum 6 characters/i)).toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('shows error when username is empty', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/username is required/i);
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'valid_user');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/password is required/i);
    });

    it('shows error when username is too short', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'ab');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 3 characters/i);
    });

    it('shows error when username is too long', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const longUsername = 'a'.repeat(33);
      await user.type(screen.getByLabelText(/^username$/i), longUsername);
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/no more than 32 characters/i);
    });

    it('shows error when username contains invalid characters', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'user@name!');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/letters, numbers, or underscores/i);
    });

    it('shows error when password is too short', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'valid_user');
      await user.type(screen.getByLabelText(/^password$/i), '12345');
      await user.type(screen.getByLabelText(/confirm password/i), '12345');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 6 characters/i);
    });

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'valid_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpass');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i);
    });
  });

  describe('duplicate username', () => {
    it('shows error when registering a duplicate username', async () => {
      registerUser('existing_user', 'password123');

      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'existing_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password456');
      await user.type(screen.getByLabelText(/confirm password/i), 'password456');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/username already exists/i);
    });

    it('shows error when registering a duplicate username with different casing', async () => {
      registerUser('TestUser', 'password123');

      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'testuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password456');
      await user.type(screen.getByLabelText(/confirm password/i), 'password456');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/username already exists/i);
    });
  });

  describe('successful registration', () => {
    it('shows success message on successful registration', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'new_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      const alerts = screen.getAllByRole('alert');
      const successAlert = alerts.find((alert) =>
        alert.textContent.match(/registration successful/i)
      );
      expect(successAlert).toBeInTheDocument();
    });

    it('stores the registered user in localStorage', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'stored_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      const users = JSON.parse(localStorage.getItem('canon_cio_users'));
      expect(users).not.toBeNull();
      const found = users.find((u) => u.username === 'stored_user');
      expect(found).toBeDefined();
      expect(found.username).toBe('stored_user');
      expect(found.role).toBe('CIO');
    });

    it('redirects to login page after successful registration', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'redirect_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      vi.advanceTimersByTime(1500);

      expect(mockNavigate).toHaveBeenCalledWith('/login');

      vi.useRealTimers();
    });

    it('clears form fields after successful registration', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      const usernameInput = screen.getByLabelText(/^username$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(usernameInput, 'clear_user');
      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(usernameInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
      expect(confirmInput).toHaveValue('');
    });
  });

  describe('error clearing', () => {
    it('clears error when username input changes', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(screen.getByLabelText(/^username$/i), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears error when password input changes', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'valid_user');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(screen.getByLabelText(/^password$/i), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears error when confirm password input changes', async () => {
      const user = userEvent.setup();
      renderRegistrationForm();

      await user.type(screen.getByLabelText(/^username$/i), 'valid_user');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpass');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.clear(screen.getByLabelText(/confirm password/i));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('has a link to the login page', () => {
      renderRegistrationForm();

      const link = screen.getByRole('link', { name: /sign in/i });
      expect(link).toHaveAttribute('href', '/login');
    });
  });
});