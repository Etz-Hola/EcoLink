import React from 'react';
import { Package, Calendar, MapPin, DollarSign, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-green-500/5 transition-all overflow-hidden group flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="aspect-[16/10] relative overflow-hidden">
        {material.photos && material.photos.length > 0 ? (
          <img
            src={material.photos[0]}
            alt={material.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20 shadow-lg ${getMaterialStatusColor(material.status)} bg-opacity-90`}>
            {material.status}
          </span>
        </div>

        {/* Condition Overlay */}
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border border-white/20 shadow-md ${getConditionColor(material.condition)} bg-opacity-90 backdrop-blur-sm`}>
            {material.condition.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Header Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                {material.category?.name || 'Material'}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-[10px] font-bold text-gray-400">
                {material.subcategory}
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
              {material.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-gray-900 leading-none">
              {formatPrice(material.totalValue)}
            </p>
            <p className="text-[10px] font-bold text-gray-400 mt-1">
              {formatPrice(material.pricePerKg)}/kg
            </p>
          </div>
        </div>

        {/* Progress Tracker (User Request) */}
        <div className="mt-2 mb-6 space-y-3">
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            <span>Progress Status</span>
            <span className="text-green-600">{material.status === 'pending' ? 'In Review' : material.status === 'accepted' ? 'Awaiting Pickup' : material.status}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
            <div className={`h-full transition-all duration-500 ${material.status !== 'rejected' ? 'bg-green-500 w-1/3' : 'bg-red-500 w-1/3'}`} />
            <div className={`h-full transition-all duration-500 ${['accepted', 'processed'].includes(material.status) ? 'bg-green-500 w-1/3' : 'bg-gray-200 w-1/3'}`} />
            <div className={`h-full transition-all duration-500 ${['processed'].includes(material.status) ? 'bg-green-500 w-1/3' : 'bg-gray-200 w-1/3'}`} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-600">{formatWeight(material.weight)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-600">{formatDate(material.uploadedAt).split(',')[0]}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 mt-auto">
            {onView && (
              <button
                onClick={() => onView(material)}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center gap-2 group/btn"
              >
                View Details
                <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
            {onEdit && material.status === 'pending' && (
              <button
                onClick={() => onEdit(material)}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MaterialCard;