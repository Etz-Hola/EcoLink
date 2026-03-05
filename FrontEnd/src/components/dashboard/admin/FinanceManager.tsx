import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight,
    Search, Download,
    Clock, ShieldCheck, PieChart, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Transaction {
    _id: string;
    amount: number;
    type: string;
    status: string;
    sender?: { firstName: string; lastName: string; businessName?: string };
    recipient?: { firstName: string; lastName: string; businessName?: string };
    createdAt: string;
}

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

const FinanceManager: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchFinancialData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const [txRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/transactions`, {
                    params: { search: searchTerm, type: typeFilter },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (txRes.data.success) setTransactions(txRes.data.data);
            if (statsRes.data.success) setStats(statsRes.data.data);
        } catch {
            toast.error('Failed to load financial records');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, typeFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFinancialData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchFinancialData]);

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    return (
        <div className="space-y-8 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Financials & Revenue</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest font-black">Platform fund flows and commission tracking</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchFinancialData}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 active:scale-95">
                        <Download size={16} /> Export Records
                    </button>
                </div>
            </div>

            {/* Revenue Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Revenue</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">{stats ? formatCurrency(stats.counts.revenue) : '₦0.00'}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <TrendingUp size={14} /> +12.5% vs Last Mo
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Volume Processed (KG)</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">{stats ? stats.counts.volume.toLocaleString() : '0'}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                        <Clock size={14} /> Global Material Throughput
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Audits</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">Secured</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full">
                        <ShieldCheck size={14} /> Verified Transactions Only
                    </div>
                </motion.div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        <PieChart size={24} className="text-emerald-500" />
                        Platform Ledgers
                    </h3>
                    <div className="flex items-center gap-4 flex-1 max-w-[500px]">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search ledgers..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-100 outline-none appearance-none cursor-pointer text-gray-500"
                        >
                            <option value="all">Everywhere</option>
                            <option value="deposit">Deposits</option>
                            <option value="transfer">Transfers</option>
                            <option value="withdrawal">Withdrawals</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Auth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <DollarSign size={48} className="opacity-20" />
                                            <p className="text-sm font-black uppercase tracking-widest">No transaction records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50/30 group transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${tx.type === 'transfer' ? 'bg-emerald-50 text-emerald-600' :
                                                tx.type === 'deposit' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">
                                                    {tx.sender ? (tx.sender.firstName + ' ' + tx.sender.lastName) : 'External'} → {tx.recipient ? (tx.recipient.firstName + ' ' + tx.recipient.lastName) : 'Unknown'}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref: {tx._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-gray-900">{formatCurrency(tx.amount)}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{tx.type}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{tx.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-95">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceManager;
