import express from 'express';
import { BranchController } from '../controllers/branchController';

const router = express.Router();

router.get('/nearby', BranchController.getNearbyBranches);

router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Branch routes working' });
});

export default router;
