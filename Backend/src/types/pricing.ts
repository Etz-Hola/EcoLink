import { Document, Types } from 'mongoose';
import { MaterialType, MaterialCondition } from './material';

export enum PricingStrategy {
  FIXED = 'fixed',
  MARKET_BASED = 'market_based',
  DYNAMIC = 'dynamic',
  AUCTION = 'auction'
}

export enum PriceFactorType {
  BASE_PRICE = 'base_price',
  CONDITION_MULTIPLIER = 'condition_multiplier',
  QUALITY_MULTIPLIER = 'quality_multiplier',
  QUANTITY_DISCOUNT = 'quantity_discount',
  SEASONAL_ADJUSTMENT = 'seasonal_adjustment',
  LOCATION_ADJUSTMENT = 'location_adjustment',
  URGENCY_PREMIUM = 'urgency_premium'
}

export interface IPriceFactor {
  type: PriceFactorType;
  value: number;
  isPercentage: boolean;
  description: string;
  conditions?: Record<string, any>;
}

export interface IMarketPrice {
  source: string;
  price: number;
  currency: string;
  unit: 'per_kg' | 'per_ton' | 'per_unit';
  lastUpdated: Date;
  reliability: number; // 0-1 scale
}

export interface IPricingRule extends Document {
  _id: Types.ObjectId;
  
  // Basic Information
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  
  // Applicability
  materialType: MaterialType;
  subTypes?: string[]; // Specific subtypes this rule applies to
  conditions?: MaterialCondition[];
  locations?: string[]; // States/cities where this rule applies
  
  // Pricing Strategy
  strategy: PricingStrategy;
  
  // Price Factors
  basePrice: number; // Per kg
  currency: string;
  priceFactors: IPriceFactor[];
  
  // Market Integration
  marketPrices?: IMarketPrice[];
  marketPriceWeight: number; // How much market price influences final price (0-1)
  
  // Quantity Tiers
  quantityTiers?: Array<{
    minQuantity: number; // kg
    maxQuantity?: number; // kg
    discountPercentage: number;
    description: string;
  }>;
  
  // Time-based Rules
  validFrom: Date;
  validUntil?: Date;
  timeOfDayRules?: Array<{
    startHour: number;
    endHour: number;
    multiplier: number;
    description: string;
  }>;
  
  // Seasonal Adjustments
  seasonalAdjustments?: Array<{
    startMonth: number;
    endMonth: number;
    multiplier: number;
    description: string;
  }>;
  
  // Treatment Pricing
  treatmentPricing?: Array<{
    treatmentType: string;
    additionalCost: number;
    priceImprovement: number; // How much treatment improves price
    description: string;
  }>;
  
  // Performance Metrics
  usage: {
    timesApplied: number;
    totalValue: number;
    averagePrice: number;
    lastUsed?: Date;
  };
  
  // Approval & Governance
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriceCalculationResult {
  materialId: Types.ObjectId;
  appliedRules: Array<{
    ruleId: Types.ObjectId;
    ruleName: string;
    basePrice: number;
    finalPrice: number;
    factorsApplied: IPriceFactor[];
  }>;
  
  // Final Pricing
  basePrice: number;
  adjustments: Array<{
    factor: string;
    value: number;
    isPercentage: boolean;
    description: string;
  }>;
  finalPrice: number;
  currency: string;
  
  // Market Comparison
  marketAverage?: number;
  competitiveAdvantage?: number; // How much better our price is
  
  // Breakdown
  breakdown: {
    materialCost: number;
    processingCost: number;
    logisticsCost: number;
    platformFee: number;
    profit: number;
  };
  
  // Treatment Analysis
  treatmentAnalysis?: {
    currentPrice: number;
    treatedPrice: number;
    treatmentCost: number;
    netBenefit: number;
    recommendation: 'treat' | 'sell_as_is';
  };
  
  // Validity
  validUntil: Date;
  calculatedAt: Date;
}

export interface IPricingStats {
  totalRules: number;
  activeRules: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricesByMaterial: Record<MaterialType, {
    averagePrice: number;
    priceRange: { min: number; max: number };
    volume: number;
  }>;
  marketTrends: Array<{
    date: Date;
    averagePrice: number;
    volume: number;
  }>;
  treatmentImpact: {
    averageImprovement: number;
    treatmentRate: number;
    netBenefit: number;
  };
}

export interface IPriceRequest {
  materialType: MaterialType;
  subType?: string;
  condition: MaterialCondition;
  weight: number;
  location: {
    coordinates: [number, number];
    state: string;
    city: string;
  };
  qualityGrade?: string;
  treatmentRequired?: string[];
  urgency?: 'low' | 'medium' | 'high';
  requestedAt: Date;
}