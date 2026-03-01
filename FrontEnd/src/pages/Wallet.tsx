import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import BalanceCard from '../components/web2/BalanceCard';
import TransactionHistory from '../components/web2/TransactionHistory';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, CreditCard, Landmark, Send } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const WalletPage: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/v1/payments/history');
            if (response.data.success) {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTopUp = async () => {
        if (!topUpAmount || parseFloat(topUpAmount) < 100) {
            toast.error('Minimum top-up is ₦100');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post('/api/v1/payments/topup', {
                amount: parseFloat(topUpAmount)
            });

            if (response.data.success && response.data.data.authorization_url) {
                // Redirect to Paystack
                window.location.href = response.data.data.authorization_url;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="text-gray-500 mt-1">Manage your funds and view transaction history</p>
            </header>

            <BalanceCard
                balance={user?.balance || 0}
                onTopUp={() => setShowTopUpModal(true)}
                onWithdraw={() => toast.success('Withdrawal feature coming soon!')}
                isLoading={isLoading}
            />

            <section>
                <TransactionHistory transactions={transactions} isLoading={isLoading} />
            </section>

            {/* Top Up Modal */}
            <AnimatePresence>
                {showTopUpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative"
                        >
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Top Up Balance</h3>
                                <p className="text-gray-500 text-sm mt-1">Add funds to your wallet securely via Paystack</p>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Amount (₦)"
                                    type="number"
                                    placeholder="Enter amount (Min: ₦100)"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    autoFocus
                                />

                                <div className="flex gap-2">
                                    {[1000, 5000, 10000, 50000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTopUpAmount(amt.toString())}
                                            className="flex-1 py-2 text-xs font-bold border rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                                        >
                                            +₦{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                fullWidth
                                size="lg"
                                onClick={handleTopUp}
                                isLoading={isProcessing}
                                leftIcon={<Send className="w-5 h-5" />}
                            >
                                Add Funds
                            </Button>

                            <div className="flex items-center justify-center gap-4 py-4 opacity-50 grayscale transition-all hover:grayscale-0">
                                <div className="flex items-center gap-1 font-bold text-xs">
                                    <Landmark className="w-4 h-4" /> SECURE PAYSTACK
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletPage;
