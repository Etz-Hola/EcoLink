import express from 'express';
import { UserController } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   PATCH /api/v1/users/role
 * @desc    Update user role
 * @access  Private
 */
router.patch('/role', protect, UserController.updateRole);

/**
 * @route   GET /api/v1/users/organization/balance
 * @desc    Get organization balance
 * @access  Private
 */
router.get('/organization/balance', protect, UserController.getOrganizationBalance);

export default router;
