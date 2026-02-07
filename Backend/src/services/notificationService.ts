import logger from '../utils/logger';

export const sendWelcomeEmail = async (email: string, name: string) => {
    logger.info(`Sending welcome email to ${email} (${name})`);
    // Mock implementation
    return Promise.resolve();
};

export const sendVerificationEmail = async (email: string, name: string) => {
    logger.info(`Sending verification email to ${email} (${name})`);
    // Mock implementation
    return Promise.resolve();
};

export const sendSMS = async (phone: string, message: string) => {
    logger.info(`Sending SMS to ${phone}: ${message}`);
    // Mock implementation
    return Promise.resolve();
};
