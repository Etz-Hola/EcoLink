export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'collector' | 'branch' | 'admin' | 'buyer';
  isVerified: boolean;
  ecoPoints: number;
  walletAddress?: string;
  createdAt: Date;
  avatar?: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  subcategory: string;
  weight: number;
  condition: 'clean' | 'dirty' | 'treated' | 'untreated';
  photos: string[];
  pricePerKg: number;
  totalValue: number;
  uploadedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'processed';
  branchId?: string;
  uploadedAt: Date;
  processedAt?: Date;
  qualityGrade?: 'A' | 'B' | 'C' | 'D';
  description?: string;
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