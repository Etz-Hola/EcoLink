import { Request, Response, NextFunction } from 'express';
import Branch from '../models/Branch';
import { AppError } from '../utils/logger';

export class BranchController {
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

            // Use the findNearby static method defined in Branch model
            // findNearby uses $centerSphere with radius in radians (radius / 6371)
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
