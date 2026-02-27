import express from 'express';
import { AdminController } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

router.get('/stats', protect, authorize(UserRole.ADMIN), AdminController.getGlobalStats);
router.get('/tracking', protect, authorize(UserRole.ADMIN), AdminController.getUserTracking);

export default router;
