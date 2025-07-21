import { CONDITION_MULTIPLIERS, QUALITY_GRADES, ECO_POINTS_RATE } from './constants';
import type { PriceCalculation, Material } from '../types';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(price);
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(2)} kg`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const calculatePrice = (
  materialType: string,
  weight: number,
  condition: keyof typeof CONDITION_MULTIPLIERS,
  qualityGrade?: keyof typeof QUALITY_GRADES,
  basePrice: number = 100
): PriceCalculation => {
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  const qualityMultiplier = qualityGrade ? QUALITY_GRADES[qualityGrade].multiplier : 1.0;
  const treatmentBonus = condition === 'treated' ? basePrice * 0.2 : 0;
  
  const totalValue = (basePrice * weight * conditionMultiplier * qualityMultiplier) + treatmentBonus;
  const logisticsCost = weight * 50; // ₦50 per kg
  const netValue = totalValue - logisticsCost;

  return {
    materialType,
    weight,
    condition,
    basePrice,
    conditionMultiplier,
    treatmentBonus,
    totalValue,
    logisticsCost,
    netValue: Math.max(0, netValue)
  };
};

export const calculateEcoPoints = (weight: number): number => {
  return Math.floor(weight * ECO_POINTS_RATE);
};

export const truncateAddress = (address: string, length: number = 6): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-4)}`;
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ecolink-materials');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/ecolink/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  const data = await response.json();
  return data.secure_url;
};

export const generateMaterialId = (): string => {
  return `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getMaterialStatusColor = (status: Material['status']): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'processed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getConditionColor = (condition: Material['condition']): string => {
  switch (condition) {
    case 'clean': return 'bg-green-100 text-green-800';
    case 'dirty': return 'bg-red-100 text-red-800';
    case 'treated': return 'bg-blue-100 text-blue-800';
    case 'untreated': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};