import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/logger';
import { UserRole } from '../types/user';

export class UserController {
    /**
     * Update user role
     */
    static async updateRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { role } = req.body;
            const userId = req.user.userId; // Assuming auth middleware attaches user to req

            // Validate role
            if (!Object.values(UserRole).includes(role)) {
                throw new AppError('Invalid role', 400);
            }

            // Prevent setting admin role via this endpoint
            if (role === UserRole.ADMIN) {
                throw new AppError('Cannot set admin role', 403);
            }

            const user = await User.findById(userId);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Update role
            user.role = role;

            // If user was pending, changing role activates them (or moves them to next step)
            // For now, let's assume it keeps them active or sets them to active if they were pending verification?
            // Actually, if they are 'pending' role, they might be 'active' status. 
            // Let's just update the role.

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
}
