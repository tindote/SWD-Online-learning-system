const ReviewModel = require('../models/reviewModel');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');

const ReviewController = {
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const reviews = await ReviewModel.getByCourseId(courseId);
      const stats = await ReviewModel.getCourseStats(courseId);

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          averageRating: stats.averageRating,
          count: stats.count
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
      const course = await CourseModel.getById(course_id);
      if (course && course.instructor_id === userId) {
        return res.status(400).json({
          success: false,
          message: 'Giảng viên không thể tự đánh giá khóa học của chính mình'
        });
      }

      // Check if user is enrolled
      const enrollment = await EnrollmentModel.getByUserAndCourse(userId, course_id);
      if (!enrollment && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bạn phải đăng ký khóa học này trước khi có thể để lại đánh giá'
        });
      }

      // Check if already reviewed
      const existing = await ReviewModel.getByUserAndCourse(userId, course_id);

      if (existing) {
        // Update existing review
        await ReviewModel.update(existing.id, {
          rating: numRating,
          review: review ? review.trim() : null
        });

        return res.status(200).json({
          success: true,
          message: 'Cập nhật đánh giá thành công'
        });
      }

      // Insert new review
      await ReviewModel.create({
        user_id: userId,
        course_id,
        rating: numRating,
        review: review ? review.trim() : null
      });

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
      const review = await ReviewModel.getById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa đánh giá này'
        });
      }

      await ReviewModel.delete(id);

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
