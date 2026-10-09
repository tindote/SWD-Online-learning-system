const db = require('../config/db');

const EnrollmentModel = {
  getAll: async (filter = {}) => {
    let query = `
      SELECT e.*, 
             u.name AS user_name, 
             u.email AS user_email, 
             c.title AS course_title,
             c.instructor AS course_instructor,
             c.instructor_id
      FROM enrollments e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filter.user_id) {
      query += ' AND e.user_id = ?';
      params.push(filter.user_id);
    }

    if (filter.course_id) {
      query += ' AND e.course_id = ?';
      params.push(filter.course_id);
    }

    if (filter.instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(filter.instructor_id);
    }

    if (filter.status) {
      query += ' AND e.status = ?';
      params.push(filter.status);
    }

    query += ' ORDER BY e.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT e.*, 
             u.name AS user_name, 
             u.email AS user_email, 
             c.title AS course_title,
             c.instructor AS course_instructor,
             c.instructor_id
      FROM enrollments e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.id = ?
    `, [id]);
    return rows[0] || null;
  },

  getByUserAndCourse: async (userId, courseId) => {
    const [rows] = await db.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    return rows[0] || null;
  },

  // Student specific: Detailed list of courses enrolled with progress calculation
  getMyEnrollments: async (userId) => {
    const [rows] = await db.query(`
      SELECT e.id AS enrollment_id,
             e.status AS enrollment_status,
             e.enrolled_at,
             c.id AS course_id,
             c.title,
             c.description,
             c.instructor,
             c.price,
             c.category,
             c.thumbnail,
             COUNT(DISTINCT l.id) AS total_lessons,
             COUNT(DISTINCT lp.lesson_id) AS completed_lessons,
             CASE 
               WHEN COUNT(DISTINCT l.id) = 0 THEN 0
               ELSE ROUND((COUNT(DISTINCT lp.lesson_id) / COUNT(DISTINCT l.id)) * 100)
             END AS progress_percentage
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = e.user_id AND lp.completed = 1
      WHERE e.user_id = ?
      GROUP BY e.id, c.id
      ORDER BY e.enrolled_at DESC
    `, [userId]);
    return rows;
  },

  create: async (data) => {
    const { user_id, course_id, status } = data;
    const enrollmentStatus = status || 'active';
    const [result] = await db.query(
      'INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, ?)',
      [user_id, course_id, enrollmentStatus]
    );
    return EnrollmentModel.getById(result.insertId);
  },

  update: async (id, data) => {
    const { user_id, course_id, status } = data;
    const [result] = await db.query(
      'UPDATE enrollments SET user_id = ?, course_id = ?, status = ? WHERE id = ?',
      [user_id, course_id, status, id]
    );
    if (result.affectedRows === 0) return null;
    return EnrollmentModel.getById(id);
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM enrollments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = EnrollmentModel;
