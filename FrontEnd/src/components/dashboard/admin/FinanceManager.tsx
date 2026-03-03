import React, { useState } from 'react';
import {
    DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight,
    Search, Filter, Download,
    Clock, ShieldCheck, PieChart, MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

const FinanceManager: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const transactions = [
        { id: '1', sender: 'EcoHub Lagos', recipient: 'Doris O.', amount: '₦22,500', commission: '₦450', status: 'completed', date: '2026-03-03 14:20' },
        { id: '2', sender: 'Exporter Group', recipient: 'EcoHub Lagos', amount: '₦1,250,000', commission: '₦25,000', status: 'completed', date: '2026-03-03 12:45' },
        { id: '3', sender: 'Surulere Hub', recipient: 'Sarah S.', amount: '₦4,500', commission: '₦90', status: 'pending', date: '2026-03-03 16:10' },
        { id: '4', sender: 'Ikeja North', recipient: 'Musa A.', amount: '₦84,000', commission: '₦1,680', status: 'completed', date: '2026-03-02 18:30' },
        { id: '5', sender: 'GreenWay', recipient: 'Hotel R.', amount: '₦12,000', commission: '₦240', status: 'failed', date: '2026-03-02 10:15' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financials & Revenue</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monitor platform commissions and global fund flows</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200/20 active:scale-95">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Revenue Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Commission Earned</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">₦842,500.00</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <TrendingUp size={14} /> +12.5% this month
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Funds in Escrow</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">₦15,400,000.00</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                        <Clock size={14} /> 156 pending payouts
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Balance (Net)</p>
                    <p className="text-3xl font-black text-gray-900 mb-6">₦3,650,200.00</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full">
                        <ShieldCheck size={14} /> Audited: 2m ago
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <PieChart size={24} className="text-emerald-500" />
                        Transaction History
                    </h3>
                    <div className="flex items-center gap-4 flex-1 max-w-[400px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by sender or recipient..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-100">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Details</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission (2%)</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Date</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/30 group transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {tx.status === 'completed' ? <ArrowUpRight size={20} /> : tx.status === 'pending' ? <Clock size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{tx.sender} → {tx.recipient}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ecolink Paystack Transfer</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-black text-gray-900">{tx.amount}</td>
                                    <td className="px-8 py-6 font-bold text-emerald-600">{tx.commission}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-400">{tx.date}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
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
