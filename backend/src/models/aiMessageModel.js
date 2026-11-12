const db = require('../config/db');

const parseSourcesJson = (rawSources) => {
  if (!rawSources) return [];
  if (Array.isArray(rawSources)) return rawSources;
  if (typeof rawSources === 'string') {
    try {
      const parsed = JSON.parse(rawSources);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const AiMessageModel = {
  /**
   * Save a new message (USER or AI) in a conversation.
   */
  create: async ({ conversation_id, sender, content, sources = null }) => {
    const normalizedSender = String(sender).toUpperCase() === 'AI' ? 'AI' : 'USER';
    const sourcesJson = Array.isArray(sources) && sources.length > 0
      ? JSON.stringify(sources)
      : null;

    const [result] = await db.query(
      'INSERT INTO ai_messages (conversation_id, sender, content, sources) VALUES (?, ?, ?, ?)',
      [conversation_id, normalizedSender, content, sourcesJson]
    );

    const [rows] = await db.query(
      'SELECT id, conversation_id, sender, content, sources, created_at FROM ai_messages WHERE id = ?',
      [result.insertId]
    );

    if (!rows[0]) return null;
    return {
      ...rows[0],
      sources: parseSourcesJson(rows[0].sources)
    };
  },

  /**
   * Retrieve all messages in a conversation ordered chronologically.
   */
  getByConversationId: async (conversationId) => {
    const [rows] = await db.query(
      `SELECT id, conversation_id, sender, content, sources, created_at
       FROM ai_messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC, id ASC`,
      [conversationId]
    );

    return rows.map((row) => ({
      ...row,
      sources: parseSourcesJson(row.sources)
    }));
  },

  /**
   * Retrieve the most recent N messages in a conversation for prompt context.
   */
  getRecentByConversationId: async (conversationId, limit = 8) => {
    const safeLimit = Math.max(1, Math.min(20, parseInt(limit, 10) || 8));
    const [rows] = await db.query(
      `SELECT id, conversation_id, sender, content, created_at
       FROM ai_messages
       WHERE conversation_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [conversationId, safeLimit]
    );

    return rows.reverse();
  }
};

module.exports = AiMessageModel;

