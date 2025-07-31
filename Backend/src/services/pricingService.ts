import PricingRule from '../models/PricingRule';
import { 
  IPriceRequest, 
  IPriceCalculationResult, 
  PricingStrategy,
  PriceFactorType 
} from '../types/pricing';
import { MaterialType, MaterialCondition } from '../types/material';
import { AppError } from '../utils/logger';
import logger from '../utils/logger';

export class PricingService {
  /**
   * Calculate price for a material
   */
  static async calculatePrice(priceRequest: IPriceRequest): Promise<IPriceCalculationResult> {
    try {
      // Find applicable pricing rules
      const applicableRules = await PricingRule.findApplicableRules(
        priceRequest.materialType,
        priceRequest.subType,
        priceRequest.condition,
        priceRequest.location.state
      );

      if (applicableRules.length === 0) {
        // Use default pricing if no rules found
        return this.getDefaultPricing(priceRequest);
      }

      // Apply rules in priority order (highest first)
      const ruleResults = [];
      let finalPrice = 0;
      let basePrice = 0;

      for (const rule of applicableRules) {
        const ruleResult = await this.applyRule(rule, priceRequest);
        ruleResults.push(ruleResult);
        
        if (ruleResults.length === 1) {
          // First rule sets the base price
          basePrice = ruleResult.basePrice;
          finalPrice = ruleResult.finalPrice;
        } else {
          // Subsequent rules modify the price
          finalPrice = this.combineRulePrices(finalPrice, ruleResult.finalPrice, rule.strategy);
        }

        // Update rule usage statistics
        await rule.updateUsage(ruleResult.finalPrice * priceRequest.weight);
      }

      // Apply quantity-based adjustments
      finalPrice = this.applyQuantityAdjustments(finalPrice, priceRequest.weight, applicableRules);

      // Apply time-based adjustments
      finalPrice = this.applyTimeAdjustments(finalPrice, priceRequest.requestedAt, applicableRules);

      // Apply urgency adjustments
      if (priceRequest.urgency && priceRequest.urgency !== 'low') {
        finalPrice = this.applyUrgencyAdjustments(finalPrice, priceRequest.urgency);
      }

      // Get market comparison
      const marketComparison = await this.getMarketComparison(priceRequest);

      // Calculate treatment analysis if needed
      const treatmentAnalysis = await this.calculateTreatmentAnalysis(priceRequest, finalPrice);

      const result: IPriceCalculationResult = {
        materialId: null as any, // Will be set by the calling service
        appliedRules: ruleResults,
        basePrice,
        adjustments: this.calculateAdjustments(basePrice, finalPrice),
        finalPrice: Math.max(finalPrice, 0), // Ensure non-negative price
        currency: 'NGN',
        marketAverage: marketComparison.average,
        competitiveAdvantage: marketComparison.advantage,
        breakdown: this.calculateBreakdown(finalPrice, priceRequest.weight),
        treatmentAnalysis,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
        calculatedAt: new Date()
      };

      logger.info(`Price calculated for ${priceRequest.materialType}: ₦${finalPrice}/kg`);
      return result;

    } catch (error) {
      logger.error('Price calculation failed:', error);
      throw new AppError('Failed to calculate price', 500);
    }
  }

  /**
   * Get real-time market prices
   */
  static async getMarketPrices(materialType: MaterialType): Promise<any[]> {
    try {
      // This would integrate with external market data APIs
      // For now, return mock data
      const mockPrices = {
        [MaterialType.PLASTIC]: [
          { source: 'Lagos Market', price: 150, currency: 'NGN', unit: 'per_kg' },
          { source: 'Kano Market', price: 140, currency: 'NGN', unit: 'per_kg' },
          { source: 'Port Harcourt', price: 160, currency: 'NGN', unit: 'per_kg' }
        ],
        [MaterialType.METAL]: [
          { source: 'Lagos Scrap', price: 350, currency: 'NGN', unit: 'per_kg' },
          { source: 'Aba Market', price: 330, currency: 'NGN', unit: 'per_kg' },
          { source: 'Kaduna Steel', price: 340, currency: 'NGN', unit: 'per_kg' }
        ],
        [MaterialType.HOUSEHOLD]: [
          { source: 'Lagos Waste', price: 80, currency: 'NGN', unit: 'per_kg' },
          { source: 'Ibadan Market', price: 75, currency: 'NGN', unit: 'per_kg' }
        ]
      };

      return mockPrices[materialType] || [];
    } catch (error) {
      logger.error('Failed to fetch market prices:', error);
      return [];
    }
  }

