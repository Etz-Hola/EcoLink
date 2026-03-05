import logger from '../utils/logger';
import Notification from '../models/Notification';

export const sendWelcomeEmail = async (email: string, name: string) => {
    logger.info(`Sending welcome email to ${email} (${name})`);
    return Promise.resolve();
};

export const sendVerificationEmail = async (email: string, name: string) => {
    logger.info(`Sending verification email to ${email} (${name})`);
    return Promise.resolve();
};

export const sendSMS = async (phone: string, message: string) => {
    logger.info(`Sending SMS to ${phone}: ${message}`);
    return Promise.resolve();
};

export const NotificationService = {
    sendNotification: async (userId: string, data: { title: string; message: string; type: 'payment' | 'material' | 'system'; metadata?: any }) => {
        try {
            const User = require('../models/User').default;
            const user = await User.findById(userId).select('organizationId');
            const organizationId = user?.organizationId || userId;

            await Notification.create({
                user: userId,
                organizationId,
                title: data.title,
                message: data.message,
                type: data.type,
                metadata: data.metadata
            });
            logger.info(`Notification saved for user ${userId} (Org: ${organizationId}): ${data.title}`);
        } catch (error) {
            logger.error(`Failed to save notification for user ${userId}:`, error);
        }
    },

    sendMaterialStatusUpdate: async (userId: string, materialId: string, previousStatus: string, currentStatus: string) => {
        const title = `Material Status: ${currentStatus.toUpperCase()}`;
        const message = `Your material upload has been updated from ${previousStatus} to ${currentStatus}.`;

        await NotificationService.sendNotification(userId, {
            title,
            message,
            type: 'material',
            metadata: { materialId, previousStatus, currentStatus }
        });
    },

    getUserNotifications: async (userId: string, limit = 20) => {
        const user = await require('../models/User').default.findById(userId).select('organizationId');
        const organizationId = user?.organizationId || userId;

        return await Notification.find({
            $or: [
                { user: userId },
                { organizationId: organizationId }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    },

    markAsRead: async (notificationId: string) => {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }
};
