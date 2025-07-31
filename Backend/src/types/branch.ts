import { Document, Types } from 'mongoose';
import { ILocation } from './user';

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  MAINTENANCE = 'maintenance'
}

export enum BranchType {
  COLLECTION_POINT = 'collection_point',
  PROCESSING_HUB = 'processing_hub',
  SORTING_CENTER = 'sorting_center',
  TREATMENT_FACILITY = 'treatment_facility',
  MAIN_HUB = 'main_hub'
}

export interface IOperatingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string; // HH:MM format
  close: string; // HH:MM format
  isOpen: boolean;
}

export interface ICapacity {
  current: number; // kg
  maximum: number; // kg
  reserved: number; // kg
  available: number; // kg
  lastUpdated: Date;
}

export interface IEquipment {
  name: string;
  type: 'scale' | 'crusher' | 'shredder' | 'cleaner' | 'sorter' | 'other';
  capacity: number;
  status: 'operational' | 'maintenance' | 'broken';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface IProcessingCapability {
  materialTypes: string[];
  treatments: string[];
  maxBatchSize: number; // kg
  processingTimeHours: number;
  qualityGrades: string[];
}

export interface IBranchMetrics {
  totalMaterialsProcessed: number;
  totalWeightProcessed: number; // kg
  totalValueProcessed: number;
  averageProcessingTime: number; // hours
  qualityRating: number;
  efficiency: number; // percentage
  monthlyStats: Array<{
    month: string;
    materialsCount: number;
    weight: number;
    value: number;
  }>;
}

export interface IBranch extends Document {
  _id: Types.ObjectId;
  
  // Basic Information
  name: string;
  code: string; // Unique branch identifier
  description: string;
  branchType: BranchType;
  status: BranchStatus;
  
  // Owner/Manager Information
  ownerId: Types.ObjectId;
  managerId?: Types.ObjectId;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  
  // Location
  location: ILocation;
  servingRadius: number; // in kilometers
  
  // Operating Information
  operatingHours: IOperatingHours[];
  isOpen24Hours: boolean;
  
  // Capacity Management
  capacity: ICapacity;
  
  // Equipment & Capabilities
  equipment: IEquipment[];
  processingCapabilities: IProcessingCapability;
  
  // Queue Management
  currentQueue: {
    materials: Types.ObjectId[];
    estimatedWaitTime: number; // in minutes
    maxQueueSize: number;
  };
  
  // Financial Information
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    routingNumber?: string;
  };
  
  // Verification & Compliance
  isVerified: boolean;
  licenseNumber?: string;
  certifications: string[];
  lastInspection?: Date;
  nextInspection?: Date;
  
  // Performance Metrics
  metrics: IBranchMetrics;
  rating: number;
  reviewCount: number;
  
  // Pricing & Commission
  commissionRate: number; // percentage
  specialRates: Array<{
    materialType: string;
    condition: string;
    rate: number;
  }>;
  
  // Notifications & Preferences
  notifications: {
    newMaterials: boolean;
    capacityAlerts: boolean;
    maintenanceReminders: boolean;
    paymentUpdates: boolean;
  };
  
  // Timestamps
  registeredAt: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBranchFilter {
  branchType?: BranchType;
  status?: BranchStatus;
  location?: {
    center: [number, number];
    radius: number;
  };
  capacity?: {
    minAvailable?: number;
    maxAvailable?: number;
  };
  processingCapabilities?: {
    materialTypes?: string[];
    treatments?: string[];
  };
  rating?: {
    min: number;
    max: number;
  };
  isVerified?: boolean;
}

export interface IBranchStats {
  totalBranches: number;
  activeBranches: number;
  branchesByType: Record<BranchType, number>;
  branchesByStatus: Record<BranchStatus, number>;
  totalCapacity: number;
  totalAvailableCapacity: number;
  averageRating: number;
  topPerformingBranches: Partial<IBranch>[];
  capacityUtilization: number;
}

export interface IBranchRegistrationData {
  name: string;
  description: string;
  branchType: BranchType;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
  };
  servingRadius: number;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  capacity: {
    maximum: number;
  };
  operatingHours: IOperatingHours[];
  processingCapabilities: IProcessingCapability;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  licenseNumber?: string;
  certifications?: string[];
}