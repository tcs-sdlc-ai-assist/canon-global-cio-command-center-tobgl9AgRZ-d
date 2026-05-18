import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../context/SessionContext';
import { registerUser } from '../services/UserManager';
import LoginForm from './LoginForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <SessionProvider>
        <LoginForm />
      </SessionProvider>
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('rendering', () => {
    it('renders the login form with username and password fields', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the sign in button', () => {
      renderLoginForm();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the application title', () => {
      renderLoginForm();

      expect(screen.getByText(/Canon CIO Command Center/i)).toBeInTheDocument();
    });

    it('renders the sign in heading', () => {
      renderLoginForm();

      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });

    it('renders a link to the registration page', () => {
      renderLoginForm();

      const link = screen.getByRole('link', { name: /create one/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/register');
    });
  });

  describe('validation errors', () => {
    it('shows error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/username is required/i);
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/password is required/i);
    });
  });

  describe('invalid credentials', () => {
    it('shows error on invalid credentials when user does not exist', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'nonexistent_user');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });

    it('shows error on invalid credentials when password is wrong', async () => {
      registerUser('test_login_user', 'correctpass');

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'test_login_user');
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });
  });

  describe('successful login', () => {
    it('redirects to dashboard on successful login', async () => {
      registerUser('dashboard_user', 'password123');

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'dashboard_user');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('stores session in localStorage after successful login', async () => {
      registerUser('session_test_user', 'password123');

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'session_test_user');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      const session = JSON.parse(localStorage.getItem('canon_cio_session'));
      expect(session).not.toBeNull();
      expect(session.username).toBe('session_test_user');
    });
  });

  describe('error clearing', () => {
    it('clears error when username input changes', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(screen.getByLabelText(/username/i), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears error when password input changes', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(screen.getByLabelText(/username/i), 'someuser');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(screen.getByLabelText(/password/i), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('has a link to the registration page', () => {
      renderLoginForm();

      const link = screen.getByRole('link', { name: /create one/i });
      expect(link).toHaveAttribute('href', '/register');
    });
  });
});