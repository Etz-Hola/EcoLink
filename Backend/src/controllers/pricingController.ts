import { Request, Response, NextFunction } from 'express';
import PricingRule from '../models/PricingRule';
import { AppError } from '../utils/logger';
import { UserRole } from '../types/user';
import { PricingStrategy, PriceFactorType } from '../types/pricing';

export class PricingController {
    /**  
     * GET /pricing
     * Returns active global price rules — one per materialType+condition combo.
     * Used by branches to auto-fill price when reviewing materials.
     */
    static async getGlobalPrices(req: Request, res: Response, next: NextFunction) {
        try {
            const rules = await PricingRule.find({ isActive: true, approvalStatus: 'approved' })
                .select('materialType conditions basePrice name description updatedAt')
                .sort({ materialType: 1, basePrice: -1 });

            // Also include "pending" admin-set rules so they still show as defaults
            const pendingAdminRules = await PricingRule.find({
                isActive: true,
                approvalStatus: 'pending',
            }).select('materialType conditions basePrice name description updatedAt');

            const combined = [...rules, ...pendingAdminRules];

            res.status(200).json({
                success: true,
                count: combined.length,
                data: combined
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /pricing/update
     * Admin sets/updates global pricing for a material type + condition.
     * Automatically approved since the requester is an admin.
     * Body: { materialType, condition, pricePerKg, description? }
     */
    static async setGlobalPrice(req: Request, res: Response, next: NextFunction) {
        try {
            const { materialType, condition, pricePerKg, description } = req.body;
            const adminId = (req as any).user._id;

            if (!materialType || !pricePerKg || pricePerKg < 0) {
                throw new AppError('materialType and a valid pricePerKg are required', 400);
            }

            const name = `${materialType}${condition ? ` (${condition})` : ''} — Admin Rate`;

            // Upsert: update existing rule if found, or create new
            const existing = await PricingRule.findOne({
                materialType,
                ...(condition ? { conditions: condition } : {}),
                createdBy: adminId,
                isActive: true
            });

            if (existing) {
                existing.basePrice = pricePerKg;
                existing.name = name;
                existing.description = description || `Admin-set rate for ${materialType}${condition ? ` (${condition})` : ''}`;
                existing.approvalStatus = 'approved';
                existing.approvedBy = adminId;
                await existing.save();

                res.status(200).json({ success: true, data: existing, message: 'Pricing updated' });
                return;
            }

            const newRule = await PricingRule.create({
                name,
                description: description || `Admin-set rate for ${materialType}${condition ? ` (${condition})` : ''}`,
                isActive: true,
                priority: 90, // high priority for admin rules
                materialType,
                conditions: condition ? [condition] : [],
                strategy: PricingStrategy.FIXED,
                basePrice: pricePerKg,
                currency: 'NGN',
                priceFactors: [{
                    type: PriceFactorType.BASE_PRICE,
                    value: pricePerKg,
                    isPercentage: false,
                    description: 'Admin-set base price'
                }],
                validFrom: new Date(),
                createdBy: adminId,
                approvedBy: adminId,
                approvalStatus: 'approved'
            });

            res.status(201).json({ success: true, data: newRule, message: 'Pricing rule created' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /pricing/defaults/:materialType
     * Returns the best matching admin price for a specific material type.
     * Used by branch to get the suggested price for a pending material.
     */
    static async getDefaultPrice(req: Request, res: Response, next: NextFunction) {
        try {
            const { materialType } = req.params;
            const { condition } = req.query;

            // Try to find an exact match first
            let rule = null;
            if (condition) {
                rule = await PricingRule.findOne({
                    materialType,
                    conditions: condition as string,
                    isActive: true,
                    approvalStatus: 'approved'
                }).sort({ priority: -1 });
            }

            // Fall back to any rule for this material type
            if (!rule) {
                rule = await PricingRule.findOne({
                    materialType,
                    isActive: true,
                    approvalStatus: 'approved'
                }).sort({ priority: -1 });
            }

            res.status(200).json({
                success: true,
                data: rule ? {
                    pricePerKg: rule.basePrice,
                    materialType: rule.materialType,
                    condition: rule.conditions?.[0] || null,
                    name: rule.name,
                    minAllowed: Math.floor(rule.basePrice * 0.8), // ±20% range
                    maxAllowed: Math.ceil(rule.basePrice * 1.2),
                } : null
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /pricing/:id
     * Admin deactivates a pricing rule.
     */
    static async deactivateRule(req: Request, res: Response, next: NextFunction) {
        try {
            const rule = await PricingRule.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            );
            if (!rule) throw new AppError('Pricing rule not found', 404);

            res.status(200).json({ success: true, message: 'Pricing rule deactivated' });
        } catch (error) {
            next(error);
        }
    }
}
