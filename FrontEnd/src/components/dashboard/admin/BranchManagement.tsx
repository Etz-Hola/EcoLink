import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin, CheckCircle, XCircle,
    ExternalLink, Map as MapIcon,
    Search, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface BranchHub {
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

const BranchManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('verification');
    const [hubs, setHubs] = useState<BranchHub[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHubs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const statusFilter = activeTab === 'verification' ? 'pending_verification' : 'active';
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: {
                    role: 'branch',
                    status: statusFilter,
                    search: searchTerm
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setHubs(res.data.data);
            }
        } catch {
            toast.error('Failed to fetch regional hubs');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchHubs();
    }, [fetchHubs]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/users/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success(`Hub ${newStatus === 'active' ? 'approved' : 'rejected'} successfully`);
                fetchHubs();
            }
        } catch {
            toast.error('Failed to update hub status');
        }
    };

    return (
        <div className="space-y-8 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Branch Management</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest font-black">Verify and monitor regional collection hubs</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchHubs}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Queue
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Map
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'verification' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-50 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : hubs.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No hubs in verification queue</p>
                        </div>
                    ) : hubs.map((branch) => (
                        <motion.div
                            key={branch._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center text-emerald-600 border border-emerald-50">
                                        <MapPin size={32} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Verification</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{branch.businessName || `${branch.firstName} ${branch.lastName}`}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">Manager: {branch.firstName} {branch.lastName}</p>

                                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <MapPin size={16} className="text-emerald-500" />
                                    {branch.location?.address || 'Address pending'}, {branch.location?.city || branch.location?.state || 'Location pending'}
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleUpdateStatus(branch._id, 'active')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200/10"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(branch._id, 'suspended')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>

                            <button className="px-8 py-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-emerald-500 transition-colors flex items-center justify-between group">
                                View Legal Documents
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'active' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search active hubs..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : hubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active hubs found</p>
                                        </td>
                                    </tr>
                                ) : hubs.map((branch) => (
                                    <tr key={branch._id} className="hover:bg-gray-50/40 group transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black overflow-hidden shadow-sm">
                                                    <MapPin size={20} />
                                                </div>
                                                <span className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{branch.businessName || `${branch.firstName} ${branch.lastName}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{branch.firstName} {branch.lastName}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-500">{branch.location?.city || branch.location?.state || 'Unknown'}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-400">Load Factor</span>
                                                    <span className="text-emerald-500">Optimal</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 shadow-sm" style={{ width: '65%' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 shadow-sm">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'map' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-[600px] flex flex-col items-center justify-center relative bg-gray-50/50">
                    <MapIcon size={64} className="text-gray-200 mb-4 animate-pulse" />
                    <p className="text-lg font-black text-gray-900 tracking-tight">Interactive Hub Topology</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">Visualizing global decentralized network</p>

                    <div className="mt-8 flex gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-md border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Hubs</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-md border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Syncing</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
