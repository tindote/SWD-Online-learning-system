const db = require('../config/db');

const LessonModel = {
  getAll: async (filter = {}) => {
    let query = `
      SELECT l.*, c.title AS course_title, c.instructor_id
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filter.course_id) {
      query += ' AND l.course_id = ?';
      params.push(filter.course_id);
    }

    if (filter.instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(filter.instructor_id);
    }

    query += ' ORDER BY l.course_id ASC, l.lesson_order ASC, l.id ASC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT l.*, c.title AS course_title, c.instructor_id
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
    `, [id]);
    return rows[0] || null;
  },

  getByCourseId: async (courseId) => {
    const [rows] = await db.query(`
      SELECT l.*, c.title AS course_title
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.course_id = ?
      ORDER BY l.lesson_order ASC, l.id ASC
    `, [courseId]);
    return rows;
  },

  create: async (data) => {
    const { course_id, title, content, video_url, resource_url, lesson_order } = data;
    const order = lesson_order ? parseInt(lesson_order, 10) : 1;
    const [result] = await db.query(
      'INSERT INTO lessons (course_id, title, content, video_url, resource_url, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
      [course_id, title, content || null, video_url || null, resource_url || null, order]
    );
    return LessonModel.getById(result.insertId);
  },

  update: async (id, data) => {
    const { course_id, title, content, video_url, resource_url, lesson_order } = data;
    const order = lesson_order ? parseInt(lesson_order, 10) : 1;
    const [result] = await db.query(
      'UPDATE lessons SET course_id = ?, title = ?, content = ?, video_url = ?, resource_url = ?, lesson_order = ? WHERE id = ?',
      [course_id, title, content || null, video_url || null, resource_url || null, order, id]
    );
    if (result.affectedRows === 0) return null;
    return LessonModel.getById(id);
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM lessons WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = LessonModel;
