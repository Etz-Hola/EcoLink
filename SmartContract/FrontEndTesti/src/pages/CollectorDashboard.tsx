import React, { useState } from 'react';
import { Package, TrendingUp, Clock, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMaterial } from '../hooks/useMaterial';
import { formatPrice, formatWeight } from '../utils/helpers';
import MaterialCard from '../components/feature/MaterialCard';
import Button from '../components/common/Button';
import EcoPointsDisplay from '../components/web3/EcoPointsDisplay';

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { materials, getMaterialsByUser, getMaterialsByStatus } = useMaterial();
  
  const [selectedTab, setSelectedTab] = useState('all');
  
  const userMaterials = getMaterialsByUser(user?.id || '');
  const pendingMaterials = userMaterials.filter(m => m.status === 'pending');
  const acceptedMaterials = userMaterials.filter(m => m.status === 'accepted');
  const processedMaterials = userMaterials.filter(m => m.status === 'processed');
  
  const totalValue = userMaterials.reduce((sum, m) => sum + m.totalValue, 0);
  const totalWeight = userMaterials.reduce((sum, m) => sum + m.weight, 0);
  
  const tabs = [
    { id: 'all', label: 'All Materials', count: userMaterials.length },
    { id: 'pending', label: 'Pending', count: pendingMaterials.length },
    { id: 'accepted', label: 'Accepted', count: acceptedMaterials.length },
    { id: 'processed', label: 'Processed', count: processedMaterials.length }
  ];

  const getFilteredMaterials = () => {
    switch (selectedTab) {
      case 'pending': return pendingMaterials;
      case 'accepted': return acceptedMaterials;
      case 'processed': return processedMaterials;
      default: return userMaterials;
    }
  };

  const stats = [
    {
      label: 'Total Value',
      value: formatPrice(totalValue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Total Weight',
      value: formatWeight(totalWeight),
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Materials Uploaded',
      value: userMaterials.length.toString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Pending Review',
      value: pendingMaterials.length.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your recyclable materials and track your environmental impact.
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          <Link to="/materials/upload">Upload Material</Link>
        </Button>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Materials Section */}
        <div className="lg:col-span-3">
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

            {/* Materials Grid */}
            <div className="p-6">
              {getFilteredMaterials().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFilteredMaterials().map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      onView={(material) => console.log('View material:', material)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {selectedTab === 'all' ? 'No materials uploaded yet' : `No ${selectedTab} materials`}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedTab === 'all' 
                      ? 'Get started by uploading your first recyclable material.'
                      : `You don't have any ${selectedTab} materials at the moment.`
                    }
                  </p>
                  {selectedTab === 'all' && (
                    <div className="mt-6">
                      <Button leftIcon={<Plus className="h-4 w-4" />}>
                        <Link to="/materials/upload">Upload Your First Material</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EcoPointsDisplay />
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {processedMaterials.slice(0, 3).map((material) => (
                <div key={material.id} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {material.name} was processed
                  </span>
                </div>
              ))}
              {processedMaterials.length === 0 && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="font-medium text-green-900 mb-3">💚 Eco Tips</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Sort materials by type for better prices</li>
              <li>• Clean containers before uploading</li>
              <li>• Bundle similar items together</li>
              <li>• Take clear photos from multiple angles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;