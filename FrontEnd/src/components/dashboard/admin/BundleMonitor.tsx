import React, { useState, useEffect, useCallback } from 'react';
import {
    Layers, Search, Eye,
    MapPin, Clock, ArrowRight, RefreshCw,
    Maximize2, ShieldCheck, Box
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Bundle {
    _id: string;
    name: string;
    totalWeight: number;
    totalPrice: number;
    status: string;
    items: any[];
    branch: { firstName: string; lastName: string; businessName?: string };
    organization: { firstName: string; lastName: string; businessName?: string };
    createdAt: string;
}

const BundleMonitor: React.FC = () => {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBundles = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.get(`${API_URL}/admin/bundles`, {
                params: { search: searchTerm, status: statusFilter },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setBundles(res.data.data);
            }
        } catch {
            toast.error('Failed to load bundle records');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBundles();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchBundles]);

    const STATUS_STLYES: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        shipped: 'bg-blue-50 text-blue-600 border-blue-100',
        delivered: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <div className="space-y-6 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Bundle Monitoring</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest font-black">Global tracker for material bundles and logistics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchBundles}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Layers className="text-emerald-500" size={18} />
                        <span className="text-sm font-black text-gray-900">{bundles.length}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Bundles</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-[320px]">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by bundle name or branch..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                            {['all', 'pending', 'approved', 'shipped', 'delivered'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bundles Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-50 rounded-[2rem] animate-pulse" />
                        ))
                    ) : bundles.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                <Box size={48} className="opacity-20" />
                                <p className="text-sm font-black uppercase tracking-widest">No bundle records found</p>
                            </div>
                        </div>
                    ) : bundles.map((bundle) => (
                        <motion.div
                            key={bundle._id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group overflow-hidden"
                        >
                            <div className="h-40 bg-gray-50 relative group-hover:opacity-90 transition-opacity flex items-center justify-center">
                                <Box size={48} className="text-gray-200" />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${STATUS_STLYES[bundle.status] || 'bg-gray-50'}`}>
                                        {bundle.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-emerald-50 shadow-sm">
                                        <ShieldCheck size={12} /> Verified
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bundle.items.length} Items • {bundle.totalWeight} kg</p>
                                    <p className="text-lg font-black text-gray-900">₦{bundle.totalPrice.toLocaleString()}</p>
                                </div>
                                <h4 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-2 group-hover:text-emerald-600 transition-colors uppercase">
                                    {bundle.name}
                                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </h4>
                                <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1 opacity-70"><MapPin size={12} /> {bundle.branch.businessName || 'Platform Hub'}</span>
                                    <span className="flex items-center gap-1 opacity-50"><Clock size={12} /> {new Date(bundle.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[10px] text-white font-black">
                                                {i === 1 ? bundle.branch.firstName.charAt(0) : bundle.organization.firstName.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm active:scale-95"><Eye size={18} /></button>
                                        <button className="p-2.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-95"><Maximize2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-8 bg-gray-50/30 border-t border-gray-50 text-center">
                    <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2 mx-auto group">
                        Logistics Audit Trail
                        <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BundleMonitor;
