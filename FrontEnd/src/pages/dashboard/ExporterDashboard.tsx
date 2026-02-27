import React from 'react';
import { Package, TrendingUp, Truck, ShoppingCart, ArrowUpRight, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import NearbyBuyersMap from '../../components/dashboard/NearbyBuyersMap';

const ExporterDashboard: React.FC = () => {
    const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                () => setUserLocation({ lat: 6.5244, lng: 3.3792 })
            );
        } else {
            setUserLocation({ lat: 6.5244, lng: 3.3792 });
        }
    }, []);
    const stats = [
        { label: 'Active Purchases', value: '12', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Bundles Verified', value: '450', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'In Transit', value: '5', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Market Savings', value: '₦245k', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const availableBundles = [
        { id: 'BDL001', branch: 'Ikeja Hub', type: 'PET Plastic', weight: '2,500kg', quality: 'Clean/Sort', price: '₦180/kg', status: 'Ready' },
        { id: 'BDL002', branch: 'Lekki Center', type: 'Aluminum Can', weight: '1,200kg', quality: 'Raw/Baled', price: '₦450/kg', status: 'In Processing' },
        { id: 'BDL003', branch: 'Ikorodu Branch', type: 'Mixed Paper', weight: '5,000kg', quality: 'Baled', price: '₦95/kg', status: 'Ready' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exporter Dashboard</h1>
                    <p className="text-gray-500 font-medium">Global procurement & logistics management</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Search className="w-4 h-4" />}>Find Bundles</Button>
                    <Button shadow>Market Insights</Button>
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
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Bundle ID</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Source Branch</th>
                                        <th className="px-6 py-4">Weight</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {availableBundles.map((bundle) => (
                                        <tr key={bundle.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-900">{bundle.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{bundle.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{bundle.branch}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{bundle.weight}</td>
                                            <td className="px-6 py-4 text-sm font-black text-green-600">{bundle.price}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-sm font-bold text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                                    Request
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
