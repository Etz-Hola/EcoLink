import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import logger from '../utils/logger';

export class NotificationController {
    static async getMyNotifications(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const notifications = await NotificationService.getUserNotifications(userId);

            res.json({
                success: true,
                data: notifications
            });
        } catch (error: any) {
            logger.error('Error fetching notifications:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await NotificationService.markAsRead(id);

            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error: any) {
            logger.error('Error marking notification as read:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
