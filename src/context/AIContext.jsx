import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  getAIResponse,
  getActionChips,
  getAIInsights,
  getChatHistory,
  saveChatHistory,
} from '../services/AIEngine';
import { trackEvent } from '../services/EngagementAnalytics';

/**
 * @typedef {Object} ChatMessage
 * @property {string} role - 'user' or 'assistant'
 * @property {string} content - The message content
 * @property {number} timestamp - Unix timestamp in milliseconds
 */

/**
 * @typedef {Object} AIContextValue
 * @property {boolean} isChatOpen - Whether the AI chat panel is currently visible.
 * @property {function(): void} toggleChat - Toggles the chat panel open/closed.
 * @property {function(string): void} openChatWithQuery - Opens the chat panel and sends a query.
 * @property {ChatMessage[]} chatHistory - The array of chat messages.
 * @property {function(string): Promise<void>} sendMessage - Sends a user message and gets an AI response.
 * @property {Array<{id: string, label: string, query: string, category: string}>} actionChips - Available AI action chips.
 * @property {Array<{id: string, title: string, summary: string, priority: string, category: string, impact: string}>} insights - Strategic AI insights.
 * @property {boolean} loading - Whether a message is currently being processed.
 */

const AIContext = createContext(null);

/**
 * AIProvider component that wraps the app and provides AI assistant state
 * and actions to all children via AIContext.
 * Manages chat panel visibility, chat history, action chips, and insights.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function AIProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [actionChips, setActionChips] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = getChatHistory();
      if (Array.isArray(storedHistory) && storedHistory.length > 0) {
        setChatHistory(storedHistory);
      }
    } catch (e) {
      console.error('[AIContext] Failed to restore chat history:', e);
    }
  }, []);

  useEffect(() => {
    getActionChips()
      .then((chips) => {
        if (Array.isArray(chips)) {
          setActionChips(chips);
        }
      })
      .catch((e) => {
        console.error('[AIContext] Failed to load action chips:', e);
      });
  }, []);

  useEffect(() => {
    getAIInsights()
      .then((data) => {
        if (Array.isArray(data)) {
          setInsights(data);
        }
      })
      .catch((e) => {
        console.error('[AIContext] Failed to load AI insights:', e);
      });
  }, []);

  /**
   * Toggles the AI chat panel open or closed.
   * @returns {void}
   */
  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  /**
   * Sends a user message to the AI engine and appends both the user message
   * and the AI response to the chat history.
   * @param {string} query - The user's message text.
   * @returns {Promise<void>}
   */
  const sendMessage = useCallback(async (query) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return;
    }

    const trimmedQuery = query.trim();

    const userMessage = {
      role: 'user',
      content: trimmedQuery,
      timestamp: Date.now(),
    };

    setChatHistory((prev) => {
      const updated = [...prev, userMessage];
      saveChatHistory(updated);
      return updated;
    });

    setLoading(true);

    try {
      trackEvent('ai_usage', { query: trimmedQuery });

      const result = await getAIResponse(trimmedQuery);

      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
      };

      setChatHistory((prev) => {
        const updated = [...prev, assistantMessage];
        saveChatHistory(updated);
        return updated;
      });
    } catch (e) {
      console.error('[AIContext] Failed to get AI response:', e);

      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I was unable to process your request. Please try again.',
        timestamp: Date.now(),
      };

      setChatHistory((prev) => {
        const updated = [...prev, errorMessage];
        saveChatHistory(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Opens the chat panel and immediately sends a query.
   * @param {string} query - The query to send after opening the chat.
   * @returns {void}
   */
  const openChatWithQuery = useCallback((query) => {
    setIsChatOpen(true);
    if (query && typeof query === 'string' && query.trim()) {
      sendMessage(query);
    }
  }, [sendMessage]);

  const value = {
    isChatOpen,
    toggleChat,
    openChatWithQuery,
    chatHistory,
    sendMessage,
    actionChips,
    insights,
    loading,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

AIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the AI context.
 * Must be used within an AIProvider.
 * @returns {AIContextValue} The AI context value.
 */
export function useAI() {
  const context = useContext(AIContext);
  if (context === null) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

export default AIContext;