const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, optionalAuth, authorize } = require('../middleware/authMiddleware');

// Public route to view course catalog & details (with optional auth to detect enrollment)
router.get('/', optionalAuth, courseController.getCourses);
router.get('/instructor/my-courses', authenticate, authorize(['instructor', 'admin']), courseController.getMyInstructorCourses);
router.get('/:id', optionalAuth, courseController.getCourseById);

// Protected routes (Instructor and Admin can manage courses)
router.post('/', authenticate, authorize(['admin', 'instructor']), courseController.createCourse);
router.put('/:id', authenticate, authorize(['admin', 'instructor']), courseController.updateCourse);
router.delete('/:id', authenticate, authorize(['admin', 'instructor']), courseController.deleteCourse);

module.exports = router;
