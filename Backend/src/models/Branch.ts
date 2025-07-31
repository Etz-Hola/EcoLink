import mongoose, { Schema } from 'mongoose';
import { IBranch, BranchStatus, BranchType } from '../types/branch';

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
  },
  country: {
    type: String,
    default: 'Nigeria'
  }
});

const OperatingHoursSchema = new Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  open: {
    type: String,
    required: true,
    validate: {
      validator: function(time: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Invalid time format. Use HH:MM'
    }
  },
  close: {
    type: String,
    required: true,
    validate: {
      validator: function(time: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Invalid time format. Use HH:MM'
    }
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

const CapacitySchema = new Schema({
  current: {
    type: Number,
    default: 0,
    min: 0
  },
  maximum: {
    type: Number,
    required: true,
    min: 1
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  available: {
    type: Number,
    default: function() {
      return this.maximum - this.current - this.reserved;
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const EquipmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['scale', 'crusher', 'shredder', 'cleaner', 'sorter', 'other'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'broken'],
    default: 'operational'
  },
  lastMaintenance: Date,
  nextMaintenance: Date
});

const ProcessingCapabilitySchema = new Schema({
  materialTypes: {
    type: [String],
    required: true
  },
  treatments: {
    type: [String],
    default: []
  },
  maxBatchSize: {
    type: Number,
    required: true,
    min: 1
  },
  processingTimeHours: {
    type: Number,
    required: true,
    min: 0.1
  },
  qualityGrades: {
    type: [String],
    default: ['A', 'B', 'C', 'D']
  }
});

const ContactPersonSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  }
});

const BankAccountSchema = new Schema({
  accountNumber: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  routingNumber: String
});

const QueueSchema = new Schema({
  materials: [{
    type: Schema.Types.ObjectId,
    ref: 'Material'
  }],
  estimatedWaitTime: {
    type: Number,
    default: 0,
    min: 0
  },
  maxQueueSize: {
    type: Number,
    default: 50,
    min: 1
  }
});

const MetricsSchema = new Schema({
  totalMaterialsProcessed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWeightProcessed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalValueProcessed: {
    type: Number,
    default: 0,
    min: 0
  },
  averageProcessingTime: {
    type: Number,
    default: 0,
    min: 0
  },
  qualityRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  efficiency: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  monthlyStats: [{
    month: String,
    materialsCount: Number,
    weight: Number,
    value: Number
  }]
});

const NotificationsSchema = new Schema({
  newMaterials: {
    type: Boolean,
    default: true
  },
  capacityAlerts: {
    type: Boolean,
    default: true
  },
  maintenanceReminders: {
    type: Boolean,
    default: true
  },
  paymentUpdates: {
    type: Boolean,
    default: true
  }
});

const BranchSchema = new Schema<IBranch>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 3,
    maxlength: 10
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  branchType: {
    type: String,
    enum: Object.values(BranchType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(BranchStatus),
    default: BranchStatus.INACTIVE
  },
  
  // Owner/Manager Information
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  contactPerson: {
    type: ContactPersonSchema,
    required: true
  },
  
  // Location
  location: {
    type: LocationSchema,
    required: true
  },
  servingRadius: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  
  // Operating Information
  operatingHours: {
    type: [OperatingHoursSchema],
    validate: {
      validator: function(hours: any[]) {
        const days = hours.map(h => h.day);
        return new Set(days).size === days.length; // No duplicate days
      },
      message: 'Duplicate operating hours for the same day'
    }
  },
  isOpen24Hours: {
    type: Boolean,
    default: false
  },
  
  // Capacity Management
  capacity: {
    type: CapacitySchema,
    required: true
  },
  
  // Equipment & Capabilities
  equipment: [EquipmentSchema],
  processingCapabilities: {
    type: ProcessingCapabilitySchema,
    required: true
  },
  
  // Queue Management
  currentQueue: {
    type: QueueSchema,
    default: () => ({})
  },
  
  // Financial Information
  bankAccount: BankAccountSchema,
  
  // Verification & Compliance
  isVerified: {
    type: Boolean,
    default: false
  },
  licenseNumber: String,
  certifications: [String],
  lastInspection: Date,
  nextInspection: Date,
  
  // Performance Metrics
  metrics: {
    type: MetricsSchema,
    default: () => ({})
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Pricing & Commission
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
    default: 5
  },
  specialRates: [{
    materialType: String,
    condition: String,
    rate: Number
  }],
  
  // Notifications & Preferences
  notifications: {
    type: NotificationsSchema,
    default: () => ({})
  },
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
BranchSchema.index({ location: '2dsphere' });
BranchSchema.index({ branchType: 1, status: 1 });
BranchSchema.index({ ownerId: 1 });
BranchSchema.index({ code: 1 });
BranchSchema.index({ rating: -1 });
BranchSchema.index({ 'capacity.available': -1 });

// Pre-save middleware
BranchSchema.pre('save', function(next) {
  // Generate branch code if not provided
  if (this.isNew && !this.code) {
    const typeCode = this.branchType.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.code = `${typeCode}${randomNum}`;
  }
  
  // Update available capacity
  if (this.capacity) {
    this.capacity.available = this.capacity.maximum - this.capacity.current - this.capacity.reserved;
    this.capacity.lastUpdated = new Date();
  }
  
  next();
});

// Virtual for occupancy rate
BranchSchema.virtual('occupancyRate').get(function() {
  if (!this.capacity || this.capacity.maximum === 0) return 0;
  return (this.capacity.current / this.capacity.maximum) * 100;
});

// Static methods
BranchSchema.statics.findNearby = function(center: [number, number], radius: number) {
  return this.find({
    location: {
      $geoWithin: {
        $centerSphere: [center, radius / 6371]
      }
    },
    status: BranchStatus.ACTIVE
  });
};

BranchSchema.statics.findWithCapacity = function(minCapacity: number = 0) {
  return this.find({
    'capacity.available': { $gte: minCapacity },
    status: BranchStatus.ACTIVE
  });
};

export default mongoose.model<IBranch>('Branch', BranchSchema);