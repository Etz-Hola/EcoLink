import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import Transaction from '../models/Transaction';
import { PaystackService } from '../services/paystackService';
import { AppError } from '../utils/logger';
import logger from '../utils/logger';

export class PaymentController {
    /**
     * Initiate Topup
     */
    static async initiateTopup(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount } = req.body;
            const userId = (req as any).user._id;

            if (!amount || amount < 100) {
                throw new AppError('Minimum top-up amount is ₦100', 400);
            }

            const data = await PaymentService.initiateTopup(userId, amount);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify Topup
     */
    static async verifyTopup(req: Request, res: Response, next: NextFunction) {
        try {
            const { reference } = req.params;
            if (!reference) throw new AppError('Reference is required', 400);

            const transaction = await PaymentService.finalizeTopup(reference);

            res.status(200).json({
                success: true,
                data: transaction
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Paystack Webhook
     */
    static async handleWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const signature = req.headers['x-paystack-signature'] as string;
            const body = JSON.stringify(req.body);

            if (!PaystackService.verifyWebhookSignature(body, signature)) {
                return res.status(400).send('Invalid signature');
            }

            const event = req.body;
            if (event.event === 'charge.success') {
                const reference = event.data.reference;
                await PaymentService.finalizeTopup(reference);
            }

            res.status(200).send('Webhook handled');
        } catch (error) {
            logger.error('Webhook error:', error);
            res.status(500).send('Webhook error');
        }
    }

    /**
     * Get Transaction History
     */
    static async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const transactions = await Transaction.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate('sender', 'firstName lastName username')
                .populate('recipient', 'firstName lastName username')
                .populate('material', 'title');

            res.status(200).json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get Admin Payment Stats
     */
    static async getAdminStats(req: Request, res: Response, next: NextFunction) {
        try {
            if ((req as any).user.role !== 'admin') {
                throw new AppError('Unauthorized', 403);
            }

            const stats = await PaymentService.getAdminStats();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}
