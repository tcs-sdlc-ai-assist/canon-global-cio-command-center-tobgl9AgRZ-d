import { useState, useCallback, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { trackEvent } from '../../services/EngagementAnalytics';

/**
 * Formats a timestamp into a human-readable time string.
 * @param {number} timestamp - Unix timestamp in milliseconds.
 * @returns {string} Formatted time string (e.g., '2:30 PM').
 */
function formatTime(timestamp) {
  if (!timestamp || typeof timestamp !== 'number') {
    return '';
  }
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

/**
 * AIChatPanel component.
 * Renders a floating slide-in panel on the right side of the screen
 * with chat message history, text input field, send button, and close button.
 * Uses AIContext for state (isChatOpen, chatHistory, sendMessage, loading).
 * Displays user messages and AI responses with distinct styling.
 * Supports keyboard shortcuts (Escape to close, Enter to send).
 * Auto-scrolls to latest message.
 * Accessible with ARIA roles and labels.
 *
 * @returns {React.ReactElement}
 */
function AIChatPanel() {
  const { isChatOpen, toggleChat, chatHistory, sendMessage, loading } = useAI();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  /**
   * Auto-scrolls to the latest message when chat history changes.
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  /**
   * Focuses the input field when the panel opens.
   */
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isChatOpen]);

  /**
   * Handles global keyboard shortcuts for the panel.
   * Escape closes the panel.
   */
  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    /**
     * @param {KeyboardEvent} e
     */
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleChat();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen, toggleChat]);

  /**
   * Handles sending a message.
   * Validates input, sends the message via AIContext, and clears the input.
   * @returns {void}
   */
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || loading) {
      return;
    }

    trackEvent('ai_usage', { query: inputValue.trim() });
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, loading, sendMessage]);

  /**
   * Handles keydown events on the input field.
   * Enter sends the message (without Shift).
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @returns {void}
   */
  const handleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /**
   * Handles input value changes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   * @returns {void}
   */
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  /**
   * Handles the close button click.
   * Tracks the event and toggles the chat panel.
   * @returns {void}
   */
  const handleClose = useCallback(() => {
    trackEvent('action_trigger', { action: 'close_ai_chat' });
    toggleChat();
  }, [toggleChat]);

  if (!isChatOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="AI Assistant Chat"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white shadow-executive-xl flex flex-col h-full animate-slide-in-right"
        role="region"
        aria-label="AI Chat Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-executive-blue-600 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-executive-amber-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
            </svg>
            <h2 className="text-base font-semibold text-white">
              AI Assistant
            </h2>
            {/* Live indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-executive-green-500" />
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-white hover:bg-executive-blue-700 rounded-executive transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close AI Assistant"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-executive-amber-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
                <path d="M18 14l1.05 3.13L22.18 18l-3.13.87L18 22l-1.05-3.13L13.82 18l3.13-.87L18 14z" opacity="0.6" />
                <path d="M6 14l1.05 3.13L10.18 18l-3.13.87L6 22l-1.05-3.13L1.82 18l3.13-.87L6 14z" opacity="0.4" />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                How can I help you today?
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                Ask about budget, security, innovation, operations, partnerships, or any IT leadership topic.
              </p>
            </div>
          )}

          {chatHistory.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-executive-md px-3.5 py-2.5 shadow-executive-sm',
                    isUser
                      ? 'bg-executive-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200',
                  ].join(' ')}
                  role="article"
                  aria-label={isUser ? 'Your message' : 'AI response'}
                >
                  {!isUser && (
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-executive-amber-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-executive-blue-700">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-700'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1.5 ${isUser ? 'text-executive-blue-200' : 'text-gray-400'} text-right`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border border-gray-200 rounded-executive-md px-3.5 py-2.5 shadow-executive-sm">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-executive-amber-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-executive-blue-700">
                    AI Assistant
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-executive-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-executive-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-executive-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              placeholder="Ask about budget, security, innovation..."
              maxLength={256}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-executive text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:border-executive-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              aria-label="Type your message"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              className="inline-flex items-center justify-center w-10 h-10 bg-executive-blue-600 text-white rounded-executive hover:bg-executive-blue-700 focus:outline-none focus:ring-2 focus:ring-executive-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Press Enter to send · Escape to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIChatPanel;