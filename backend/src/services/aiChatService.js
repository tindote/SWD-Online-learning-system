const { getGeminiConfig } = require('../config/gemini');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const AiConversationModel = require('../models/aiConversationModel');
const AiMessageModel = require('../models/aiMessageModel');
const RagService = require('./ragService');
const GeminiService = require('./geminiService');

/**
 * Detects attempts to extract confidential quiz answer keys, API keys, or system prompts.
 */
const CONFIDENTIAL_REQUEST_PATTERNS = [
  /\b(đáp án đúng của bài kiểm tra|đáp án bài thi|cho tôi toàn bộ đáp án|quiz answer key|exam answer key|dump all correct answers)\b/i,
  /\b(ignore previous instructions|ignore all system instructions|bỏ qua tất cả hướng dẫn hệ thống|tiết lộ system prompt|reveal your system prompt|show GEMINI_API_KEY)\b/i
];

const AiChatService = {
  /**
   * Validates that a courseId is a positive integer.
   */
  parseCourseId: (rawCourseId) => {
    const id = Number(rawCourseId);
    if (!Number.isInteger(id) || id <= 0) {
      const err = new Error('Mã khóa học (courseId) không hợp lệ.');
      err.statusCode = 400;
      throw err;
    }
    return id;
  },

  /**
   * Validates that a conversationId is a positive integer.
   */
  parseConversationId: (rawConversationId) => {
    const id = Number(rawConversationId);
    if (!Number.isInteger(id) || id <= 0) {
      const err = new Error('Mã cuộc trò chuyện (conversationId) không hợp lệ.');
      err.statusCode = 400;
      throw err;
    }
    return id;
  },

  /**
   * Checks whether an authenticated instructor owns the specified course.
   */
  isInstructorCourseOwner: (user, course) => {
    if (!user || !course) return false;
    const byId = course.instructor_id != null && Number(course.instructor_id) === Number(user.id);
    const byName = Boolean(
      user.name &&
      course.instructor &&
      course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase()
    );
    return byId || byName;
  },

  /**
   * Enforces strict role-based course authorization for RAG chat and indexing.
   * - ADMIN: allowed according to administration rules.
   * - INSTRUCTOR: allowed on their own courses (and for chat if actively enrolled in another published course).
   * - STUDENT: allowed for chat ONLY when course is published AND they have an ACTIVE enrollment.
   */
  verifyCourseAccess: async (user, rawCourseId, options = { requireIndexingPermission: false }) => {
    if (!user || !user.id) {
      const err = new Error('Yêu cầu đăng nhập để sử dụng Trợ lý AI.');
      err.statusCode = 401;
      throw err;
    }

    const courseId = AiChatService.parseCourseId(rawCourseId);
    const course = await CourseModel.getById(courseId);

    if (!course) {
      const err = new Error(`Không tìm thấy khóa học có ID ${courseId}.`);
      err.statusCode = 404;
      throw err;
    }

    const role = String(user.role || '').toLowerCase();
    const isOwner = AiChatService.isInstructorCourseOwner(user, course);

    // 1. Indexing permission check (Only ADMIN or the owning INSTRUCTOR)
    if (options.requireIndexingPermission) {
      if (role === 'admin') {
        return course;
      }
      if (role === 'instructor' && isOwner) {
        return course;
      }
      const err = new Error('Chỉ Quản trị viên (ADMIN) hoặc Giảng viên phụ trách khóa học mới có quyền lập chỉ mục tri thức AI.');
      err.statusCode = 403;
      throw err;
    }

    // 2. Chat / Retrieval permission check
    if (role === 'admin') {
      return course;
    }

    if (role === 'instructor' && isOwner) {
      return course;
    }

    // For students (or instructors studying another instructor's course):
    // Course must be published AND user must have an active enrollment
    if (String(course.status || '').toLowerCase() !== 'published') {
      const err = new Error('Khóa học này hiện chưa được xuất bản nên không thể truy cập tài liệu AI.');
      err.statusCode = 403;
      throw err;
    }

    const enrollment = await EnrollmentModel.getByUserAndCourse(user.id, courseId);
    const enrollmentStatus = String(enrollment?.status || '').toLowerCase();
    // In this system, active students have status 'active' (or 'completed' after finishing 100% of lessons)
    const hasActiveAccess = Boolean(
      enrollment && (enrollmentStatus === 'active' || enrollmentStatus === 'completed')
    );

    if (!hasActiveAccess) {
      const err = new Error('Bạn phải ghi danh (ACTIVE enrollment) vào khóa học này trước khi sử dụng Trợ lý Học tập AI.');
      err.statusCode = 403;
      throw err;
    }

    return course;
  },

  /**
   * Validates user message input length and content safety.
   */
  validateMessageInput: (rawMessage) => {
    const config = getGeminiConfig();
    const maxLen = config.maxMessageLength || 2000;

    if (rawMessage === undefined || rawMessage === null || typeof rawMessage !== 'string') {
      const err = new Error('Vui lòng nhập nội dung câu hỏi.');
      err.statusCode = 400;
      throw err;
    }

    const trimmed = rawMessage.trim();
    if (!trimmed) {
      const err = new Error('Nội dung câu hỏi không được để trống.');
      err.statusCode = 400;
      throw err;
    }

    if (trimmed.length > maxLen) {
      const err = new Error(`Câu hỏi quá dài (tối đa ${maxLen} ký tự, hiện tại ${trimmed.length} ký tự).`);
      err.statusCode = 400;
      throw err;
    }

    for (const pattern of CONFIDENTIAL_REQUEST_PATTERNS) {
      if (pattern.test(trimmed)) {
        const err = new Error('Vì lý do bảo mật và liêm chính học thuật, Trợ lý AI không cung cấp đáp án trực tiếp của bài kiểm tra hoặc thông tin nội bộ hệ thống.');
        err.statusCode = 403;
        err.code = 'POLICY_VIOLATION';
        throw err;
      }
    }

    return trimmed;
  },

  /**
   * Builds a concise conversation title from the user's first question.
   */
  buildConversationTitle: (question) => {
    const singleLine = String(question || '').replace(/\s+/g, ' ').trim();
    if (!singleLine) return 'Cuộc trò chuyện mới';
    return singleLine.length > 70 ? `${singleLine.slice(0, 67)}...` : singleLine;
  },

  /**
   * Processes a chat message from an authenticated user using either:
   * 1. Course-specific RAG pipeline (when courseId > 0)
   * 2. Catalog-wide Course Advisor pipeline (when courseId is null / 0 / 'advisor')
   */
  sendMessage: async ({ user, courseId, previewCourseId, conversationId, message }) => {
    const cleanQuestion = AiChatService.validateMessageInput(message);
    const config = getGeminiConfig();

    const isAdvisorInput =
      courseId === undefined ||
      courseId === null ||
      courseId === '' ||
      courseId === 0 ||
      courseId === '0' ||
      courseId === 'advisor';

    let conversation = null;
    let targetCourseId = isAdvisorInput ? null : courseId;

    if (conversationId !== undefined && conversationId !== null && conversationId !== '') {
      const parsedConvId = AiChatService.parseConversationId(conversationId);
      const existingConv = await AiConversationModel.getById(parsedConvId);

      if (existingConv) {
        if (Number(existingConv.user_id) !== Number(user.id)) {
          const err = new Error('Bạn không có quyền truy cập hoặc gửi tin nhắn vào cuộc trò chuyện của người dùng khác.');
          err.statusCode = 403;
          throw err;
        }

        const convCourseId = existingConv.course_id ? Number(existingConv.course_id) : null;
        const reqCourseId = targetCourseId ? Number(targetCourseId) : null;

        // Only reuse existingConv if it belongs to the same mode/course; otherwise start a fresh conversation
        if (reqCourseId === convCourseId) {
          targetCourseId = existingConv.course_id;
          conversation = existingConv;
        }
      }
    }

    // Retrieve limited conversation history BEFORE saving the new question
    const history = conversation
      ? await AiMessageModel.getRecentByConversationId(conversation.id, config.maxHistoryMessages)
      : [];

    let contextText = '';
    let sources = [];
    let courseMetaForPrompt = {};
    let dbCourseId = null;

    if (targetCourseId === null) {
      // COURSE ADVISOR MODE (Catalog-wide public course recommendation & learning path advice)
      const advisorData = await RagService.retrieveCatalogAdvisorContext(cleanQuestion, previewCourseId);
      contextText = advisorData.contextText;
      sources = advisorData.sources;
      courseMetaForPrompt = {
        id: null,
        title: 'Tư vấn Chọn Khóa học & Lộ trình Học tập (Toàn bộ Danh mục Hệ thống)',
        category: 'Tất cả danh mục',
        instructor: 'Đội ngũ Giảng viên Online Learning System'
      };
      dbCourseId = null;
    } else {
      // COURSE-SPECIFIC RAG MODE (Requires active enrollment / ownership)
      const course = await AiChatService.verifyCourseAccess(user, targetCourseId, {
        requireIndexingPermission: false
      });

      const relevantChunks = await RagService.retrieveRelevantChunks(course.id, cleanQuestion);
      const built = RagService.buildContext(relevantChunks);
      contextText = built.contextText;
      sources = built.sources;
      courseMetaForPrompt = {
        id: course.id,
        title: course.title,
        category: course.category,
        instructor: course.instructor
      };
      dbCourseId = course.id;
    }

    // Generate grounded answer using Gemini
    const answerText = await GeminiService.generateAnswer(
      cleanQuestion,
      contextText,
      history,
      courseMetaForPrompt
    );

    // Create conversation if this was the first message
    if (!conversation) {
      const title = AiChatService.buildConversationTitle(cleanQuestion);
      conversation = await AiConversationModel.create({
        user_id: user.id,
        course_id: dbCourseId,
        title
      });
    } else if (conversation.title === 'Cuộc trò chuyện mới' && history.length === 0) {
      conversation = await AiConversationModel.updateTitle(
        conversation.id,
        user.id,
        AiChatService.buildConversationTitle(cleanQuestion)
      );
    }

    // Save both USER and AI messages
    const savedUserMessage = await AiMessageModel.create({
      conversation_id: conversation.id,
      sender: 'USER',
      content: cleanQuestion
    });

    const savedAiMessage = await AiMessageModel.create({
      conversation_id: conversation.id,
      sender: 'AI',
      content: answerText,
      sources
    });

    await AiConversationModel.touch(conversation.id);
    const updatedConversation = await AiConversationModel.getByIdAndUser(conversation.id, user.id);

    return {
      conversation: updatedConversation,
      userMessage: savedUserMessage,
      aiMessage: savedAiMessage,
      answer: answerText,
      sources
    };
  },

  /**
   * Create a blank conversation explicitly for an authorized course or Course Advisor mode.
   */
  createConversation: async ({ user, courseId, title }) => {
    const isAdvisorInput =
      courseId === undefined ||
      courseId === null ||
      courseId === '' ||
      courseId === 0 ||
      courseId === '0' ||
      courseId === 'advisor';

    let dbCourseId = null;
    if (!isAdvisorInput) {
      const course = await AiChatService.verifyCourseAccess(user, courseId, {
        requireIndexingPermission: false
      });
      dbCourseId = course.id;
    }

    const conversation = await AiConversationModel.create({
      user_id: user.id,
      course_id: dbCourseId,
      title: title || (isAdvisorInput ? 'Tư vấn chọn khóa học' : 'Cuộc trò chuyện mới')
    });

    return conversation;
  },

  /**
   * List conversations belonging ONLY to the authenticated user.
   */
  getUserConversations: async (user, courseId = null) => {
    const isAdvisorFilter = courseId === 'advisor' || courseId === 0 || courseId === '0';
    if (!isAdvisorFilter && courseId !== null && courseId !== undefined && courseId !== '') {
      await AiChatService.verifyCourseAccess(user, courseId, { requireIndexingPermission: false });
    }
    return AiConversationModel.getByUser(user.id, courseId);
  },

  /**
   * Get messages in a specific conversation owned by the authenticated user.
   */
  getConversationDetails: async (user, rawConversationId) => {
    const conversationId = AiChatService.parseConversationId(rawConversationId);
    const existing = await AiConversationModel.getById(conversationId);

    if (!existing) {
      const err = new Error('Không tìm thấy cuộc trò chuyện.');
      err.statusCode = 404;
      throw err;
    }

    if (Number(existing.user_id) !== Number(user.id)) {
      const err = new Error('Bạn không có quyền xem cuộc trò chuyện của người dùng khác.');
      err.statusCode = 403;
      throw err;
    }

    // If this conversation belongs to a specific course, verify user still has access to it
    if (existing.course_id !== null && existing.course_id !== undefined) {
      await AiChatService.verifyCourseAccess(user, existing.course_id, {
        requireIndexingPermission: false
      });
    }

    const conversation = await AiConversationModel.getByIdAndUser(conversationId, user.id);
    const messages = await AiMessageModel.getByConversationId(conversationId);

    return {
      conversation,
      messages
    };
  },

  /**
   * Delete a conversation owned by the authenticated user.
   */
  deleteConversation: async (user, rawConversationId) => {
    const conversationId = AiChatService.parseConversationId(rawConversationId);
    const existing = await AiConversationModel.getById(conversationId);

    if (!existing) {
      const err = new Error('Không tìm thấy cuộc trò chuyện.');
      err.statusCode = 404;
      throw err;
    }

    if (Number(existing.user_id) !== Number(user.id)) {
      const err = new Error('Bạn không có quyền xóa cuộc trò chuyện của người dùng khác.');
      err.statusCode = 403;
      throw err;
    }

    const deleted = await AiConversationModel.deleteByIdAndUser(conversationId, user.id);
    return deleted;
  },

  /**
   * Trigger RAG course indexing (restricted to owning INSTRUCTOR or ADMIN).
   */
  indexCourse: async (user, rawCourseId, options = {}) => {
    const course = await AiChatService.verifyCourseAccess(user, rawCourseId, {
      requireIndexingPermission: true
    });

    return RagService.indexCourseLessons(course.id, options);
  }
};

module.exports = AiChatService;

