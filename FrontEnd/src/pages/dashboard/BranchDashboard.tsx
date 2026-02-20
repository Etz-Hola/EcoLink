import React, { useState } from 'react';
import { Package, Users, CheckCircle, Clock, AlertCircle, Box, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMaterial } from '../../hooks/useMaterial';
import { formatPrice } from '../../utils/helpers';
import MaterialCard from '../../components/feature/MaterialCard';
import QualityGrader from '../../components/feature/QualityGrader';
import { Material } from '../../types';

const BranchDashboard: React.FC = () => {
  const { dispatch } = useAuth() as any;
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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Aggregation Hub Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">
          Manage local intake, quality verification, and export bundling.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Materials Review */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-50">
          <nav className="flex space-x-8 px-6 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`relative py-2 px-1 border-b-2 font-bold text-sm tracking-tight transition-all ${selectedTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-50 text-gray-900 py-0.5 px-2.5 rounded-full text-[10px] font-black">
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
                  <div className="flex gap-2">
                    {material.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(material.id, 'accepted')}
                          className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-100 transition-all border border-green-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(material.id, 'rejected')}
                          className="flex-1 px-4 py-2.5 bg-red-50 text-red-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all border border-red-100"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {material.status === 'accepted' && (
                      <button
                        onClick={() => handleGradeMaterial(material)}
                        className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
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
              <AlertCircle className="mx-auto h-12 w-12 text-gray-200" />
              <h3 className="mt-4 text-sm font-bold text-gray-900">
                No {selectedTab} materials
              </h3>
              <p className="mt-1 text-xs text-gray-400 font-medium tracking-tight">
                {selectedTab === 'pending'
                  ? 'New materials will appear here for review.'
                  : `No ${selectedTab} materials at the moment.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Aggregation & Bundling Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-xl">
                <Box className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Ready for Bundling</h2>
            </div>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              You have <span className="text-white font-bold">{processedMaterials.length}</span> processed materials waiting to be bundled. Create a high-quality bundle to attract large exporters.
            </p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Weight Available</p>
                <p className="text-xl font-black text-green-400">
                  {processedMaterials.reduce((sum, m) => sum + m.weight, 0)} kg
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold hover:gap-4 transition-all">
                Create Bundle <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
              Minimum 500kg recommended for export
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-black uppercase tracking-tight">Branch Notifications</h2>
          <div className="space-y-4">
            {[
              { title: 'New material from Al-Hikmah', time: '5m ago', type: 'info' },
              { title: 'Exporter requested a bundle', time: '1h ago', type: 'alert' },
              { title: 'Daily capacity reached 85%', time: '3h ago', type: 'warning' },
            ].map((note, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className={`w-2 h-2 rounded-full mt-2 ${note.type === 'alert' ? 'bg-red-500' : note.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm font-bold text-gray-900">{note.title}</p>
                  <p className="text-xs text-gray-400 font-medium">{note.time}</p>
                </div>
              </div>
            ))}
          </div>
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