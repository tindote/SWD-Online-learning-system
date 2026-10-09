const db = require('../config/db');

const ReviewController = {
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const [reviews] = await db.query(`
        SELECT r.*, u.name AS user_name, u.avatar AS user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.course_id = ?
        ORDER BY r.created_at DESC
      `, [courseId]);

      // Calculate average
      const [stats] = await db.query(`
        SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS count
        FROM reviews WHERE course_id = ?
      `, [courseId]);

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          averageRating: Number(Number(stats[0].average_rating).toFixed(1)),
          count: stats[0].count
        }
      });
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy đánh giá khóa học',
        error: error.message
      });
    }
  },

  createReview: async (req, res) => {
    try {
      const { course_id, rating, review } = req.body;
      const userId = req.user.id;

      if (!course_id || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã khóa học và số sao đánh giá'
        });
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1 đến 5 sao'
        });
      }

      // Check if instructor owns the course
      const [course] = await db.query('SELECT instructor_id FROM courses WHERE id = ?', [course_id]);
      if (course.length > 0 && course[0].instructor_id === userId) {
        return res.status(400).json({
          success: false,
          message: 'Giảng viên không thể tự đánh giá khóa học của chính mình'
        });
      }

      // Check if user is enrolled
      const [enrollment] = await db.query(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, course_id]
      );

      if (enrollment.length === 0 && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bạn phải đăng ký khóa học này trước khi có thể để lại đánh giá'
        });
      }

      // Check if already reviewed
      const [existing] = await db.query(
        'SELECT * FROM reviews WHERE user_id = ? AND course_id = ?',
        [userId, course_id]
      );

      if (existing.length > 0) {
        // Update existing review
        await db.query(
          'UPDATE reviews SET rating = ?, review = ? WHERE id = ?',
          [numRating, review ? review.trim() : null, existing[0].id]
        );

        return res.status(200).json({
          success: true,
          message: 'Cập nhật đánh giá thành công'
        });
      }

      // Insert new review
      await db.query(
        'INSERT INTO reviews (user_id, course_id, rating, review) VALUES (?, ?, ?, ?)',
        [userId, course_id, numRating, review ? review.trim() : null]
      );

      return res.status(201).json({
        success: true,
        message: 'Đăng đánh giá khóa học thành công'
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi gửi đánh giá',
        error: error.message
      });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      const [review] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);

      if (review.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      if (req.user.role !== 'admin' && review[0].user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa đánh giá này'
        });
      }

      await db.query('DELETE FROM reviews WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa đánh giá thành công'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa đánh giá',
        error: error.message
      });
    }
  }
};

module.exports = ReviewController;
