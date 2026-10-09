const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public route to view categories
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only management
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
