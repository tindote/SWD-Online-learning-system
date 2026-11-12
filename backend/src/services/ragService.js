const { getGeminiConfig } = require('../config/gemini');
const EmbeddingService = require('./embeddingService');
const AiKnowledgeModel = require('../models/aiKnowledgeModel');
const CourseModel = require('../models/courseModel');
const LessonModel = require('../models/lessonModel');

/**
 * Helper delay for rate-limit friendly batch indexing.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Short-lived in-memory cache for catalog advisor data (TTL: 60 seconds)
let catalogCache = {
  timestamp: 0,
  courses: null,
  lessonsByCourse: null
};

const RagService = {
  /**
   * Extracts and normalizes textual lesson content.
   * Strips control characters, normalizes line breaks and spaces,
   * and redacts any accidental inline quiz answer key markers.
   */
  normalizeText: (rawText) => {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Redact any explicit quiz answer key lines if ever present in raw text
      .replace(/^\s*(đáp án đúng|correct answer|answer key)\s*[:=].*$/gim, '[Nội dung đáp án kiểm tra được ẩn]')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  /**
   * Splits normalized text into overlapping semantic chunks of ~1200 characters
   * with ~200 characters overlap, respecting paragraph/sentence/word boundaries.
   */
  splitTextIntoChunks: (text, options = {}) => {
    const config = getGeminiConfig();
    const chunkSize = Math.max(200, Number(options.chunkSize) || config.chunkSize || 1200);
    const chunkOverlap = Math.max(0, Math.min(chunkSize - 50, Number(options.chunkOverlap) || config.chunkOverlap || 200));

    const normalized = RagService.normalizeText(text);
    if (!normalized) return [];

    if (normalized.length <= chunkSize) {
      return [normalized];
    }

    const chunks = [];
    let startIndex = 0;
    const textLength = normalized.length;

    while (startIndex < textLength) {
      let endIndex = Math.min(startIndex + chunkSize, textLength);

      // If not at the end of the text, try to break at a natural boundary
      if (endIndex < textLength) {
        const windowText = normalized.slice(startIndex, endIndex);
        const minBreakOffset = Math.floor(chunkSize * 0.55);

        // Prefer paragraph break, then sentence end, then space
        let breakOffset = windowText.lastIndexOf('\n\n');
        if (breakOffset < minBreakOffset) {
          breakOffset = Math.max(
            windowText.lastIndexOf('. '),
            windowText.lastIndexOf('! '),
            windowText.lastIndexOf('? '),
            windowText.lastIndexOf('\n')
          );
          if (breakOffset >= minBreakOffset) {
            breakOffset += 1; // Include punctuation
          }
        }
        if (breakOffset < minBreakOffset) {
          breakOffset = windowText.lastIndexOf(' ');
        }

        if (breakOffset >= minBreakOffset) {
          endIndex = startIndex + breakOffset;
        }
      }

      const chunk = normalized.slice(startIndex, endIndex).trim();
      if (chunk) {
        chunks.push(chunk);
      }

      if (endIndex >= textLength) {
        break;
      }

      // Advance startIndex with overlap, ensuring forward progress
      const nextStart = endIndex - chunkOverlap;
      startIndex = nextStart > startIndex ? nextStart : endIndex;
    }

    return chunks;
  },

  /**
   * Generates document embeddings for an array of text chunks.
   */
  generateDocumentEmbeddings: async (chunks = []) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return [];
    const embeddings = [];

    for (let i = 0; i < chunks.length; i++) {
      const vector = await EmbeddingService.generateDocumentEmbedding(chunks[i]);
      embeddings.push(vector);
      if (i < chunks.length - 1) {
        await sleep(80);
      }
    }

    return embeddings;
  },

  /**
   * Generates a query embedding for a student question.
   */
  generateQueryEmbedding: async (question) => {
    return EmbeddingService.generateQueryEmbedding(question);
  },

  /**
   * Calculates cosine similarity between two numeric vectors.
   * Safely handles invalid vectors, dimension mismatches, and zero vectors.
   */
  calculateCosineSimilarity: (vecA, vecB) => {
    if (!EmbeddingService.isValidVector(vecA) || !EmbeddingService.isValidVector(vecB)) {
      return 0;
    }

    const len = Math.min(vecA.length, vecB.length);
    if (len === 0 || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0 || !Number.isFinite(denominator)) {
      return 0;
    }

    return dotProduct / denominator;
  },

  /**
   * Indexes all eligible lessons of a published course into `ai_knowledge_chunks`.
   * Skips unchanged chunks using SHA-256 content hashes to avoid duplicate embedding calls.
   */
  indexCourseLessons: async (courseId, options = {}) => {
    const numericCourseId = Number(courseId);
    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
      const err = new Error('Mã khóa học (courseId) không hợp lệ.');
      err.statusCode = 400;
      throw err;
    }

    const course = await CourseModel.getById(numericCourseId);
    if (!course) {
      const err = new Error(`Không tìm thấy khóa học với ID ${numericCourseId}.`);
      err.statusCode = 404;
      throw err;
    }

    // Only published courses should be indexed for student-facing RAG
    if (String(course.status || '').toLowerCase() !== 'published') {
      const err = new Error('Chỉ có thể lập chỉ mục RAG cho các khóa học đã xuất bản (published).');
      err.statusCode = 400;
      throw err;
    }

    const lessons = await LessonModel.getByCourseId(numericCourseId);
    const activeLessonIds = lessons.map((l) => l.id);

    // Clean up chunks belonging to deleted lessons
    await AiKnowledgeModel.deleteOrphanChunksForCourse(numericCourseId, activeLessonIds);

    const report = {
      courseId: numericCourseId,
      courseTitle: course.title,
      totalLessons: lessons.length,
      indexedLessons: 0,
      skippedEmptyLessons: 0,
      totalChunks: 0,
      newlyEmbeddedChunks: 0,
      reusedUnchangedChunks: 0,
      failures: []
    };

    for (const lesson of lessons) {
      // Support both `lessons.content` (actual schema) and `lessons.content_text` if present
      const rawLessonText = lesson.content_text !== undefined ? lesson.content_text : lesson.content;
      const normalizedBody = RagService.normalizeText(rawLessonText);

      if (!normalizedBody) {
        report.skippedEmptyLessons += 1;
        await AiKnowledgeModel.deleteSurplusChunksForLesson(lesson.id, 0);
        continue;
      }

      const sourceTitle = lesson.title
        ? `Bài ${lesson.lesson_order || ''}: ${lesson.title}`.replace(/^Bài :\s*/, '')
        : `Bài học #${lesson.id}`;

      const rawChunks = RagService.splitTextIntoChunks(normalizedBody, options);
      if (rawChunks.length === 0) {
        report.skippedEmptyLessons += 1;
        await AiKnowledgeModel.deleteSurplusChunksForLesson(lesson.id, 0);
        continue;
      }

      const existingChunks = await AiKnowledgeModel.getChunksByLessonId(lesson.id);
      const existingByIndex = new Map(existingChunks.map((c) => [c.chunk_index, c]));

      let lessonHadSuccess = false;

      for (let idx = 0; idx < rawChunks.length; idx++) {
        const chunkBody = rawChunks[idx];
        const enrichedContent = `Khóa học: ${course.title}\nBài học: ${sourceTitle}\nNội dung: ${chunkBody}`;
        const contentHash = EmbeddingService.computeContentHash(enrichedContent);
        const existing = existingByIndex.get(idx);

        // Do not regenerate embeddings repeatedly for unchanged content
        if (
          !options.force &&
          existing &&
          existing.content_hash === contentHash &&
          EmbeddingService.isValidVector(existing.embedding)
        ) {
          report.totalChunks += 1;
          report.reusedUnchangedChunks += 1;
          lessonHadSuccess = true;
          continue;
        }

        try {
          const embedding = await EmbeddingService.generateDocumentEmbedding(enrichedContent);
          await AiKnowledgeModel.upsertChunk({
            course_id: numericCourseId,
            lesson_id: lesson.id,
            chunk_index: idx,
            content: enrichedContent,
            content_hash: contentHash,
            embedding,
            source_title: lesson.title || sourceTitle
          });

          report.totalChunks += 1;
          report.newlyEmbeddedChunks += 1;
          lessonHadSuccess = true;

          // Gentle pacing to avoid hitting Gemini API rate limits on large courses
          await sleep(60);
        } catch (chunkErr) {
          report.failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            chunkIndex: idx,
            error: chunkErr.message
          });

          // If API key is missing/invalid or rate-limited, stop immediately and surface error
          if (
            chunkErr.code === 'GEMINI_API_KEY_MISSING' ||
            chunkErr.code === 'GEMINI_API_KEY_INVALID' ||
            chunkErr.code === 'GEMINI_RATE_LIMIT'
          ) {
            throw chunkErr;
          }
        }
      }

      // Remove any surplus chunks if the lesson was shortened
      await AiKnowledgeModel.deleteSurplusChunksForLesson(lesson.id, rawChunks.length);

      if (lessonHadSuccess) {
        report.indexedLessons += 1;
      }
    }

    return report;
  },

  /**
   * Retrieves the Top-K most relevant knowledge chunks for a student's question
   * strictly scoped to the specified published course.
   */
  retrieveRelevantChunks: async (courseId, question, options = {}) => {
    const config = getGeminiConfig();
    const topK = Math.max(1, Math.min(15, Number(options.topK) || config.topK || 5));
    const minSimilarity = options.minSimilarity !== undefined ? Number(options.minSimilarity) : 0.15;

    let storedChunks = await AiKnowledgeModel.getChunksByCourseId(courseId);

    // If course has not been indexed yet, attempt automatic on-demand indexing once
    if (storedChunks.length === 0 && options.autoIndexIfEmpty !== false) {
      const lessons = await LessonModel.getByCourseId(courseId);
      const hasNonEmptyLesson = lessons.some((l) => {
        const txt = l.content_text !== undefined ? l.content_text : l.content;
        return Boolean(RagService.normalizeText(txt));
      });

      if (hasNonEmptyLesson) {
        await RagService.indexCourseLessons(courseId);
        storedChunks = await AiKnowledgeModel.getChunksByCourseId(courseId);
      }
    }

    if (storedChunks.length === 0) {
      return [];
    }

    const queryEmbedding = await RagService.generateQueryEmbedding(question);

    const scoredChunks = [];
    for (const chunk of storedChunks) {
      if (!EmbeddingService.isValidVector(chunk.embedding)) {
        continue;
      }
      const similarity = RagService.calculateCosineSimilarity(queryEmbedding, chunk.embedding);
      if (similarity >= minSimilarity) {
        scoredChunks.push({
          id: chunk.id,
          course_id: chunk.course_id,
          lesson_id: chunk.lesson_id,
          lesson_order: chunk.lesson_order,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          source_title: chunk.source_title,
          similarity: Number(similarity.toFixed(4))
        });
      }
    }

    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    return scoredChunks.slice(0, topK);
  },

  /**
   * Builds the formatted context string for the Gemini prompt and extracts unique lesson references.
   */
  buildContext: (relevantChunks = []) => {
    if (!Array.isArray(relevantChunks) || relevantChunks.length === 0) {
      return {
        contextText: '',
        sources: []
      };
    }

    const contextBlocks = [];
    const seenLessons = new Map();

    relevantChunks.forEach((chunk, idx) => {
      const orderLabel = chunk.lesson_order ? `Bài ${chunk.lesson_order}: ` : '';
      const header = `[Tài liệu #${idx + 1} | ${orderLabel}${chunk.source_title} | Độ liên quan: ${(chunk.similarity * 100).toFixed(1)}%]`;
      contextBlocks.push(`${header}\n${chunk.content}`);

      const lessonKey = `${chunk.lesson_id}:${chunk.source_title}`;
      if (!seenLessons.has(lessonKey)) {
        seenLessons.set(lessonKey, {
          lesson_id: chunk.lesson_id,
          lesson_order: chunk.lesson_order || null,
          title: chunk.source_title,
          similarity: chunk.similarity
        });
      }
    });

    return {
      contextText: contextBlocks.join('\n\n---\n\n'),
      sources: Array.from(seenLessons.values())
    };
  },

  /**
   * Builds catalog-wide public course advisory context for Course Advisor mode.
   * Only exposes PUBLIC course metadata and lesson titles (never private lesson content).
   */
  retrieveCatalogAdvisorContext: async (question, previewCourseId = null) => {
    const now = Date.now();
    let publishedCourses = catalogCache.courses;
    let lessonsByCourse = catalogCache.lessonsByCourse;

    if (!publishedCourses || !lessonsByCourse || now - catalogCache.timestamp > 60000) {
      publishedCourses = await CourseModel.getAll({ status: 'published', allStatus: false });
      const allLessons = await LessonModel.getAll();

      lessonsByCourse = new Map();
      for (const l of allLessons) {
        if (!lessonsByCourse.has(l.course_id)) {
          lessonsByCourse.set(l.course_id, []);
        }
        lessonsByCourse.get(l.course_id).push({
          id: l.id,
          lesson_order: l.lesson_order,
          title: l.title
        });
      }

      catalogCache = {
        timestamp: now,
        courses: publishedCourses,
        lessonsByCourse
      };
    }

    const STOP_WORDS = new Set([
      'hệ', 'thống', 'hiện', 'có', 'những', 'khóa', 'học', 'nào', 'mình', 'tôi',
      'muốn', 'nên', 'cho', 'về', 'giúp', 'tư', 'vấn', 'của', 'các', 'trong',
      'và', 'là', 'gì', 'với', 'được', 'không', 'người', 'mới', 'bắt', 'đầu',
      'miễn', 'phí', 'free', 'cần', 'tìm', 'hiểu', 'thêm', 'bài', 'giảng'
    ]);

    const qLower = String(question || '').toLowerCase();
    const keywords = qLower
      .replace(/[^\p{L}\p{N}\s+#.]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

    const wantsFree = /(miễn phí|\bfree\b|0đ|0\s*usd|\$0)/i.test(qLower);

    // Score each published course against the user's question
    const scoredCourses = publishedCourses.map((course) => {
      let score = 0;
      const hayTitle = String(course.title || '').toLowerCase();
      const hayCat = String(course.category || '').toLowerCase();
      const hayDesc = String(course.description || '').toLowerCase();
      const hayInst = String(course.instructor || '').toLowerCase();
      const courseLessons = lessonsByCourse.get(course.id) || [];
      const hayLessons = courseLessons.map((l) => String(l.title || '').toLowerCase()).join(' ');

      if (previewCourseId && Number(course.id) === Number(previewCourseId)) {
        score += 30;
      }

      if (wantsFree && Number(course.price) === 0) {
        score += 50;
      }

      for (const kw of keywords) {
        if (hayTitle.includes(kw)) score += 6;
        if (hayCat.includes(kw)) score += 5;
        if (hayInst.includes(kw)) score += 5;
        if (hayDesc.includes(kw)) score += 2;
        if (hayLessons.includes(kw)) score += 2;
      }

      return {
        course,
        lessons: courseLessons,
        score
      };
    });

    scoredCourses.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Number(b.course.average_rating || 0) - Number(a.course.average_rating || 0);
    });

    // Top matched courses get full public syllabus outline + clickable source cards
    const topMatches = scoredCourses.slice(0, 5);
    const positiveMatches = topMatches.filter((item) => item.score > 0);
    const cardCandidates = wantsFree
      ? positiveMatches.filter((item) => Number(item.course.price) === 0)
      : (positiveMatches.length > 0 ? positiveMatches.slice(0, 3) : topMatches.slice(0, 3));

    const sources = cardCandidates.map((item) => ({
      course_id: item.course.id,
      lesson_id: 0,
      title: item.course.title,
      category: `${item.course.category} • ${Number(item.course.price) === 0 ? 'Miễn phí' : `$${Number(item.course.price).toFixed(2)}`}`,
      instructor: item.course.instructor
    }));

    // Build catalog summary + detailed syllabus outline for top matches
    const catalogOverviewLines = publishedCourses.map((c) => {
      const priceStr = Number(c.price) === 0 ? 'Miễn phí ($0.00)' : `$${Number(c.price).toFixed(2)}`;
      const ratingStr = Number(c.average_rating || 0).toFixed(1);
      return `- Khóa học: "${c.title}" | Danh mục: ${c.category} | Giảng viên: ${c.instructor} | Học phí: ${priceStr} | Đánh giá: ${ratingStr}/5 (${c.reviews_count || 0} nhận xét, ${c.enrollments_count || 0} học viên) | Số bài học: ${c.lessons_count || 0} | Mô tả: ${c.description}`;
    });

    const topMatchDetailBlocks = topMatches.map((item, idx) => {
      const c = item.course;
      const priceStr = Number(c.price) === 0 ? 'Miễn phí ($0.00)' : `$${Number(c.price).toFixed(2)}`;
      const lessonOutline = item.lessons.length > 0
        ? item.lessons.map((l) => `   + Bài ${l.lesson_order}: ${l.title}`).join('\n')
        : '   + (Đang cập nhật danh sách bài học)';
      return `[Khóa học tiêu biểu #${idx + 1}]: ${c.title}
- Danh mục: ${c.category}
- Giảng viên: ${c.instructor}
- Học phí: ${priceStr}
- Mô tả: ${c.description}
- Đề cương các bài học (${item.lessons.length} bài):
${lessonOutline}`;
    });

    const contextText = `=== DANH MỤC KHÓA HỌC HIỆN CÓ TRÊN HỆ THỐNG (${publishedCourses.length} KHÓA HỌC ĐÃ XUẤT BẢN) ===
${catalogOverviewLines.join('\n')}

=== CHI TIẾT ĐỀ CƯƠNG CÁC KHÓA HỌC PHÙ HỢP NHẤT VỚI YÊU CẦU ===
${topMatchDetailBlocks.join('\n\n')}`;

    return {
      contextText,
      sources
    };
  }
};

module.exports = RagService;

