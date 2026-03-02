import { Document, Types } from 'mongoose';

export enum TransactionType {
    TOPUP = 'topup',
    WITHDRAWAL = 'withdrawal',
    TRANSFER = 'transfer',
    COMMISSION = 'commission',
    REFUND = 'refund'
}

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export interface ITransaction extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId; // User whose balance is affected (for transfers, this is the recipient or sender depending on context)
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    reference: string; // Internal or external reference (e.g., Paystack reference)
    description: string;

    // For transfers
    sender?: Types.ObjectId;
    recipient?: Types.ObjectId;

    // For material-related payments
    material?: Types.ObjectId;
    batch?: string;

    // Metadata
    metadata?: Record<string, any>;

    createdAt: Date;
    updatedAt: Date;
}