  /**
   * Update pricing rule
   */
  static async updatePricingRule(ruleId: string, updateData: any, updatedBy: string): Promise<void> {
    const rule = await PricingRule.findById(ruleId);
    
    if (!rule) {
      throw new AppError('Pricing rule not found', 404);
    }

    // Reset approval status if critical fields are changed
    const criticalFields = ['basePrice', 'strategy', 'priceFactors', 'quantityTiers'];
    const hasCriticalChanges = criticalFields.some(field => updateData[field] !== undefined);
    
    if (hasCriticalChanges) {
      updateData.approvalStatus = 'pending';
    }

    Object.assign(rule, updateData);
    await rule.save();

    logger.info(`Pricing rule ${ruleId} updated by ${updatedBy}`);
  }

  /**
   * Calculate treatment cost-benefit analysis
   */
  static async calculateTreatmentAnalysis(
    priceRequest: IPriceRequest,
    currentPrice: number
  ): Promise<any> {
    if (!priceRequest.treatmentRequired || priceRequest.treatmentRequired.length === 0) {
      return null;
    }

    // Find rules with treatment pricing
    const rulesWithTreatment = await PricingRule.find({
      materialType: priceRequest.materialType,
      'treatmentPricing.treatmentType': { $in: priceRequest.treatmentRequired },
      isActive: true
    });

    if (rulesWithTreatment.length === 0) {
      return null;
    }

    let totalTreatmentCost = 0;
    let totalPriceImprovement = 0;

    for (const treatment of priceRequest.treatmentRequired) {
      for (const rule of rulesWithTreatment) {
        const treatmentPricing = rule.treatmentPricing?.find(
          tp => tp.treatmentType === treatment
        );
        
        if (treatmentPricing) {
          totalTreatmentCost += treatmentPricing.additionalCost;
          totalPriceImprovement += treatmentPricing.priceImprovement;
        }
      }
    }

    const treatedPrice = currentPrice + totalPriceImprovement;
    const netBenefit = totalPriceImprovement - totalTreatmentCost;

    return {
      currentPrice,
      treatedPrice,
      treatmentCost: totalTreatmentCost,
      netBenefit,
      recommendation: netBenefit > 0 ? 'treat' : 'sell_as_is'
    };
  }

  // Private helper methods
  private static async applyRule(rule: any, priceRequest: IPriceRequest): Promise<any> {
    let basePrice = rule.basePrice;
    let finalPrice = basePrice;
    const factorsApplied = [];

    // Apply condition multiplier
    const conditionFactor = rule.priceFactors.find(
      (f: any) => f.type === PriceFactorType.CONDITION_MULTIPLIER
    );
    if (conditionFactor) {
      const multiplier = this.getConditionMultiplier(priceRequest.condition);
      finalPrice *= multiplier;
      factorsApplied.push({
        ...conditionFactor,
        appliedValue: multiplier
      });
    }

    // Apply location adjustments
    const locationFactor = rule.priceFactors.find(
      (f: any) => f.type === PriceFactorType.LOCATION_ADJUSTMENT
    );
    if (locationFactor && this.shouldApplyLocationAdjustment(priceRequest.location.state)) {
      const adjustment = locationFactor.isPercentage 
        ? finalPrice * (locationFactor.value / 100)
        : locationFactor.value;
      finalPrice += adjustment;
      factorsApplied.push(locationFactor);
    }

    // Apply market-based adjustments
    if (rule.strategy === PricingStrategy.MARKET_BASED) {
      const marketPrice = await this.getAverageMarketPrice(priceRequest.materialType);
      if (marketPrice > 0) {
        finalPrice = (finalPrice * (1 - rule.marketPriceWeight)) + 
                    (marketPrice * rule.marketPriceWeight);
      }
    }

    return {
      ruleId: rule._id,
      ruleName: rule.name,
      basePrice,
      finalPrice,
      factorsApplied
    };
  }

  private static getDefaultPricing(priceRequest: IPriceRequest): IPriceCalculationResult {
    // Default pricing when no rules are found
    const defaultPrices = {
      [MaterialType.PLASTIC]: 120,
      [MaterialType.METAL]: 300,
      [MaterialType.HOUSEHOLD]: 60
    };

    const basePrice = defaultPrices[priceRequest.materialType] || 50;
    const conditionMultiplier = this.getConditionMultiplier(priceRequest.condition);
    const finalPrice = basePrice * conditionMultiplier;

    return {
      materialId: null as any,
      appliedRules: [],
      basePrice,
      adjustments: [
        {
          factor: 'condition',
          value: conditionMultiplier,
          isPercentage: false,
          description: `Condition adjustment for ${priceRequest.condition}`
        }
      ],
      finalPrice,
      currency: 'NGN',
      breakdown: this.calculateBreakdown(finalPrice, priceRequest.weight),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      calculatedAt: new Date()
    };
  }

