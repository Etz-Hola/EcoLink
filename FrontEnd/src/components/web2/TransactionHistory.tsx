import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';

interface Transaction {
    _id: string;
    type: 'topup' | 'withdrawal' | 'transfer' | 'commission';
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    amount: number;
    description: string;
    createdAt: string;
    sender?: { firstName: string; lastName: string; username: string };
    recipient?: { firstName: string; lastName: string; username: string };
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No transactions yet</p>
                <p className="text-gray-400 text-sm mt-1">Your payments will appear here</p>
            </div>
        );
    }

    const getIcon = (type: string, status: string) => {
        if (status === 'failed' || status === 'cancelled') return <XCircle className="w-5 h-5 text-red-500" />;
        return type === 'topup' || type === 'transfer' ? (
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
        ) : (
            <ArrowUpRight className="w-5 h-5 text-blue-500" />
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'failed':
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                <button className="text-emerald-600 font-semibold text-sm hover:underline">View All</button>
            </div>

            <div className="space-y-3">
                {transactions.map((tx, index) => (
                    <motion.div
                        key={tx._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${tx.type === 'topup' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-blue-50' : 'bg-purple-50'
                                }`}>
                                {getIcon(tx.type, tx.status)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 line-clamp-1">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                            <div>
                                <p className={`font-bold text-lg ${tx.type === 'topup' || (tx.type === 'transfer' && tx.status === 'success') ? 'text-emerald-600' : 'text-gray-900'
                                    }`}>
                                    {tx.type === 'topup' || tx.type === 'transfer' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                                </p>
                            </div>
                            <button className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
