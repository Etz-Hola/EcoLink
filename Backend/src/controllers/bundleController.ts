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
            const user = (req as any).user;
            const branchId = user.branchId || user.organizationId || user._id;
            const organizationId = user.organizationId || user._id;

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
                organizationId,
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
                await NotificationService.sendNotification(material.submittedBy.toString(), {
                    title: 'Material Bundled for Export 🚢',
                    message: `Your material (${material.materialType}) has been bundled into "${name}" and is ready for export!`,
                    type: 'material',
                    metadata: { materialId: material._id, bundleId: bundle._id }
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
     * Purchase a bundle (Exporter) - Changes status to REQUESTED
     */
    static async purchaseBundle(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exporterId = (req as any).user._id;

            const bundle = await Bundle.findById(id);
            if (!bundle || bundle.status !== BundleStatus.AVAILABLE) {
                throw new AppError('Bundle not available for purchase', 404);
            }

            bundle.status = BundleStatus.REQUESTED;
            bundle.exporterId = exporterId;
            bundle.organizationId = (req as any).user.organizationId || exporterId; // The buying organization
            await bundle.save();

            // Notify branch
            const { NotificationService } = require('../services/notificationService');
            await NotificationService.sendNotification(bundle.branchId.toString(), {
                title: 'Bundle Purchase Requested! 💰',
                message: `An exporter has requested to purchase bundle "${bundle.name}". Please review and accept.`,
                type: 'bundle',
                metadata: { bundleId: bundle._id }
            });

            res.status(200).json({
                success: true,
                message: 'Purchase request sent to branch',
                data: bundle
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Accept purchase request (Branch)
     */
    static async acceptBundleRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const branchId = (req as any).user.branchId || (req as any).user.organizationId || (req as any).user._id;

            const bundle = await Bundle.findById(id);
            if (!bundle) throw new AppError('Bundle not found', 404);

            if (bundle.branchId.toString() !== branchId.toString()) {
                throw new AppError('Not authorized to accept requests for this bundle', 403);
            }

            if (bundle.status !== BundleStatus.REQUESTED) {
                throw new AppError('Bundle is not in requested status', 400);
            }

            bundle.status = BundleStatus.PURCHASED;
            await bundle.save();

            // Notify exporter
            const { NotificationService } = require('../services/notificationService');
            if (bundle.exporterId) {
                await NotificationService.sendNotification(bundle.exporterId.toString(), {
                    title: 'Purchase Request Accepted! ✅',
                    message: `Your request to purchase bundle "${bundle.name}" has been accepted. You can now schedule pickup.`,
                    type: 'bundle',
                    metadata: { bundleId: bundle._id }
                });
            }

            res.status(200).json({
                success: true,
                message: 'Purchase request accepted',
                data: bundle
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify receipt of bundle and release payment (Exporter)
     */
    static async verifyBundleReceipt(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exporterOrgId = (req as any).user.organizationId || (req as any).user._id;

            const bundle = await Bundle.findById(id);
            if (!bundle) throw new AppError('Bundle not found', 404);

            if (bundle.organizationId.toString() !== exporterOrgId.toString()) {
                throw new AppError('Only the purchasing organization can verify receipt', 403);
            }

            if (bundle.status !== BundleStatus.PURCHASED && bundle.status !== BundleStatus.IN_TRANSIT) {
                throw new AppError('Bundle must be purchased or in transit to verify receipt', 400);
            }

            bundle.status = BundleStatus.SOLD;
            await bundle.save();

            // Mark materials as sold (if not already)
            await Material.updateMany(
                { _id: { $in: bundle.materialIds } },
                { $set: { status: MaterialStatus.SOLD, soldAt: new Date() } }
            );

            // Release Payment (Exporter Org -> Branch Org)
            const { PaymentService } = require('../services/paymentService');
            await PaymentService.processInternalTransfer(
                `bundle_${bundle._id}`, // Fake material ID for tracking
                exporterOrgId.toString(),
                bundle.branchId.toString(),
                bundle.totalPrice,
                bundle._id.toString() // batchId/bundleId
            );

            // Notify Branch
            const { NotificationService } = require('../services/notificationService');
            await NotificationService.sendNotification(bundle.branchId.toString(), {
                title: 'Payment Received for Bundle! 🚢',
                message: `Payment of ₦${bundle.totalPrice.toLocaleString()} has been received for bundle "${bundle.name}".`,
                type: 'payment',
                metadata: { bundleId: bundle._id, amount: bundle.totalPrice }
            });

            res.status(200).json({
                success: true,
                message: 'Bundle receipt verified and payment released',
                data: bundle
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get bundles created by the authenticated branch
     */
    static async getMyBundles(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const organizationId = user.organizationId || user._id;
            const bundles = await Bundle.find({ organizationId })
                .populate('materialIds', 'materialType weight condition')
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
}
