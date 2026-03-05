import { Types } from 'mongoose';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { TransactionType, TransactionStatus } from '../types/transaction';
import { PaystackService } from './paystackService';
import logger from '../utils/logger';
import { AppError } from '../utils/logger';
import { NotificationService } from './notificationService';

export class PaymentService {
    /**
     * Initialize Topup
     */
    static async initiateTopup(userId: string, amount: number) {
        const user = await User.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        const paystackSession = await PaystackService.initializeTransaction(
            user.email || `${user.username}@ecolink.com`,
            amount,
            { userId, type: TransactionType.TOPUP }
        );

        // Create pending transaction
        await Transaction.create({
            user: userId,
            organizationId: user.organizationId || user._id,
            type: TransactionType.TOPUP,
            status: TransactionStatus.PENDING,
            amount,
            reference: paystackSession.data.reference,
            description: `Top-up via Paystack`
        });

        return paystackSession.data;
    }

    /**
     * Finalize Topup (Verify and update balance)
     */
    static async finalizeTopup(reference: string) {
        const transaction = await Transaction.findOne({ reference });
        if (!transaction) throw new AppError('Transaction not found', 404);
        if (transaction.status !== TransactionStatus.PENDING) return transaction;

        const verification = await PaystackService.verifyTransaction(reference);

        if (verification.data.status === 'success') {
            const amount = verification.data.amount / 100; // back to NGN

            transaction.status = TransactionStatus.SUCCESS;
            await transaction.save();

            // Update user/organization balance
            const targetId = transaction.organizationId || transaction.user;
            await User.findByIdAndUpdate(targetId, {
                $inc: { balance: amount }
            });

            logger.info(`Top-up successful for org/user ${targetId}: ₦${amount}`);

            // Notify user
            NotificationService.sendNotification(transaction.user.toString(), {
                title: 'Top-up Successful',
                message: `Your account has been credited with ₦${amount.toLocaleString()}`,
                type: 'payment'
            } as any);

        } else {
            transaction.status = TransactionStatus.FAILED;
            await transaction.save();
        }

        return transaction;
    }

    /**
     * Process Internal Transfer (Branch to Collector or Exporter to Branch)
     * Deducts commission and moves money between balances.
     */
    static async processInternalTransfer(
        materialId: string,
        senderId: string,
        recipientId: string,
        fullAmount: number,
        batchId?: string
    ) {
        const session = await User.startSession();
        session.startTransaction();

        try {
            const sender = await User.findById(senderId).session(session);
            const recipient = await User.findById(recipientId).session(session);

            const senderOrgId = sender.organizationId || sender._id;
            const recipientOrgId = recipient.organizationId || recipient._id;

            const senderOrg = await User.findById(senderOrgId).session(session);
            const recipientOrg = await User.findById(recipientOrgId).session(session);

            // Commission calculation (2-5%, let's use 5% as default)
            const commissionRate = 0.05;
            const commissionAmount = fullAmount * commissionRate;
            const netAmount = fullAmount - commissionAmount;

            if (!senderOrg || !recipientOrg) throw new AppError('Sender or Recipient organization not found', 404);
            if (senderOrg.balance < fullAmount) throw new AppError('Insufficient balance in organization account', 400);

            // Deduct from sender organization
            senderOrg.balance -= fullAmount;
            await senderOrg.save({ session });

            // Add to recipient organization
            recipientOrg.balance += netAmount;
            await recipientOrg.save({ session });

            // Add to Admin (Commission aggregation)
            // Find an admin user to hold the platform balance
            const admin = await User.findOne({ role: 'admin' }).session(session);
            if (admin) {
                admin.balance += commissionAmount;
                await admin.save({ session });
            }

            // Record Transactions
            const reference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Transfer record
            await Transaction.create([{
                user: recipientId,
                organizationId: recipientOrgId,
                sender: senderId,
                recipient: recipientId,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.SUCCESS,
                amount: netAmount,
                reference,
                description: `Payment for material approval`,
                material: materialId,
                batch: batchId
            }], { session });

            // Commission record
            await Transaction.create([{
                user: admin?._id || senderId,
                organizationId: admin?.organizationId || admin?._id || senderOrgId,
                type: TransactionType.COMMISSION,
                status: TransactionStatus.SUCCESS,
                amount: commissionAmount,
                reference: `COM-${reference}`,
                description: `Platform commission from transfer ${reference}`,
                material: materialId
            }], { session });

            await session.commitTransaction();
            logger.info(`Transfer successful: ₦${netAmount} to ${recipientId}, ₦${commissionAmount} commission`);

            // Notify recipient
            NotificationService.sendNotification(recipientId.toString(), {
                title: 'Payment Received',
                message: `You received ₦${netAmount.toLocaleString()} from batch approval.`,
                type: 'payment'
            } as any);

        } catch (error) {
            await session.abortTransaction();
            logger.error('Internal transfer failed:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get Admin Stats (Total balance and commissions)
     */
    static async getAdminStats() {
        const totalUserBalance = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);

        const totalCommissions = await Transaction.aggregate([
            { $match: { type: TransactionType.COMMISSION, status: TransactionStatus.SUCCESS } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            totalCirculatingBalance: totalUserBalance[0]?.total || 0,
            totalCommissionsEarned: totalCommissions[0]?.total || 0
        };
    }
}
