const LessonModel = require('../models/lessonModel');
const CourseModel = require('../models/courseModel');

const validateLessonInput = async (data) => {
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
    errors.push('Tiêu đề bài học là bắt buộc');
  }

  return errors;
};

const getLessons = async (req, res) => {
  try {
    const { course_id } = req.query;
    const filter = {};
    if (course_id) filter.course_id = course_id;

    // If instructor and requesting own lessons
    if (req.user && req.user.role === 'instructor') {
      filter.instructor_id = req.user.id;
    }

    const lessons = await LessonModel.getAll(filter);
    return res.status(200).json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách bài học',
      error: error.message
    });
  }
};

const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await LessonModel.getById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài học có ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết bài học',
      error: error.message
    });
  }
};

const createLesson = async (req, res) => {
  try {
    const errors = await validateLessonInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { course_id, title, content, video_url, resource_url, lesson_order } = req.body;

    // Check course ownership for instructor
    if (req.user.role === 'instructor') {
      const course = await CourseModel.getById(course_id);
      if (course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thêm bài học vào khóa học của giảng viên khác'
        });
      }
    }

    const newLesson = await LessonModel.create({
      course_id: Number(course_id),
      title: title.trim(),
      content: content ? content.trim() : '',
      video_url: video_url ? video_url.trim() : null,
      resource_url: resource_url ? resource_url.trim() : null,
      lesson_order: lesson_order ? Number(lesson_order) : 1
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm bài học thành công',
      data: newLesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo bài học',
      error: error.message
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLesson = await LessonModel.getById(id);
    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài học có ID ${id}`
      });
    }

    // Check course ownership
    if (req.user.role === 'instructor' && existingLesson.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài học của giảng viên khác'
      });
    }

    const errors = await validateLessonInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { course_id, title, content, video_url, resource_url, lesson_order } = req.body;
    const updatedLesson = await LessonModel.update(id, {
      course_id: Number(course_id),
      title: title.trim(),
      content: content ? content.trim() : '',
      video_url: video_url !== undefined ? video_url : existingLesson.video_url,
      resource_url: resource_url !== undefined ? resource_url : existingLesson.resource_url,
      lesson_order: lesson_order ? Number(lesson_order) : existingLesson.lesson_order
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài học thành công',
      data: updatedLesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật bài học',
      error: error.message
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLesson = await LessonModel.getById(id);
    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài học có ID ${id}`
      });
    }

    // Check ownership
    if (req.user.role === 'instructor' && existingLesson.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài học của giảng viên khác'
      });
    }

    await LessonModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `Đã xóa bài học thành công`
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa bài học',
      error: error.message
    });
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};
