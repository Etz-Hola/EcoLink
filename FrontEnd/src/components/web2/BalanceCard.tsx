import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';

interface BalanceCardProps {
    balance: number;
    onTopUp: () => void;
    onWithdraw: () => void;
    isLoading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, onTopUp, onWithdraw, isLoading }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-900/20"
        >
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full -ml-24 -mb-24 blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-emerald-50">Total Balance</span>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className="text-emerald-100/70 mt-2 text-sm">Available for withdrawal</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onTopUp}
                        className="flex items-center justify-center gap-2 bg-white text-emerald-700 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
                    >
                        <ArrowUpCircle className="w-5 h-5" />
                        Top Up
                    </button>
                    <button
                        onClick={onWithdraw}
                        className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 py-3 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 backdrop-blur-md"
                    >
                        <ArrowDownCircle className="w-5 h-5" />
                        Withdraw
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BalanceCard;
