export interface User {
  id: string;
  _id?: string;
  name: string; // Synthesized from firstName + lastName
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'collector' | 'branch' | 'admin' | 'buyer' | 'organization' | 'hotel' | 'exporter' | 'pending';
  isVerified: boolean;
  ecoPoints: number;
  walletAddress?: string;
  createdAt: Date;
  balance?: number;
  avatar?: string;
  totalEarnings?: number;
  totalMaterialsSubmitted?: number;
  profileImage?: string;
  businessName?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface Material {
  id: string;
  _id?: string;
  name?: string;
  title?: string;
  category?: MaterialCategory;
  materialType?: string;
  subType?: string;
  subcategory?: string;
  weight: number;
  condition: string;
  photos?: string[];
  images?: Array<{ url: string; publicId: string }>;
  pricePerKg?: number;
  totalValue?: number;
  uploadedBy?: string;
  submittedBy?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'processed' | 'approved' | 'delivered';
  branchId?: string;
  uploadedAt?: Date;
  createdAt?: string | Date;
  processedAt?: Date;
  qualityGrade?: 'A' | 'B' | 'C' | 'D';
  description?: string;
  pickupLocation?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
  };
}

export interface MaterialCategory {
  id: string;
  name: string;
  subcategories: string[];
  basePrice: number;
  unit: 'kg' | 'piece';
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  currentLoad: number;
  acceptedMaterials: string[];
  operatingHours: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  isActive: boolean;
}

export interface LogisticsRequest {
  id: string;
  materialId: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledDate: Date;
  status: 'pending' | 'scheduled' | 'in_transit' | 'completed';
  cost: number;
  transporterId?: string;
  estimatedDuration: number;
}

export interface PriceCalculation {
  materialType: string;
  weight: number;
  condition: string;
  basePrice: number;
  conditionMultiplier: number;
  treatmentBonus: number;
  totalValue: number;
  logisticsCost: number;
  netValue: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
}

export interface AppState {
  materials: Material[];
  branches: Branch[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}