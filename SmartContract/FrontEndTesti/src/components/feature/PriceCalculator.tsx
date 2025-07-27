import React, { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import { MATERIAL_CATEGORIES, CONDITION_MULTIPLIERS } from '../../utils/constants';
import { calculatePrice, formatPrice, formatWeight } from '../../utils/helpers';
import Input from '../common/Input';
import Button from '../common/Button';

interface PriceCalculatorProps {
  onCalculate?: (calculation: any) => void;
  initialValues?: {
    materialType?: string;
    weight?: number;
    condition?: string;
  };
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  onCalculate,
  initialValues
}) => {
  const [materialType, setMaterialType] = useState(initialValues?.materialType || '');
  const [weight, setWeight] = useState(initialValues?.weight || 0);
  const [condition, setCondition] = useState<keyof typeof CONDITION_MULTIPLIERS>(
    initialValues?.condition as keyof typeof CONDITION_MULTIPLIERS || 'clean'
  );
  const [calculation, setCalculation] = useState<any>(null);

  const selectedCategory = MATERIAL_CATEGORIES.find(cat => cat.id === materialType);

  useEffect(() => {
    if (materialType && weight > 0) {
      const result = calculatePrice(
        materialType,
        weight,
        condition,
        undefined,
        selectedCategory?.basePrice || 100
      );
      setCalculation(result);
      onCalculate?.(result);
    }
  }, [materialType, weight, condition, selectedCategory, onCalculate]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
      </div>

      <div className="space-y-4 mb-6">
        {/* Material Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Type
          </label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">Select material type</option>
            {MATERIAL_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} - {formatPrice(category.basePrice)}/{category.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <Input
          type="number"
          label="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          placeholder="Enter weight in kilograms"
          min="0"
          step="0.1"
        />

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as keyof typeof CONDITION_MULTIPLIERS)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            {Object.entries(CONDITION_MULTIPLIERS).map(([key, multiplier]) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)} ({multiplier}x multiplier)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {calculation && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">{formatPrice(calculation.basePrice)}/kg</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium">{formatWeight(calculation.weight)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Condition Multiplier:</span>
              <span className="font-medium">{calculation.conditionMultiplier}x</span>
            </div>
            
            {calculation.treatmentBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Treatment Bonus:</span>
                <span className="font-medium text-green-600">
                  +{formatPrice(calculation.treatmentBonus)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(calculation.totalValue)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Logistics Cost:</span>
              <span className="font-medium text-red-600">
                -{formatPrice(calculation.logisticsCost)}
              </span>
            </div>
            
            <div className="flex justify-between border-t pt-2 text-lg">
              <span className="font-semibold text-gray-900">Net Value:</span>
              <span className="font-bold text-green-600">
                {formatPrice(calculation.netValue)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg mt-4">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Prices may vary based on market conditions, quality grade, and branch location. 
              This is an estimate for planning purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;