const AssignmentModel = require('../models/assignmentModel');
const CourseModel = require('../models/courseModel');

const validateAssignmentInput = async (data) => {
  const errors = [];
  const { course_id, title } = data;

  if (!course_id || isNaN(Number(course_id))) {
    errors.push('Mã khóa học là bắt buộc');
  } else {
    const course = await CourseModel.getById(course_id);
    if (!course) {
      errors.push(`Khóa học với ID ${course_id} không tồn tại`);
    }
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Tiêu đề bài tập là bắt buộc');
  }

  return errors;
};

const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.course_id) filter.course_id = req.query.course_id;

    if (req.user) {
      if (req.query.as_student === 'true' || req.user.role === 'student') {
        filter.enrolled_user_id = req.user.id;
      } else if (req.user.role === 'instructor') {
        filter.instructor_id = req.user.id;
      }
    }

    const assignments = await AssignmentModel.getAll(filter);
    return res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách bài tập',
      error: error.message
    });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentModel.getById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài tập có ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết bài tập',
      error: error.message
    });
  }
};

const createAssignment = async (req, res) => {
  try {
    const errors = await validateAssignmentInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { course_id, title, description, due_date } = req.body;

    // Check course ownership
    if (req.user.role === 'instructor') {
      const course = await CourseModel.getById(course_id);
      if (course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền giao bài tập cho khóa học của giảng viên khác'
        });
      }
    }

    const newAssignment = await AssignmentModel.create({
      course_id: Number(course_id),
      title: title.trim(),
      description: description ? description.trim() : '',
      due_date: due_date || null
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo bài tập thành công',
      data: newAssignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo bài tập',
      error: error.message
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAssignment = await AssignmentModel.getById(id);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài tập có ID ${id}`
      });
    }

    // Check ownership
    if (req.user.role === 'instructor' && existingAssignment.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài tập của giảng viên khác'
      });
    }

    const errors = await validateAssignmentInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { course_id, title, description, due_date } = req.body;
    const updatedAssignment = await AssignmentModel.update(id, {
      course_id: Number(course_id),
      title: title.trim(),
      description: description ? description.trim() : '',
      due_date: due_date || null
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài tập thành công',
      data: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật bài tập',
      error: error.message
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAssignment = await AssignmentModel.getById(id);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài tập có ID ${id}`
      });
    }

    if (req.user.role === 'instructor' && existingAssignment.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài tập của giảng viên khác'
      });
    }

    await AssignmentModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `Đã xóa bài tập thành công`
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa bài tập',
      error: error.message
    });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
