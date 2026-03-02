import mongoose, { Schema } from 'mongoose';
import { ITransaction, TransactionType, TransactionStatus } from '../types/transaction';

const TransactionSchema = new Schema<ITransaction>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(TransactionStatus),
        default: TransactionStatus.PENDING
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    description: String,

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    material: {
        type: Schema.Types.ObjectId,
        ref: 'Material'
    },
    batch: String,

    metadata: {
        type: Map,
        of: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ material: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
