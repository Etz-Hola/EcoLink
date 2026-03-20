import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', protect as any, NotificationController.getMyNotifications);
router.patch('/:id/read', protect as any, NotificationController.markAsRead);

export default router;
