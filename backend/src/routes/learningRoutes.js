const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/:courseId', authenticate, learningController.getCourseLearning);
router.post('/toggle', authenticate, learningController.toggleLessonProgress);

module.exports = router;
