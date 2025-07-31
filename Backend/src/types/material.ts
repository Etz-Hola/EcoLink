import { Document, Types } from 'mongoose';

export enum MaterialType {
  PLASTIC = 'plastic',
  METAL = 'metal',
  HOUSEHOLD = 'household'
}

export enum PlasticType {
  PET = 'pet',
  HDPE = 'hdpe',
  PVC = 'pvc',
  LDPE = 'ldpe',
  PP = 'pp',
  PS = 'ps',
  OTHER = 'other'
}

export enum MetalType {
  FERROUS = 'ferrous',
  NON_FERROUS = 'non_ferrous',
  MIXED = 'mixed',
  ALUMINUM = 'aluminum',
  COPPER = 'copper',
  STEEL = 'steel',
  IRON = 'iron'
}

export enum HouseholdType {
  ORGANIC = 'organic',
  RECYCLABLE = 'recyclable',
  HAZARDOUS = 'hazardous',
  TEXTILE = 'textile',
  GLASS = 'glass',
  PAPER = 'paper',
  ELECTRONIC = 'electronic'
}

export enum MaterialCondition {
  CLEAN = 'clean',
  DIRTY = 'dirty',
  TREATED = 'treated',
  UNTREATED = 'untreated',
  DAMAGED = 'damaged',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  POOR = 'poor'
}

export enum MaterialStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  PROCESSED = 'processed',
  SOLD = 'sold'
}

export interface IMaterialImage {
  url: string;
  publicId: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IQualityAssessment {
  overallGrade: 'A' | 'B' | 'C' | 'D';
  purity: number; // percentage
  contamination: number; // percentage
  moisture: number; // percentage
  notes: string;
  assessedBy: Types.ObjectId;
  assessedAt: Date;
}

export interface IPricing {
  basePrice: number;
  conditionMultiplier: number;
  qualityMultiplier: number;
  marketMultiplier: number;
  finalPrice: number;
  currency: string;
  lastUpdated: Date;
}

export interface IMaterial extends Document {
  _id: Types.ObjectId;
  
  // Basic Information
  title: string;
  description: string;
  materialType: MaterialType;
  subType: PlasticType | MetalType | HouseholdType;
  condition: MaterialCondition;
  status: MaterialStatus;
  
  // Physical Properties
  weight: number; // in kg
  estimatedVolume?: number; // in cubic meters
  color?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Images
  images: IMaterialImage[];
  
  // Quality Assessment
  qualityAssessment?: IQualityAssessment;
  
  // Pricing
  pricing: IPricing;
  
  // Location & Logistics
  pickupLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
  };
  
  // Ownership & Processing
  submittedBy: Types.ObjectId; // User who submitted
  currentOwner: Types.ObjectId; // Current owner
  processingBranch?: Types.ObjectId; // Branch handling this material
  assignedTransporter?: Types.ObjectId; // Transporter for pickup
  
  // Treatment Information
  requiresTreatment: boolean;
  treatmentType?: string[];
  treatmentCost?: number;
  treatmentNotes?: string;
  
  // Batch Information
  batchId?: string;
  isPartOfBatch: boolean;
  batchWeight?: number;
  
  // Analytics
  views: number;
  interestedBuyers: Types.ObjectId[];
  
  // Timestamps
  submittedAt: Date;
  approvedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  processedAt?: Date;
  soldAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaterialFilter {
  materialType?: MaterialType;
  subType?: string;
  condition?: MaterialCondition;
  status?: MaterialStatus;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    center: [number, number];
    radius: number; // in kilometers
  };
  submittedBy?: Types.ObjectId;
  processingBranch?: Types.ObjectId;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface IMaterialStats {
  totalMaterials: number;
  totalWeight: number;
  totalValue: number;
  materialsByType: Record<MaterialType, number>;
  materialsByStatus: Record<MaterialStatus, number>;
  averagePrice: number;
  topMaterials: Partial<IMaterial>[];
  monthlyTrends: Array<{
    month: string;
    count: number;
    weight: number;
    value: number;
  }>;
}

export interface IMaterialUploadData {
  title: string;
  description: string;
  materialType: MaterialType;
  subType: string;
  condition: MaterialCondition;
  weight: number;
  estimatedVolume?: number;
  color?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  pickupLocation: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
  };
  requiresTreatment: boolean;
  treatmentType?: string[];
  images: Express.Multer.File[];
}