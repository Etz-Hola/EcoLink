import mongoose, { Schema } from 'mongoose';
import { ILogistics, TransportType, LogisticsStatus, PickupType } from '../types/logistics';

const LocationSchema = new Schema({
  coordinates: {
    type: [Number],
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

const TransportVehicleSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(TransportType),
    required: true
  },
  plateNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentLoad: {
    type: Number,
    default: 0,
    min: 0
  },
  fuelEfficiency: Number,
  maintenanceStatus: {
    type: String,
    enum: ['good', 'needs_service', 'out_of_service'],
    default: 'good'
  },
  lastMaintenance: Date,
  nextMaintenance: Date,
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  }
});

const WaypointSchema = new Schema({
  coordinates: {
    type: [Number],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  stopDuration: {
    type: Number,
    default: 15,
    min: 0
  }
});

const RouteSchema = new Schema({
  origin: {
    type: LocationSchema,
    required: true
  },
  destination: {
    type: LocationSchema,
    required: true
  },
  waypoints: [WaypointSchema],
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  actualDuration: Number,
  trafficConditions: {
    type: String,
    enum: ['light', 'moderate', 'heavy']
  }
});

const CostBreakdownSchema = new Schema({
  baseFee: {
    type: Number,
    required: true,
    min: 0
  },
  distanceFee: {
    type: Number,
    required: true,
    min: 0
  },
  weightFee: {
    type: Number,
    required: true,
    min: 0
  },
  urgencyFee: {
    type: Number,
    default: 0,
    min: 0
  },
  fuelSurcharge: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  }
});

const ReceiptSchema = new Schema({
  receiptNumber: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  signedBy: String
});

const CurrentLocationSchema = new Schema({
  coordinates: {
    type: [Number],
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  accuracy: {
    type: Number,
    default: 10
  }
});

const TrackingHistorySchema = new Schema({
  coordinates: {
    type: [Number],
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  notes: String
});

const ContactSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

const WeightDiscrepancySchema = new Schema({
  expected: {
    type: Number,
    required: true
  },
  actual: {
    type: Number,
    required: true
  },
  variance: {
    type: Number,
    required: true
  },
  notes: String
});

const RatingSchema = new Schema({
  collector: {
    type: Number,
    min: 1,
    max: 5
  },
  transporter: {
    type: Number,
    min: 1,
    max: 5
  },
  branch: {
    type: Number,
    min: 1,
    max: 5
  }
});

const FeedbackSchema = new Schema({
  collector: String,
  transporter: String,
  branch: String
});

const LogisticsSchema = new Schema<ILogistics>({
  pickupId: {
    type: String,
    required: true,
    unique: true
  },
  pickupType: {
    type: String,
    enum: Object.values(PickupType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(LogisticsStatus),
    default: LogisticsStatus.PENDING
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Materials & Weight
  materials: [{
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  }],
  totalWeight: {
    type: Number,
    required: true,
    min: 0.1
  },
  estimatedVolume: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Parties Involved
  collector: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transporter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  destinationBranch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  
  // Route Information
  route: {
    type: RouteSchema,
    required: true
  },
  
  // Vehicle Information
  assignedVehicle: TransportVehicleSchema,
  
  // Scheduling
  requestedPickupTime: {
    type: Date,
    required: true
  },
  scheduledPickupTime: Date,
  actualPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Cost Information
  costBreakdown: {
    type: CostBreakdownSchema,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital_wallet', 'crypto']
  },
  
  // Tracking Information
  currentLocation: CurrentLocationSchema,
  trackingHistory: [TrackingHistorySchema],
  
  // Documentation
  pickupReceipt: ReceiptSchema,
  deliveryReceipt: ReceiptSchema,
  
  // Quality Control
  pickupPhotos: [String],
  deliveryPhotos: [String],
  weightDiscrepancy: WeightDiscrepancySchema,
  
  // Communication
  specialInstructions: String,
  contactAtPickup: ContactSchema,
  contactAtDelivery: ContactSchema,
  
  // Performance Metrics
  rating: RatingSchema,
  feedback: FeedbackSchema
}, {
  timestamps: true
});

// Indexes
LogisticsSchema.index({ pickupId: 1 });
LogisticsSchema.index({ status: 1 });
LogisticsSchema.index({ collector: 1 });
LogisticsSchema.index({ transporter: 1 });
LogisticsSchema.index({ destinationBranch: 1 });
LogisticsSchema.index({ requestedPickupTime: 1 });
LogisticsSchema.index({ createdAt: -1 });
LogisticsSchema.index({ 'route.origin': '2dsphere' });
LogisticsSchema.index({ 'route.destination': '2dsphere' });

// Pre-save middleware
LogisticsSchema.pre('save', function(next) {
  // Generate pickup ID if not provided
  if (this.isNew && !this.pickupId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.pickupId = `PU${date}${random}`;
  }
  
  // Calculate total cost
  if (this.costBreakdown) {
    this.costBreakdown.totalCost = 
      this.costBreakdown.baseFee +
      this.costBreakdown.distanceFee +
      this.costBreakdown.weightFee +
      this.costBreakdown.urgencyFee +
      this.costBreakdown.fuelSurcharge;
  }
  
  next();
});

// Virtual for delivery duration
LogisticsSchema.virtual('deliveryDuration').get(function() {
  if (this.actualPickupTime && this.actualDeliveryTime) {
    return this.actualDeliveryTime.getTime() - this.actualPickupTime.getTime();
  }
  return null;
});

// Static methods
LogisticsSchema.statics.findByRoute = function(origin: [number, number], destination: [number, number], radius: number = 5) {
  return this.find({
    $and: [
      {
        'route.origin.coordinates': {
          $geoWithin: {
            $centerSphere: [origin, radius / 6371]
          }
        }
      },
      {
        'route.destination.coordinates': {
          $geoWithin: {
            $centerSphere: [destination, radius / 6371]
          }
        }
      }
    ]
  });
};

LogisticsSchema.statics.findActivePickups = function() {
  return this.find({
    status: { $in: [LogisticsStatus.ASSIGNED, LogisticsStatus.IN_TRANSIT] }
  });
};

export default mongoose.model<ILogistics>('Logistics', LogisticsSchema);