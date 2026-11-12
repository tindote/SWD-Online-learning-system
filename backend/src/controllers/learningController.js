const LearningModel = require('../models/learningModel');
const LessonModel = require('../models/lessonModel');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const NotificationModel = require('../models/notificationModel');

const LearningController = {
  // Get course learning status for student (all lessons with completed flag)
  getCourseLearning: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Get course info first
      const course = await CourseModel.getById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại'
        });
      }

      const isCourseOwner = (course.instructor_id != null && Number(course.instructor_id) === Number(userId)) ||
        (req.user.name && course.instructor && course.instructor.trim().toLowerCase() === req.user.name.trim().toLowerCase());
      const isAdmin = req.user.role === 'admin';

      // Check enrollment
      const enrollment = await EnrollmentModel.getByUserAndCourse(userId, courseId);

      if (!enrollment && !isAdmin && !isCourseOwner) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chưa đăng ký khóa học này'
        });
      }

      // Get lessons in order
      const lessons = await LessonModel.getByCourseId(courseId);

      // Get completed lessons by this user
      const progress = await LearningModel.getCompletedLessons(userId, courseId);

      const completedLessonIds = progress.map(p => p.lesson_id);
      const totalLessons = lessons.length;
      const completedCount = completedLessonIds.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      const lessonsWithProgress = lessons.map(lesson => ({
        ...lesson,
        isCompleted: completedLessonIds.includes(lesson.id)
      }));

      return res.status(200).json({
        success: true,
        data: {
          course,
          lessons: lessonsWithProgress,
          completedLessonIds,
          totalLessons,
          completedCount,
          progressPercentage,
          enrollmentStatus: enrollment?.status || 'active'
        }
      });
    } catch (error) {
      console.error('Error fetching course learning:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy dữ liệu học tập',
        error: error.message
      });
    }
  },

  // Toggle lesson complete status
  toggleLessonProgress: async (req, res) => {
    try {
      const { courseId, lessonId } = req.body;
      const userId = req.user.id;

      if (!courseId || !lessonId) {
        return res.status(400).json({
          success: false,
          message: 'Cần cung cấp courseId và lessonId'
        });
      }

      const newStatus = await LearningModel.toggleProgress(userId, courseId, lessonId);

      // Recalculate progress
      const lessons = await LessonModel.getByCourseId(courseId);
      const completedRows = await LearningModel.getCompletedLessons(userId, courseId);

      const totalLessons = lessons.length;
      const completedCount = completedRows.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // If all lessons completed, update enrollment status to completed & notify
      if (progressPercentage === 100 && totalLessons > 0) {
        await EnrollmentModel.updateStatusByUserAndCourse(userId, courseId, 'completed');

        const course = await CourseModel.getById(courseId);
        const courseTitle = course?.title || 'Khóa học';

        await NotificationModel.create({
          user_id: userId,
          title: 'Chúc mừng bạn đã hoàn thành khóa học! 🎓',
          message: `Bạn đã hoàn thành 100% tất cả các bài học trong khóa học "${courseTitle}". Xin chúc mừng thành tích tuyệt vời của bạn!`
        });
      }

      return res.status(200).json({
        success: true,
        message: newStatus ? 'Đã đánh dấu hoàn thành bài học' : 'Đã bỏ đánh dấu hoàn thành',
        data: {
          lessonId,
          isCompleted: newStatus,
          progressPercentage,
          completedCount,
          totalLessons
        }
      });
    } catch (error) {
      console.error('Error toggling progress:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật tiến độ học tập',
        error: error.message
      });
    }
  }
};

module.exports = LearningController;
