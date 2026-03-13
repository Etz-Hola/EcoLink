import { Request, Response, NextFunction } from 'express';
import Branch from '../models/Branch';
import { AppError } from '../utils/logger';

export class BranchController {
    /**
     * Get the authenticated user's own Branch document
     * @route GET /api/v1/branches/my-branch
     */
    static async getMyBranch(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;

            if (!user.branchId) {
                throw new AppError('No branch linked to this account', 404);
            }

            const branch = await Branch.findById(user.branchId);
            if (!branch) {
                throw new AppError('Branch not found', 404);
            }

            res.status(200).json({
                success: true,
                data: branch
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get nearby branches based on coordinates
     * @route GET /api/v1/branches/nearby
     */
    static async getNearbyBranches(req: Request, res: Response, next: NextFunction) {
        try {
            const { lat, lng, radius } = req.query;

            if (!lat || !lng) {
                throw new AppError('Latitude and longitude are required', 400);
            }

            const center: [number, number] = [Number(lng), Number(lat)];
            const searchRadius = radius ? Number(radius) : 50; // default 50km

            const branches = await (Branch as any).findNearby(center, searchRadius);

            res.status(200).json({
                success: true,
                count: branches.length,
                data: branches
            });
        } catch (error) {
            next(error);
        }
    }
}
