const db = require('../config/db');

const LearningController = {
  // Get course learning status for student (all lessons with completed flag)
  getCourseLearning: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Get course info first
      const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại'
        });
      }

      const isCourseOwner = (course[0].instructor_id != null && Number(course[0].instructor_id) === Number(userId)) ||
        (req.user.name && course[0].instructor && course[0].instructor.trim().toLowerCase() === req.user.name.trim().toLowerCase());
      const isAdmin = req.user.role === 'admin';

      // Check enrollment
      const [enrollment] = await db.query(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      if (enrollment.length === 0 && !isAdmin && !isCourseOwner) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chưa đăng ký khóa học này'
        });
      }

      // Get lessons in order
      const [lessons] = await db.query(
        'SELECT id, course_id, title, content, video_url, resource_url, lesson_order FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC, id ASC',
        [courseId]
      );

      // Get completed lessons by this user
      const [progress] = await db.query(
        'SELECT lesson_id, completed, completed_at FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
        [userId, courseId]
      );

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
          course: course[0],
          lessons: lessonsWithProgress,
          completedLessonIds,
          totalLessons,
          completedCount,
          progressPercentage,
          enrollmentStatus: enrollment[0]?.status || 'active'
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

      // Check current progress
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

      // Recalculate progress
      const [lessons] = await db.query('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
      const [completedRows] = await db.query(
        'SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
        [userId, courseId]
      );

      const totalLessons = lessons.length;
      const completedCount = completedRows.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // If all lessons completed, update enrollment status to completed & notify
      if (progressPercentage === 100 && totalLessons > 0) {
        await db.query(
          'UPDATE enrollments SET status = "completed" WHERE user_id = ? AND course_id = ?',
          [userId, courseId]
        );

        const [c] = await db.query('SELECT title FROM courses WHERE id = ?', [courseId]);
        const courseTitle = c[0]?.title || 'Khóa học';

        await db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [
            userId,
            'Chúc mừng bạn đã hoàn thành khóa học! 🎓',
            `Bạn đã hoàn thành 100% tất cả các bài học trong khóa học "${courseTitle}". Xin chúc mừng thành tích tuyệt vời của bạn!`
          ]
        );
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
