import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import User from '../models/User';
import { IUser, ILoginCredentials, IRegisterData, IAuthResponse, AuthProvider, UserStatus } from '../types/user';
import { AppError } from '../utils/logger';
import { sendWelcomeEmail, sendVerificationEmail } from './notificationService';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: IRegisterData): Promise<IAuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.findExistingUser(userData);
      if (existingUser) {
        throw new AppError('User already exists with this email, phone, or wallet address', 400);
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Send welcome notification
      await this.sendWelcomeNotification(user);

      return {
        success: true,
        message: 'User registered successfully',
        user: this.sanitizeUser(user),
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Registration failed', 500);
    }
  }

  /**
   * Login user with credentials
   */
  static async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    try {
      let user: IUser | null = null;

      // Find user by identifier (email, phone, or wallet)
      if (credentials.identifier.includes('@')) {
        user = await User.findOne({ email: credentials.identifier.toLowerCase() });
      } else if (credentials.identifier.startsWith('+') || /^\d+$/.test(credentials.identifier)) {
        user = await User.findOne({ phone: credentials.identifier });
      } else if (credentials.identifier.startsWith('0x')) {
        user = await User.findOne({ walletAddress: credentials.identifier.toLowerCase() });
      }

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check user status
      if (user.status === UserStatus.SUSPENDED) {
        throw new AppError('Account suspended. Please contact support', 403);
      }

      // Verify credentials based on auth provider
      const isValid = await this.verifyCredentials(user, credentials);
      if (!isValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      return {
        success: true,
        message: 'Login successful',
        user: this.sanitizeUser(user),
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const user = await User.findById(payload.userId);

      if (!user || user.status === UserStatus.SUSPENDED) {
        throw new AppError('Invalid refresh token', 401);
      }

      const newAccessToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      return {
        success: true,
        message: 'Token refreshed successfully',
        user: this.sanitizeUser(user),
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Verify wallet signature for wallet authentication
   */
  static async verifyWalletSignature(walletAddress: string, message: string, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user || !user.email) {
      throw new AppError('User not found or email not provided', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    await sendVerificationEmail(user.email, user.firstName);
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId: string, token: string): Promise<void> {
    // Implementation would depend on your verification token system
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isEmailVerified = true;
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      user.status = UserStatus.ACTIVE;
    }
    await user.save();
  }

  /**
   * Logout user (invalidate tokens - would require token blacklisting)
   */
  static async logout(userId: string): Promise<void> {
    // In a production system, you would add the tokens to a blacklist
    // For now, we'll just update the last login
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  // Private helper methods
  private static async findExistingUser(userData: IRegisterData): Promise<IUser | null> {
    const conditions = [];
    
    if (userData.email) {
      conditions.push({ email: userData.email.toLowerCase() });
    }
    if (userData.phone) {
      conditions.push({ phone: userData.phone });
    }
    if (userData.walletAddress) {
      conditions.push({ walletAddress: userData.walletAddress.toLowerCase() });
    }

    if (conditions.length === 0) return null;

    return User.findOne({ $or: conditions });
  }

  private static async verifyCredentials(user: IUser, credentials: ILoginCredentials): Promise<boolean> {
    switch (user.authProvider) {
      case AuthProvider.EMAIL:
      case AuthProvider.PHONE:
        if (!credentials.password) return false;
        return user.comparePassword(credentials.password);
      
      case AuthProvider.WALLET:
        if (!credentials.signature || !credentials.message) return false;
        return this.verifyWalletSignature(user.walletAddress!, credentials.message, credentials.signature);
      
      default:
        return false;
    }
  }

  private static async sendWelcomeNotification(user: IUser): Promise<void> {
    try {
      if (user.email && user.notifications.email) {
        await sendWelcomeEmail(user.email, user.firstName);
      }
      // Add SMS welcome notification if needed
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send welcome notification:', error);
    }
  }

  private static sanitizeUser(user: IUser): Partial<IUser> {
    const sanitized = user.toJSON();
    delete sanitized.password;
    return sanitized;
  }
}