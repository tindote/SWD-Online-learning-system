const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All user management routes require admin role
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;
