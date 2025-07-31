import { Document, Types } from 'mongoose';

export enum TransportType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  TRICYCLE = 'tricycle',
  VAN = 'van',
  TRUCK = 'truck',
  CONTAINER = 'container'
}

export enum LogisticsStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed'
}

export enum PickupType {
  SCHEDULED = 'scheduled',
  ON_DEMAND = 'on_demand',
  BATCH = 'batch',
  EMERGENCY = 'emergency'
}

export interface ITransportVehicle {
  type: TransportType;
  plateNumber: string;
  capacity: number; // in kg
  currentLoad: number; // in kg
  fuelEfficiency?: number; // km per liter
  maintenanceStatus: 'good' | 'needs_service' | 'out_of_service';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
}

export interface IRoute {
  origin: {
    coordinates: [number, number];
    address: string;
  };
  destination: {
    coordinates: [number, number];
    address: string;
  };
  waypoints?: Array<{
    coordinates: [number, number];
    address: string;
    stopDuration: number; // in minutes
  }>;
  distance: number; // in kilometers
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  trafficConditions?: 'light' | 'moderate' | 'heavy';
}

export interface ICostBreakdown {
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  urgencyFee: number;
  fuelSurcharge: number;
  totalCost: number;
  currency: string;
}

export interface ILogistics extends Document {
  _id: Types.ObjectId;
  
  // Basic Information
  pickupId: string; // Unique pickup identifier
  pickupType: PickupType;
  status: LogisticsStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Materials & Weight
  materials: Types.ObjectId[]; // References to materials
  totalWeight: number; // in kg
  estimatedVolume: number; // in cubic meters
  
  // Parties Involved
  collector: Types.ObjectId; // Material collector
  transporter?: Types.ObjectId; // Assigned transporter
  destinationBranch: Types.ObjectId; // Processing branch
  
  // Route Information
  route: IRoute;
  
  // Vehicle Information
  assignedVehicle?: ITransportVehicle;
  
  // Scheduling
  requestedPickupTime: Date;
  scheduledPickupTime?: Date;
  actualPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  
  // Cost Information
  costBreakdown: ICostBreakdown;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'cash' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  
  // Tracking Information
  currentLocation?: {
    coordinates: [number, number];
    timestamp: Date;
    accuracy: number; // in meters
  };
  trackingHistory: Array<{
    coordinates: [number, number];
    timestamp: Date;
    status: string;
    notes?: string;
  }>;
  
  // Documentation
  pickupReceipt?: {
    receiptNumber: string;
    url: string;
    issuedAt: Date;
  };
  deliveryReceipt?: {
    receiptNumber: string;
    url: string;
    signedBy: string;
    issuedAt: Date;
  };
  
  // Quality Control
  pickupPhotos?: string[];
  deliveryPhotos?: string[];
  weightDiscrepancy?: {
    expected: number;
    actual: number;
    variance: number;
    notes: string;
  };
  
  // Communication
  specialInstructions?: string;
  contactAtPickup?: {
    name: string;
    phone: string;
  };
  contactAtDelivery?: {
    name: string;
    phone: string;
  };
  
  // Performance Metrics
  rating?: {
    collector: number; // Rating given by collector
    transporter: number; // Rating given by transporter
    branch: number; // Rating given by branch
  };
  feedback?: {
    collector: string;
    transporter: string;
    branch: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ILogisticsFilter {
  status?: LogisticsStatus;
  pickupType?: PickupType;
  priority?: string;
  collector?: Types.ObjectId;
  transporter?: Types.ObjectId;
  destinationBranch?: Types.ObjectId;
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    center: [number, number];
    radius: number;
  };
  weightRange?: {
    min: number;
    max: number;
  };
  paymentStatus?: string;
}

export interface ILogisticsStats {
  totalPickups: number;
  completedPickups: number;
  pendingPickups: number;
  totalDistance: number;
  totalWeight: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  averageRating: number;
  costPerKg: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    pickups: number;
    weight: number;
  }>;
  topRoutes: Array<{
    origin: string;
    destination: string;
    frequency: number;
    averageCost: number;
  }>;
}

export interface IPickupRequest {
  materials: Types.ObjectId[];
  pickupLocation: {
    coordinates: [number, number];
    address: string;
  };
  destinationBranch: Types.ObjectId;
  requestedPickupTime: Date;
  pickupType: PickupType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  specialInstructions?: string;
  contactPerson: {
    name: string;
    phone: string;
  };
}

export interface ICostEstimation {
  distance: number;
  estimatedWeight: number;
  transportType: TransportType;
  pickupType: PickupType;
  priority: string;
  costBreakdown: ICostBreakdown;
  estimatedDuration: number;
  availableTimeSlots: Array<{
    start: Date;
    end: Date;
    isAvailable: boolean;
  }>;
}