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
            const user = (req as any).user;
            let materialsData: any[] = [];

            // Handle both JSON and Multipart
            if (req.body.materials && Array.isArray(req.body.materials)) {
                materialsData = req.body.materials;
            } else {
                // Reconstruct materials from FormData keys like materials[0][type]
                const materialsMap: Record<number, any> = {};
                Object.keys(req.body).forEach(key => {
                    const match = key.match(/^materials\[(\d+)\]\[(\w+)\]$/);
                    if (match) {
                        const index = parseInt(match[1]!);
                        const field = match[2]!;
                        if (!materialsMap[index]) materialsMap[index] = {};
                        materialsMap[index][field] = req.body[key];
                    }
                });
                materialsData = Object.values(materialsMap);
            }

            if (materialsData.length === 0) {
                // Fallback: check if it's a simple object
                if (req.body.type && req.body.weightKg) {
                    materialsData = [req.body];
                } else {
                    throw new AppError('No materials data provided', 400);
                }
            }

            // Default location if user has one
            const defaultLocation = user.location || {
                type: 'Point',
                coordinates: [3.3792, 6.5244], // Lagos
                address: 'Lagos Island',
                city: 'Lagos',
                state: 'Lagos'
            };

            const createdMaterials = await Promise.all(materialsData.map(async (m: any) => {
                const materialType = (m.type || 'plastic').toLowerCase();

                // Map frontend values to backend enums
                let backMaterialType: any = 'plastic';
                if (materialType === 'pet' || materialType === 'hdpe') backMaterialType = 'plastic';
                else if (materialType === 'aluminum' || materialType === 'steel' || materialType === 'metal') backMaterialType = 'metal';
                else if (materialType === 'paper' || materialType === 'organic') backMaterialType = 'household';

                return await Material.create({
                    title: `${materialType.toUpperCase()} Materials from ${user.username}`,
                    description: m.description || `Batch of ${materialType} materials submitted by ${user.username}`,
                    materialType: backMaterialType,
                    subType: m.subType || (materialType === 'pet' ? 'pet' : materialType === 'hdpe' ? 'hdpe' : materialType === 'aluminum' ? 'aluminum' : materialType === 'paper' ? 'paper' : 'other'),
                    condition: m.quality === 'treated_clean' ? 'clean' : 'dirty',
                    weight: parseFloat(m.weightKg) || parseFloat(m.weight) || 1,
                    status: MaterialStatus.PENDING,
                    submittedBy: user._id,
                    currentOwner: user._id,
                    pickupLocation: defaultLocation,
                    pricing: {
                        basePrice: 100,
                        finalPrice: 100,
                        currency: 'NGN'
                    },
                    images: [{
                        url: 'https://images.unsplash.com/photo-1591193520257-c030ea05fa81?q=80&w=300&h=200&auto=format&fit=crop',
                        publicId: 'placeholder',
                        filename: 'placeholder.jpg',
                        size: 1024,
                        mimeType: 'image/jpeg'
                    }]
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
