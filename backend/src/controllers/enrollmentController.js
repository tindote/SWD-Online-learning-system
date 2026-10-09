const EnrollmentModel = require('../models/enrollmentModel');
const CourseModel = require('../models/courseModel');
const UserModel = require('../models/userModel');
const db = require('../config/db');

const getEnrollments = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student') {
      filter.user_id = req.user.id;
    } else if (req.user.role === 'instructor') {
      filter.instructor_id = req.user.id;
    }

    if (req.query.course_id) filter.course_id = req.query.course_id;
    if (req.query.status) filter.status = req.query.status;

    const enrollments = await EnrollmentModel.getAll(filter);
    return res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách đăng ký học',
      error: error.message
    });
  }
};

// Student's own enrollments with progress
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollmentModel.getMyEnrollments(req.user.id);
    return res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching my enrollments:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách khóa học bạn đã đăng ký',
      error: error.message
    });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await EnrollmentModel.getById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bản ghi đăng ký có ID ${id}`
      });
    }

    // Authorization check
    if (req.user.role === 'student' && enrollment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin ghi danh của học viên khác'
      });
    }

    if (req.user.role === 'instructor' && enrollment.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin ghi danh của khóa học này'
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết đăng ký',
      error: error.message
    });
  }
};

// Direct student self-enrollment
const enrollInCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'Mã khóa học là bắt buộc'
      });
    }

    const course = await CourseModel.getById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học cần đăng ký'
      });
    }

    // A teacher cannot enroll in their own course
    const isOwner = (course.instructor_id != null && Number(course.instructor_id) === Number(req.user.id)) ||
      (course.instructor && req.user.name && course.instructor.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
      (course.instructor_name && req.user.name && course.instructor_name.trim().toLowerCase() === req.user.name.trim().toLowerCase());

    if (isOwner) {
      return res.status(400).json({
        success: false,
        message: 'Bạn là giảng viên của khóa học này nên không thể tự đăng ký. Bạn có thể vào xem bài giảng trực tiếp.'
      });
    }

    // Check duplicate enrollment
    const existing = await EnrollmentModel.getByUserAndCourse(req.user.id, course_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này trước đó rồi'
      });
    }

    const enrollment = await EnrollmentModel.create({
      user_id: req.user.id,
      course_id,
      status: 'active'
    });

    // Create a notification for the student
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        req.user.id,
        'Ghi danh thành công!',
        `Bạn đã ghi danh thành công khóa học "${course.title}". Hãy bắt đầu học ngay bây giờ!`
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Đăng ký khóa học "${course.title}" thành công`,
      data: enrollment
    });
  } catch (error) {
    console.error('Error in self-enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thực hiện đăng ký khóa học',
      error: error.message
    });
  }
};

// Admin create enrollment
const createEnrollment = async (req, res) => {
  try {
    const { user_id, course_id, status } = req.body;

    if (!user_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp đầy đủ ID người dùng và ID khóa học'
      });
    }

    const user = await UserModel.getById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    const course = await CourseModel.getById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Khóa học không tồn tại'
      });
    }

    const existing = await EnrollmentModel.getByUserAndCourse(user_id, course_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Học viên này đã được ghi danh trong khóa học'
      });
    }

    const newEnrollment = await EnrollmentModel.create({
      user_id,
      course_id,
      status: status || 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Ghi danh học viên thành công',
      data: newEnrollment
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi ghi danh học viên',
      error: error.message
    });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await EnrollmentModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bản ghi đăng ký có ID ${id}`
      });
    }

    if (req.user.role === 'instructor' && existing.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa trạng thái đăng ký của khóa học này'
      });
    }

    const { status, user_id, course_id } = req.body;
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái phải là một trong các giá trị: ${validStatuses.join(', ')}`
      });
    }

    const updated = await EnrollmentModel.update(id, {
      user_id: user_id || existing.user_id,
      course_id: course_id || existing.course_id,
      status: status || existing.status
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đăng ký thành công',
      data: updated
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật đăng ký',
      error: error.message
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await EnrollmentModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bản ghi đăng ký có ID ${id}`
      });
    }

    // Role check: Only admin or the student themselves can cancel enrollment
    if (req.user.role === 'student' && existing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đăng ký của học viên khác'
      });
    }

    await EnrollmentModel.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Đã hủy đăng ký thành công'
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi hủy đăng ký',
      error: error.message
    });
  }
};

module.exports = {
  getEnrollments,
  getMyEnrollments,
  getEnrollmentById,
  enrollInCourse,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
};
