import { Document, Types } from 'mongoose';

export enum UserRole {
  COLLECTOR = 'collector',
  BRANCH = 'branch',
  BUYER = 'buyer',
  ORGANIZATION = 'organization',
  ADMIN = 'admin',
  PENDING = 'pending'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum AuthProvider {
  EMAIL = 'email',
  PHONE = 'phone',
  WALLET = 'wallet',
  GOOGLE = 'google'
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;

  // Profile information
  firstName: string;
  lastName: string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';

  // Location
  location?: ILocation;

  // Verification
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYCVerified: boolean;
  verificationDocuments?: string[];

  // Business information (for branches, buyers)
  businessName?: string;
  businessRegistrationNumber?: string;
  businessType?: string;

  // Statistics
  totalEarnings: number;
  totalMaterialsSubmitted: number;
  ecoPoints: number;
  rating: number;
  reviewCount: number;

  // Settings
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  // Timestamps
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

export interface ILoginCredentials {
  identifier: string; // email, phone, or wallet address
  password?: string;
  signature?: string; // For wallet authentication
  message?: string; // For wallet authentication
}

export interface IRegisterData {
  username: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  authProvider: AuthProvider;
  location?: ILocation;
  businessName?: string;
  businessType?: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: Partial<IUser>;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  newUsersThisMonth: number;
  topPerformers: Partial<IUser>[];
}