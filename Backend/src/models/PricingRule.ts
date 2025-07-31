import mongoose, { Schema } from 'mongoose';
import { IPricingRule, PricingStrategy, PriceFactorType } from '../types/pricing';
import { MaterialType, MaterialCondition } from '../types/material';

const PriceFactorSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(PriceFactorType),
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  isPercentage: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  },
  conditions: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

const MarketPriceSchema = new Schema({
  source: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  unit: {
    type: String,
    enum: ['per_kg', 'per_ton', 'per_unit'],
    default: 'per_kg'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  reliability: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
});

const QuantityTierSchema = new Schema({
  minQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  maxQuantity: Number,
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: String
});

const TimeOfDayRuleSchema = new Schema({
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  endHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  multiplier: {
    type: Number,
    required: true,
    min: 0
  },
  description: String
});

const SeasonalAdjustmentSchema = new Schema({
  startMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  endMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  multiplier: {
    type: Number,
    required: true,
    min: 0
  },
  description: String
});

const TreatmentPricingSchema = new Schema({
  treatmentType: {
    type: String,
    required: true
  },
  additionalCost: {
    type: Number,
    required: true,
    min: 0
  },
  priceImprovement: {
    type: Number,
    required: true,
    min: 0
  },
  description: String
});

const UsageSchema = new Schema({
  timesApplied: {
    type: Number,
    default: 0,
    min: 0
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  },
  averagePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsed: Date
});

const PricingRuleSchema = new Schema<IPricingRule>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 50
  },
  
  // Applicability
  materialType: {
    type: String,
    enum: Object.values(MaterialType),
    required: true
  },
  subTypes: [String],
  conditions: {
    type: [String],
    enum: Object.values(MaterialCondition)
  },
  locations: [String],
  
  // Pricing Strategy
  strategy: {
    type: String,
    enum: Object.values(PricingStrategy),
    required: true
  },
  
  // Price Factors
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  priceFactors: [PriceFactorSchema],
  
  // Market Integration
  marketPrices: [MarketPriceSchema],
  marketPriceWeight: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.3
  },
  
  // Quantity Tiers
  quantityTiers: [QuantityTierSchema],
  
  // Time-based Rules
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: Date,
  timeOfDayRules: [TimeOfDayRuleSchema],
  
  // Seasonal Adjustments
  seasonalAdjustments: [SeasonalAdjustmentSchema],
  
  // Treatment Pricing
  treatmentPricing: [TreatmentPricingSchema],
  
  // Performance Metrics
  usage: {
    type: UsageSchema,
    default: () => ({})
  },
  
  // Approval & Governance
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalNotes: String
}, {
  timestamps: true
});

// Indexes
PricingRuleSchema.index({ materialType: 1, isActive: 1 });
PricingRuleSchema.index({ priority: -1 });
PricingRuleSchema.index({ validFrom: 1, validUntil: 1 });
PricingRuleSchema.index({ approvalStatus: 1 });
PricingRuleSchema.index({ createdBy: 1 });

// Validation
PricingRuleSchema.pre('validate', function() {
  // Ensure valid date range
  if (this.validUntil && this.validFrom >= this.validUntil) {
    this.invalidate('validUntil', 'Valid until date must be after valid from date');
  }
  
  // Ensure quantity tiers don't overlap
  if (this.quantityTiers && this.quantityTiers.length > 1) {
    const sortedTiers = this.quantityTiers.sort((a, b) => a.minQuantity - b.minQuantity);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const current = sortedTiers[i];
      const next = sortedTiers[i + 1];
      if (current.maxQuantity && current.maxQuantity >= next.minQuantity) {
        this.invalidate('quantityTiers', 'Quantity tiers cannot overlap');
        break;
      }
    }
  }
});

// Middleware to update usage statistics
PricingRuleSchema.methods.updateUsage = function(value: number) {
  this.usage.timesApplied += 1;
  this.usage.totalValue += value;
  this.usage.averagePrice = this.usage.totalValue / this.usage.timesApplied;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Static methods
PricingRuleSchema.statics.findApplicableRules = function(
  materialType: MaterialType,
  subType?: string,
  condition?: MaterialCondition,
  location?: string
) {
  const query: any = {
    materialType,
    isActive: true,
    approvalStatus: 'approved',
    validFrom: { $lte: new Date() },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: null },
      { validUntil: { $gte: new Date() } }
    ]
  };
  
  if (subType) {
    query.$or = [
      { subTypes: { $exists: false } },
      { subTypes: { $size: 0 } },
      { subTypes: subType }
    ];
  }
  
  if (condition) {
    query.$or = [
      { conditions: { $exists: false } },
      { conditions: { $size: 0 } },
      { conditions: condition }
    ];
  }
  
  if (location) {
    query.$or = [
      { locations: { $exists: false } },
      { locations: { $size: 0 } },
      { locations: location }
    ];
  }
  
  return this.find(query).sort({ priority: -1 });
};

PricingRuleSchema.statics.findByMaterialType = function(materialType: MaterialType) {
  return this.find({ materialType, isActive: true });
};

export default mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);