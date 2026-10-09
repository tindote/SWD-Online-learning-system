const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, assignmentController.getAssignments);
router.get('/:id', authenticate, assignmentController.getAssignmentById);

// Admin and Instructor only
router.post('/', authenticate, authorize(['admin', 'instructor']), assignmentController.createAssignment);
router.put('/:id', authenticate, authorize(['admin', 'instructor']), assignmentController.updateAssignment);
router.delete('/:id', authenticate, authorize(['admin', 'instructor']), assignmentController.deleteAssignment);

module.exports = router;
