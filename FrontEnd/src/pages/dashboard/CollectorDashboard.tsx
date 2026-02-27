import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Clock, DollarSign, Plus, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, formatWeight, formatDate } from '../../utils/helpers';
import MaterialCard from '../../components/feature/MaterialCard';
import Button from '../../components/common/Button';
import EcoPointsDisplay from '../../components/web3/EcoPointsDisplay';
import NearbyBuyersMap from '../../components/dashboard/NearbyBuyersMap';
import UploadMaterialsForm from '../../components/dashboard/UploadMaterialsForm';
import { useAuth } from '../../hooks/useAuth';

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('ecolink_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/materials/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data.map((m: any) => ({
          id: m._id,
          name: m.name || `${m.materialType} Batch`,
          category: { name: m.materialType },
          subcategory: m.quality || 'Standard',
          weight: m.weight,
          condition: m.condition === 'treated_clean' ? 'clean' : 'dirty',
          photos: m.images || [],
          status: m.status, // accepted, rejected, pending, processed
          pricePerKg: m.pricing?.offeredPrice || 0,
          totalValue: (m.pricing?.offeredPrice || 0) * m.weight,
          uploadedAt: new Date(m.createdAt)
        })));
      }
    } catch (err) {
      console.error('Failed to fetch materials', err);
    }
  };


  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserLocation({ lat: 6.5244, lng: 3.3792 })
      );
    } else {
      setUserLocation({ lat: 6.5244, lng: 3.3792 });
    }

    fetchMaterials();
  }, []);

  const pendingMaterials = materials.filter(m => m.status === 'pending');
  const approvedMaterials = materials.filter(m => m.status === 'accepted');
  const rejectedMaterials = materials.filter(m => m.status === 'rejected');
  const totalValue = materials.reduce((sum, m) => sum + m.totalValue, 0);
  const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);

  const tabs = [
    { id: 'all', label: 'All Materials', count: materials.length },
    { id: 'pending', label: 'Pending', count: pendingMaterials.length },
    { id: 'approved', label: 'Approved', count: approvedMaterials.length },
    { id: 'rejected', label: 'Rejected', count: rejectedMaterials.length }
  ];

  const getFilteredMaterials = () => {
    switch (selectedTab) {
      case 'pending': return pendingMaterials;
      case 'approved': return approvedMaterials;
      case 'rejected': return rejectedMaterials;
      default: return materials;
    }
  };

  const stats = [
    {
      label: 'Total Value',
      value: formatPrice(totalValue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    },
    {
      label: 'Total Weight',
      value: formatWeight(totalWeight),
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      label: 'Materials Uploaded',
      value: materials.length.toString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      label: 'Pending Review',
      value: pendingMaterials.length.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-green-600 to-green-800 text-white overflow-hidden shadow-2xl shadow-green-900/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <LayoutDashboard className="w-3 h-3" />
              Individual Collector
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              Welcome back, <span className="text-green-200">{user?.name?.split(' ')[0] || 'Recycler'}</span>!
            </h1>
            <p className="text-green-50/80 text-lg max-w-xl font-medium">
              You've recycled <span className="text-white font-bold">{formatWeight(totalWeight)}</span> so far.
              Keep up the great work for a cleaner Nigeria! 🇳🇬
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/materials/upload">
              <button className="px-8 py-4 bg-white text-green-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload Materials
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeIn}
            className={`glass-card p-6 rounded-3xl border ${stat.border} hover:shadow-2xl transition-all group bg-white shadow-sm border-gray-100`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-gray-400">
              <span>View detailed analytics</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Nearby Buyers Map */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Nearby Collection Centers</h2>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">Live Updates</span>
        </div>
        <NearbyBuyersMap userLocation={userLocation} viewMode="collector" />
      </div>

      {/* Upload Section */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Ready to Recycle?</h2>
        </div>
        <UploadMaterialsForm />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Materials Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
              <nav className="flex space-x-8 px-8 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`relative py-4 px-2 font-bold text-sm transition-all ${selectedTab === tab.id
                      ? 'text-green-600'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {tab.count}
                      </span>
                    </div>
                    {selectedTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Materials Grid */}
            <div className="p-8">
              {getFilteredMaterials().length > 0 ? (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {getFilteredMaterials().map((material) => (
                    <motion.div key={material.id} variants={fadeIn}>
                      <MaterialCard
                        material={material as any}
                        onView={(material) => console.log('View material:', material)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedTab === 'all' ? 'No materials uploaded yet' : `No ${selectedTab} materials`}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-8">
                    {selectedTab === 'all'
                      ? 'Get started by uploading your first recyclable material. Every small action counts!'
                      : `You don't have any ${selectedTab} materials at the moment.`
                    }
                  </p>
                  {selectedTab === 'all' && (
                    <Button
                      size="lg"
                      className="rounded-2xl"
                      leftIcon={<Plus className="h-5 w-5" />}
                    >
                      <Link to="/materials/upload">Upload Your First Material</Link>
                    </Button>
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
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
              Recent Activity
              <span className="p-2 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400" />
              </span>
            </h3>
            <div className="space-y-6">
              {approvedMaterials.slice(0, 3).map((material) => (
                <div key={material.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                      {material.name} Approved
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">
                      {formatDate(material.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
              {approvedMaterials.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-gray-400 italic">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Eco Tips */}
          <div className="relative rounded-[2rem] p-8 bg-green-900 text-white overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-2xl">🌱</span> Eco Tips
              </h4>
              <ul className="space-y-4">
                {[
                  'Sort materials by type for better prices',
                  'Clean containers before uploading',
                  'Bundle similar items together',
                  'Take clear photos from multiple angles'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-green-100/90 leading-relaxed group/item hover:text-white transition-colors">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 group-hover/item:bg-white/20">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-white/10">
                View All Tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;