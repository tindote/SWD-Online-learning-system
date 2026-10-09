const db = require('../config/db');

const SubmissionModel = {
  getAll: async (filter = {}) => {
    let query = `
      SELECT s.*, 
             a.title AS assignment_title, 
             a.due_date,
             c.id AS course_id,
             c.title AS course_title,
             c.instructor_id,
             u.name AS user_name, 
             u.email AS user_email
      FROM submissions s
      LEFT JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filter.user_id) {
      query += ' AND s.user_id = ?';
      params.push(filter.user_id);
    }

    if (filter.assignment_id) {
      query += ' AND s.assignment_id = ?';
      params.push(filter.assignment_id);
    }

    if (filter.instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(filter.instructor_id);
    }

    query += ' ORDER BY s.submitted_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT s.*, 
             a.title AS assignment_title, 
             a.due_date,
             c.id AS course_id,
             c.title AS course_title,
             c.instructor_id,
             u.name AS user_name, 
             u.email AS user_email
      FROM submissions s
      LEFT JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  },

  getByAssignmentAndUser: async (assignmentId, userId) => {
    const [rows] = await db.query(`
      SELECT s.*, 
             a.title AS assignment_title, 
             a.due_date,
             c.id AS course_id,
             c.title AS course_title
      FROM submissions s
      LEFT JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE s.assignment_id = ? AND s.user_id = ?
    `, [assignmentId, userId]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { assignment_id, user_id, content, grade, feedback } = data;
    const gradeVal = grade !== undefined && grade !== null && grade !== '' ? parseFloat(grade) : null;
    const [result] = await db.query(
      'INSERT INTO submissions (assignment_id, user_id, content, grade, feedback) VALUES (?, ?, ?, ?, ?)',
      [assignment_id, user_id, content, gradeVal, feedback || null]
    );
    return SubmissionModel.getById(result.insertId);
  },

  update: async (id, data) => {
    const { assignment_id, user_id, content, grade, feedback } = data;
    const gradeVal = grade !== undefined && grade !== null && grade !== '' ? parseFloat(grade) : null;
    const [result] = await db.query(
      'UPDATE submissions SET assignment_id = ?, user_id = ?, content = ?, grade = ?, feedback = ? WHERE id = ?',
      [assignment_id, user_id, content, gradeVal, feedback || null, id]
    );
    if (result.affectedRows === 0) return null;
    return SubmissionModel.getById(id);
  },

  // Instructor grading & feedback
  gradeSubmission: async (id, grade, feedback) => {
    const gradeVal = parseFloat(grade);
    const [result] = await db.query(
      'UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?',
      [gradeVal, feedback || null, id]
    );
    if (result.affectedRows === 0) return null;
    return SubmissionModel.getById(id);
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM submissions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = SubmissionModel;
