import express from 'express';
import { BundleController } from '../controllers/bundleController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

router.post('/create', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), BundleController.createBundle);
router.get('/available', protect, authorize(UserRole.EXPORTER, UserRole.BUYER, UserRole.ADMIN), BundleController.getAvailableBundles);
router.patch('/:id/purchase', protect, authorize(UserRole.EXPORTER, UserRole.BUYER, UserRole.ADMIN), BundleController.purchaseBundle);

export default router;
