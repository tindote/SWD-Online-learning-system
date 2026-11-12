const express = require('express');
const router = express.Router();
const AiChatController = require('../controllers/aiChatController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * Sliding-window rate limiter for AI endpoints to prevent abuse and protect Gemini API quotas.
 * Configurable via AI_RATE_LIMIT_WINDOW_MS (default 60s) and AI_RATE_LIMIT_MAX_REQUESTS (default 15).
 */
const rateLimitBuckets = new Map();

const createAiRateLimiter = (options = {}) => {
  return (req, res, next) => {
    const windowMs = parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || String(options.windowMs || 60000), 10) || 60000;
    const maxRequests = parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || String(options.maxRequests || 15), 10) || 15;

    const userKey = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || 'unknown'}`;
    const bucketKey = `${options.prefix || 'ai'}:${userKey}`;
    const now = Date.now();

    const timestamps = rateLimitBuckets.get(bucketKey) || [];
    const recentTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (recentTimestamps.length >= maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - recentTimestamps[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Bạn đã gửi quá nhiều yêu cầu tới Trợ lý AI. Vui lòng thử lại sau ${retryAfterSec} giây.`
      });
    }

    recentTimestamps.push(now);
    rateLimitBuckets.set(bucketKey, recentTimestamps);
    return next();
  };
};

// Expose reset helper for automated test suites
router.resetRateLimits = () => rateLimitBuckets.clear();

const chatRateLimiter = createAiRateLimiter({ prefix: 'chat', windowMs: 60000, maxRequests: 15 });
const indexRateLimiter = createAiRateLimiter({ prefix: 'index', windowMs: 60000, maxRequests: 10 });

// All AI endpoints require JWT authentication
router.use(authenticate);

// Chat & Conversation Endpoints
router.post('/chat', chatRateLimiter, AiChatController.chat);
router.post('/conversations', AiChatController.createConversation);
router.get('/conversations', AiChatController.getConversations);
router.get('/conversations/:id', AiChatController.getConversationById);
router.delete('/conversations/:id', AiChatController.deleteConversation);

// Protected Course Indexing Endpoint (Restricted to INSTRUCTOR and ADMIN roles, plus ownership check in service)
router.post(
  '/courses/:courseId/index',
  authorize(['instructor', 'admin']),
  indexRateLimiter,
  AiChatController.indexCourse
);

module.exports = router;

