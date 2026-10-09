const CourseModel = require('../models/courseModel');
const db = require('../config/db');

// Validation helper
const validateCourseInput = (data) => {
  const errors = [];
  const { title, description, category, price } = data;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Tiêu đề khóa học là bắt buộc');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('Mô tả khóa học là bắt buộc');
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('Danh mục khóa học là bắt buộc');
  }

  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    errors.push('Giá khóa học phải là một số không âm');
  }

  return errors;
};

const getCourses = async (req, res) => {
  try {
    const { search, category, isFree, status, allStatus, instructor_id, sortBy } = req.query;
    
    // Only admins can view all statuses (draft, archived)
    const isAdmin = req.user && req.user.role === 'admin';
    const canViewAllStatus = isAdmin && (allStatus === 'true' || allStatus === true);

    const courses = await CourseModel.getAll({
      search,
      category,
      isFree,
      status: canViewAllStatus ? undefined : (status || 'published'),
      allStatus: canViewAllStatus,
      instructor_id,
      sortBy
    });

    const coursesWithOwnership = courses.map(course => {
      const isInstructorOwner = req.user ? (
        (course.instructor_id != null && Number(course.instructor_id) === Number(req.user.id)) ||
        (course.instructor && req.user.name && course.instructor.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
        (course.instructor_name && req.user.name && course.instructor_name.trim().toLowerCase() === req.user.name.trim().toLowerCase())
      ) : false;
      return {
        ...course,
        isInstructorOwner
      };
    });

    return res.status(200).json({
      success: true,
      count: coursesWithOwnership.length,
      data: coursesWithOwnership
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách khóa học',
      error: error.message
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.getById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy khóa học có ID ${id}`
      });
    }

    // Fetch lessons for this course
    const [lessons] = await db.query(
      'SELECT id, course_id, title, lesson_order, video_url, resource_url, created_at FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC',
      [id]
    );

    // Fetch reviews for this course
    const [reviews] = await db.query(`
      SELECT r.*, u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    // Check if the current logged in user is enrolled
    let isEnrolled = false;
    let enrollmentStatus = null;
    let progressPercentage = 0;

    if (req.user) {
      const [enrollment] = await db.query(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [req.user.id, id]
      );
      if (enrollment.length > 0) {
        isEnrolled = true;
        enrollmentStatus = enrollment[0].status;

        // Calculate progress
        const [progressCount] = await db.query(
          'SELECT COUNT(*) as completed_count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
          [req.user.id, id]
        );
        const totalLessons = lessons.length;
        if (totalLessons > 0) {
          progressPercentage = Math.round((progressCount[0].completed_count / totalLessons) * 100);
        }
      }
    }

    const isInstructorOwner = req.user ? (
      (course.instructor_id != null && Number(course.instructor_id) === Number(req.user.id)) ||
      (course.instructor && req.user.name && course.instructor.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
      (course.instructor_name && req.user.name && course.instructor_name.trim().toLowerCase() === req.user.name.trim().toLowerCase())
    ) : false;

    return res.status(200).json({
      success: true,
      data: {
        ...course,
        lessons,
        reviews,
        isEnrolled,
        enrollmentStatus,
        progressPercentage,
        isInstructorOwner
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết khóa học',
      error: error.message
    });
  }
};

// Get courses created by the authenticated instructor
const getMyInstructorCourses = async (req, res) => {
  try {
    const courses = await CourseModel.getAll({
      instructor_id: req.user.id,
      allStatus: true,
      sortBy: 'newest'
    });

    return res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách khóa học của bạn',
      error: error.message
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const errors = validateCourseInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { title, description, instructor, instructor_id, price, category, thumbnail, status } = req.body;

    // Determine instructor ownership
    let finalInstructorName = instructor;
    let finalInstructorId = instructor_id;

    if (req.user.role === 'instructor') {
      finalInstructorName = req.user.name;
      finalInstructorId = req.user.id;
    } else if (req.user.role === 'admin') {
      if (!finalInstructorName) finalInstructorName = req.user.name;
      if (!finalInstructorId) finalInstructorId = req.user.id;
    }

    const newCourse = await CourseModel.create({
      title: title.trim(),
      description: description.trim(),
      instructor: finalInstructorName,
      instructor_id: finalInstructorId,
      price: price !== undefined ? parseFloat(price) : 0.00,
      category: category.trim(),
      thumbnail,
      status: status || 'published'
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo khóa học thành công',
      data: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo khóa học',
      error: error.message
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCourse = await CourseModel.getById(id);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy khóa học có ID ${id}`
      });
    }

    // Ownership check: If role is instructor, cannot edit another instructor's course
    if (req.user.role === 'instructor' && existingCourse.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa khóa học của giảng viên khác'
      });
    }

    const errors = validateCourseInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { title, description, instructor, instructor_id, price, category, thumbnail, status } = req.body;

    const updatedCourse = await CourseModel.update(id, {
      title: title.trim(),
      description: description.trim(),
      instructor: req.user.role === 'instructor' ? existingCourse.instructor : (instructor || existingCourse.instructor),
      instructor_id: req.user.role === 'instructor' ? existingCourse.instructor_id : (instructor_id !== undefined ? instructor_id : existingCourse.instructor_id),
      price: price !== undefined ? parseFloat(price) : existingCourse.price,
      category: category.trim(),
      thumbnail,
      status
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật khóa học thành công',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật khóa học',
      error: error.message
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCourse = await CourseModel.getById(id);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy khóa học có ID ${id}`
      });
    }

    // Ownership check
    if (req.user.role === 'instructor' && existingCourse.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa khóa học của giảng viên khác'
      });
    }

    await CourseModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `Đã xóa khóa học thành công`
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa khóa học',
      error: error.message
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getMyInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
