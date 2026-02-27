import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Package, Clock, CheckCircle, Upload,
  MapPin, Leaf, ChevronRight, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  processed: { label: 'Processed', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const res = await fetch(`${API_URL}/materials/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMaterials(data.data);
      } catch (err) {
        setError('Could not load your materials. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const stats = {
    total: materials.length,
    pending: materials.filter(m => m.status === 'pending').length,
    accepted: materials.filter(m => m.status === 'accepted').length,
    totalWeight: materials.reduce((sum, m) => sum + (m.weight || 0), 0),
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Collector';
  const recentMaterials = materials.slice(0, 5);

  const statCards = [
    {
      label: 'Total Uploads', value: stats.total, icon: Package,
      gradient: 'from-green-600 to-emerald-500', bg: 'from-green-50 to-emerald-50'
    },
    {
      label: 'In Review', value: stats.pending, icon: Clock,
      gradient: 'from-amber-500 to-orange-400', bg: 'from-amber-50 to-orange-50'
    },
    {
      label: 'Accepted', value: stats.accepted, icon: CheckCircle,
      gradient: 'from-indigo-600 to-purple-500', bg: 'from-indigo-50 to-purple-50'
    },
    {
      label: 'Total Weight (kg)', value: stats.totalWeight.toFixed(1), icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-500', bg: 'from-rose-50 to-pink-50'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900"
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-green-400 font-bold text-sm uppercase tracking-widest">Individual Collector</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Welcome back, <span className="text-green-400">{firstName}!</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg">
            Track your materials, see their status, and contribute to a cleaner Nigeria. Every kilogram counts.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/materials/upload">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-900/40"
              >
                <Upload className="w-4 h-4" /> Upload Material
              </motion.button>
            </Link>
            <Link to="/materials">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors border border-white/10"
              >
                <Package className="w-4 h-4" /> My Materials
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`bg-gradient-to-br ${card.bg} border border-white rounded-2xl p-5 shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900">{card.value}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Materials Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="text-lg font-black text-gray-900">Recent Materials</h2>
          <Link to="/materials" className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm font-medium text-gray-400">Loading your materials...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-6 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-1">No materials yet</h3>
            <p className="text-sm text-gray-400 mb-4">Upload your first material to get started.</p>
            <Link to="/materials/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">
              <Upload className="w-4 h-4" /> Get Started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70">
                  {['Material', 'Type', 'Weight', 'Location', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentMaterials.map((m, i) => {
                  const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
                  return (
                    <motion.tr
                      key={m._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{m.title || `${m.materialType} Batch`}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{m.subType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider capitalize">
                          {m.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">{m.weight?.toFixed(1)} kg</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {m.pickupLocation?.city || m.pickupLocation?.address?.split(',')[0] || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-medium text-gray-400">
                        {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { icon: '📸', title: 'Better Photos = Better Price', body: 'Clear, well-lit photos help branches assess your materials faster.' },
          { icon: '⚖️', title: 'Accurate Weight Matters', body: 'Inaccurate weight estimates can lead to pricing disputes. Use a scale.' },
          { icon: '📍', title: 'Share Your Location', body: 'Enabling your location helps the nearest branch find and pick up your materials quickly.' },
        ].map((tip, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-3">{tip.icon}</div>
            <h3 className="font-black text-gray-900 text-sm mb-1">{tip.title}</h3>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CollectorDashboard;