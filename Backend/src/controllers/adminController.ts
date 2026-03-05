import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Material from '../models/Material';
import Bundle from '../models/Bundle';
import Transaction from '../models/Transaction';
import { UserRole } from '../types/user';
import { MaterialStatus } from '../types/material';
import { TransactionStatus, TransactionType } from '../types/transaction';
import { AppError } from '../utils/logger';

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
                revenueAgg,
                volumeAgg,
                usersByRole,
                materialsByStatus
            ] = await Promise.all([
                User.countDocuments(),
                Material.countDocuments(),
                Bundle.countDocuments(),
                Transaction.aggregate([
                    { $match: { status: TransactionStatus.SUCCESS, type: { $in: [TransactionType.PAYMENT, TransactionType.TRANSFER] } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Material.aggregate([
                    { $match: { status: { $in: [MaterialStatus.APPROVED, MaterialStatus.DELIVERED, MaterialStatus.BUNDLED, MaterialStatus.SOLD] } } },
                    { $group: { _id: null, total: { $sum: '$weight' } } }
                ]),
                User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
                Material.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
            ]);

            res.status(200).json({
                success: true,
                data: {
                    counts: {
                        users: totalUsers,
                        materials: totalMaterials,
                        bundles: totalBundles,
                        revenue: revenueAgg[0]?.total || 0,
                        volume: volumeAgg[0]?.total || 0
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
     * Get all users with search and filters
     */
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { search, role, status, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {};
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ];
            }
            if (role && role !== 'all') query.role = role;
            if (status && status !== 'all') query.status = status;

            const [users, total] = await Promise.all([
                User.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                User.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                count: users.length,
                total,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a user's role, status, or balance
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { role, status, balance } = req.body;

            const user = await User.findById(id);
            if (!user) throw new AppError('User not found', 404);

            if (role) user.role = role;
            if (status) user.status = status;
            if (typeof balance === 'number') user.balance = balance;

            await user.save();

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all materials across the platform
     */
    static async getMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, type, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {};
            if (status && status !== 'all') query.status = status;
            if (type && type !== 'all') query.materialType = type;

            const [materials, total] = await Promise.all([
                Material.find(query)
                    .populate('submittedBy', 'firstName lastName email businessName')
                    .populate('organizationId', 'businessName username')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Material.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                count: materials.length,
                total,
                data: materials
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bundles across the platform
     */
    static async getBundles(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {};
            if (status && status !== 'all') query.status = status;

            const [bundles, total] = await Promise.all([
                Bundle.find(query)
                    .populate('branchId', 'name location')
                    .populate('organizationId', 'businessName username')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Bundle.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                count: bundles.length,
                total,
                data: bundles
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all transactions across the platform
     */
    static async getTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { type, status, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {};
            if (type && type !== 'all') query.type = type;
            if (status && status !== 'all') query.status = status;

            const [transactions, total] = await Promise.all([
                Transaction.find(query)
                    .populate('user', 'firstName lastName email')
                    .populate('organizationId', 'businessName username')
                    .populate('sender', 'firstName lastName')
                    .populate('recipient', 'firstName lastName')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Transaction.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                count: transactions.length,
                total,
                data: transactions
            });
        } catch (error) {
            next(error);
        }
    }
}
