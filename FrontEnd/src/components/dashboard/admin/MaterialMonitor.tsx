import React, { useState } from 'react';
import {
    Package, Search, Filter, Eye, MessageSquare,
    MapPin, CheckCircle, Clock, Trash2, ArrowRight,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaterialMonitor: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data
    const uploads = [
        { id: '1', collector: 'Doris O.', type: 'Plastic', weight: '45kg', price: '₦22,500', status: 'pending', branch: 'Lekki Hub', time: '10m ago' },
        { id: '2', collector: 'John D.', type: 'Metal', weight: '120kg', price: '₦84,000', status: 'approved', branch: 'Ikeja North', time: '1h ago' },
        { id: '3', collector: 'Sarah S.', type: 'Paper', weight: '30kg', price: '₦4,500', status: 'delivered', branch: 'Surulere', time: '3h ago' },
        { id: '4', collector: 'Hotel R.', type: 'Glass', weight: '200kg', price: '₦12,000', status: 'rejected', branch: 'Victoria Island', time: 'Yesterday' },
        { id: '5', collector: 'Musa A.', type: 'Electronic', weight: '12kg', price: '₦36,000', status: 'processing', branch: 'Abuja Central', time: '2 days ago' },
    ];

    const STATUS_STLYES: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        delivered: 'bg-blue-50 text-blue-600 border-blue-100',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
        processing: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Material Monitoring</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global tracker for all recycling activities</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Package className="text-emerald-500" size={18} />
                        <span className="text-sm font-black text-gray-900">12,450 kg</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Volume</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-[320px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search uploads by uploader or branch..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                            {['all', 'pending', 'approved', 'delivered'].map((s) => (
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

                {/* Uploads Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploads.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group overflow-hidden"
                        >
                            <div className="h-40 bg-gray-100 relative group-hover:opacity-90 transition-opacity">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                    <Package size={48} />
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${STATUS_STLYES[item.status]}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.type} • {item.weight}</p>
                                    <p className="text-lg font-black text-gray-900">{item.price}</p>
                                </div>
                                <h4 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                                    {item.collector}
                                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </h4>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1 opacity-70"><MapPin size={12} /> {item.branch}</span>
                                    <span className="flex items-center gap-1 opacity-50"><Clock size={12} /> {item.time}</span>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Eye size={16} /></button>
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><MessageSquare size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-8 bg-gray-50/30 border-t border-gray-50 text-center">
                    <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2 mx-auto group">
                        Load More History
                        <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialMonitor;
