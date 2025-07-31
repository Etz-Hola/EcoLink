import Material from '../models/Material';
import PricingRule from '../models/PricingRule';
import { IMaterial, IMaterialUploadData, MaterialStatus, IMaterialFilter } from '../types/material';
import { PricingService } from './pricingService';
import { UploadService } from './uploadService';
import { NotificationService } from './notificationService';
import { AppError } from '../utils/logger';
import logger from '../utils/logger';

export class MaterialService {
  /**
   * Upload new material
   */
  static async uploadMaterial(
    userId: string,
    materialData: IMaterialUploadData
  ): Promise<IMaterial> {
    try {
      // Upload images to AWS S3
      const imageUploads = await Promise.all(
        materialData.images.map(file => UploadService.uploadToS3(file, 'materials'))
      );

      // Calculate pricing
      const pricing = await PricingService.calculatePrice({
        materialType: materialData.materialType,
        subType: materialData.subType,
        condition: materialData.condition,
        weight: materialData.weight,
        location: {
          coordinates: materialData.pickupLocation.coordinates,
          state: materialData.pickupLocation.address.split(',').pop()?.trim() || '',
          city: materialData.pickupLocation.city
        },
        requestedAt: new Date()
      });

      // Create material document
      const material = new Material({
        ...materialData,
        submittedBy: userId,
        currentOwner: userId,
        images: imageUploads.map(upload => ({
          url: upload.url,
          publicId: upload.key,
          filename: upload.originalName,
          size: upload.size,
          mimeType: upload.contentType
        })),
        pricing: {
          basePrice: pricing.basePrice,
          conditionMultiplier: 1,
          qualityMultiplier: 1,
          marketMultiplier: 1,
          finalPrice: pricing.finalPrice,
          currency: pricing.currency,
          lastUpdated: new Date()
        },
        pickupLocation: {
          type: 'Point',
          coordinates: materialData.pickupLocation.coordinates,
          address: materialData.pickupLocation.address,
          city: materialData.pickupLocation.city,
          state: materialData.pickupLocation.state
        }
      });

      await material.save();

      logger.info(`Material uploaded successfully: ${material._id}`);
      
      // Send notification to nearby branches
      await this.notifyNearbyBranches(material);

      return material;
    } catch (error) {
      logger.error('Material upload failed:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload material', 500);
    }
  }

