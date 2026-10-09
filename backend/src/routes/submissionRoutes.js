const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate } = require('../middleware/authMiddleware');

// All submission routes require authentication
router.get('/', authenticate, submissionController.getSubmissions);
router.get('/:id', authenticate, submissionController.getSubmissionById);
router.post('/', authenticate, submissionController.createSubmission);
router.put('/:id', authenticate, submissionController.updateSubmission);
router.delete('/:id', authenticate, submissionController.deleteSubmission);

module.exports = router;
