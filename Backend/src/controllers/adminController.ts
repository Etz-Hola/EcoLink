import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Material from '../models/Material';
import Bundle from '../models/Bundle';
import { UserRole, UserStatus } from '../types/user';
import { MaterialStatus } from '../types/material';

export class AdminController {
    /**
     * Get global statistics
     */
    static async getGlobalStats(req: Request, res: Response, next: NextFunction) {
        try {
            const [
                totalUsers,
                totalMaterials,
                totalBundles,
                usersByRole,
                materialsByStatus
            ] = await Promise.all([
                User.countDocuments(),
                Material.countDocuments(),
                Bundle.countDocuments(),
                User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
                Material.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
            ]);

            res.status(200).json({
                success: true,
                data: {
                    counts: {
                        users: totalUsers,
                        materials: totalMaterials,
                        bundles: totalBundles
                    },
                    distribution: {
                        usersByRole,
                        materialsByStatus
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user activity tracking
     */
    static async getUserTracking(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await User.find()
                .select('username role status createdAt lastLogin totalMaterialsSubmitted ecoPoints')
                .sort({ createdAt: -1 })
                .limit(100);

            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }
}
