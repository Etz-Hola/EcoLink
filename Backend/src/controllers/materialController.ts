import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Material from '../models/Material';
import User from '../models/User';
import { MaterialStatus } from '../types/material';
import { AppError } from '../utils/logger';
import { PaymentService } from '../services/paymentService';
import { NotificationService } from '../services/notificationService';

export class MaterialController {
    /**
     * Upload materials (Collector/Organization/Hotel)
     */
    static async uploadMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;

            // Extract location from request body (sent from frontend geolocation)
            const lat = parseFloat(req.body.lat) || 6.5244;
            const lng = parseFloat(req.body.lng) || 3.3792;
            const address = req.body.address || (user.location?.address) || 'Lagos Island';
            const city = req.body.city || (user.location?.city) || 'Lagos';
            const state = req.body.state || (user.location?.state) || 'Lagos';

            const pickupLocation = {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number],
                address,
                city,
                state
            };

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
                // Fallback: treat the body itself as a single material
                if (req.body.type || req.body.weightKg || req.body.weight) {
                    materialsData = [req.body];
                } else {
                    throw new AppError('No materials data provided', 400);
                }
            }

            const createdMaterials = await Promise.all(materialsData.map(async (m: any) => {
                const frontendType = (m.type || 'plastic').toLowerCase();
                const subType = m.subType || m.subtype || (
                    frontendType === 'pet' || frontendType === 'hdpe' ? frontendType :
                        frontendType === 'aluminum' || frontendType === 'steel' ? frontendType : 'other'
                );

                // Map to valid backend enums
                let backMaterialType: string;
                if (['plastic', 'pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps'].includes(frontendType)) {
                    backMaterialType = 'plastic';
                } else if (['metal', 'aluminum', 'copper', 'steel', 'iron'].includes(frontendType)) {
                    backMaterialType = 'metal';
                } else {
                    backMaterialType = 'household';
                }

                // Map subType to valid enums
                const validPlastics = ['pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps', 'other'];
                const validMetals = ['aluminum', 'copper', 'steel', 'brass', 'scrap'];
                const validHousehold = ['paper', 'cardboard', 'glass', 'textile', 'organic', 'other'];

                let validSubType = 'other';
                if (backMaterialType === 'plastic' && validPlastics.includes(subType)) validSubType = subType;
                else if (backMaterialType === 'plastic') validSubType = 'other';
                else if (backMaterialType === 'metal' && validMetals.includes(subType)) validSubType = subType;
                else if (backMaterialType === 'metal') validSubType = 'scrap';
                else if (backMaterialType === 'household' && validHousehold.includes(subType)) validSubType = subType;
                else if (backMaterialType === 'household') validSubType = 'other';

                const condition = m.quality === 'treated_clean' || m.condition === 'clean' ? 'clean' :
                    m.condition === 'treated' ? 'treated' :
                        m.condition === 'untreated' ? 'untreated' : 'dirty';

                const weight = parseFloat(m.weightKg) || parseFloat(m.weight) || 1;
                const userName = user.firstName || user.username || 'User';

                return await Material.create({
                    title: `${backMaterialType.charAt(0).toUpperCase()}${backMaterialType.slice(1)} - ${validSubType.toUpperCase()} by ${userName}`,
                    description: m.description || `${validSubType.toUpperCase()} materials submitted by ${userName} from ${city}`,
                    materialType: backMaterialType,
                    subType: validSubType,
                    condition,
                    weight,
                    status: MaterialStatus.PENDING,
                    submittedBy: user._id,
                    currentOwner: user._id,
                    pickupLocation,
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
            const materials = await Material.find({ submittedBy: userId })
                .sort({ createdAt: -1 })
                .populate('submittedBy', 'firstName lastName username email');

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
     * Get materials for branches (nearby or by status)
     * Default: pending, but supports ?status=approved,rejected,delivered,etc or status=all
     */
    static async getPendingMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const { lat, lng, radius, status } = req.query as {
                lat?: string;
                lng?: string;
                radius?: string;
                status?: string;
            };

            const query: any = {};

            if (status && status !== 'all') {
                const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
                query.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
            } else {
                query.status = MaterialStatus.PENDING;
            }

            if (lat && lng) {
                const center: [number, number] = [Number(lng), Number(lat)];
                const searchRadius = radius ? Number(radius) : 50;
                query.pickupLocation = {
                    $geoWithin: {
                        $centerSphere: [center, searchRadius / 6371]
                    }
                };
            }

            const materials = await Material.find(query)
                .populate('submittedBy', 'firstName lastName username businessName')
                .sort({ createdAt: -1 });

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

            if (status === MaterialStatus.APPROVED || status === MaterialStatus.REJECTED) {
                material.processingBranch = (req as any).user.branchId || (req as any).user._id;
                if (status === MaterialStatus.APPROVED) material.approvedAt = new Date();
            }

            await material.save();

            // Notify uploader of status/price update
            await NotificationService.sendMaterialStatusUpdate(
                material.submittedBy.toString(),
                material._id.toString(),
                'pending',
                material.status
            );

            res.status(200).json({
                success: true,
                data: material
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify physical delivery and trigger payment release
     */
    static async verifyMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const branchId = (req as any).user.branchId || (req as any).user._id;

            const material = await Material.findById(id);
            if (!material) {
                throw new AppError('Material not found', 404);
            }

            // Ensure this branch is assigned or it's a valid intake
            // For now, simplicity: if status is approved/accepted
            // if (material.status !== MaterialStatus.APPROVED && material.status !== 'accepted') {
            //     throw new AppError('Material must be in approved status to verify delivery', 400);
            // }

            if (material.status !== MaterialStatus.APPROVED) {
                throw new AppError('Material must be in approved status to verify delivery', 400);
            }

            material.status = MaterialStatus.DELIVERED;
            material.deliveredAt = new Date();
            material.currentOwner = (req as any).user.branchId || (req as any).user._id;

            // Process Payment Release
            const collectorId = material.submittedBy;
            const amount = (material as any).totalValue || (material.weight * (material.pricing?.finalPrice || 0));

            await PaymentService.processInternalTransfer(
                material._id.toString(),
                branchId.toString(),
                collectorId.toString(),
                amount
            );

            await material.save();

            // Notify uploader of payment release
            await NotificationService.sendNotification(collectorId.toString(), {
                title: 'Payment Released 💸',
                message: `Payment of ₦${amount.toLocaleString()} has been released to your balance for your ${material.materialType} upload.`,
                type: 'payment',
                metadata: { materialId: material._id.toString(), amount }
            });

            res.status(200).json({
                success: true,
                message: 'Delivery verified and payment released successfully',
                data: material
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /materials/:id/schedule-pickup
     * Called by Collector/Organization when they are ready for pickup.
     * Notifies the relevant branch manager.
     */
    static async schedulePickup(req: Request, res: Response, next: NextFunction) {
        try {
            const material = await Material.findById(req.params.id)
                .populate('submittedBy', 'username businessName firstName lastName')
                .populate('branch', '_id');

            if (!material) throw new AppError('Material not found', 404);

            const user = (req as any).user;
            // Only the uploader can schedule pickup
            if (material.submittedBy._id.toString() !== user._id.toString()) {
                throw new AppError('Not authorized to schedule pickup for this material', 403);
            }

            if (!['approved', 'accepted'].includes(material.status)) {
                throw new AppError('Material must be accepted by a branch before scheduling pickup', 400);
            }

            material.status = 'pickup_scheduled' as any;
            await material.save();

            // Notify the branch manager (find admins/branches)
            const branchId = (material as any).branch || (material as any).reviewedBy;
            if (branchId) {
                await NotificationService.sendNotification(branchId.toString(), {
                    title: 'Pickup Scheduled 🚚',
                    message: `Uploader has confirmed they are ready for pickup of ${material.materialType} (${material.weight}kg). Please arrange collection.`,
                    type: 'material',
                    metadata: { materialId: material._id.toString(), status: 'pickup_scheduled' }
                });
            }

            // Also notify uploader/collector for confirmation
            await NotificationService.sendNotification(user._id.toString(), {
                title: 'Pickup Request Sent ✅',
                message: `Your pickup request for ${material.materialType} (${material.weight}kg) has been submitted. The branch will contact you shortly.`,
                type: 'material',
                metadata: { materialId: material._id.toString(), status: 'pickup_scheduled' }
            });

            res.status(200).json({
                success: true,
                message: 'Pickup scheduled. Branch has been notified.',
                data: material
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /materials/:id/appeal
     * Collector appeals a rejection. Creates an admin notification ticket.
     */
    static async appealMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const material = await Material.findById(req.params.id)
                .populate('submittedBy', 'username businessName firstName lastName');

            if (!material) throw new AppError('Material not found', 404);

            const user = (req as any).user;
            if (material.submittedBy._id.toString() !== user._id.toString()) {
                throw new AppError('Not authorized to appeal this material', 403);
            }

            if (material.status !== MaterialStatus.REJECTED) {
                throw new AppError('Only rejected materials can be appealed', 400);
            }

            const { reason } = req.body;

            // Find all admins and notify them
            const admins = await User.find({ role: 'admin' }).select('_id');
            const appealNotifPromises = admins.map(admin =>
                NotificationService.sendNotification(admin._id.toString(), {
                    title: '⚠️ Rejection Appeal Received',
                    message: `User ${user.username || user.businessName} is appealing the rejection of their ${material.materialType} (${material.weight}kg) upload.${reason ? ` Reason: ${reason}` : ''}`,
                    type: 'material',
                    metadata: {
                        materialId: material._id.toString(),
                        appealedBy: user._id.toString(),
                        reason: reason || 'No reason provided'
                    }
                })
            );
            await Promise.all(appealNotifPromises);

            // Notify the uploader that appeal was submitted
            await NotificationService.sendNotification(user._id.toString(), {
                title: 'Appeal Submitted 📋',
                message: `Your appeal for the rejected ${material.materialType} (${material.weight}kg) upload has been submitted. Our admin team will review it within 24 hours.`,
                type: 'material',
                metadata: { materialId: material._id.toString() }
            });

            res.status(200).json({
                success: true,
                message: 'Appeal submitted successfully. Admin has been notified.',
                data: { materialId: material._id, status: material.status }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /materials/:id/confirm-pickup
     * Called by Branch to confirm they are heading/ready for pickup.
     */
    static async confirmPickup(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const branchId = (req as any).user.branchId || (req as any).user._id;

            const material = await Material.findById(id);
            if (!material) throw new AppError('Material not found', 404);

            if (material.status !== MaterialStatus.APPROVED) {  // ← use the enum, not string
                throw new AppError('Material must be approved before confirming pickup', 400);
            }

            material.status = 'pickup_scheduled' as any;
            await material.save();

            // Notify uploader
            await NotificationService.sendNotification(material.submittedBy.toString(), {
                title: 'Pickup Confirmed! 🚚',
                message: `A branch manager has confirmed your pickup request. Please have your materials ready.`,
                type: 'material',
                metadata: { materialId: material._id.toString(), status: 'pickup_scheduled' }
            });

            res.status(200).json({
                success: true,
                message: 'Pickup confirmed and uploader notified',
                data: material
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /materials/stats/branch
     * Returns stats for the authenticated branch
     */
    static async getBranchStats(req: Request, res: Response, next: NextFunction) {
        try {
            const branchId = (req as any).user.branchId || (req as any).user._id;
            const lat = parseFloat(req.query.lat as string) || 6.5244;
            const lng = parseFloat(req.query.lng as string) || 3.3792;
            const radius = parseFloat(req.query.radius as string) || 50;

            const center: [number, number] = [lng, lat];

            // 1. Pending nearby
            const pendingNearbyCount = await Material.countDocuments({
                status: MaterialStatus.PENDING,
                pickupLocation: {
                    $geoWithin: {
                        $centerSphere: [center, radius / 6371]
                    }
                }
            });

            // 2. Branch specific stats
            const stats = await Material.aggregate([
                { $match: { processingBranch: new Types.ObjectId(branchId.toString()) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statusCounts: Record<string, number> = {
                pending: pendingNearbyCount,
                approved: 0,
                delivered: 0,
                rejected: 0,
                processed: 0
            };

            stats.forEach(s => {
                if (statusCounts.hasOwnProperty(s._id)) {
                    statusCounts[s._id] = s.count;
                }
            });

            res.status(200).json({
                success: true,
                data: statusCounts
            });
        } catch (error) {
            next(error);
        }
    }
}
