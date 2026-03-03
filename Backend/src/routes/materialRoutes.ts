import express from 'express';
import { MaterialController } from '../controllers/materialController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

import multer from 'multer';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

// Public/Semi-public routes
router.get('/pending', MaterialController.getPendingMaterials);

// Protected routes
router.post('/upload', protect, authorize(UserRole.COLLECTOR, UserRole.ORGANIZATION, UserRole.HOTEL), upload.any(), MaterialController.uploadMaterials);
router.get('/me', protect, MaterialController.getMyMaterials);
router.get('/my', protect, MaterialController.getMyMaterials); // Alias for convenience
router.patch('/:id/review', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), MaterialController.reviewMaterial);
router.patch('/:id/verify', protect, authorize(UserRole.BRANCH, UserRole.ADMIN), MaterialController.verifyMaterial);

// New: Collector-initiated actions
router.patch('/:id/schedule-pickup', protect, authorize(UserRole.COLLECTOR, UserRole.ORGANIZATION, UserRole.HOTEL), MaterialController.schedulePickup);
router.post('/:id/appeal', protect, authorize(UserRole.COLLECTOR, UserRole.ORGANIZATION, UserRole.HOTEL), MaterialController.appealMaterial);

export default router;
