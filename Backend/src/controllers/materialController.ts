import { PaymentService } from '../services/paymentService';

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

            if (status === MaterialStatus.APPROVED) {
                material.processingBranch = (req as any).user.branchId || (req as any).user._id;
                material.approvedAt = new Date();
            }

            // Trigger payment when marked as processed
            if (status === MaterialStatus.PROCESSED && material.status !== MaterialStatus.PROCESSED) {
                const branchId = (req as any).user.branchId || (req as any).user._id;
                const collectorId = material.submittedBy;
                const amount = material.totalValue || (material.weight * (material.pricing?.finalPrice || 0));

                // background process or await if we want strict consistency
                await PaymentService.processInternalTransfer(
                    material._id.toString(),
                    branchId.toString(),
                    collectorId.toString(),
                    amount
                );
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
