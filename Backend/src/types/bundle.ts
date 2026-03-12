import { Document, Types } from 'mongoose';

export enum BundleStatus {
    AVAILABLE = 'available',
    REQUESTED = 'requested',
    PURCHASED = 'purchased',
    IN_TRANSIT = 'in_transit',
    COLLECTED = 'collected',
    SOLD = 'sold'
}

export interface IBundle extends Document {
    _id: Types.ObjectId;
    name: string;
    materialIds: Types.ObjectId[];
    branchId: Types.ObjectId;
    organizationId: Types.ObjectId; // Organization/Entity who owns the bundle
    exporterId?: Types.ObjectId;
    status: BundleStatus;
    totalWeight: number;
    totalPrice: number;
    currency: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBundleCreateData {
    name: string;
    materialIds: string[];
    description?: string;
}
