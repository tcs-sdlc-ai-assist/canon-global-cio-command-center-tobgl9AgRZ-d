import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * AIChatToggle component.
 * Renders a floating action button fixed to the bottom-right corner of the screen.
 * Toggles the AI chat panel open/closed via AIContext.toggleChat.
 * Shows a chat bubble icon when the panel is closed and an X icon when open.
 * Includes a subtle pulse animation when there are unread AI responses.
 * Accessible with ARIA labels and keyboard support.
 *
 * @returns {React.ReactElement}
 */
function AIChatToggle() {
  const { isChatOpen, toggleChat, chatHistory } = useAI();
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);

  /**
   * Detects unread AI responses by comparing the current assistant message count
   * against the last seen count when the chat was open.
   */
  useEffect(() => {
    const assistantMessages = chatHistory.filter((m) => m.role === 'assistant');
    const currentCount = assistantMessages.length;

    if (isChatOpen) {
      setHasUnread(false);
      setLastSeenCount(currentCount);
    } else {
      if (currentCount > lastSeenCount) {
        setHasUnread(true);
      }
    }
  }, [chatHistory, isChatOpen, lastSeenCount]);

  /**
   * Handles the toggle button click.
   * Tracks the event and toggles the chat panel.
   * @returns {void}
   */
  const handleToggle = useCallback(() => {
    trackEvent('action_trigger', {
      action: isChatOpen ? 'close_ai_chat_toggle' : 'open_ai_chat_toggle',
    });
    toggleChat();
  }, [isChatOpen, toggleChat]);

  /**
   * Handles keyboard activation (Enter/Space) for accessibility.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @returns {void}
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={[
        'fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-executive-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-offset-2',
        isChatOpen
          ? 'bg-executive-red-500 hover:bg-executive-red-600 text-white'
          : 'bg-executive-blue-600 hover:bg-executive-blue-700 text-white',
      ].join(' ')}
      aria-label={isChatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      aria-expanded={isChatOpen}
    >
      {/* Pulse animation for unread messages */}
      {!isChatOpen && hasUnread && (
        <span className="absolute inset-0 rounded-full animate-ping bg-executive-blue-400 opacity-40" />
      )}

      {/* Unread indicator dot */}
      {!isChatOpen && hasUnread && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4">
          <span className="relative inline-flex rounded-full h-3 w-3 bg-executive-amber-500 border-2 border-white" />
        </span>
      )}

      {isChatOpen ? (
        /* X / Close icon */
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
        /* Chat bubble icon with AI sparkle */
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )}
    </button>
  );
}

export default AIChatToggle;