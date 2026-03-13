import jwt from 'jsonwebtoken';
import User from '../models/User';
import Invite from '../models/Invite';
import { IRegisterData, ILoginCredentials, IAuthResponse, UserRole, UserStatus, AuthProvider } from '../types/user';
import { InviteStatus } from '../types/invite';
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
            let businessName = data.businessName;
            let resolvedInvite: any = null;
            let inviteActivated = false;

            // Handle Branch / Exporter Signup (Option A - Invite Code OR Option B - Self-Signup pending admin)
            if (data.role === UserRole.BRANCH || data.role === UserRole.EXPORTER) {
                if (data.inviteCode) {
                    const invite = await Invite.findOne({
                        code: data.inviteCode.toUpperCase(),
                        status: InviteStatus.PENDING,
                        expiresAt: { $gt: new Date() }
                    });

                    if (!invite) {
                        throw new AppError('Invalid or expired invite code', 400);
                    }

                    // Invite is valid → auto-activate
                    userStatus = UserStatus.ACTIVE;
                    businessName = invite.businessName || businessName;
                    resolvedInvite = invite;
                    inviteActivated = true;
                } else {
                    // No invite code → Self-Signup + pending admin approval
                    userStatus = UserStatus.PENDING_APPROVAL;
                }
            }

            // Create the User document
            const newUser = new User({
                ...data,
                status: userStatus,
                businessName
            });

            await newUser.save();

            // Mark invite as used
            if (resolvedInvite) {
                resolvedInvite.status = InviteStatus.USED;
                resolvedInvite.usedBy = newUser._id;
                await resolvedInvite.save();
            }

            // If immediately approved (invite code), create the entity document and link it
            if (inviteActivated) {
                if (data.role === UserRole.BRANCH) {
                    newUser.branchId = await AuthService._createBranchForUser(newUser, businessName);
                } else if (data.role === UserRole.EXPORTER) {
                    newUser.companyId = await AuthService._createCompanyForUser(newUser, businessName);
                }
                await newUser.save();
            }

            const accessToken = newUser.generateAuthToken();
            const refreshToken = newUser.generateRefreshToken();

            const message = (data.role === UserRole.BRANCH || data.role === UserRole.EXPORTER)
                ? inviteActivated
                    ? 'Registration successful. Your account is now active.'
                    : 'Registration submitted. Your account is pending admin approval.'
                : 'Registration successful';

            logger.info(`User registered successfully: ${newUser._id} (${newUser.role})`);

            return {
                success: true,
                message,
                user: newUser,
                tokens: { accessToken, refreshToken }
            };
        } catch (error) {
            logger.error('Registration failed:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Registration failed. Please try again.', 500);
        }
    }

    /**
     * Create a Branch document for a newly registered branch user.
     * Returns the Branch _id.
     */
    static async _createBranchForUser(user: any, businessName?: string): Promise<any> {
        // Lazy-require to avoid circular dependency issues
        const Branch = require('../models/Branch').default;
        const { BranchStatus, BranchType } = require('../types/branch');

        // Use user's location if available, otherwise fall back to Lagos default
        const location = (user.location && user.location.coordinates && user.location.coordinates.length === 2)
            ? user.location
            : {
                type: 'Point',
                coordinates: [3.3792, 6.5244],
                address: 'To be updated',
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria'
            };

        const branch = new Branch({
            name: businessName || user.businessName || `${user.firstName}'s Branch`,
            code: `BR${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
            description: `Branch owned by ${user.firstName} ${user.lastName}`,
            branchType: BranchType.COLLECTION_POINT,
            status: BranchStatus.ACTIVE,
            ownerId: user._id,
            contactPerson: {
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phone || '0000000000',
                email: user.email || `${user.username}@ecolink.ng`,
                position: 'Owner'
            },
            location,
            servingRadius: 50,
            capacity: {
                current: 0,
                maximum: 10000,
                reserved: 0,
                available: 10000
            },
            processingCapabilities: {
                materialTypes: ['plastic', 'metal', 'paper', 'glass', 'household'],
                treatments: [],
                maxBatchSize: 1000,
                processingTimeHours: 24,
                qualityGrades: ['A', 'B', 'C', 'D']
            },
            commissionRate: 5
        });

        await branch.save();
        logger.info(`Branch document created: ${branch._id} for user ${user._id}`);
        return branch._id;
    }

    /**
     * Create a Company document for a newly registered exporter user.
     * Returns the Company _id.
     */
    static async _createCompanyForUser(user: any, businessName?: string): Promise<any> {
        const Company = require('../models/Company').default;
        const { CompanyStatus } = require('../types/company');

        const company = new Company({
            name: businessName || user.businessName || `${user.firstName}'s Company`,
            businessType: user.businessType || 'exporter',
            ownerId: user._id,
            status: CompanyStatus.ACTIVE,
            location: user.location,
            balance: 0,
            currency: 'NGN',
            isVerified: false
        });

        await company.save();
        logger.info(`Company document created: ${company._id} for user ${user._id}`);
        return company._id;
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
                if (!signature || !message) {
                    throw new AppError('Signature and message are required for wallet login', 400);
                }
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
                tokens: { accessToken, refreshToken }
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
        throw new AppError('Wallet login reconstruction in progress', 501);
    }
}