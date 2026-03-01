import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate as any, NotificationController.getMyNotifications);
router.patch('/:id/read', authenticate as any, NotificationController.markAsRead);

export default router;
