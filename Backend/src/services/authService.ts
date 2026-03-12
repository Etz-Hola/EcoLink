import jwt from 'jsonwebtoken';
import User from '../models/User';
import Invite from '../models/Invite';
import { IUser, IRegisterData, ILoginCredentials, IAuthResponse, UserRole, UserStatus, AuthProvider } from '../types/user';
import { IInvite, InviteStatus } from '../types/invite';
import { AppError } from '../utils/logger';
import logger from '../utils/logger';

export class AuthService {
    /**
     * Register a new user
     */
    static async register(data: IRegisterData): Promise<IAuthResponse> {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: data.email },
                    { username: data.username },
                    { phone: data.phone }
                ].filter(condition => Object.values(condition)[0] !== undefined)
            });

            if (existingUser) {
                throw new AppError('User with these credentials already exists', 400);
            }

            let userStatus = UserStatus.PENDING_VERIFICATION;
            let organizationId = data.organizationId;
            let businessName = data.businessName;

            // Handle Branch Signup logic (Option A - Invite Code OR Option B - Self-Signup)
            if (data.role === UserRole.BRANCH) {
                if (data.inviteCode) {
                    const invite = await Invite.findOne({
                        code: data.inviteCode.toUpperCase(),
                        status: InviteStatus.PENDING,
                        expiresAt: { $gt: new Date() }
                    });

                    if (!invite) {
                        throw new AppError('Invalid or expired invite code', 400);
                    }

                    // If invite is valid, auto-activate branch
                    userStatus = UserStatus.ACTIVE;
                    businessName = invite.businessName || businessName;
                    
                    // Store for later
                    (data as any)._inviteFound = invite;
                } else {
                    // No invite code provided -> Option B: Self-Signup + Admin Approval
                    userStatus = UserStatus.PENDING_APPROVAL;
                }
            }

            // Create new user
            const newUser = new User({
                ...data,
                status: userStatus,
                businessName: businessName
            });

            await newUser.save();

            // Additional logic for branch: mark invite as used and set organizationId to self if not provided
            if (data.role === UserRole.BRANCH && (data as any)._inviteFound) {
                const invite = (data as any)._inviteFound;
                invite.status = InviteStatus.USED;
                invite.usedBy = newUser._id;
                await invite.save();
                
                // Ensure organizationId is self for branch
                newUser.organizationId = newUser._id;
                await newUser.save();
            }

            const accessToken = newUser.generateAuthToken();
            const refreshToken = newUser.generateRefreshToken();

            logger.info(`User registered successfully: ${newUser._id} (${newUser.role})`);

            return {
                success: true,
                message: 'Registration successful',
                user: newUser,
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            logger.error('Registration failed:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Registration failed. Please try again.', 500);
        }
    }

    /**
     * Login user
     */
    static async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
        try {
            const { identifier, password, signature, message } = credentials;

            const user = await User.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier.toLowerCase() },
                    { phone: identifier },
                    { walletAddress: identifier.toLowerCase() }
                ]
            });

            if (!user) {
                throw new AppError('Invalid credentials', 401);
            }

            // Verify password if using email/phone/username
            if (user.authProvider !== AuthProvider.WALLET) {
                if (!password) throw new AppError('Password is required', 400);
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    throw new AppError('Invalid credentials', 401);
                }
            } else {
                // Wallet auth verification would happen here or in verifyWalletLogin
                if (!signature || !message) {
                    throw new AppError('Signature and message are required for wallet login', 400);
                }
                // (Verification logic omitted for brevity, should use siwe or similar)
            }

            if (user.status === UserStatus.SUSPENDED) {
                throw new AppError('Account is suspended. Please contact support.', 403);
            }

            user.lastLogin = new Date();
            await user.save();

            const accessToken = user.generateAuthToken();
            const refreshToken = user.generateRefreshToken();

            logger.info(`User logged in: ${user._id}`);

            return {
                success: true,
                message: 'Login successful',
                user,
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            logger.error('Login failed:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Login failed', 500);
        }
    }

    /**
     * Google Login/Signup
     */
    static async googleLogin(idToken: string, role?: string): Promise<IAuthResponse> {
        // Implementation for Google login...
        // This is a placeholder for the reconstructed logic
        throw new AppError('Google login reconstruction in progress', 501);
    }

    /**
     * Generate Nonce for SIWE
     */
    static generateNonce(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Verify Wallet Login
     */
    static async verifyWalletLogin(data: any): Promise<IAuthResponse> {
        // Implementation for wallet verification...
        throw new AppError('Wallet login reconstruction in progress', 501);
    }
}