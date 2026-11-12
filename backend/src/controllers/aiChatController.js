const AiChatService = require('../services/aiChatService');

/**
 * Safely sends structured JSON error responses without leaking internal secrets or stack traces.
 */
const handleControllerError = (res, error, fallbackMessage) => {
  const statusCode = error?.statusCode && Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;

  if (statusCode >= 500) {
    console.error('[AI Chatbot Error]:', error?.message || error);
  }

  return res.status(statusCode).json({
    success: false,
    code: error?.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
    message: error?.message || fallbackMessage || 'Đã xảy ra lỗi khi xử lý yêu cầu AI.'
  });
};

const AiChatController = {
  /**
   * POST /api/ai/chat
   * Send a question to the RAG Learning Assistant, creating or continuing a conversation.
   */
  chat: async (req, res) => {
    try {
      const { courseId, course_id, previewCourseId, preview_course_id, conversationId, conversation_id, message } = req.body || {};
      const resolvedCourseId = courseId !== undefined ? courseId : course_id;
      const resolvedPreviewCourseId = previewCourseId !== undefined ? previewCourseId : preview_course_id;
      const resolvedConversationId = conversationId !== undefined ? conversationId : conversation_id;

      const result = await AiChatService.sendMessage({
        user: req.user,
        courseId: resolvedCourseId,
        previewCourseId: resolvedPreviewCourseId,
        conversationId: resolvedConversationId,
        message
      });

      return res.status(200).json({
        success: true,
        message: 'Đã tạo phản hồi từ Trợ lý Học tập AI',
        data: {
          conversation: result.conversation,
          userMessage: result.userMessage,
          aiMessage: result.aiMessage,
          answer: result.answer,
          sources: result.sources
        }
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể xử lý câu hỏi với Trợ lý AI');
    }
  },

  /**
   * POST /api/ai/conversations
   * Explicitly create a new empty conversation for a course.
   */
  createConversation: async (req, res) => {
    try {
      const { courseId, course_id, title } = req.body || {};
      const resolvedCourseId = courseId !== undefined ? courseId : course_id;

      const conversation = await AiChatService.createConversation({
        user: req.user,
        courseId: resolvedCourseId,
        title
      });

      return res.status(201).json({
        success: true,
        message: 'Đã tạo cuộc trò chuyện mới',
        data: conversation
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể tạo cuộc trò chuyện mới');
    }
  },

  /**
   * GET /api/ai/conversations
   * Get authenticated user's conversations (optionally filtered by ?courseId=).
   */
  getConversations: async (req, res) => {
    try {
      const courseId = req.query.courseId !== undefined ? req.query.courseId : req.query.course_id;
      const conversations = await AiChatService.getUserConversations(req.user, courseId);

      return res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể tải danh sách cuộc trò chuyện');
    }
  },

  /**
   * GET /api/ai/conversations/:id
   * Get conversation details and messages owned by the authenticated user.
   */
  getConversationById: async (req, res) => {
    try {
      const { id } = req.params;
      const details = await AiChatService.getConversationDetails(req.user, id);

      return res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể tải nội dung cuộc trò chuyện');
    }
  },

  /**
   * DELETE /api/ai/conversations/:id
   * Delete a conversation owned by the authenticated user.
   */
  deleteConversation: async (req, res) => {
    try {
      const { id } = req.params;
      await AiChatService.deleteConversation(req.user, id);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa cuộc trò chuyện thành công'
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể xóa cuộc trò chuyện');
    }
  },

  /**
   * POST /api/ai/courses/:courseId/index
   * Protected endpoint for course instructors or ADMIN to index course lessons into RAG store.
   */
  indexCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const force = Boolean(req.body?.force);

      const report = await AiChatService.indexCourse(req.user, courseId, { force });

      return res.status(200).json({
        success: true,
        message: `Đã lập chỉ mục tri thức AI cho khóa học "${report.courseTitle}" thành công`,
        data: report
      });
    } catch (error) {
      return handleControllerError(res, error, 'Không thể lập chỉ mục tri thức cho khóa học');
    }
  }
};

module.exports = AiChatController;

