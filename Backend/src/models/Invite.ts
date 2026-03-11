import mongoose, { Schema } from 'mongoose';
import { IInvite, InviteStatus } from '../types/invite';
import { UserRole } from '../types/user';

const InviteSchema = new Schema<IInvite>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitedEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    businessName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
        default: UserRole.COLLECTOR
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: Object.values(InviteStatus),
        default: InviteStatus.PENDING
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
    }
}, {
    timestamps: true
});

// Indexes
InviteSchema.index({ code: 1 });
InviteSchema.index({ organizationId: 1 });
InviteSchema.index({ invitedEmail: 1 });

export default mongoose.model<IInvite>('Invite', InviteSchema);
