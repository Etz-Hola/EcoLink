import { Request, Response, NextFunction } from 'express';
import Material from '../models/Material';
import { MaterialStatus } from '../types/material';
import { AppError } from '../utils/logger';
import { Types } from 'mongoose';

export class MaterialController {
    /**
     * Upload materials (Collector/Organization/Hotel)
     */
    static async uploadMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const { materials } = req.body; // Array of material data
            // In a real app, we'd handle multiple files from req.files

            if (!materials || !Array.isArray(materials)) {
                throw new AppError('Materials data is required', 400);
            }

            const createdMaterials = await Promise.all(materials.map(async (m: any) => {
                return await Material.create({
                    ...m,
                    submittedBy: (req as any).user._id,
                    currentOwner: (req as any).user._id,
                    status: MaterialStatus.PENDING
                });
            }));

            res.status(201).json({
                success: true,
                count: createdMaterials.length,
                data: createdMaterials
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get my materials
     */
    static async getMyMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const materials = await Material.find({ submittedBy: userId }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: materials.length,
                data: materials
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending materials for branches (nearby or all)
     */
    static async getPendingMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const { lat, lng, radius } = req.query;
            let query: any = { status: MaterialStatus.PENDING };

            if (lat && lng) {
                const center: [number, number] = [Number(lng), Number(lat)];
                const searchRadius = radius ? Number(radius) : 50;
                query.pickupLocation = {
                    $geoWithin: {
                        $centerSphere: [center, searchRadius / 6371]
                    }
                };
            }

            const materials = await Material.find(query).populate('submittedBy', 'username businessName').sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: materials.length,
                data: materials
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update material status and offer price (Branch)
     */
    static async reviewMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, offeredPrice, notes } = req.body;

            const material = await Material.findById(id);
            if (!material) {
                throw new AppError('Material not found', 404);
            }

            if (status) material.status = status;
            if (offeredPrice) {
                if (!material.pricing) material.pricing = {} as any;
                material.pricing.offeredPrice = offeredPrice;
                material.pricing.lastUpdated = new Date();
            }
            if (notes && material.qualityAssessment) {
                material.qualityAssessment.notes = notes;
            }

            if (status === MaterialStatus.APPROVED) {
                material.processingBranch = (req as any).user.branchId || (req as any).user._id;
                material.approvedAt = new Date();
            }

            await material.save();

            res.status(200).json({
                success: true,
                data: material
            });
        } catch (error) {
            next(error);
        }
    }
}
