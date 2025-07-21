import { useState, useCallback } from 'react';
import { Material, MaterialCategory } from '../types';
import { useApp } from '../context/AppContext';
import { generateMaterialId, uploadToCloudinary, validateImageFile } from '../utils/helpers';
import { MATERIAL_CATEGORIES } from '../utils/constants';

export const useMaterial = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, setLoading, setError } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  const uploadMaterial = useCallback(async (materialData: {
    name: string;
    categoryId: string;
    subcategory: string;
    weight: number;
    condition: 'clean' | 'dirty' | 'treated' | 'untreated';
    description?: string;
    photos: File[];
    uploadedBy: string;
  }) => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate images
      for (const photo of materialData.photos) {
        if (!validateImageFile(photo)) {
          throw new Error('Invalid image file. Please use JPEG, PNG, or WebP files under 5MB.');
        }
      }

      // Upload images to Cloudinary
      const photoUrls: string[] = [];
      for (const photo of materialData.photos) {
        const url = await uploadToCloudinary(photo);
        photoUrls.push(url);
      }

      // Find category details
      const category = MATERIAL_CATEGORIES.find(cat => cat.id === materialData.categoryId);
      if (!category) {
        throw new Error('Invalid material category');
      }

      // Create material object
      const newMaterial: Material = {
        id: generateMaterialId(),
        name: materialData.name,
        category,
        subcategory: materialData.subcategory,
        weight: materialData.weight,
        condition: materialData.condition,
        photos: photoUrls,
        pricePerKg: category.basePrice,
        totalValue: category.basePrice * materialData.weight,
        uploadedBy: materialData.uploadedBy,
        status: 'pending',
        uploadedAt: new Date(),
        description: materialData.description
      };

      // Add to app state
      addMaterial(newMaterial);
      
      return newMaterial;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload material');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [addMaterial, setError]);

  const getMaterialsByUser = useCallback((userId: string) => {
    return materials.filter(material => material.uploadedBy === userId);
  }, [materials]);

  const getMaterialsByStatus = useCallback((status: Material['status']) => {
    return materials.filter(material => material.status === status);
  }, [materials]);

  const updateMaterialStatus = useCallback(async (materialId: string, status: Material['status'], feedback?: string) => {
    setLoading(true);
    try {
      const updates: Partial<Material> = { status };
      if (status === 'processed') {
        updates.processedAt = new Date();
      }
      
      updateMaterial(materialId, updates);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update material');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateMaterial, setLoading, setError]);

  const gradeMaterial = useCallback(async (materialId: string, grade: 'A' | 'B' | 'C' | 'D', feedback: string) => {
    setLoading(true);
    try {
      updateMaterial(materialId, { qualityGrade: grade });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to grade material');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateMaterial, setLoading, setError]);

  return {
    materials,
    isUploading,
    uploadMaterial,
    getMaterialsByUser,
    getMaterialsByStatus,
    updateMaterialStatus,
    gradeMaterial,
    deleteMaterial
  };
};