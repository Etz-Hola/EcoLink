import mongoose, { Schema } from 'mongoose';
import { ICompany, CompanyStatus } from '../types/company';

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
  address: String,
  city: String,
  state: String,
  country: {
    type: String,
    default: 'Nigeria'
  }
});

const CompanySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  businessType: {
    type: String,
    trim: true
  },

  // Owner
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Status
  status: {
    type: String,
    enum: Object.values(CompanyStatus),
    default: CompanyStatus.INACTIVE
  },

  // Location
  location: {
    type: LocationSchema
  },

  // Financial
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  licenseNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
CompanySchema.index({ ownerId: 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ location: '2dsphere' }, { sparse: true });

export default mongoose.model<ICompany>('Company', CompanySchema);
