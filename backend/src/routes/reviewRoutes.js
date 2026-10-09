const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/course/:courseId', reviewController.getCourseReviews);
router.post('/', authenticate, reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
