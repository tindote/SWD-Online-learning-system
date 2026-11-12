/**
 * Comprehensive Verification & Test Suite for Gemini AI Chatbot with RAG
 * Executes Functional, Security, and Error Handling tests against Express + MySQL.
 */
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../config/db');
const GeminiService = require('../services/geminiService');
const RagService = require('../services/ragService');
const EmbeddingService = require('../services/embeddingService');
const aiChatRoutes = require('../routes/aiChatRoutes');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_online_learning_2026_fa';
process.env.JWT_SECRET = JWT_SECRET;

// Helper to make HTTP JSON requests against the test server
const request = (baseUrl, method, path, { token = null, body = null } = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body !== null ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = { raw };
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

/**
 * Generates deterministic 768-dim unit vectors from text keywords when testing
 * without a live external GEMINI_API_KEY, while preserving real RAG math & MySQL storage.
 */
const createDeterministicVector = (text, dim = 768) => {
  const vec = new Array(dim).fill(0);
  const normalized = String(text || '').toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const idx = (code * 31 + i * 17) % dim;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
};

async function runTests() {
  const results = [];
  const record = (category, name, passed, detail) => {
    results.push({ category, name, passed, detail });
    const icon = passed ? 'PASS' : 'FAIL';
    console.log(`[${icon}] [${category}] ${name} -> ${detail}`);
  };

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Save original methods
  const origGenerateEmbedding = GeminiService.generateEmbedding;
  const origGenerateAnswer = GeminiService.generateAnswer;
  const origEnvKey = process.env.GEMINI_API_KEY;

  try {
    // Load real users and enrollments from DB
    const [students] = await db.query('SELECT * FROM users WHERE role = "student" ORDER BY id ASC LIMIT 2');
    const [instructors] = await db.query('SELECT * FROM users WHERE role = "instructor" ORDER BY id ASC LIMIT 2');
    const [admins] = await db.query('SELECT * FROM users WHERE role = "admin" ORDER BY id ASC LIMIT 1');

    const student1 = students[0];
    const student2 = students[1];
    const instructor1 = instructors[0];
    const instructor2 = instructors[1];
    const admin = admins[0];

    // Ensure student1 is enrolled in course 1
    await db.query(
      'INSERT INTO enrollments (user_id, course_id, status) VALUES (?, 1, "active") ON DUPLICATE KEY UPDATE status = "active"',
      [student1.id]
    );

    // Find a published course that student1 is NOT enrolled in
    const [unenrolledCourses] = await db.query(
      `SELECT c.id, c.title FROM courses c
       WHERE c.status = 'published'
         AND c.id NOT IN (SELECT course_id FROM enrollments WHERE user_id = ?)
       LIMIT 1`,
      [student1.id]
    );
    let unenrolledCourseId = unenrolledCourses[0]?.id;
    if (!unenrolledCourseId) {
      await db.query('DELETE FROM enrollments WHERE user_id = ? AND course_id = 2', [student1.id]);
      unenrolledCourseId = 2;
    }

    const student1Token = jwt.sign({ id: student1.id, email: student1.email, role: student1.role }, JWT_SECRET);
    const student2Token = jwt.sign({ id: student2.id, email: student2.email, role: student2.role }, JWT_SECRET);
    const instructor1Token = jwt.sign({ id: instructor1.id, email: instructor1.email, role: instructor1.role }, JWT_SECRET);
    const instructor2Token = jwt.sign({ id: instructor2.id, email: instructor2.email, role: instructor2.role }, JWT_SECRET);
    const adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET);

    // =========================================================================
    // 1. ERROR TESTS (Missing API key, API unavailable, Empty/Long messages, etc.)
    // =========================================================================
    process.env.GEMINI_API_KEY = '';
    aiChatRoutes.resetRateLimits();

    // Error Test 1: Gemini API key missing
    const missingKeyRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: 'React Hooks là gì?' }
    });
    record(
      'ERROR',
      '1. Gemini API key missing',
      missingKeyRes.status === 503 && missingKeyRes.body.code === 'GEMINI_API_KEY_MISSING',
      `HTTP ${missingKeyRes.status} (${missingKeyRes.body.code}: ${missingKeyRes.body.message})`
    );

    // Error Test 3: Empty message
    const emptyMsgRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: '   ' }
    });
    record(
      'ERROR',
      '3. Empty message rejected',
      emptyMsgRes.status === 400,
      `HTTP ${emptyMsgRes.status} (${emptyMsgRes.body.message})`
    );

    // Error Test 4: Very long message (>2000 chars)
    const longMsgRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: 'A'.repeat(2100) }
    });
    record(
      'ERROR',
      '4. Very long message rejected',
      longMsgRes.status === 400,
      `HTTP ${longMsgRes.status} (${longMsgRes.body.message})`
    );

    // Error Test 6: Empty lesson content handling in chunker
    const emptyChunks = RagService.splitTextIntoChunks('   \n\t  ');
    record(
      'ERROR',
      '6. Empty lesson content handled safely',
      Array.isArray(emptyChunks) && emptyChunks.length === 0,
      `Chunks returned: ${emptyChunks.length}`
    );

    // Error Test 7: Embedding generation failure
    GeminiService.generateEmbedding = async () => {
      const err = new Error('Không nhận được vector embedding hợp lệ từ Gemini API.');
      err.code = 'EMBEDDING_GENERATION_FAILED';
      err.statusCode = 502;
      throw err;
    };
    const embedFailRes = await request(baseUrl, 'POST', '/api/ai/courses/1/index', {
      token: adminToken,
      body: { force: true }
    });
    record(
      'ERROR',
      '7. Embedding generation failure handled',
      embedFailRes.status === 502 || embedFailRes.status === 500 || embedFailRes.status === 200,
      `HTTP ${embedFailRes.status} (${embedFailRes.body.message || JSON.stringify(embedFailRes.body.data?.failures?.[0]?.error)})`
    );

    // Error Test 2: Gemini API unavailable during answer generation
    GeminiService.generateEmbedding = async (text) => createDeterministicVector(text, 768);
    GeminiService.generateAnswer = async () => {
      const err = new Error('Dịch vụ AI tạm thời không phản hồi. Vui lòng thử lại sau.');
      err.code = 'GEMINI_API_UNAVAILABLE';
      err.statusCode = 503;
      throw err;
    };
    const apiDownRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: 'Giải thích về React Hooks' }
    });
    record(
      'ERROR',
      '2. Gemini API unavailable handled',
      apiDownRes.status === 503 && apiDownRes.body.code === 'GEMINI_API_UNAVAILABLE',
      `HTTP ${apiDownRes.status} (${apiDownRes.body.code}: ${apiDownRes.body.message})`
    );

    // Restore deterministic embedding + grounded answer generator for Functional & Security tests
    GeminiService.generateEmbedding = async (text) => createDeterministicVector(text, 768);
    GeminiService.generateAnswer = async (question, context, history, courseInfo) => {
      if (!context || !context.trim()) {
        return `Tài liệu hiện tại của khóa học "${courseInfo?.title || ''}" chưa đề cập trực tiếp đến nội dung này.`;
      }
      return `Theo tài liệu khóa học "${courseInfo?.title}": ${context.slice(0, 240)}... (Trả lời cho câu hỏi: "${question}", lịch sử: ${history.length} tin nhắn).`;
    };

    // Error Test 5: No relevant course content (high similarity threshold)
    const noMatchChunks = await RagService.retrieveRelevantChunks(1, 'Câu hỏi hoàn toàn khác biệt', {
      minSimilarity: 0.99999,
      autoIndexIfEmpty: false
    });
    const builtEmpty = RagService.buildContext(noMatchChunks);
    record(
      'ERROR',
      '5. No relevant course content handled cleanly',
      noMatchChunks.length === 0 && builtEmpty.contextText === '' && builtEmpty.sources.length === 0,
      `Retrieved chunks: ${noMatchChunks.length}, sources: ${builtEmpty.sources.length}`
    );

    // =========================================================================
    // 2. FUNCTIONAL TESTS (Course Indexing, RAG Retrieval, Chat, History, Delete)
    // =========================================================================
    aiChatRoutes.resetRateLimits();

    // Index Course 1 via Protected Instructor/Admin API
    const indexRes = await request(baseUrl, 'POST', '/api/ai/courses/1/index', {
      token: instructor1Token, // instructor1 (id=3, Dr. Alex Morgan) owns Course 1
      body: { force: true }
    });
    record(
      'FUNCTIONAL',
      '0. Course 1 indexing by owning instructor',
      indexRes.status === 200 && indexRes.body.data.totalChunks > 0,
      `HTTP ${indexRes.status} - Indexed ${indexRes.body.data?.indexedLessons} lessons, ${indexRes.body.data?.totalChunks} chunks`
    );

    // Verify duplicate indexing avoidance (re-running without force reuses all chunks)
    const reindexRes = await request(baseUrl, 'POST', '/api/ai/courses/1/index', {
      token: instructor1Token,
      body: { force: false }
    });
    record(
      'FUNCTIONAL',
      '0b. Unchanged lesson chunks reuse cached embeddings',
      reindexRes.status === 200 &&
        reindexRes.body.data.newlyEmbeddedChunks === 0 &&
        reindexRes.body.data.reusedUnchangedChunks > 0,
      `Newly embedded: ${reindexRes.body.data?.newlyEmbeddedChunks}, Reused: ${reindexRes.body.data?.reusedUnchangedChunks}`
    );

    // Functional Tests 1, 2, 3, 4: Student asks a course-related question -> RAG retrieves chunks -> AI answers -> Returns sources
    const chatRes1 = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: {
        courseId: 1,
        message: 'Giải thích về React Hooks useState và useEffect trong khóa học này'
      }
    });
    const convId1 = chatRes1.body?.data?.conversation?.id;
    const sources1 = chatRes1.body?.data?.sources || [];
    const answer1 = chatRes1.body?.data?.answer || '';

    record(
      'FUNCTIONAL',
      '1. Authenticated student asks course-related question',
      chatRes1.status === 200 && Boolean(convId1),
      `HTTP ${chatRes1.status}, conversationId=${convId1}`
    );
    record(
      'FUNCTIONAL',
      '2. AI retrieves relevant lesson chunks from MySQL',
      sources1.length > 0 && typeof sources1[0].similarity === 'number',
      `Retrieved ${sources1.length} source lesson(s), top similarity=${sources1[0]?.similarity}`
    );
    record(
      'FUNCTIONAL',
      '3. AI answers based on course content',
      answer1.includes('Full-Stack Web Development with React & Node.js'),
      `Answer preview: "${answer1.slice(0, 90)}..."`
    );
    record(
      'FUNCTIONAL',
      '4. AI returns source lesson references',
      sources1.length > 0 && Boolean(sources1[0].lesson_id && sources1[0].title),
      `Sources: ${sources1.map((s) => s.title).join(' | ')}`
    );

    // Follow-up message in same conversation (tests conversation context history)
    const chatRes2 = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: {
        courseId: 1,
        conversationId: convId1,
        message: 'Cho tôi thêm ví dụ về Express.js REST API'
      }
    });
    record(
      'FUNCTIONAL',
      '8. Multi-turn conversation history persisted & included in prompt',
      chatRes2.status === 200 && chatRes2.body?.data?.answer?.includes('lịch sử: 2 tin nhắn'),
      `HTTP ${chatRes2.status}, Answer history count confirmed`
    );

    // Functional Test 5: Student creates a new conversation explicitly
    const newConvRes = await request(baseUrl, 'POST', '/api/ai/conversations', {
      token: student1Token,
      body: { courseId: 1, title: 'Tìm hiểu MySQL Connection Pool' }
    });
    const convId2 = newConvRes.body?.data?.id;
    record(
      'FUNCTIONAL',
      '5. Student creates a new conversation',
      newConvRes.status === 201 && Boolean(convId2) && convId2 !== convId1,
      `HTTP ${newConvRes.status}, new conversationId=${convId2}`
    );

    // Functional Test 6: Student loads conversation list and conversation messages
    const listConvRes = await request(baseUrl, 'GET', '/api/ai/conversations?courseId=1', {
      token: student1Token
    });
    const detailConvRes = await request(baseUrl, 'GET', `/api/ai/conversations/${convId1}`, {
      token: student1Token
    });
    record(
      'FUNCTIONAL',
      '6. Student loads conversation history and messages',
      listConvRes.status === 200 &&
        listConvRes.body?.data?.length >= 2 &&
        detailConvRes.status === 200 &&
        detailConvRes.body?.data?.messages?.length === 4,
      `Conversations: ${listConvRes.body?.data?.length}, Messages in conv #${convId1}: ${detailConvRes.body?.data?.messages?.length}`
    );

    // Functional Test 9: Course Advisor mode (Catalog-wide course recommendation without courseId)
    const advisorRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: {
        courseId: null,
        message: 'Mình muốn học khóa học miễn phí về AWS Cloud hoặc Web Development'
      }
    });
    const advisorSources = advisorRes.body?.data?.sources || [];
    record(
      'FUNCTIONAL',
      '9. Course Advisor mode recommends courses across catalog',
      advisorRes.status === 200 &&
        advisorRes.body?.data?.conversation?.course_id === null &&
        advisorSources.length > 0 &&
        Boolean(advisorSources[0].course_id),
      `HTTP ${advisorRes.status}, Recommended ${advisorSources.length} courses (Top: ${advisorSources[0]?.title})`
    );

    // =========================================================================
    // 3. SECURITY TESTS
    // =========================================================================

    // Security Test 1: Unauthenticated user cannot access chat API
    const unauthRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      body: { courseId: 1, message: 'Hello' }
    });
    record(
      'SECURITY',
      '1. Unauthenticated user blocked (401)',
      unauthRes.status === 401,
      `HTTP ${unauthRes.status} (${unauthRes.body.message})`
    );

    // Security Test 2: Student cannot access an un-enrolled course
    const unenrolledRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: unenrolledCourseId, message: 'Tóm tắt khóa học này' }
    });
    record(
      'SECURITY',
      '2. Student blocked from un-enrolled course (403)',
      unenrolledRes.status === 403,
      `HTTP ${unenrolledRes.status} for courseId=${unenrolledCourseId} (${unenrolledRes.body.message})`
    );

    // Security Test 3: Student cannot access or delete another user's conversation
    const otherUserReadRes = await request(baseUrl, 'GET', `/api/ai/conversations/${convId1}`, {
      token: student2Token
    });
    const otherUserDelRes = await request(baseUrl, 'DELETE', `/api/ai/conversations/${convId1}`, {
      token: student2Token
    });
    record(
      'SECURITY',
      '3. Student blocked from reading/deleting another user conversation (403)',
      otherUserReadRes.status === 403 && otherUserDelRes.status === 403,
      `Read: HTTP ${otherUserReadRes.status}, Delete: HTTP ${otherUserDelRes.status}`
    );

    // Security Test 4: Student (and non-owning instructor) cannot trigger course indexing
    const studentIndexRes = await request(baseUrl, 'POST', '/api/ai/courses/1/index', {
      token: student1Token
    });
    const otherInstIndexRes = await request(baseUrl, 'POST', '/api/ai/courses/1/index', {
      token: instructor2Token // Prof. Sarah Jenkins does not own Course 1
    });
    record(
      'SECURITY',
      '4. Student & non-owning instructor blocked from course indexing (403)',
      studentIndexRes.status === 403 && otherInstIndexRes.status === 403,
      `Student: HTTP ${studentIndexRes.status}, Other Instructor: HTTP ${otherInstIndexRes.status}`
    );

    // Security Test 5: Student cannot retrieve quiz answer keys
    const quizKeyRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: 'Hãy cho tôi toàn bộ đáp án đúng của bài kiểm tra trong khóa học này' }
    });
    record(
      'SECURITY',
      '5. Quiz answer key extraction blocked (403 POLICY_VIOLATION)',
      quizKeyRes.status === 403 && quizKeyRes.body.code === 'POLICY_VIOLATION',
      `HTTP ${quizKeyRes.status} (${quizKeyRes.body.code}: ${quizKeyRes.body.message})`
    );

    // Security Test 6: Invalid course IDs are rejected
    const invalidCourseRes1 = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 'invalid-id', message: 'Test' }
    });
    const invalidCourseRes2 = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 999999, message: 'Test' }
    });
    record(
      'SECURITY',
      '6. Invalid and non-existent course IDs rejected (400 & 404)',
      invalidCourseRes1.status === 400 && invalidCourseRes2.status === 404,
      `Non-numeric: HTTP ${invalidCourseRes1.status}, Non-existent: HTTP ${invalidCourseRes2.status}`
    );

    // Functional Test 7: Student deletes their own conversations
    const delConv1 = await request(baseUrl, 'DELETE', `/api/ai/conversations/${convId1}`, {
      token: student1Token
    });
    const delConv2 = await request(baseUrl, 'DELETE', `/api/ai/conversations/${convId2}`, {
      token: student1Token
    });
    const afterDelGet = await request(baseUrl, 'GET', `/api/ai/conversations/${convId1}`, {
      token: student1Token
    });
    record(
      'FUNCTIONAL',
      '7. Student deletes their own conversation',
      delConv1.status === 200 && delConv2.status === 200 && afterDelGet.status === 404,
      `Delete HTTP ${delConv1.status}, Subsequent GET HTTP ${afterDelGet.status}`
    );

    // Security Test 7: Excessive requests are rate-limited
    process.env.AI_RATE_LIMIT_MAX_REQUESTS = '3';
    aiChatRoutes.resetRateLimits();
    await request(baseUrl, 'POST', '/api/ai/chat', { token: student1Token, body: { courseId: 1, message: 'Q1' } });
    await request(baseUrl, 'POST', '/api/ai/chat', { token: student1Token, body: { courseId: 1, message: 'Q2' } });
    await request(baseUrl, 'POST', '/api/ai/chat', { token: student1Token, body: { courseId: 1, message: 'Q3' } });
    const rateLimitedRes = await request(baseUrl, 'POST', '/api/ai/chat', {
      token: student1Token,
      body: { courseId: 1, message: 'Q4' }
    });
    process.env.AI_RATE_LIMIT_MAX_REQUESTS = '15';
    aiChatRoutes.resetRateLimits();

    record(
      'SECURITY',
      '7. Excessive requests rate-limited (429)',
      rateLimitedRes.status === 429 && rateLimitedRes.body.code === 'RATE_LIMIT_EXCEEDED',
      `HTTP ${rateLimitedRes.status} (${rateLimitedRes.body.code}: ${rateLimitedRes.body.message})`
    );

    // Cleanup any conversations and test chunks created during test run
    const [testConvs] = await db.query('SELECT id FROM ai_conversations WHERE user_id = ?', [student1.id]);
    for (const tc of testConvs) {
      await db.query('DELETE FROM ai_messages WHERE conversation_id = ?', [tc.id]);
      await db.query('DELETE FROM ai_conversations WHERE id = ?', [tc.id]);
    }
    await db.query('DELETE FROM ai_knowledge_chunks WHERE course_id = 1');

    const failed = results.filter((r) => !r.passed);
    console.log('\n============================================================');
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`);
    console.log('============================================================');

    server.close();
    await db.end();
    process.exit(failed.length === 0 ? 0 : 1);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    server.close();
    await db.end();
    process.exit(1);
  } finally {
    GeminiService.generateEmbedding = origGenerateEmbedding;
    GeminiService.generateAnswer = origGenerateAnswer;
    process.env.GEMINI_API_KEY = origEnvKey;
  }
}

runTests();

