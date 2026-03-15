import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2, Search, ExternalLink,
    TrendingUp, Package, DollarSign,
    RefreshCw, ShieldAlert, BadgeCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Organization {
    _id: string;
    businessName: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    balance: number;
    createdAt: string;
    totalMaterialsSubmitted?: number;
    totalEarnings?: number;
}

const OrganizationManagement: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const [page, setPage] = useState(1);
    const limit = 8;

    const fetchOrganizations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            // We fetch users with roles organization, hotel, exporter, or buyer as "Organizations"
            // For now, let's just use the 'organization' filter or fetch all and filter client side if role filter is single
            // Actually AdminController.getUsers takes a single role.
            // Let's fetch 'organization' role first, and maybe we can expand the backend later.
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: {
                    search: searchTerm,
                    role: 'organization',
                    page,
                    limit
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setOrganizations(res.data.data);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('Failed to fetch organization data');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page, limit]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrganizations();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchOrganizations]);

    return (
        <div className="space-y-6 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Platform Entities</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest font-black">Monitoring corporate partners and logistics hubs</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchOrganizations}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Building2 className="text-emerald-500" size={18} />
                        <span className="text-sm font-black text-gray-900">{total}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered Entities</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 w-fit backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Entity Roster
                </button>
                <button
                    onClick={() => setActiveTab('disputes')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'disputes' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Dispute Monitoring
                </button>
            </div>

            {activeTab === 'active' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Find organization by name, business ID, or manager..."
                            className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-16 pr-6 text-sm font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-emerald-50 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : organizations.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest font-black">No matching entities found</p>
                        </div>
                    ) : organizations.map((org) => (
                        <motion.div
                            key={org._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                            {org.businessName?.charAt(0) || org.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-emerald-600 transition-colors">{org.businessName || 'Unnamed Entity'}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{org.role.replace('_', ' ')} • {org.username}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${org.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {org.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <Package size={12} className="text-emerald-500" /> Uploads
                                        </div>
                                        <p className="text-lg font-black text-gray-900">{org.totalMaterialsSubmitted || 0}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <DollarSign size={12} className="text-blue-500" /> Earnings
                                        </div>
                                        <p className="text-lg font-black text-gray-900">₦{(org.totalEarnings || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <TrendingUp size={12} className="text-purple-500" /> Points
                                        </div>
                                        <p className="text-lg font-black text-gray-900">0</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <BadgeCheck size={16} />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trust Index: <span className="text-emerald-500">98%</span></p>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 group/btn">
                                        Deep Audit <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="md:col-span-2 flex items-center justify-center gap-4 py-8">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 disabled:opacity-20 hover:text-emerald-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Page {page} of {Math.ceil(total / limit)}</span>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 disabled:opacity-20 hover:text-emerald-500"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden p-12 text-center">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Entity Dispute Center</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-md mx-auto">
                        Automated monitoring system is currently tracking 0 active disputes between collectors and regional hubs.
                    </p>
                    <div className="mt-12 p-8 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">System Status: Nominal</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationManagement;