  /**
   * Get materials with filters and pagination
   */
  static async getMaterials(
    filter: IMaterialFilter = {},
    page: number = 1,
    limit: number = 20,
    sort: string = '-createdAt'
  ): Promise<{
    materials: IMaterial[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const query = this.buildFilterQuery(filter);
      const skip = (page - 1) * limit;

      const [materials, totalCount] = await Promise.all([
        Material.find(query)
          .populate('submittedBy', 'firstName lastName username rating')
          .populate('processingBranch', 'name code location')
          .populate('assignedTransporter', 'firstName lastName username rating')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Material.countDocuments(query)
      ]);

      return {
        materials,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Failed to fetch materials:', error);
      throw new AppError('Failed to fetch materials', 500);
    }
  }

  /**
   * Get material by ID
   */
  static async getMaterialById(materialId: string): Promise<IMaterial> {
    const material = await Material.findById(materialId)
      .populate('submittedBy', 'firstName lastName username rating location')
      .populate('processingBranch', 'name code location contactPerson')
      .populate('assignedTransporter', 'firstName lastName username rating');

    if (!material) {
      throw new AppError('Material not found', 404);
    }

    // Increment view count
    material.views += 1;
    await material.save();

    return material;
  }

  /**
   * Update material status
   */
  static async updateMaterialStatus(
    materialId: string,
    status: MaterialStatus,
    updatedBy: string,
    notes?: string
  ): Promise<IMaterial> {
    const material = await Material.findById(materialId);
    
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    const previousStatus = material.status;
    material.status = status;

    // Update timestamps based on status
    switch (status) {
      case MaterialStatus.APPROVED:
        material.approvedAt = new Date();
        break;
      case MaterialStatus.IN_TRANSIT:
        material.pickedUpAt = new Date();
        break;
      case MaterialStatus.DELIVERED:
        material.deliveredAt = new Date();
        break;
      case MaterialStatus.PROCESSED:
        material.processedAt = new Date();
        break;
      case MaterialStatus.SOLD:
        material.soldAt = new Date();
        break;
    }

    await material.save();

    logger.info(`Material ${materialId} status updated from ${previousStatus} to ${status} by ${updatedBy}`);

    // Send notification to relevant parties
    await this.notifyStatusChange(material, previousStatus, updatedBy);

    return material;
  }

  /**
   * Assign material to branch
   */
  static async assignToBranch(
    materialId: string,
    branchId: string,
    assignedBy: string
  ): Promise<IMaterial> {
    const material = await Material.findById(materialId);
    
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    if (material.status !== MaterialStatus.APPROVED) {
      throw new AppError('Material must be approved before assignment', 400);
    }

    material.processingBranch = branchId as any;
    material.status = MaterialStatus.IN_TRANSIT;
    await material.save();

    logger.info(`Material ${materialId} assigned to branch ${branchId} by ${assignedBy}`);
    return material;
  }

  /**
   * Add material to interested buyers list
   */
  static async addInterestedBuyer(materialId: string, buyerId: string): Promise<IMaterial> {
    const material = await Material.findById(materialId);
    
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    if (!material.interestedBuyers.includes(buyerId as any)) {
      material.interestedBuyers.push(buyerId as any);
      await material.save();
    }

    return material;
  }

  /**
   * Get materials by user (collector)
   */
  static async getMaterialsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    materials: IMaterial[];
    totalCount: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [materials, totalCount] = await Promise.all([
      Material.find({ submittedBy: userId })
        .populate('processingBranch', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Material.countDocuments({ submittedBy: userId })
    ]);

    return {
      materials,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Get materials near location
   */
  static async getMaterialsNearLocation(
    coordinates: [number, number],
    radius: number = 10,
    limit: number = 20
  ): Promise<IMaterial[]> {
    return Material.find({
      pickupLocation: {
        $geoWithin: {
          $centerSphere: [coordinates, radius / 6371] // Convert km to radians
        }
      },
      status: { $in: [MaterialStatus.PENDING, MaterialStatus.APPROVED] }
    })
    .populate('submittedBy', 'firstName lastName username')
    .limit(limit)
    .sort({ createdAt: -1 });
  }

  /**
   * Search materials
   */
  static async searchMaterials(
    searchTerm: string,
    filters: IMaterialFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    materials: IMaterial[];
    totalCount: number;
    totalPages: number;
  }> {
    const searchQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { materialType: { $regex: searchTerm, $options: 'i' } },
        { subType: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const combinedQuery = {
      ...this.buildFilterQuery(filters),
      ...searchQuery
    };

    const skip = (page - 1) * limit;

    const [materials, totalCount] = await Promise.all([
      Material.find(combinedQuery)
        .populate('submittedBy', 'firstName lastName username rating')
        .populate('processingBranch', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Material.countDocuments(combinedQuery)
    ]);

    return {
      materials,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Delete material
   */
  static async deleteMaterial(materialId: string, userId: string): Promise<void> {
    const material = await Material.findById(materialId);
    
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    if (material.submittedBy.toString() !== userId) {
      throw new AppError('Unauthorized to delete this material', 403);
    }

    if (material.status !== MaterialStatus.PENDING) {
      throw new AppError('Cannot delete material that is already being processed', 400);
    }

    // Delete images from S3
    await Promise.all(
      material.images.map(image => UploadService.deleteFromS3(image.publicId))
    );

    await Material.findByIdAndDelete(materialId);
    logger.info(`Material ${materialId} deleted by ${userId}`);
  }

  // Private helper methods
  private static buildFilterQuery(filter: IMaterialFilter): any {
    const query: any = {};

    if (filter.materialType) {
      query.materialType = filter.materialType;
    }

    if (filter.subType) {
      query.subType = filter.subType;
    }

    if (filter.condition) {
      query.condition = filter.condition;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.minWeight || filter.maxWeight) {
      query.weight = {};
      if (filter.minWeight) query.weight.$gte = filter.minWeight;
      if (filter.maxWeight) query.weight.$lte = filter.maxWeight;
    }

    if (filter.minPrice || filter.maxPrice) {
      query['pricing.finalPrice'] = {};
      if (filter.minPrice) query['pricing.finalPrice'].$gte = filter.minPrice;
      if (filter.maxPrice) query['pricing.finalPrice'].$lte = filter.maxPrice;
    }

    if (filter.location) {
      query.pickupLocation = {
        $geoWithin: {
          $centerSphere: [filter.location.center, filter.location.radius / 6371]
        }
      };
    }

    if (filter.submittedBy) {
      query.submittedBy = filter.submittedBy;
    }

    if (filter.processingBranch) {
      query.processingBranch = filter.processingBranch;
    }

    if (filter.dateRange) {
      query.createdAt = {
        $gte: filter.dateRange.start,
        $lte: filter.dateRange.end
      };
    }

    return query;
  }

  private static async notifyNearbyBranches(material: IMaterial): Promise<void> {
    try {
      // This would be implemented to notify branches within serving radius
      // For now, we'll just log it
      logger.info(`Notifying nearby branches about new material: ${material._id}`);
    } catch (error) {
      logger.error('Failed to notify nearby branches:', error);
    }
  }

  private static async notifyStatusChange(
    material: IMaterial,
    previousStatus: MaterialStatus,
    updatedBy: string
  ): Promise<void> {
    try {
      // Send notifications to relevant parties based on status change
      await NotificationService.sendMaterialStatusUpdate(
        material.submittedBy.toString(),
        material._id.toString(),
        previousStatus,
        material.status
      );
    } catch (error) {
      logger.error('Failed to send status change notification:', error);
    }
  }
}