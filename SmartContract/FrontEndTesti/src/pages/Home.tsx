import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Award, MapPin, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMaterial } from '../hooks/useMaterial';
import Button from '../components/common/Button';
import MaterialCard from '../components/feature/MaterialCard';
import EcoPointsDisplay from '../components/web3/EcoPointsDisplay';
import PriceCalculator from '../components/feature/PriceCalculator';
import { formatPrice } from '../utils/helpers';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { materials, getMaterialsByUser } = useMaterial();
  
  const userMaterials = getMaterialsByUser(user?.id || '');
  const recentMaterials = userMaterials.slice(0, 3);
  
  // Mock data for dashboard
  const totalEarnings = 12450;
  const monthlyEarnings = 2850;
  const totalMaterials = userMaterials.length;
  const pendingMaterials = userMaterials.filter(m => m.status === 'pending').length;

  const quickStats = [
    {
      label: 'Total Earnings',
      value: formatPrice(totalEarnings),
      change: '+12%',
      positive: true,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      label: 'This Month',
      value: formatPrice(monthlyEarnings),
      change: '+8%',
      positive: true,
      icon: <Award className="h-5 w-5" />
    },
    {
      label: 'Materials Uploaded',
      value: totalMaterials.toString(),
      change: '+3 new',
      positive: true,
      icon: <Package className="h-5 w-5" />
    },
    {
      label: 'Pending Review',
      value: pendingMaterials.toString(),
      change: 'Review needed',
      positive: false,
      icon: <Upload className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-green-100 mb-4 md:mb-0">
              Ready to make more impact today? Upload your recyclable materials and start earning.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              <Link to="/materials/upload">Upload Material</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              leftIcon={<MapPin className="h-4 w-4" />}
            >
              <Link to="/branches">Find Branches</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.positive ? 'text-green-600' : 'text-orange-600'}`}>
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Materials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Materials</h2>
              <Link
                to="/materials"
                className="text-green-600 hover:text-green-500 text-sm font-medium"
              >
                View all →
              </Link>
            </div>

            {recentMaterials.length > 0 ? (
              <div className="space-y-4">
                {recentMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    showActions={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No materials yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading your first recyclable material.
                </p>
                <div className="mt-6">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    <Link to="/materials/upload">Upload Material</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Price Calculator */}
          <PriceCalculator />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* EcoPoints Display */}
          <EcoPointsDisplay />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/materials/upload"
                className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <Plus className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-700 font-medium group-hover:text-green-800">
                  Upload New Material
                </span>
              </Link>
              
              <Link
                to="/logistics"
                className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-blue-700 font-medium group-hover:text-blue-800">
                  Schedule Pickup
                </span>
              </Link>
              
              <Link
                to="/profile"
                className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <Award className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-gray-700 font-medium group-hover:text-gray-800">
                  View Profile
                </span>
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-3">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Clean materials get 20% higher prices</li>
              <li>• Upload multiple angles for better assessment</li>
              <li>• Sort materials by type for bonus payments</li>
              <li>• Connect your wallet for Web3 rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;