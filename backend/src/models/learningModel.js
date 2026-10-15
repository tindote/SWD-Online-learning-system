const db = require('../config/db');

const LearningModel = {
  // Get completed lessons by user and course
  getCompletedLessons: async (userId, courseId) => {
    const [rows] = await db.query(
      'SELECT lesson_id, completed, completed_at FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
      [userId, courseId]
    );
    return rows;
  },

  // Get completed lesson count for a specific user and course
  getCompletedCount: async (userId, courseId) => {
    const [rows] = await db.query(
      'SELECT COUNT(*) as completed_count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
      [userId, courseId]
    );
    return rows[0]?.completed_count || 0;
  },

  // Get specific lesson progress entry for a user
  getProgressByLesson: async (userId, lessonId) => {
    const [rows] = await db.query(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );
    return rows[0] || null;
  },

  // Upsert/Toggle lesson progress
  toggleProgress: async (userId, courseId, lessonId) => {
    const [existing] = await db.query(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    let newStatus = true;
    if (existing.length > 0) {
      newStatus = !existing[0].completed;
      await db.query(
        'UPDATE lesson_progress SET completed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed) VALUES (?, ?, ?, ?)',
        [userId, courseId, lessonId, true]
      );
    }
    return newStatus;
  }
};

module.exports = LearningModel;
