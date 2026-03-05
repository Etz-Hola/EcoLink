import mongoose, { Schema } from 'mongoose';
import { IBundle, BundleStatus } from '../types/bundle';

const BundleSchema = new Schema<IBundle>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    materialIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    }],
    branchId: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exporterId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: Object.values(BundleStatus),
        default: BundleStatus.AVAILABLE
    },
    totalWeight: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Indexes
BundleSchema.index({ branchId: 1, status: 1 });
BundleSchema.index({ organizationId: 1, status: 1 });
BundleSchema.index({ exporterId: 1 });
BundleSchema.index({ status: 1 });
BundleSchema.index({ createdAt: -1 });

export default mongoose.model<IBundle>('Bundle', BundleSchema);
