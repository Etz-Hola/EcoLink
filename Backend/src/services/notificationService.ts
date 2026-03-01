import logger from '../utils/logger';

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

export class NotificationService {
    static async sendNotification(userId: string, data: { title: string; message: string; type: string }) {
        logger.info(`Sending ${data.type} notification to user ${userId}: ${data.title} - ${data.message}`);
        return Promise.resolve();
    }
}
