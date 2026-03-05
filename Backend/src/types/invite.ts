import { Document, Types } from 'mongoose';
import { UserRole } from './user';

export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired'
}

export interface IInvite extends Document {
    _id: Types.ObjectId;
    code: string;
    organizationId: Types.ObjectId; // The entity that created the invite
    invitedEmail?: string;
    role: UserRole; // Role to assign to the new user (e.g., manager, staff)
    createdBy: Types.ObjectId;
    status: InviteStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
