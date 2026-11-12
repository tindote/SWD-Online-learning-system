const db = require('../config/db');

const ReviewModel = {
  // Get all reviews for a course with user details
  getByCourseId: async (courseId) => {
    const [rows] = await db.query(`
      SELECT r.*, u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
    `, [courseId]);
    return rows;
  },

  // Calculate average rating and count for a course
  getCourseStats: async (courseId) => {
    const [rows] = await db.query(`
      SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS count
      FROM reviews
      WHERE course_id = ?
    `, [courseId]);
    return {
      averageRating: Number(Number(rows[0]?.average_rating || 0).toFixed(1)),
      count: rows[0]?.count || 0
    };
  },

  // Get a single review by ID
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Check if a user has already reviewed a course
  getByUserAndCourse: async (userId, courseId) => {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    return rows[0] || null;
  },

  // Create a review
  create: async (data) => {
    const { user_id, course_id, rating, review } = data;
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, course_id, rating, review) VALUES (?, ?, ?, ?)',
      [user_id, course_id, rating, review ? review.trim() : null]
    );
    return ReviewModel.getById(result.insertId);
  },

  // Update a review
  update: async (id, data) => {
    const { rating, review } = data;
    const [result] = await db.query(
      'UPDATE reviews SET rating = ?, review = ? WHERE id = ?',
      [rating, review ? review.trim() : null, id]
    );
    if (result.affectedRows === 0) return null;
    return ReviewModel.getById(id);
  },

  // Delete a review
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ReviewModel;
