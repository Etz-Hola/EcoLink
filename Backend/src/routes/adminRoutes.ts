import express from 'express';
import { AdminController } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

router.get('/stats', protect, authorize(UserRole.ADMIN), AdminController.getGlobalStats);
router.get('/users', protect, authorize(UserRole.ADMIN), AdminController.getUsers);
router.patch('/users/:id', protect, authorize(UserRole.ADMIN), AdminController.updateUser);
router.get('/materials', protect, authorize(UserRole.ADMIN), AdminController.getMaterials);
router.get('/bundles', protect, authorize(UserRole.ADMIN), AdminController.getBundles);
router.get('/transactions', protect, authorize(UserRole.ADMIN), AdminController.getTransactions);

export default router;
