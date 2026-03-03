import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Filter, Search, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatWeight, formatDate, getMaterialStatusColor } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type Status = 'all' | 'pending' | 'accepted' | 'rejected' | 'processed';

const STATUS_STEPS = {
    pending: { label: 'In Review', step: 1, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    accepted: { label: 'Accepted', step: 2, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    approved: { label: 'Accepted', step: 2, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    delivered: { label: 'Delivered', step: 3, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
    processed: { label: 'Processed', step: 3, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: TrendingUp },
    bundled: { label: 'Bundled', step: 3, color: 'text-purple-600', bg: 'bg-purple-50', icon: TrendingUp },
    sold: { label: 'Sold', step: 3, color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp },
    rejected: { label: 'Rejected', step: 0, color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
} as const;

const MyMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<Status>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const token = localStorage.getItem('ecolink_token');
                const res = await fetch(`${API_URL}/materials/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMaterials(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch materials:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const getFiltered = () => {
        let result = materials;
        if (selectedStatus !== 'all') {
            if (selectedStatus === 'accepted') {
                // Treat backend "approved" as accepted for the user
                result = result.filter(m => m.status === 'accepted' || m.status === 'approved');
            } else if (selectedStatus === 'processed') {
                // Group all completed lifecycle states as "processed"
                const processedStatuses = ['processed', 'delivered', 'bundled', 'sold'];
                result = result.filter(m => processedStatuses.includes(m.status));
            } else {
                result = result.filter(m => m.status === selectedStatus);
            }
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.title?.toLowerCase().includes(q) ||
                m.materialType?.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q)
            );
        }
        return result;
    };

    const filtered = getFiltered();
    const counts = {
        all: materials.length,
        pending: materials.filter(m => m.status === 'pending').length,
        accepted: materials.filter(m => m.status === 'accepted' || m.status === 'approved').length,
        rejected: materials.filter(m => m.status === 'rejected').length,
        processed: materials.filter((m) =>
            ['processed', 'delivered', 'bundled', 'sold'].includes(m.status)
        ).length,
    };

    const tabs: { id: Status; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'accepted', label: 'Accepted' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'processed', label: 'Processed' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Materials</h1>
                    <p className="text-gray-500 mt-1 font-medium">Track everything you've uploaded and its review status.</p>
                </div>
                <Link to="/materials/upload">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Upload Material
                    </motion.button>
                </Link>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Uploaded', value: counts.all, color: 'bg-gray-900 text-white' },
                    { label: 'In Review', value: counts.pending, color: 'bg-amber-500 text-white' },
                    { label: 'Accepted', value: counts.accepted, color: 'bg-emerald-500 text-white' },
                    { label: 'Rejected', value: counts.rejected, color: 'bg-rose-500 text-white' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`${stat.color} p-5 rounded-2xl shadow-sm`}
                    >
                        <p className="text-3xl font-black">{stat.value}</p>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedStatus(tab.id)}
                            className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedStatus === tab.id
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] ${selectedStatus === tab.id ? 'bg-white/20' : 'bg-gray-100'
                                }`}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search materials..."
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100 focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-sm font-medium text-gray-400">Loading your materials...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No materials found</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                {selectedStatus === 'all' ? "You haven't uploaded any materials yet." : `No ${selectedStatus} materials found.`}
                            </p>
                            <Link to="/materials/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold">
                                <Plus className="w-4 h-4" /> Upload Your First Material
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/70">
                                    {['Material', 'Type', 'Weight', 'Status', 'Progress', 'Location', 'Submitted'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {filtered.map((m, i) => {
                                        const statusKey = (m.status in STATUS_STEPS ? m.status : 'pending') as keyof typeof STATUS_STEPS;
                                        const statusInfo = STATUS_STEPS[statusKey];
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <motion.tr
                                                key={m._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="hover:bg-gray-50/60 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {(() => {
                                                                const firstImage = m.images?.[0];
                                                                const imageUrl =
                                                                    typeof firstImage === 'string'
                                                                        ? firstImage
                                                                        : firstImage?.url;
                                                                return imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={m.title}
                                                                        className="w-full h-full object-cover cursor-pointer"
                                                                        onClick={() => window.open(imageUrl, '_blank')}
                                                                        onError={(e) => {
                                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                                                                );
                                                            })()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{m.title || `${m.materialType} Batch`}</p>
                                                            <p className="text-[10px] font-medium text-gray-400">{m.subType}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider capitalize">
                                                        {m.materialType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{m.weight?.toFixed(1)} kg</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.bg} ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1 items-center">
                                                        {[1, 2, 3].map(step => (
                                                            <div
                                                                key={step}
                                                                className={`h-1.5 w-8 rounded-full ${m.status === 'rejected' && step === 1
                                                                        ? 'bg-rose-400'
                                                                        : step <= statusInfo.step
                                                                            ? 'bg-green-500'
                                                                            : 'bg-gray-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] text-gray-400 mt-1 font-medium">
                                                        Step {m.status === 'rejected' ? '1/3 (Rejected)' : `${statusInfo.step}/3`}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {m.pickupLocation?.address ? (
                                                        <span className="text-[11px] font-medium text-gray-600 line-clamp-1">
                                                            📍 {m.pickupLocation.city || m.pickupLocation.address}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-medium text-gray-400">
                                                    {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyMaterials;
