import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserRole, UserStatus, AuthProvider } from '../types/user';

const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function (coordinates: number[]) {
        return coordinates.length === 2 &&
          coordinates[0]! >= -180 && coordinates[0]! <= 180 &&
          coordinates[1]! >= -90 && coordinates[1]! <= 90;
      },
      message: 'Invalid coordinates format'
    }
  },
  address: String,
  city: String,
  state: String,
  country: String
});

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (email: string) {
        return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function (phone: string) {
        return !phone || /^\+?[1-9]\d{1,14}$/.test(phone);
      },
      message: 'Invalid phone format'
    }
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    validate: {
      validator: function (address: string) {
        return !address || /^0x[a-fA-F0-9]{40}$/.test(address);
      },
      message: 'Invalid wallet address format'
    }
  },
  password: {
    type: String,
    required: function (this: any) {
      return this.authProvider === AuthProvider.EMAIL || this.authProvider === AuthProvider.PHONE;
    },
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.COLLECTOR
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING_VERIFICATION
  },
  authProvider: {
    type: String,
    enum: Object.values(AuthProvider),
    required: true
  },

  // Profile information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  profileImage: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },

  // Location
  location: LocationSchema,

  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isKYCVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [String],

  // Business information
  businessName: String,
  businessRegistrationNumber: String,
  businessType: String,

  // Statistics
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMaterialsSubmitted: {
    type: Number,
    default: 0,
    min: 0
  },
  ecoPoints: {
    type: Number,
    default: 0,
    min: 0
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

  // Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },

  // Timestamps
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

// Validation
UserSchema.pre('validate', function (this: any) {
  // Ensure at least one authentication method is provided
  if (!this.email && !this.phone && !this.walletAddress) {
    this.invalidate('auth', 'At least one authentication method (email, phone, or wallet) is required');
  }

  // Validate auth provider matches available credentials
  if (this.authProvider === AuthProvider.EMAIL && !this.email) {
    this.invalidate('email', 'Email is required for email authentication');
  }
  if (this.authProvider === AuthProvider.PHONE && !this.phone) {
    this.invalidate('phone', 'Phone is required for phone authentication');
  }
  if (this.authProvider === AuthProvider.WALLET && !this.walletAddress) {
    this.invalidate('walletAddress', 'Wallet address is required for wallet authentication');
  }
  if (this.authProvider === AuthProvider.GOOGLE && !this.email) {
    this.invalidate('email', 'Email is required for Google authentication');
  }
});

// Hash password before saving
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Methods
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
      status: this.status
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE as any }
  );
};

UserSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE as any }
  );
};

export default mongoose.model<IUser>('User', UserSchema);