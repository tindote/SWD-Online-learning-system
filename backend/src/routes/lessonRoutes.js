const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticate, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, lessonController.getLessons);
router.get('/:id', optionalAuth, lessonController.getLessonById);

// Admin and Instructor only
router.post('/', authenticate, authorize(['admin', 'instructor']), lessonController.createLesson);
router.put('/:id', authenticate, authorize(['admin', 'instructor']), lessonController.updateLesson);
router.delete('/:id', authenticate, authorize(['admin', 'instructor']), lessonController.deleteLesson);

module.exports = router;
