import { Request, Response, NextFunction } from 'express';
import Bundle from '../models/Bundle';
import Material from '../models/Material';
import { BundleStatus } from '../types/bundle';
import { MaterialStatus } from '../types/material';
import { AppError } from '../utils/logger';

export class BundleController {
    /**
     * Create a bundle from accepted materials (Branch)
     */
    static async createBundle(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, materialIds, description } = req.body;
            const branchId = (req as any).user.branchId || (req as any).user._id;

            if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
                throw new AppError('At least one material is required to create a bundle', 400);
            }

            // Verify materials are accepted/delivered and belong to this branch
            const materials = await Material.find({
                _id: { $in: materialIds },
                status: { $in: [MaterialStatus.APPROVED, MaterialStatus.DELIVERED] }
            });

            if (materials.length !== materialIds.length) {
                throw new AppError('Some materials are not available for bundling (must be approved or delivered)', 400);
            }

            const totalWeight = materials.reduce((sum, m: any) => sum + (m.weight || 0), 0);
            const totalPrice = materials.reduce((sum, m: any) => sum + (m.weight * (m.pricing?.finalPrice || 0)), 0);

            const bundle = await Bundle.create({
                name,
                materialIds,
                branchId,
                totalWeight,
                totalPrice,
                description,
                status: BundleStatus.AVAILABLE
            });

            // Mark materials as bundled
            await Material.updateMany(
                { _id: { $in: materialIds } },
                { $set: { status: MaterialStatus.BUNDLED } }
            );

            // Notify uploaders
            const { NotificationService } = require('../services/notificationService');
            for (const material of materials) {
                await NotificationService.sendNotification({
                    recipient: material.submittedBy,
                    title: 'Material Bundled for Export',
                    message: `Your material (${material.materialType}) has been bundled into "${name}" and is ready for export!`,
                    type: 'info',
                    relatedId: bundle._id,
                    onModel: 'Bundle'
                });
            }

            res.status(201).json({
                success: true,
                data: bundle
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available bundles for exporters
     */
    static async getAvailableBundles(req: Request, res: Response, next: NextFunction) {
        try {
            const bundles = await Bundle.find({ status: BundleStatus.AVAILABLE })
                .populate('branchId', 'name location')
                .populate('materialIds', 'materialType weight')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: bundles.length,
                data: bundles
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Purchase a bundle (Exporter)
     */
    static async purchaseBundle(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exporterId = (req as any).user._id;

            const bundle = await Bundle.findById(id);
            if (!bundle || bundle.status !== BundleStatus.AVAILABLE) {
                throw new AppError('Bundle not available for purchase', 404);
            }

            bundle.status = BundleStatus.PURCHASED;
            bundle.exporterId = exporterId;
            await bundle.save();

            // Mark materials as sold
            await Material.updateMany(
                { _id: { $in: bundle.materialIds } },
                { $set: { status: MaterialStatus.SOLD, soldAt: new Date() } }
            );

            res.status(200).json({
                success: true,
                data: bundle
            });
        } catch (error) {
            next(error);
        }
    }
}
