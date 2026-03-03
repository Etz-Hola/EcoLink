import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Package, Clock, CheckCircle, Upload,
  Leaf, ChevronRight, AlertCircle, Bell, Wallet, CreditCard, Truck, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Material, Notification } from '../../types';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  accepted: { label: 'Accepted — Ready for Pickup', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  approved: { label: 'Accepted — Ready for Pickup', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  processed: { label: 'Processed', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  delivered: { label: 'Paid & Delivered ✅', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [matRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/materials/my`, { headers }),
          fetch(`${API_URL}/notifications`, { headers })
        ]);

        const matData = await matRes.json();
        const notifData = await notifRes.json();

        if (matData.success) setMaterials(matData.data);
        if (notifData.success) setNotifications(notifData.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load your dashboard. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: materials.length,
    pending: materials.filter(m => m.status === 'pending').length,
    accepted: materials.filter(m => m.status === 'accepted').length,
    totalWeight: materials.reduce((sum, m) => sum + (m.weight || 0), 0),
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Collector';
  const recentMaterials = materials.slice(0, 5);

  // ── Schedule Pickup handler (real API) ──
  const handleSchedulePickup = async (materialId: string) => {
    const token = localStorage.getItem('ecolink_token');
    try {
      const res = await fetch(`${API_URL}/materials/${materialId}/schedule-pickup`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to schedule pickup');
      toast.success('Pickup scheduled! The branch has been notified to arrange collection. 🚚', {
        duration: 5000, icon: '📅'
      });
      // Optimistically update local status
      setMaterials(prev => prev.map(m =>
        m._id === materialId ? { ...m, status: 'pickup_scheduled' as Material['status'] } : m
      ));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not schedule pickup';
      toast.error(msg);
    }
  };

  // ── Appeal handler (real API) ──
  const handleAppeal = async (materialId: string) => {
    const token = localStorage.getItem('ecolink_token');
    try {
      const res = await fetch(`${API_URL}/materials/${materialId}/appeal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Quality or condition dispute — requesting admin review' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit appeal');
      toast.success('Appeal submitted! Our admin team will review within 24 hours. 📋', {
        duration: 6000, icon: '✅'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit appeal';
      toast.error(msg);
    }
  };

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

  const currentBalance = user?.balance || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Welcome & Balance Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] p-10 bg-gradient-to-br from-[#061a14] via-[#0a261d] to-[#061a14] shadow-2xl shadow-emerald-950/20"
        >
          {/* Animated background elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05],
              x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-12 -left-12 w-64 h-64 bg-green-400 rounded-full blur-[80px]"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-inner">
                <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <span className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">Verified Collector</span>
                <div className="h-1 w-12 bg-emerald-500/30 rounded-full mt-1" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Hi! <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">{firstName}!</span>
            </h1>
            <p className="text-gray-400 font-medium max-w-xl text-lg leading-relaxed mb-8">
              Your contribution is making a difference. We've tracked <span className="text-white font-bold">{materials.length} batches</span> of materials from your account. Keep it up!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/materials/upload">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-2xl font-black text-sm transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]"
                >
                  <Upload className="w-5 h-5" /> START UPLOADING
                </motion.button>
              </Link>
              <Link to="/wallet">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-sm transition-all border border-white/10"
                >
                  <Wallet className="w-5 h-5 text-emerald-400" /> VIEW WALLET
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Unique Glassmorphism Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:col-span-4 relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 p-1"
        >
          <div className="h-full w-full rounded-[2.3rem] bg-gradient-to-b from-gray-50/50 to-white p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <CreditCard className="w-56 h-56 -rotate-12 translate-x-12 -translate-y-12" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Balance</p>
                  <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-600">₦</span>
                  <h2 className="text-5xl font-black text-gray-900 tracking-tight">
                    {currentBalance.toLocaleString()}
                  </h2>
                </div>
                <div className="flex items-center gap-2 py-1 px-3 bg-emerald-50 w-fit rounded-full">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Live from Paystack</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <Link to="/wallet">
                <motion.button
                  whileHover={{ gap: "1rem" }}
                  className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-emerald-600 text-white rounded-[1.25rem] transition-all duration-300 shadow-lg shadow-gray-900/10 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-black uppercase tracking-widest relative z-10">Manage Funds</span>
                  <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

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

      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Materials Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
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
                    {['Material', 'Type', 'Weight', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentMaterials.map((m, i) => {
                    const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
                    const isAccepted = m.status === 'accepted' || m.status === 'approved';
                    const isRejected = m.status === 'rejected';
                    const isPaid = m.status === 'delivered';
                    const quoted = m.pricePerKg && m.weight ? m.pricePerKg * m.weight : null;
                    return (
                      <motion.tr
                        key={m._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.06 }}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{m.title || `${m.materialType} Batch`}</p>
                            {quoted && isAccepted && (
                              <p className="text-[10px] text-emerald-600 font-black mt-0.5">₦{quoted.toLocaleString()} quoted</p>
                            )}
                            {isPaid && quoted && (
                              <p className="text-[10px] text-emerald-700 font-black mt-0.5">₦{quoted.toLocaleString()} paid ✅</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider capitalize">
                            {m.materialType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{m.weight?.toFixed(1)} kg</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-medium text-gray-400">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {isAccepted && (
                            <button
                              onClick={() => m._id && handleSchedulePickup(m._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap"
                            >
                              <Truck className="w-3 h-3" /> Schedule Pickup
                            </button>
                          )}
                          {isRejected && (
                            <button
                              onClick={() => m._id && handleAppeal(m._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <MessageSquare className="w-3 h-3" /> Appeal
                            </button>
                          )}
                          {isPaid && (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Complete ✅</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Notifications Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Notifications</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-200" />
                </div>
                <p className="text-xs font-bold text-gray-400">No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 6).map((notif, idx) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className={`p-4 rounded-2xl border ${notif.isRead ? 'bg-white border-gray-50' : 'bg-emerald-50/30 border-emerald-100'}`}
                >
                  <p className="text-xs font-black text-gray-900">{notif.title}</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </motion.div>
              ))
            )}

            {notifications.length > 0 && (
              <button className="w-full py-3 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors border-t border-gray-50">
                View Prior Notifications
              </button>
            )}
          </div>
        </motion.div>
      </div>

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