import mongoose, { Schema } from 'mongoose';
import { 
  IMaterial, 
  MaterialType, 
  PlasticType, 
  MetalType, 
  HouseholdType, 
  MaterialCondition, 
  MaterialStatus 
} from '../types/material';

const MaterialImageSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  }
});

const QualityAssessmentSchema = new Schema({
  overallGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  purity: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  contamination: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  moisture: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  notes: String,
  assessedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessedAt: {
    type: Date,
    default: Date.now
  }
});

const PricingSchema = new Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  conditionMultiplier: {
    type: Number,
    default: 1,
    min: 0
  },
  qualityMultiplier: {
    type: Number,
    default: 1,
    min: 0
  },
  marketMultiplier: {
    type: Number,
    default: 1,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  }
});

const DimensionsSchema = new Schema({
  length: {
    type: Number,
    min: 0
  },
  width: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  }
});

const MaterialSchema = new Schema<IMaterial>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  materialType: {
    type: String,
    enum: Object.values(MaterialType),
    required: true
  },
  subType: {
    type: String,
    required: true,
    validate: {
      validator: function(subType: string) {
        const validSubTypes = [
          ...Object.values(PlasticType),
          ...Object.values(MetalType),
          ...Object.values(HouseholdType)
        ];
        return validSubTypes.includes(subType as any);
      },
      message: 'Invalid subtype for material'
    }
  },
  condition: {
    type: String,
    enum: Object.values(MaterialCondition),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(MaterialStatus),
    default: MaterialStatus.PENDING
  },
  
  // Physical Properties
  weight: {
    type: Number,
    required: true,
    min: 0.1,
    max: 10000
  },
  estimatedVolume: {
    type: Number,
    min: 0
  },
  color: String,
  dimensions: DimensionsSchema,
  
  // Images
  images: {
    type: [MaterialImageSchema],
    validate: {
      validator: function(images: any[]) {
        return images.length >= 1 && images.length <= 10;
      },
      message: 'At least 1 and at most 10 images are required'
    }
  },
  
  // Quality Assessment
  qualityAssessment: QualityAssessmentSchema,
  
  // Pricing
  pricing: {
    type: PricingSchema,
    required: true
  },
  
  // Location & Logistics
  pickupLocation: {
    type: LocationSchema,
    required: true
  },
  
  // Ownership & Processing
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processingBranch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  assignedTransporter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Treatment Information
  requiresTreatment: {
    type: Boolean,
    default: false
  },
  treatmentType: [String],
  treatmentCost: {
    type: Number,
    min: 0
  },
  treatmentNotes: String,
  
  // Batch Information
  batchId: String,
  isPartOfBatch: {
    type: Boolean,
    default: false
  },
  batchWeight: {
    type: Number,
    min: 0
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  interestedBuyers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  processedAt: Date,
  soldAt: Date
}, {
  timestamps: true
});

// Indexes
MaterialSchema.index({ pickupLocation: '2dsphere' });
MaterialSchema.index({ materialType: 1, subType: 1 });
MaterialSchema.index({ status: 1 });
MaterialSchema.index({ submittedBy: 1 });
MaterialSchema.index({ processingBranch: 1 });
MaterialSchema.index({ createdAt: -1 });
MaterialSchema.index({ 'pricing.finalPrice': 1 });
MaterialSchema.index({ weight: 1 });

// Middleware
MaterialSchema.pre('save', function(next) {
  // Set current owner to submitter initially
  if (this.isNew && !this.currentOwner) {
    this.currentOwner = this.submittedBy;
  }
  
  // Calculate final price
  if (this.pricing) {
    this.pricing.finalPrice = this.pricing.basePrice * 
                              this.pricing.conditionMultiplier * 
                              this.pricing.qualityMultiplier * 
                              this.pricing.marketMultiplier;
  }
  
  next();
});

// Virtual for total estimated value
MaterialSchema.virtual('totalValue').get(function() {
  return this.weight * this.pricing.finalPrice;
});

// Static methods
MaterialSchema.statics.findByLocation = function(center: [number, number], radius: number) {
  return this.find({
    pickupLocation: {
      $geoWithin: {
        $centerSphere: [center, radius / 6371] // Convert km to radians
      }
    }
  });
};

MaterialSchema.statics.findByMaterialType = function(materialType: MaterialType, subType?: string) {
  const query: any = { materialType };
  if (subType) query.subType = subType;
  return this.find(query);
};

export default mongoose.model<IMaterial>('Material', MaterialSchema);