const db = require('../config/db');

const AiConversationModel = {
  /**
   * Create a new AI chat conversation for an authenticated user and course.
   */
  create: async ({ user_id, course_id, title }) => {
    const cleanTitle = (title && String(title).trim())
      ? String(title).trim().slice(0, 250)
      : 'Cuộc trò chuyện mới';
    const normalizedCourseId =
      course_id === null || course_id === undefined || course_id === '' || Number(course_id) === 0
        ? null
        : Number(course_id);

    const [result] = await db.query(
      'INSERT INTO ai_conversations (user_id, course_id, title) VALUES (?, ?, ?)',
      [user_id, normalizedCourseId, cleanTitle]
    );

    return AiConversationModel.getByIdAndUser(result.insertId, user_id);
  },

  /**
   * Retrieve all conversations belonging to a specific user (optionally filtered by course_id).
   */
  getByUser: async (userId, courseId = null) => {
    let query = `
      SELECT ac.id,
             ac.user_id,
             ac.course_id,
             ac.title,
             ac.created_at,
             ac.updated_at,
             c.title AS course_title,
             (SELECT COUNT(*) FROM ai_messages am WHERE am.conversation_id = ac.id) AS message_count
      FROM ai_conversations ac
      LEFT JOIN courses c ON ac.course_id = c.id
      WHERE ac.user_id = ?
    `;
    const params = [userId];

    if (courseId === 'advisor' || courseId === 0 || courseId === '0') {
      query += ' AND ac.course_id IS NULL';
    } else if (courseId !== null && courseId !== undefined && courseId !== '') {
      query += ' AND ac.course_id = ?';
      params.push(Number(courseId));
    }

    query += ' ORDER BY ac.updated_at DESC, ac.id DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  /**
   * Get a single conversation by ID strictly scoped to the authenticated user.
   */
  getByIdAndUser: async (conversationId, userId) => {
    const [rows] = await db.query(
      `SELECT ac.id,
              ac.user_id,
              ac.course_id,
              ac.title,
              ac.created_at,
              ac.updated_at,
              c.title AS course_title
       FROM ai_conversations ac
       LEFT JOIN courses c ON ac.course_id = c.id
       WHERE ac.id = ? AND ac.user_id = ?`,
      [conversationId, userId]
    );
    return rows[0] || null;
  },

  /**
   * Get a conversation by ID without user filter (to distinguish 404 vs 403 in authorization checks).
   */
  getById: async (conversationId) => {
    const [rows] = await db.query(
      'SELECT id, user_id, course_id, title, created_at, updated_at FROM ai_conversations WHERE id = ?',
      [conversationId]
    );
    return rows[0] || null;
  },

  /**
   * Update conversation title and updated_at timestamp.
   */
  updateTitle: async (conversationId, userId, title) => {
    const cleanTitle = String(title || 'Cuộc trò chuyện mới').trim().slice(0, 250);
    await db.query(
      'UPDATE ai_conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [cleanTitle, conversationId, userId]
    );
    return AiConversationModel.getByIdAndUser(conversationId, userId);
  },

  /**
   * Touch conversation updated_at timestamp when new messages are added.
   */
  touch: async (conversationId) => {
    await db.query(
      'UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );
  },

  /**
   * Safely delete a user's own conversation and its messages inside a transaction.
   */
  deleteByIdAndUser: async (conversationId, userId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [convRows] = await connection.query(
        'SELECT id FROM ai_conversations WHERE id = ? AND user_id = ? FOR UPDATE',
        [conversationId, userId]
      );

      if (convRows.length === 0) {
        await connection.rollback();
        return false;
      }

      await connection.query(
        'DELETE FROM ai_messages WHERE conversation_id = ?',
        [conversationId]
      );

      const [delResult] = await connection.query(
        'DELETE FROM ai_conversations WHERE id = ? AND user_id = ?',
        [conversationId, userId]
      );

      await connection.commit();
      return delResult.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = AiConversationModel;