  private static getConditionMultiplier(condition: MaterialCondition): number {
    const multipliers = {
      [MaterialCondition.EXCELLENT]: 1.2,
      [MaterialCondition.GOOD]: 1.1,
      [MaterialCondition.CLEAN]: 1.0,
      [MaterialCondition.TREATED]: 1.15,
      [MaterialCondition.DIRTY]: 0.8,
      [MaterialCondition.UNTREATED]: 0.9,
      [MaterialCondition.DAMAGED]: 0.6,
      [MaterialCondition.POOR]: 0.7
    };

    return multipliers[condition] || 1.0;
  }

  private static combineRulePrices(currentPrice: number, newPrice: number, strategy: PricingStrategy): number {
    switch (strategy) {
      case PricingStrategy.FIXED:
        return Math.max(currentPrice, newPrice);
      case PricingStrategy.MARKET_BASED:
        return (currentPrice + newPrice) / 2;
      case PricingStrategy.DYNAMIC:
        return Math.max(currentPrice, newPrice);
      default:
        return currentPrice;
    }
  }

  private static applyQuantityAdjustments(price: number, weight: number, rules: any[]): number {
    for (const rule of rules) {
      if (rule.quantityTiers && rule.quantityTiers.length > 0) {
        const applicableTier = rule.quantityTiers.find((tier: any) => 
          weight >= tier.minQuantity && (!tier.maxQuantity || weight <= tier.maxQuantity)
        );
        
        if (applicableTier) {
          price *= (1 - applicableTier.discountPercentage / 100);
          break;
        }
      }
    }
    return price;
  }

  private static applyTimeAdjustments(price: number, requestTime: Date, rules: any[]): number {
    const hour = requestTime.getHours();
    const month = requestTime.getMonth() + 1;

    for (const rule of rules) {
      // Time of day adjustments
      if (rule.timeOfDayRules) {
        const timeRule = rule.timeOfDayRules.find((tr: any) => 
          hour >= tr.startHour && hour <= tr.endHour
        );
        if (timeRule) {
          price *= timeRule.multiplier;
        }
      }

      // Seasonal adjustments
      if (rule.seasonalAdjustments) {
        const seasonalRule = rule.seasonalAdjustments.find((sa: any) => 
          month >= sa.startMonth && month <= sa.endMonth
        );
        if (seasonalRule) {
          price *= seasonalRule.multiplier;
        }
      }
    }

    return price;
  }

  private static applyUrgencyAdjustments(price: number, urgency: string): number {
    const urgencyMultipliers = {
      low: 1.0,
      medium: 1.1,
      high: 1.2,
      urgent: 1.3
    };

    return price * (urgencyMultipliers[urgency as keyof typeof urgencyMultipliers] || 1.0);
  }

  private static async getMarketComparison(priceRequest: IPriceRequest): Promise<{ average: number; advantage: number }> {
    const marketPrices = await this.getMarketPrices(priceRequest.materialType);
    
    if (marketPrices.length === 0) {
      return { average: 0, advantage: 0 };
    }

    const average = marketPrices.reduce((sum, price) => sum + price.price, 0) / marketPrices.length;
    return { average, advantage: 0 }; // Will be calculated after final price is determined
  }

  private static async getAverageMarketPrice(materialType: MaterialType): Promise<number> {
    const marketPrices = await this.getMarketPrices(materialType);
    
    if (marketPrices.length === 0) return 0;
    
    return marketPrices.reduce((sum, price) => sum + price.price, 0) / marketPrices.length;
  }

  private static shouldApplyLocationAdjustment(state: string): boolean {
    // Apply location adjustments for high-cost states
    const highCostStates = ['Lagos', 'Abuja', 'Rivers', 'Delta'];
    return highCostStates.includes(state);
  }

  private static calculateAdjustments(basePrice: number, finalPrice: number): any[] {
    const difference = finalPrice - basePrice;
    const percentage = basePrice > 0 ? (difference / basePrice) * 100 : 0;

    return [
      {
        factor: 'total_adjustment',
        value: percentage,
        isPercentage: true,
        description: `Total price adjustment: ${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`
      }
    ];
  }

  private static calculateBreakdown(finalPrice: number, weight: number): any {
    // Simplified breakdown - in production, this would be more detailed
    const totalValue = finalPrice * weight;
    
    return {
      materialCost: totalValue * 0.7,
      processingCost: totalValue * 0.15,
      logisticsCost: totalValue * 0.08,
      platformFee: totalValue * 0.05,
      profit: totalValue * 0.02
    };
  }
}