import { describe, it, expect, beforeEach } from 'vitest';
import {
  getActionChips,
  getAIResponse,
  getAIInsights,
  getChatHistory,
  saveChatHistory,
} from './AIEngine';

describe('AIEngine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getActionChips', () => {
    it('returns an array of action chip objects', async () => {
      const chips = await getActionChips();

      expect(Array.isArray(chips)).toBe(true);
      expect(chips.length).toBeGreaterThan(0);
    });

    it('each chip has id, label, query, and category properties', async () => {
      const chips = await getActionChips();

      for (const chip of chips) {
        expect(chip).toHaveProperty('id');
        expect(chip).toHaveProperty('label');
        expect(chip).toHaveProperty('query');
        expect(chip).toHaveProperty('category');
        expect(typeof chip.id).toBe('string');
        expect(typeof chip.label).toBe('string');
        expect(typeof chip.query).toBe('string');
        expect(typeof chip.category).toBe('string');
      }
    });

    it('returns chips from localStorage if already stored', async () => {
      const customChips = [
        { id: 'custom_1', label: 'Custom Chip', query: 'Custom query', category: 'test' },
      ];
      localStorage.setItem('canon_cio_ai_action_chips', JSON.stringify(customChips));

      const chips = await getActionChips();

      expect(chips).toEqual(customChips);
    });

    it('stores default chips in localStorage on first call', async () => {
      const chips = await getActionChips();

      const stored = JSON.parse(localStorage.getItem('canon_cio_ai_action_chips'));
      expect(Array.isArray(stored)).toBe(true);
      expect(stored.length).toBe(chips.length);
    });

    it('returns defaults when localStorage contains invalid data', async () => {
      localStorage.setItem('canon_cio_ai_action_chips', JSON.stringify('not_an_array'));

      const chips = await getActionChips();

      expect(Array.isArray(chips)).toBe(true);
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  describe('getAIResponse', () => {
    it('returns a relevant response for the keyword "cloud"', async () => {
      const result = await getAIResponse('Tell me about cloud migration');

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('actions');
      expect(typeof result.response).toBe('string');
      expect(result.response.toLowerCase()).toContain('cloud');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "security"', async () => {
      const result = await getAIResponse('What about security posture?');

      expect(result.response.toLowerCase()).toContain('security');
      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('returns a relevant response for the keyword "budget"', async () => {
      const result = await getAIResponse('Show me the budget status');

      expect(result.response.toLowerCase()).toContain('budget');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "innovation"', async () => {
      const result = await getAIResponse('What is the innovation pipeline?');

      expect(result.response.toLowerCase()).toContain('innovation');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "partner"', async () => {
      const result = await getAIResponse('How are our partners doing?');

      expect(result.response.toLowerCase()).toContain('partner');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "uptime"', async () => {
      const result = await getAIResponse('What is the system uptime?');

      expect(result.response.toLowerCase()).toContain('uptime');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "risk"', async () => {
      const result = await getAIResponse('What is the overall risk score?');

      expect(result.response.toLowerCase()).toContain('risk');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "cost"', async () => {
      const result = await getAIResponse('Show me cost savings');

      expect(result.response.toLowerCase()).toContain('cost');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "ai"', async () => {
      const result = await getAIResponse('Tell me about AI initiatives');

      expect(result.response.toLowerCase()).toContain('ai');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a relevant response for the keyword "compliance"', async () => {
      const result = await getAIResponse('What is the compliance rate?');

      expect(result.response.toLowerCase()).toContain('compliance');
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('returns a fallback response for an unknown query', async () => {
      const result = await getAIResponse('xyzzy foobar gibberish');

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('actions');
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);
      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('rejects with error for empty string input', async () => {
      await expect(getAIResponse('')).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_INPUT',
        })
      );
    });

    it('rejects with error for null input', async () => {
      await expect(getAIResponse(null)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_INPUT',
        })
      );
    });

    it('rejects with error for undefined input', async () => {
      await expect(getAIResponse(undefined)).rejects.toEqual(
        expect.objectContaining({
          error: 'INVALID_INPUT',
        })
      );
    });

    it('sanitizes HTML tags from input before processing', async () => {
      const result = await getAIResponse('<script>alert("xss")</script> cloud migration');

      expect(result).toHaveProperty('response');
      expect(result.response.toLowerCase()).toContain('cloud');
    });

    it('truncates input longer than 256 characters', async () => {
      const longInput = 'cloud ' + 'a'.repeat(300);
      const result = await getAIResponse(longInput);

      expect(result).toHaveProperty('response');
      expect(typeof result.response).toBe('string');
    });

    it('handles case-insensitive keyword matching', async () => {
      const result = await getAIResponse('CLOUD MIGRATION STATUS');

      expect(result.response.toLowerCase()).toContain('cloud');
    });
  });

  describe('getAIInsights', () => {
    it('returns an array of strategic insight objects', async () => {
      const insights = await getAIInsights();

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('each insight has id, title, summary, priority, category, and impact', async () => {
      const insights = await getAIInsights();

      for (const insight of insights) {
        expect(insight).toHaveProperty('id');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('summary');
        expect(insight).toHaveProperty('priority');
        expect(insight).toHaveProperty('category');
        expect(insight).toHaveProperty('impact');
        expect(typeof insight.id).toBe('string');
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.summary).toBe('string');
        expect(typeof insight.priority).toBe('string');
        expect(typeof insight.category).toBe('string');
        expect(typeof insight.impact).toBe('string');
      }
    });

    it('returns insights with valid priority values', async () => {
      const insights = await getAIInsights();
      const validPriorities = ['High', 'Medium', 'Low'];

      for (const insight of insights) {
        expect(validPriorities).toContain(insight.priority);
      }
    });

    it('returns default insights when localStorage has section-keyed object', async () => {
      const sectionInsights = {
        executive_summary: { summary: 'test', metricInsights: {} },
      };
      localStorage.setItem('canon_cio_ai_insights', JSON.stringify(sectionInsights));

      const insights = await getAIInsights();

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('returns stored array insights from localStorage', async () => {
      const customInsights = [
        {
          id: 'custom_insight',
          title: 'Custom Insight',
          summary: 'Custom summary',
          priority: 'High',
          category: 'operations',
          impact: 'Custom impact',
        },
      ];
      localStorage.setItem('canon_cio_ai_insights', JSON.stringify(customInsights));

      const insights = await getAIInsights();

      expect(insights).toEqual(customInsights);
    });
  });

  describe('getChatHistory', () => {
    it('returns an empty array when no history exists', () => {
      const history = getChatHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('returns stored chat history from localStorage', () => {
      const messages = [
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
      ];
      localStorage.setItem('canon_cio_ai_chat_history', JSON.stringify(messages));

      const history = getChatHistory();

      expect(history).toEqual(messages);
    });

    it('returns empty array when localStorage contains invalid data', () => {
      localStorage.setItem('canon_cio_ai_chat_history', JSON.stringify('not_an_array'));

      const history = getChatHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });

  describe('saveChatHistory', () => {
    it('saves chat history to localStorage', () => {
      const messages = [
        { role: 'user', content: 'Test message', timestamp: Date.now() },
        { role: 'assistant', content: 'Test response', timestamp: Date.now() },
      ];

      const result = saveChatHistory(messages);

      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem('canon_cio_ai_chat_history'));
      expect(stored).toEqual(messages);
    });

    it('returns false when given non-array input', () => {
      const result = saveChatHistory('not_an_array');

      expect(result).toBe(false);
    });

    it('returns false when given null input', () => {
      const result = saveChatHistory(null);

      expect(result).toBe(false);
    });

    it('trims history to max limit when exceeded', () => {
      const messages = [];
      for (let i = 0; i < 60; i++) {
        messages.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: Date.now() + i,
        });
      }

      const result = saveChatHistory(messages);

      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem('canon_cio_ai_chat_history'));
      expect(stored.length).toBeLessThanOrEqual(50);
    });

    it('preserves most recent messages when trimming', () => {
      const messages = [];
      for (let i = 0; i < 60; i++) {
        messages.push({
          role: 'user',
          content: `Message ${i}`,
          timestamp: Date.now() + i,
        });
      }

      saveChatHistory(messages);

      const stored = JSON.parse(localStorage.getItem('canon_cio_ai_chat_history'));
      expect(stored[stored.length - 1].content).toBe('Message 59');
    });
  });

  describe('getChatHistory and saveChatHistory round-trip', () => {
    it('round-trips chat history correctly', () => {
      const messages = [
        { role: 'user', content: 'What is the budget?', timestamp: 1700000000000 },
        { role: 'assistant', content: 'Budget utilization is at 87%.', timestamp: 1700000001000 },
        { role: 'user', content: 'Tell me about security', timestamp: 1700000002000 },
        { role: 'assistant', content: 'Security score is 94/100.', timestamp: 1700000003000 },
      ];

      saveChatHistory(messages);
      const retrieved = getChatHistory();

      expect(retrieved).toEqual(messages);
      expect(retrieved.length).toBe(4);
      expect(retrieved[0].role).toBe('user');
      expect(retrieved[1].role).toBe('assistant');
      expect(retrieved[2].content).toBe('Tell me about security');
      expect(retrieved[3].content).toBe('Security score is 94/100.');
    });

    it('round-trips empty array correctly', () => {
      saveChatHistory([]);
      const retrieved = getChatHistory();

      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBe(0);
    });

    it('preserves message structure through round-trip', () => {
      const message = {
        role: 'user',
        content: 'Test with special chars: <>&"\'',
        timestamp: 1700000000000,
      };

      saveChatHistory([message]);
      const retrieved = getChatHistory();

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].role).toBe(message.role);
      expect(retrieved[0].content).toBe(message.content);
      expect(retrieved[0].timestamp).toBe(message.timestamp);
    });
  });
});