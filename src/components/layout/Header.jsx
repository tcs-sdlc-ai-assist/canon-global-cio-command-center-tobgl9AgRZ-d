import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSession } from '../../context/SessionContext';
import { trackEvent } from '../../services/EngagementAnalytics';
import { DEFAULT_CONFIG } from '../../utils/constants';

/**
 * Extracts initials from a username string.
 * Returns up to 2 uppercase characters.
 * @param {string} username - The username to extract initials from.
 * @returns {string} The initials string (1-2 characters).
 */
function getInitials(username) {
  if (!username || typeof username !== 'string') {
    return '?';
  }
  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return '?';
  }
  const parts = trimmed.split(/[_\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.substring(0, 2).toUpperCase();
}

/**
 * Header component displayed on all authenticated pages.
 * Shows Canon brand logo/text, current user role badge, user avatar (initials-based),
 * notification bell icon with count badge, and logout button.
 * Responsive: collapses to hamburger menu on mobile.
 * Uses SessionContext for user info and logout.
 * @returns {React.ReactElement}
 */
function Header() {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);

  /**
   * Handles user logout action.
   * Tracks the logout event, calls logout from SessionContext,
   * and navigates to the login page.
   * @returns {void}
   */
  const handleLogout = useCallback(() => {
    trackEvent('logout', { username: user?.username || 'unknown' });
    logout();
    navigate('/login', { replace: true });
  }, [user, logout, navigate]);

  /**
   * Toggles the mobile menu open/closed state.
   * @returns {void}
   */
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const initials = getInitials(user?.username);
  const displayRole = user?.role || 'User';
  const displayUsername = user?.username || 'User';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-executive-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 bg-executive-blue-600 rounded-executive text-white font-bold text-sm">
              C
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-executive-blue-900 tracking-tight leading-tight">
                {DEFAULT_CONFIG.APP_TITLE}
              </h1>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-base font-bold text-executive-blue-900 tracking-tight leading-tight">
                CIO Center
              </h1>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              type="button"
              aria-label={`Notifications, ${notificationCount} unread`}
              className="relative p-2 text-gray-500 hover:text-executive-blue-600 hover:bg-gray-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-executive-red-500 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 bg-executive-blue-100 text-executive-blue-700 rounded-full text-sm font-semibold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 leading-tight">
                  {displayUsername}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-executive-blue-50 text-executive-blue-700 leading-tight w-fit">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-executive-red-600 hover:bg-executive-red-50 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-red-500"
              aria-label="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Notification Bell */}
            <button
              type="button"
              aria-label={`Notifications, ${notificationCount} unread`}
              className="relative p-2 text-gray-500 hover:text-executive-blue-600 hover:bg-gray-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-executive-red-500 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 text-gray-500 hover:text-executive-blue-600 hover:bg-gray-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-blue-500"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-executive-md">
          <div className="px-4 py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 bg-executive-blue-100 text-executive-blue-700 rounded-full text-sm font-semibold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {displayUsername}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-executive-blue-50 text-executive-blue-700 w-fit">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-executive-red-600 bg-executive-red-50 hover:bg-executive-red-100 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-executive-red-500"
              aria-label="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;