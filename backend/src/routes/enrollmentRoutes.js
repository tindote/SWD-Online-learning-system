const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Student self-enrollment & my-enrollments
router.get('/my-enrollments', authenticate, enrollmentController.getMyEnrollments);
router.post('/enroll', authenticate, enrollmentController.enrollInCourse);

// General management
router.get('/', authenticate, enrollmentController.getEnrollments);
router.get('/:id', authenticate, enrollmentController.getEnrollmentById);
router.post('/', authenticate, authorize('admin'), enrollmentController.createEnrollment);
router.put('/:id', authenticate, authorize(['admin', 'instructor']), enrollmentController.updateEnrollment);
router.delete('/:id', authenticate, enrollmentController.deleteEnrollment);

module.exports = router;
