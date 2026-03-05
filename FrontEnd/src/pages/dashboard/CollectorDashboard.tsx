import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Package, Clock, CheckCircle, Upload,
  Leaf, ChevronRight, AlertCircle, Bell, Wallet, CreditCard, Truck, MessageSquare,
  RefreshCw, Filter, List, Grid, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMaterial } from '../../hooks/useMaterial';
import { Material, Notification } from '../../types';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  approved: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  pickup_scheduled: { label: 'Logistics Info Sent', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
  processed: { label: 'Processing', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Package },
  delivered: { label: 'Paid & Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Wallet },
  rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchMyMaterials, updateMaterialStatus } = useMaterial();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'delivered' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('ecolink_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [matData, notifRes] = await Promise.all([
        fetchMyMaterials(),
        fetch(`${API_URL}/notifications/me`, { headers })
      ]);

      setMaterials(matData);

      const notifData = await notifRes.json();
      if (notifData.success) setNotifications(notifData.data);

      if (isRefresh) toast.success('Dashboard synced with latest data');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not sync dashboards. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, fetchMyMaterials]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMaterials = materials.filter(m => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'accepted' && (m.status === 'accepted' || m.status === 'approved' || m.status === 'pickup_scheduled')) ||
      m.status === activeTab;
    const matchesSearch = searchQuery === '' ||
      (m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.materialType?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: materials.length,
    pending: materials.filter(m => m.status === 'pending').length,
    accepted: materials.filter(m => m.status === 'accepted' || m.status === 'approved' || m.status === 'pickup_scheduled').length,
    totalWeight: materials.reduce((sum, m) => sum + (m.weight || 0), 0),
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Collector';

  const handleSchedulePickup = async (materialId: string) => {
    const token = localStorage.getItem('ecolink_token');
    try {
      const res = await fetch(`${API_URL}/materials/${materialId}/schedule-pickup`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to schedule pickup');
      toast.success('Pickup request sent! A branch representative will contact you. 🚚');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Could not schedule pickup');
    }
  };

  const handleAppeal = async (materialId: string) => {
    const token = localStorage.getItem('ecolink_token');
    try {
      const res = await fetch(`${API_URL}/materials/${materialId}/appeal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Quality dispute' })
      });
      if (!res.ok) throw new Error('Appeal failed');
      toast.success('Appeal submitted for review.');
      fetchData(true);
    } catch (err) {
      toast.error('Could not submit appeal');
    }
  };

  const statCards = [
    { label: 'Total Uploads', value: stats.total, icon: Package, gradient: 'from-green-600 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
    { label: 'In Review', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-400', bg: 'from-amber-50 to-orange-50' },
    { label: 'Accepted / Active', value: stats.accepted, icon: CheckCircle, gradient: 'from-indigo-600 to-purple-500', bg: 'from-indigo-50 to-purple-50' },
    { label: 'Shared Weight (kg)', value: stats.totalWeight.toFixed(1), icon: TrendingUp, gradient: 'from-rose-500 to-pink-500', bg: 'from-rose-50 to-pink-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4 md:px-0">
      {/* Welcome & Balance Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 bg-gradient-to-br from-[#061a14] via-[#0a261d] to-[#061a14] shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">{user?.organizationId ? 'Team Member' : 'Individual Collector'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Hello, <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">{firstName}!</span>
            </h1>
            <p className="text-gray-400 font-medium max-w-xl text-lg mb-8">
              Your team's contribution is scaling. You've collectively managed <span className="text-white font-bold">{materials.length} batches</span>.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/materials/upload">
                <button className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-gray-950 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" /> NEW UPLOAD
                </button>
              </Link>
              <button
                onClick={() => fetchData(true)}
                className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-sm border border-white/10 hover:bg-white/20 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} /> SYNC DATA
              </button>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl p-8 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Treasury Balance</p>
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600">₦</span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{(user?.balance || 0).toLocaleString()}</h2>
            </div>
            <div className="py-1 px-3 bg-emerald-50 w-fit rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-700 uppercase">Live Organization Funds</span>
            </div>
          </div>
          <Link to="/wallet" className="mt-8">
            <button className="w-full flex items-center justify-between p-4 bg-gray-900 text-white rounded-2xl hover:bg-emerald-600 transition-colors">
              <span className="text-xs font-black uppercase tracking-widest">Manage Treasury</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`bg-gradient-to-br ${card.bg} p-6 rounded-[2rem] border border-white shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 text-white shadow-lg shadow-gray-200`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Shared Inventory Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Organization Inventory</h2>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto whitespace-nowrap">
            {(['all', 'pending', 'accepted', 'delivered', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches by ID or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-emerald-500/10 placeholder:text-gray-400"
            />
          </div>
          <p className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
            Viewing {filteredMaterials.length} of {materials.length} batches
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-[2.5rem]" />
              ))
            ) : filteredMaterials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]"
              >
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold italic uppercase text-xs tracking-widest">No batches found for this view</p>
              </motion.div>
            ) : filteredMaterials.map((m) => {
              const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={m._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all group overflow-hidden relative"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                      {m.photos?.[0] ? (
                        <img src={m.photos[0]} alt="Material" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                          <Package className="w-6 h-6 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${sc.bg} ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                      {m.title || `${m.materialType} Batch`}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> {m.weight?.toFixed(1)} KG</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {m.createdAt ? new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-gray-50 group-hover:bg-emerald-50/50 transition-colors">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Value Created</p>
                      <p className="text-lg font-black text-gray-900">₦{(m.totalValue || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lot Grade</p>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{m.qualityGrade || 'Pending'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(m.status === 'accepted' || m.status === 'approved') && (
                      <button
                        onClick={() => handleSchedulePickup(m._id!)}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all"
                      >
                        ARRANGE PICKUP
                      </button>
                    )}
                    {m.status === 'rejected' && (
                      <button
                        onClick={() => handleAppeal(m._id!)}
                        className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all"
                      >
                        SUBMIT APPEAL
                      </button>
                    )}
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications and Team Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-2 bg-[#061a14] text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <TrendingUp className="w-64 h-64 rotate-12" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">System Alerts</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length === 0 ? (
                <p className="text-gray-500 font-bold italic py-8 text-center text-xs tracking-widest uppercase">No active alerts for your organization</p>
              ) : notifications.map((notif, i) => (
                <div key={notif._id} className="group p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">{notif.title}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 leading-tight">Environmental Impact</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Your organization's efforts have prevented <span className="text-emerald-600 font-black">{(stats.totalWeight * 2.5).toFixed(1)}kg</span> of CO2 emissions this month.
            </p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-emerald-500 w-[75%]" />
            </div>
          </div>
          <button className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 hover:text-gray-950 transition-colors">
            View Impact Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
