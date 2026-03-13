import express from 'express';
import { BranchController } from '../controllers/branchController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected: Get the authenticated user's own Branch document (includes balance)
router.get('/my-branch', protect, BranchController.getMyBranch);

// Public: Get nearby branches by coordinates
router.get('/nearby', BranchController.getNearbyBranches);

router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Branch routes working' });
});

export default router;
