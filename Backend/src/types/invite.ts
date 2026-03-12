import { Document, Types } from 'mongoose';
import { UserRole } from './user';

export enum InviteStatus {
    PENDING = 'pending',
    USED = 'used',
    EXPIRED = 'expired',
    REVOKED = 'revoked'
}

export interface IInvite extends Document {
    _id: Types.ObjectId;
    code: string;
    organizationId?: Types.ObjectId;
    invitedEmail?: string;
    businessName?: string;
    role: UserRole;
    createdBy: Types.ObjectId;
    usedBy?: Types.ObjectId;
    status: InviteStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}