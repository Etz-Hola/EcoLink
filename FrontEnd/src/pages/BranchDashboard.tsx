import React, { useState } from 'react';
import { Package, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMaterial } from '../hooks/useMaterial';
import { formatPrice, formatWeight } from '../utils/helpers';
import MaterialCard from '../components/feature/MaterialCard';
import QualityGrader from '../components/feature/QualityGrader';
import { Material } from '../types';

const BranchDashboard: React.FC = () => {
  const { user } = useAuth();
  const { materials, updateMaterialStatus, gradeMaterial } = useMaterial();
  
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showGrader, setShowGrader] = useState(false);
  
  // Filter materials for branch review
  const pendingMaterials = materials.filter(m => m.status === 'pending');
  const acceptedMaterials = materials.filter(m => m.status === 'accepted');
  const processedMaterials = materials.filter(m => m.status === 'processed');
  
  const tabs = [
    { id: 'pending', label: 'Pending Review', count: pendingMaterials.length, color: 'text-orange-600' },
    { id: 'accepted', label: 'Accepted', count: acceptedMaterials.length, color: 'text-green-600' },
    { id: 'processed', label: 'Processed', count: processedMaterials.length, color: 'text-blue-600' }
  ];

  const getFilteredMaterials = () => {
    switch (selectedTab) {
      case 'pending': return pendingMaterials;
      case 'accepted': return acceptedMaterials;
      case 'processed': return processedMaterials;
      default: return materials;
    }
  };

  const handleStatusUpdate = async (materialId: string, status: Material['status']) => {
    try {
      await updateMaterialStatus(materialId, status);
    } catch (error) {
      console.error('Failed to update material status:', error);
    }
  };

  const handleGradeMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setShowGrader(true);
  };

  const handleGradeSubmit = async (grade: 'A' | 'B' | 'C' | 'D', feedback: string) => {
    if (selectedMaterial) {
      try {
        await gradeMaterial(selectedMaterial.id, grade, feedback);
        await handleStatusUpdate(selectedMaterial.id, 'processed');
      } catch (error) {
        console.error('Failed to grade material:', error);
      }
    }
  };

  const stats = [
    {
      label: 'Pending Review',
      value: pendingMaterials.length.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Total Processed',
      value: processedMaterials.length.toString(),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Branch Capacity',
      value: '85%',
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Collectors',
      value: '23',
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Branch Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Review and process materials from collectors in your area.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Materials Review */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`relative py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Materials List */}
        <div className="p-6">
          {getFilteredMaterials().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMaterials().map((material) => (
                <div key={material.id} className="space-y-4">
                  <MaterialCard material={material} showActions={false} />
                  
                  {/* Branch Actions */}
                  <div className="flex space-x-2">
                    {material.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(material.id, 'accepted')}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(material.id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {material.status === 'accepted' && (
                      <button
                        onClick={() => handleGradeMaterial(material)}
                        className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Grade & Process
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {selectedTab} materials
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTab === 'pending' 
                  ? 'New materials will appear here for review.' 
                  : `No ${selectedTab} materials at the moment.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quality Grader Modal */}
      {showGrader && selectedMaterial && (
        <QualityGrader
          isOpen={showGrader}
          onClose={() => {
            setShowGrader(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
          onGrade={handleGradeSubmit}
        />
      )}
    </div>
  );
};

export default BranchDashboard;