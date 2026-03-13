import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Package, DollarSign, TrendingUp,
    MapPin, Clock, ArrowUpRight, ArrowDownRight,
    ShieldCheck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface StatCardProps {
    label: string;
    value: string | number;
    change: string;
    positive: boolean;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const StatCard = ({ label, value, change, positive, icon: Icon, color, bg }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} transition-transform group-hover:scale-110 shadow-sm`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{typeof value === 'number' && label.includes('Revenue') ? `₦${value.toLocaleString()}` : value.toLocaleString()}{label.includes('Volume') ? ' kg' : ''}</p>
    </motion.div>
);

interface ActivityItemProps {
    title: string;
    subtitle: string;
    time: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const ActivityItem = ({ title, subtitle, time, icon: Icon, color, bg }: ActivityItemProps) => (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{title}</p>
            <p className="text-xs font-medium text-gray-500 truncate">{subtitle}</p>
        </div>
        <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap uppercase tracking-widest">{time}</span>
    </div>
);

interface DashboardStats {
    counts: {
        users: number;
        materials: number;
        bundles: number;
        revenue: number;
        volume: number;
    };
    distribution: {
        usersByRole: { _id: string; count: number }[];
        materialsByStatus: { _id: string; count: number }[];
    };
}

interface Branch {
    _id: string;
    businessName?: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    location?: { address: string; city: string; state: string };
    createdAt: string;
    balance: number;
}

const AdminOverview: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingBranches, setPendingBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Admin';

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const [statsRes, pendingRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/admin/branches/pending`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (pendingRes.data.success) setPendingBranches(pendingRes.data.data);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/branches/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Branch approved successfully! 🏢');
                fetchStats();
            }
        } catch {
            toast.error('Failed to approve branch');
        }
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/branches/${rejectingId}/reject`, 
                { reason: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success('Branch rejected');
                setRejectingId(null);
                setRejectReason('');
                fetchStats();
            }
        } catch {
            toast.error('Failed to reject branch');
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const metrics = stats ? [
        { label: 'Total Users', value: stats.counts.users, change: '+12%', positive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Org/Hubs', value: stats.counts.bundles, change: '+3%', positive: true, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Material Volume', value: stats.counts.volume, change: '+18%', positive: true, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Platform Revenue', value: stats.counts.revenue, change: '+8%', positive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ] : [];

    return (
        <div className="space-y-6 md:space-y-8 pb-10 px-0 sm:px-2 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 ml-4 md:ml-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Platform Overview</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Global Platform Metrics & Real-time Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-xs md:text-sm font-bold text-gray-500">
                        Active: <span className="text-gray-900 font-black">{firstName}</span>
                    </p>
                    <button
                        onClick={fetchStats}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-32 animate-pulse" />
                    ))
                ) : (
                    metrics.map((m, i) => (
                        <StatCard key={i} {...m} />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Chart Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <TrendingUp size={200} />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Growth & Performance</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Material Processing distribution</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button className="px-3 py-1.5 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-emerald-50">Volume</button>
                                <button className="px-3 py-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-gray-600 transition-colors">Users</button>
                            </div>
                        </div>

                        <div className="h-72 w-full flex items-end justify-between gap-4 px-4 pb-4 bg-gray-50/30 rounded-3xl border border-gray-100">
                            {stats?.distribution?.materialsByStatus?.map((item, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div className="w-full relative flex items-end justify-center mb-2 h-48">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.count / stats.counts.materials) * 100 || 10}%` }}
                                            className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg shadow-sm group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all cursor-help relative"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.count} Units
                                            </div>
                                        </motion.div>
                                    </div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate w-full text-center">{item._id}</p>
                                </div>
                            ))}
                            {(!stats || stats.distribution.materialsByStatus.length === 0) && (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                    <Clock size={40} className="mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">Awaiting Data Streams...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Verifications Section */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50 group-hover:bg-amber-100 transition-colors" />
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Pending Branches</h3>
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                                    {pendingBranches.length} Requests
                                </span>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
                                ) : pendingBranches.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No pending verifications</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {pendingBranches.map((branch) => (
                                            <div key={branch._id} className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-emerald-100 transition-all">
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">{branch.businessName || `${branch.firstName} ${branch.lastName}`}</h4>
                                                        <div className="space-y-0.5 mt-1">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{branch.email}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                                <MapPin size={10} className="text-emerald-500" />
                                                                {branch.location?.city || 'City'}, {branch.location?.state || 'State'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(branch._id)}
                                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200/20"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => setRejectingId(branch._id)}
                                                            className="px-3 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>

                                                {rejectingId === branch._id && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                                                        <input 
                                                            type="text"
                                                            placeholder="Reason..."
                                                            className="w-full bg-white border border-rose-100 rounded-xl py-2 px-3 text-[9px] font-bold mb-2 outline-none"
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={handleReject}
                                                                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => setRejectingId(null)}
                                                                className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Network Health Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Network</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">98% Optimal</span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 leading-tight">All clusters operational. Next scheduled audit: <span className="text-gray-900">4:00 AM CST</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Activity Feed */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-fit sticky top-24">
                    <div className="p-8 border-b border-gray-50">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <Clock size={20} className="text-emerald-500" />
                            Live Activity
                        </h3>
                    </div>
                    <div className="p-4 space-y-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        <ActivityItem
                            title="Branch Verification"
                            subtitle="EcoHub North - Kano Territory"
                            time="Now"
                            icon={MapPin} color="text-blue-600" bg="bg-blue-50"
                        />
                        <ActivityItem
                            title="Organization Payout"
                            subtitle="₦145,000 processed for Regency Hotel"
                            time="12m ago"
                            icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50"
                        />
                        <ActivityItem
                            title="Material Export"
                            subtitle="2.5 Tons PET bundled for Exporter"
                            time="1h ago"
                            icon={Package} color="text-purple-600" bg="bg-purple-50"
                        />
                        <ActivityItem
                            title="New Organization"
                            subtitle="Lekki Beach Resort registered"
                            time="3h ago"
                            icon={Users} color="text-indigo-600" bg="bg-indigo-50"
                        />
                    </div>
                    <div className="p-6">
                        <button className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest py-3.5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 hover:text-emerald-500 transition-all active:scale-[0.98]">
                            Full Audit Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
