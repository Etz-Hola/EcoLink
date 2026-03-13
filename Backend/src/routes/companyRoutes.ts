import express from 'express';
import { CompanyController } from '../controllers/companyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected: Get the authenticated exporter's own Company document (includes balance)
router.get('/my-company', protect, CompanyController.getMyCompany);

router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Company routes working' });
});

export default router;
