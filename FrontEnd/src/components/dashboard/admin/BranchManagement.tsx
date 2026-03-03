import React, { useState } from 'react';
import {
    MapPin, CheckCircle, XCircle, Clock,
    ExternalLink, ShieldCheck, Map as MapIcon,
    Search, Filter, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const BranchManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('verification');

    // Mock data
    const pendingBranches = [
        { id: '1', name: 'EcoHub South', manager: 'Bisi Olaniyi', location: 'Lekki Phase 1, Lagos', joined: '2h ago', type: 'Hub' },
        { id: '2', name: 'GreenWay Recycling', manager: 'Musa Abubakar', location: 'Gwarinpa, Abuja', joined: 'Yesterday', type: 'Collection Point' },
    ];

    const approvedBranches = [
        { id: '3', name: 'Lekki Branch', manager: 'Ade Wale', location: 'Lagos', capacity: '85%', status: 'active' },
        { id: '4', name: 'Ibadan North', manager: 'Segun Arinze', location: 'Oyo', capacity: '42%', status: 'active' },
        { id: '5', name: 'Warri Central', manager: 'Efe Grace', location: 'Delta', capacity: '12%', status: 'maintenance' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Branch Management</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verify and monitor regional collection hubs</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setActiveTab('verification')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        Verification Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        Approved Branches
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        Map View
                    </button>
                </div>
            </div>

            {activeTab === 'verification' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingBranches.map((branch) => (
                        <motion.div
                            key={branch.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center text-emerald-600 border border-emerald-50">
                                        <MapPin size={32} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Pending Identity</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{branch.name}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">Manager: {branch.manager}</p>

                                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-500">
                                    <MapPin size={16} className="text-emerald-500" />
                                    {branch.location}
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200/20">
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>

                            <button className="px-8 py-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-emerald-500 transition-colors flex items-center justify-between group">
                                View Verification Documents
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'active' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search branches by hub name or location..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 border border-gray-100 transition-all">
                            <Filter size={14} /> Filter Capacity
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub Name</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Load</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {approvedBranches.map((branch) => (
                                <tr key={branch.id} className="hover:bg-gray-50/40 group transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black overflow-hidden shadow-sm">
                                                <MapPin size={20} />
                                            </div>
                                            <span className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{branch.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-600">{branch.manager}</td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-500">{branch.location}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5 w-32">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-gray-400">Capacity</span>
                                                <span className={parseInt(branch.capacity) > 80 ? 'text-rose-500' : 'text-emerald-500'}>{branch.capacity}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                <div className={`h-full ${parseInt(branch.capacity) > 80 ? 'bg-rose-500 shadow-sm shadow-rose-200' : 'bg-emerald-500 shadow-sm shadow-emerald-200'}`} style={{ width: branch.capacity }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${branch.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {branch.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                            <ExternalLink size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'map' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-[600px] flex flex-col items-center justify-center relative bg-gray-50/50">
                    <MapIcon size={64} className="text-gray-200 mb-4 animate-pulse" />
                    <p className="text-lg font-black text-gray-900 tracking-tight">Interactive Hub Map</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">Visualizing 156 collection points nationwide</p>

                    <div className="mt-8 flex gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-md border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Hubs</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-md border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Critical Load</span>
                        </div>
                    </div>

                    <div className="absolute inset-x-8 bottom-8 p-6 bg-emerald-600 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-emerald-900/40">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight leading-tight">Branch Coverage Optimization</p>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">AI Suggestion: New hub needed in Port Harcourt</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-white text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-lg active:scale-95">Deploy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
