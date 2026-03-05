import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All payment routes are protected
router.use(protect);

router.post('/topup', PaymentController.initiateTopup);
router.get('/verify/:reference', PaymentController.verifyTopup);
router.post('/withdraw', PaymentController.withdraw);
router.get('/history', PaymentController.getTransactionHistory);
router.get('/admin/stats', PaymentController.getAdminStats);

// Webhook is public (verification handled in controller)
router.post('/webhook', PaymentController.handleWebhook);

export default router;
