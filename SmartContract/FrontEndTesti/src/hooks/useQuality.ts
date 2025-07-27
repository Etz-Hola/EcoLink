import { useState, useCallback } from 'react';
import { Material } from '../types';
import { QUALITY_GRADES } from '../utils/constants';

export const useQuality = () => {
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessQuality = useCallback(async (material: Material): Promise<{
    recommendedGrade: 'A' | 'B' | 'C' | 'D';
    confidence: number;
    reasons: string[];
    // recommendedGrade: 'A' | 'B' | 'C' | 'D';
    // confidence: number;
    // reasons: string[];
  }> => {
    setIsGrading(true);
    setError(null);

    try {
      // Mock quality assessment algorithm
      // In a real implementation, this would use AI/ML models
      let score = 100;
      const reasons: string[] = [];

      // Assess based on condition
      if (material.condition === 'dirty') {
        score -= 30;
        reasons.push('Material appears dirty/contaminated');
      } else if (material.condition === 'clean') {
        score += 10;
        reasons.push('Material is clean and well-maintained');
      }

      if (material.condition === 'treated') {
        score += 20;
        reasons.push('Material has been properly treated');
      }

      // Assess based on photos (mock analysis)
      if (material.photos.length === 0) {
        score -= 20;
        reasons.push('No images provided for assessment');
      } else if (material.photos.length >= 3) {
        score += 5;
        reasons.push('Multiple angles provided for assessment');
      }

      // Determine grade based on score
      let recommendedGrade: 'A' | 'B' | 'C' | 'D';
      if (score >= 90) {
        recommendedGrade = 'A';
      } else if (score >= 75) {
        recommendedGrade = 'B';
      } else if (score >= 60) {
        recommendedGrade = 'C';
      } else {
        recommendedGrade = 'D';
      }

      const confidence = Math.min(Math.max(score, 0), 100);

      return {
        recommendedGrade,
        confidence,
        reasons
      };
      // return {
      //   recommendedGrade,
      //   confidence,
      //   reasons
      // };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assess quality');
      throw err;
    } finally {
      setIsGrading(false);
    }
  }, []);

  const getQualityMultiplier = useCallback((grade: 'A' | 'B' | 'C' | 'D') => {
    return QUALITY_GRADES[grade].multiplier;
  }, []);

  const getQualityLabel = useCallback((grade: 'A' | 'B' | 'C' | 'D') => {
    return QUALITY_GRADES[grade].label;
  }, []);

  return {
    isGrading,
    error,
    assessQuality,
    getQualityMultiplier,
    getQualityLabel
  };
};