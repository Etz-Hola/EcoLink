import React, { useState, useEffect, useCallback } from 'react';
import { Package, TrendingUp, Truck, ShoppingCart, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useBalance } from '../../hooks/useBalance';
import NearbyBuyersMap from '../../components/dashboard/NearbyBuyersMap';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface AvailableBundle {
    _id: string;
    name: string;
    branchName?: string;
    totalWeight: number;
    totalPrice: number;
}

const ExporterDashboard: React.FC = () => {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [bundles, setBundles] = useState<AvailableBundle[]>([]);
    const [loadingBundles, setLoadingBundles] = useState(false);
    const { balance, refreshBalance, isAdmin } = useBalance();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                () => setUserLocation({ lat: 6.5244, lng: 3.3792 })
            );
        } else {
            setUserLocation({ lat: 6.5244, lng: 3.3792 });
        }
    }, []);

    const fetchBundles = useCallback(async () => {
        setLoadingBundles(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await fetch(`${API_URL}/bundles/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load bundles');
            const mapped: AvailableBundle[] = (data.data || []).map((b: any) => ({
                _id: b._id,
                name: b.name,
                branchName: b.branchId?.name,
                totalWeight: b.totalWeight,
                totalPrice: b.totalPrice,
            }));
            setBundles(mapped);
        } catch (err: any) {
            toast.error(err.message || 'Could not load export bundles');
        } finally {
            setLoadingBundles(false);
        }
    }, []);

    useEffect(() => {
        fetchBundles();
    }, [fetchBundles]);

    const handleSync = async () => {
        setIsSyncing(true);
        await Promise.all([fetchBundles(), refreshBalance()]);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('Organization data synchronized');
        }, 800);
    };

    const handlePurchase = async (bundleId: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await fetch(`${API_URL}/bundles/${bundleId}/purchase`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to purchase bundle');
            toast.success('Bundle purchase recorded — materials marked as sold ✅');
            fetchBundles();
            refreshBalance();
        } catch (err: any) {
            toast.error(err.message || 'Could not complete purchase');
        }
    };

    const stats = [
        { label: 'Active Purchases', value: '12', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Bundles Verified', value: '450', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'In Transit', value: '5', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Market Savings', value: '₦245k', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Exporter Dashboard</h1>
                    <p className="text-gray-500 font-medium">Global procurement & logistics management</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4">
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Entity Balance</p>
                            <p className="text-xl font-black text-emerald-600">₦{balance.toLocaleString()}</p>
                        </div>
                        {isAdmin && (
                            <div className="h-8 w-px bg-gray-100 mx-2" />
                        )}
                        {isAdmin && (
                            <button className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                                Withdraw
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSync}
                        className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                +12% <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</h3>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Map Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Available Export Bundles</h2>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">Global Supply</span>
                </div>
                <NearbyBuyersMap userLocation={userLocation} viewMode="exporter" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Marketplace Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Available Bundles from Branches</h2>
                            <button className="text-sm font-bold text-green-600 hover:text-green-700">View Map Mode</button>
                        </div>
                        <div className="overflow-x-auto">
                            {loadingBundles ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    <p className="text-sm font-medium text-gray-400">Loading available bundles...</p>
                                </div>
                            ) : bundles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Package className="w-10 h-10 text-gray-200 mb-3" />
                                    <p className="text-sm font-medium text-gray-500">No export bundles available yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Bundle</th>
                                            <th className="px-6 py-4">Source Branch</th>
                                            <th className="px-6 py-4">Weight</th>
                                            <th className="px-6 py-4">Total Price</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bundles.map((bundle) => (
                                            <tr key={bundle._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {bundle.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                    {bundle.branchName || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    {bundle.totalWeight.toLocaleString()} kg
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-green-600">
                                                    ₦{bundle.totalPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handlePurchase(bundle._id)}
                                                        className="text-sm font-bold text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                                    >
                                                        Purchase
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-green-500/30 transition-all" />
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Market Price Feed
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'PET Flakes (Premium)', price: '₦220', trend: 'up' },
                                { label: 'Aluminum Ingots', price: '₦1,850', trend: 'down' },
                                { label: 'HDPE Bales', price: '₦195', trend: 'up' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                    <span className="text-sm font-medium text-gray-300">{item.label}</span>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{item.price}</p>
                                        <p className={`text-[10px] font-black uppercase ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.trend} 2.1%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 rounded-2xl bg-green-500 font-bold text-gray-900 hover:bg-green-400 transition-all shadow-lg shadow-green-900/40">
                            Download Price Index
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-purple-600" />
                            Live Shipments
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'SHP-4522', status: 'In Transit', loc: 'Lagos - Port Harcourt' },
                                { id: 'SHP-4523', status: 'Pending Pickup', loc: 'Kano - Ikeja Hub' },
                            ].map((shp, i) => (
                                <div key={i} className="p-3 border border-gray-50 rounded-2xl hover:border-purple-100 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-gray-900">{shp.id}</span>
                                        <span className="text-[10px] font-extrabold text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded-full">{shp.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{shp.loc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExporterDashboard;
