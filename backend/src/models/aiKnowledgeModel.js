const db = require('../config/db');

const parseEmbeddingJson = (rawEmbedding) => {
  if (!rawEmbedding) return null;
  if (Array.isArray(rawEmbedding)) return rawEmbedding;
  if (typeof rawEmbedding === 'string') {
    try {
      const parsed = JSON.parse(rawEmbedding);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
};

const AiKnowledgeModel = {
  /**
   * Retrieve all indexed knowledge chunks for a specific course.
   * Joins with `lessons` so chunks belonging to deleted lessons are automatically excluded.
   */
  getChunksByCourseId: async (courseId) => {
    const [rows] = await db.query(
      `SELECT akc.id,
              akc.course_id,
              akc.lesson_id,
              akc.chunk_index,
              akc.content,
              akc.content_hash,
              akc.embedding,
              akc.source_title,
              akc.created_at,
              akc.updated_at,
              l.lesson_order
       FROM ai_knowledge_chunks akc
       INNER JOIN lessons l ON akc.lesson_id = l.id AND l.course_id = akc.course_id
       WHERE akc.course_id = ?
       ORDER BY l.lesson_order ASC, akc.chunk_index ASC`,
      [courseId]
    );

    return rows.map((row) => ({
      ...row,
      embedding: parseEmbeddingJson(row.embedding)
    }));
  },

  /**
   * Retrieve existing chunks for a specific lesson (used to skip unchanged chunks during re-indexing).
   */
  getChunksByLessonId: async (lessonId) => {
    const [rows] = await db.query(
      `SELECT id, course_id, lesson_id, chunk_index, content, content_hash, embedding, source_title
       FROM ai_knowledge_chunks
       WHERE lesson_id = ?
       ORDER BY chunk_index ASC`,
      [lessonId]
    );

    return rows.map((row) => ({
      ...row,
      embedding: parseEmbeddingJson(row.embedding)
    }));
  },

  /**
   * Insert or update a single lesson chunk safely using the unique (lesson_id, chunk_index) constraint.
   */
  upsertChunk: async ({ course_id, lesson_id, chunk_index, content, content_hash, embedding, source_title }) => {
    const embeddingJson = JSON.stringify(embedding);
    const [result] = await db.query(
      `INSERT INTO ai_knowledge_chunks
         (course_id, lesson_id, chunk_index, content, content_hash, embedding, source_title)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         course_id = VALUES(course_id),
         content = VALUES(content),
         content_hash = VALUES(content_hash),
         embedding = VALUES(embedding),
         source_title = VALUES(source_title),
         updated_at = CURRENT_TIMESTAMP`,
      [course_id, lesson_id, chunk_index, content, content_hash, embeddingJson, source_title]
    );
    return result;
  },

  /**
   * Remove outdated trailing chunks when a lesson's content was shortened.
   */
  deleteSurplusChunksForLesson: async (lessonId, validChunkCount) => {
    await db.query(
      'DELETE FROM ai_knowledge_chunks WHERE lesson_id = ? AND chunk_index >= ?',
      [lessonId, validChunkCount]
    );
  },

  /**
   * Remove chunks for lessons that no longer exist in the course.
   */
  deleteOrphanChunksForCourse: async (courseId, activeLessonIds = []) => {
    if (!Array.isArray(activeLessonIds) || activeLessonIds.length === 0) {
      await db.query('DELETE FROM ai_knowledge_chunks WHERE course_id = ?', [courseId]);
      return;
    }

    const placeholders = activeLessonIds.map(() => '?').join(', ');
    await db.query(
      `DELETE FROM ai_knowledge_chunks
       WHERE course_id = ? AND lesson_id NOT IN (${placeholders})`,
      [courseId, ...activeLessonIds]
    );
  },

  /**
   * Count total indexed chunks for a course.
   */
  countByCourseId: async (courseId) => {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM ai_knowledge_chunks WHERE course_id = ?',
      [courseId]
    );
    return rows[0]?.count || 0;
  }
};

module.exports = AiKnowledgeModel;

