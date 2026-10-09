const db = require('../config/db');

const AssignmentModel = {
  getAll: async (filter = {}) => {
    let query = `
      SELECT a.*, 
             c.title AS course_title,
             c.instructor AS course_instructor,
             c.instructor_id,
             COUNT(DISTINCT s.id) AS submissions_count
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE 1=1
    `;
    const params = [];

    if (filter.course_id) {
      query += ' AND a.course_id = ?';
      params.push(filter.course_id);
    }

    if (filter.instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(filter.instructor_id);
    }

    // If student, only show assignments of enrolled courses
    if (filter.enrolled_user_id) {
      query += ' AND a.course_id IN (SELECT course_id FROM enrollments WHERE user_id = ? AND status = "active")';
      params.push(filter.enrolled_user_id);
    }

    query += ' GROUP BY a.id ORDER BY a.due_date ASC, a.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT a.*, 
             c.title AS course_title,
             c.instructor AS course_instructor,
             c.instructor_id,
             COUNT(DISTINCT s.id) AS submissions_count
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { course_id, title, description, due_date } = data;
    const [result] = await db.query(
      'INSERT INTO assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)',
      [course_id, title, description, due_date || null]
    );
    return AssignmentModel.getById(result.insertId);
  },

  update: async (id, data) => {
    const { course_id, title, description, due_date } = data;
    const [result] = await db.query(
      'UPDATE assignments SET course_id = ?, title = ?, description = ?, due_date = ? WHERE id = ?',
      [course_id, title, description, due_date || null, id]
    );
    if (result.affectedRows === 0) return null;
    return AssignmentModel.getById(id);
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM assignments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = AssignmentModel;
