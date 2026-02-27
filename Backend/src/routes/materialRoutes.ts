import express from 'express';
import { MaterialController } from '../controllers/materialController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

// Public/Semi-public routes
router.get('/pending', MaterialController.getPendingMaterials);

// Protected routes
router.post('/upload', protect, authorize(UserRole.COLLECTOR, UserRole.ORGANIZATION, UserRole.HOTEL), MaterialController.uploadMaterials);
router.get('/me', protect, MaterialController.getMyMaterials);
router.patch('/:id/review', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), MaterialController.reviewMaterial);

export default router;
