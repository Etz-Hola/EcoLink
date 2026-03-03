import express from 'express';
import { PricingController } from '../controllers/pricingController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

// Any authenticated user can read global prices (for branch default-fill and uploader estimates)
router.get('/', protect, PricingController.getGlobalPrices);
router.get('/defaults/:materialType', protect, PricingController.getDefaultPrice);

// Admin only — set / update / deactivate global prices
router.post('/update', protect, authorize(UserRole.ADMIN), PricingController.setGlobalPrice);
router.delete('/:id', protect, authorize(UserRole.ADMIN), PricingController.deactivateRule);

export default router;
