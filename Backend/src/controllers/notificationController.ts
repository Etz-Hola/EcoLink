import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import logger from '../utils/logger';

export class NotificationController {
    /**
     * Get all notifications for the authenticated user
     */
    static async getMyNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?._id || (req as any).user?.id;

            if (!userId) { 
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const notifications = await NotificationService.getUserNotifications(userId.toString());

            res.json({
                success: true,
                data: notifications,
            });
        } catch (error: any) {
            logger.error('Error fetching notifications:', error);
            res.status(500).json({ success: false, message: error.message || 'Internal server error' });
        }
    }

    /**
     * Mark a single notification as read
     */
    static async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?._id || (req as any).user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id } = req.params;

            // Type guard: ensure id exists and is string
            if (!id || typeof id !== 'string') {
                res.status(400).json({ success: false, message: 'Notification ID is required' });
                return;
            }

            await NotificationService.markAsRead(id);

            res.json({
                success: true,
                message: 'Notification marked as read',
            });
        } catch (error: any) {
            logger.error('Error marking notification as read:', error);
            res.status(500).json({ success: false, message: error.message || 'Internal server error' });
        }
    }
}