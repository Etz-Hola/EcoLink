import React from 'react';
import { Package, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Material } from '../../types';
import { formatPrice, formatWeight, formatDate, getMaterialStatusColor, getConditionColor } from '../../utils/helpers';
import Button from '../common/Button';

interface MaterialCardProps {
  material: Material;
  onView?: (material: Material) => void;
  onEdit?: (material: Material) => void;
  showActions?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onView,
  onEdit,
  showActions = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      {material.photos.length > 0 && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={material.photos[0]}
            alt={material.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMaterialStatusColor(material.status)}`}>
              {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{material.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${getConditionColor(material.condition)}`}>
                {material.condition}
              </span>
              {material.qualityGrade && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Grade {material.qualityGrade}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(material.totalValue)}
            </div>
            <div className="text-sm text-gray-500">
              {formatPrice(material.pricePerKg)}/kg
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            <span>{formatWeight(material.weight)} • {material.subcategory}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Uploaded {formatDate(material.uploadedAt)}</span>
          </div>

          {material.branchId && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Assigned to branch</span>
            </div>
          )}
        </div>

        {/* Description */}
        {material.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {material.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(material)}
                className="flex-1"
              >
                View Details
              </Button>
            )}
            {onEdit && material.status === 'pending' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(material)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialCard;