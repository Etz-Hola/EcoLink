import express from 'express';
import { BundleController } from '../controllers/bundleController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

router.post('/create', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), BundleController.createBundle);
router.get('/available', protect, authorize(UserRole.EXPORTER, UserRole.BUYER, UserRole.ADMIN), BundleController.getAvailableBundles);
router.get('/my-bundles', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), BundleController.getMyBundles);
router.patch('/:id/purchase', protect, authorize(UserRole.EXPORTER, UserRole.BUYER, UserRole.ADMIN), BundleController.purchaseBundle);
router.patch('/:id/accept-request', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), BundleController.acceptBundleRequest);
router.patch('/:id/verify-receipt', protect, authorize(UserRole.EXPORTER, UserRole.BUYER, UserRole.ADMIN), BundleController.verifyBundleReceipt);

export default router;
