import { Document, Types } from 'mongoose';
import { ILocation } from './user';

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended'
}

export interface ICompany extends Document {
  _id: Types.ObjectId;

  // Basic info
  name: string;
  description?: string;
  businessType?: string;

  // Owner
  ownerId: Types.ObjectId;

  // Status
  status: CompanyStatus;

  // Location
  location?: ILocation;

  // Financial
  balance: number;
  currency: string;

  // Verification
  isVerified: boolean;
  licenseNumber?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyRegistrationData {
  name: string;
  description?: string;
  businessType?: string;
  location?: ILocation;
}
