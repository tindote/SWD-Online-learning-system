const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// General / Admin dashboard stats
router.get('/stats', dashboardController.getDashboardStats);

// Instructor-specific dashboard stats
router.get('/instructor', authenticate, authorize(['instructor', 'admin']), dashboardController.getInstructorStats);

// Student-specific dashboard stats
router.get('/student', authenticate, dashboardController.getStudentStats);

module.exports = router;
