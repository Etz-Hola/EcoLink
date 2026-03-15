import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/logger';
import { UserRole, UserStatus } from '../types/user';

export class UserController {
    /**
     * Update user role   
     */
    static async updateRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { role } = req.body;
            const user = req.user; // Get user from protect middleware

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Validate role
            if (!Object.values(UserRole).includes(role)) {
                throw new AppError('Invalid role', 400);
            }

            // Prevent setting admin role via this endpoint
            if (role === UserRole.ADMIN) {
                throw new AppError('Cannot set admin role', 403);
            }

            // Update role
            user.role = role;

            // If switching to a business-level role after signup, require admin approval
            if (role === UserRole.BRANCH || role === UserRole.EXPORTER) {
                user.status = UserStatus.PENDING_APPROVAL;
            } else {
                // Collectors and standard organizations are active by default
                user.status = UserStatus.ACTIVE;
            }

            await user.save();

            // Return updated user and potentially a new token if role is embedded in token
            const newToken = user.generateAuthToken();
            const newRefreshToken = user.generateRefreshToken();

            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                user: {
                    ...user.toJSON(),
                    role: user.role
                },
                tokens: {
                    accessToken: newToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get organization balance (shared across entity)
     * GET /users/organization/balance
     */
    static async getOrganizationBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const organizationId = user.organizationId || user._id;

            const organization = await User.findById(organizationId).select('balance currency');
            if (!organization) {
                throw new AppError('Organization not found', 404);
            }

            res.status(200).json({
                success: true,
                data: {
                    balance: organization.balance || 0,
                    currency: (organization as any).currency || 'NGN',
                    organizationId
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
