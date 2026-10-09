const SubmissionModel = require('../models/submissionModel');
const AssignmentModel = require('../models/assignmentModel');
const db = require('../config/db');

const getSubmissions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.assignment_id) filter.assignment_id = req.query.assignment_id;

    if (req.query.my_submissions === 'true' || req.user.role === 'student') {
      filter.user_id = req.user.id;
    } else if (req.user.role === 'instructor') {
      filter.instructor_id = req.user.id;
    }

    const submissions = await SubmissionModel.getAll(filter);
    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách bài nộp',
      error: error.message
    });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await SubmissionModel.getById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài nộp có ID ${id}`
      });
    }

    // IDOR Protection: Student cannot view another student's submission
    if (req.user.role === 'student' && submission.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài nộp của học viên khác'
      });
    }

    // Instructor cannot view submissions for other instructors' courses
    if (req.user.role === 'instructor' && submission.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài nộp của khóa học này'
      });
    }

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết bài nộp',
      error: error.message
    });
  }
};

const createSubmission = async (req, res) => {
  try {
    const { assignment_id, content, user_id, grade, feedback } = req.body;

    if (!assignment_id || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã bài tập và nội dung bài nộp'
      });
    }

    const assignment = await AssignmentModel.getById(assignment_id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Bài tập không tồn tại'
      });
    }

    // Determine target user
    let submitUserId = req.user.id;
    let initialGrade = null;
    let initialFeedback = null;

    if (req.user.role === 'admin') {
      if (user_id) submitUserId = user_id;
      if (grade !== undefined) initialGrade = grade;
      if (feedback !== undefined) initialFeedback = feedback;
    }

    // Check if user already submitted this assignment
    const existing = await SubmissionModel.getByAssignmentAndUser(assignment_id, submitUserId);
    if (existing) {
      // Update existing submission content
      const updated = await SubmissionModel.update(existing.id, {
        assignment_id,
        user_id: submitUserId,
        content: content.trim(),
        grade: existing.grade,
        feedback: existing.feedback
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật bài nộp thành công',
        data: updated
      });
    }

    const newSubmission = await SubmissionModel.create({
      assignment_id: Number(assignment_id),
      user_id: submitUserId,
      content: content.trim(),
      grade: initialGrade,
      feedback: initialFeedback
    });

    return res.status(201).json({
      success: true,
      message: 'Nộp bài tập thành công',
      data: newSubmission
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi nộp bài tập',
      error: error.message
    });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SubmissionModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài nộp có ID ${id}`
      });
    }

    // If student, can only edit their own submission content
    if (req.user.role === 'student') {
      if (existing.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa bài nộp của người khác'
        });
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung bài nộp không được để trống'
        });
      }

      const updated = await SubmissionModel.update(id, {
        assignment_id: existing.assignment_id,
        user_id: existing.user_id,
        content: content.trim(),
        grade: existing.grade,
        feedback: existing.feedback
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật nội dung bài nộp thành công',
        data: updated
      });
    }

    // If instructor or admin, can grade and give feedback
    if (req.user.role === 'instructor' && existing.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấm bài nộp của khóa học này'
      });
    }

    const { grade, feedback, content } = req.body;

    if (grade !== undefined && grade !== null && grade !== '') {
      const numGrade = parseFloat(grade);
      if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
        return res.status(400).json({
          success: false,
          message: 'Điểm số phải là số từ 0 đến 100'
        });
      }
    }

    const updated = await SubmissionModel.update(id, {
      assignment_id: existing.assignment_id,
      user_id: existing.user_id,
      content: content !== undefined ? content : existing.content,
      grade: grade !== undefined ? grade : existing.grade,
      feedback: feedback !== undefined ? feedback : existing.feedback
    });

    // Notify the student about the grade/feedback
    if (grade !== undefined && grade !== null) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          existing.user_id,
          'Bài tập đã được chấm điểm',
          `Bài nộp cho "${existing.assignment_title}" đã có điểm: ${grade}/100. ${feedback ? 'Nhận xét: ' + feedback : ''}`
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật chấm điểm và nhận xét thành công',
      data: updated
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật bài nộp',
      error: error.message
    });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SubmissionModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài nộp có ID ${id}`
      });
    }

    // Role check: Only admin or the student themselves can delete
    if (req.user.role === 'student' && existing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài nộp của học viên khác'
      });
    }

    if (req.user.role === 'instructor' && existing.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài nộp của khóa học này'
      });
    }

    await SubmissionModel.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa bài nộp thành công'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa bài nộp',
      error: error.message
    });
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission
};
