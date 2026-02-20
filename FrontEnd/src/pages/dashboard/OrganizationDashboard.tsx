import React from 'react';
import { Building2, MapPin, BarChart3, Upload, History, Zap, ArrowRight, Download } from 'lucide-react';
import Button from '../../components/common/Button';

const OrganizationDashboard: React.FC = () => {
    const stats = [
        { label: 'Bulk Listings', value: '48', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Volume', value: '1,240kg', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Estimated Revenue', value: '₦840k', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Sustainability Score', value: 'A+', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Organization Dashboard</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Enterprise waste management & ESG tracking</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Impact Report</Button>
                    <Button shadow leftIcon={<Upload className="w-4 h-4" />}>Bulk Upload</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Map CTA */}
                    <div className="relative h-64 rounded-[2rem] overflow-hidden group cursor-pointer border-4 border-white shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Map Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-transparent flex items-center px-10">
                            <div className="max-w-xs space-y-3">
                                <h3 className="text-2xl font-black text-white leading-tight">Locate a Branch Near You</h3>
                                <p className="text-green-100 text-sm font-medium">Find high-capacity aggregation hubs to drop off your bulk materials.</p>
                                <div className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                                    Open Interactive Map <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Listings */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Bulk Submissions</h2>
                            <button className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">View All</button>
                        </div>
                        <div className="p-0">
                            {[
                                { type: 'Clear PET Flakes', weight: '250kg', date: '2 hours ago', status: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
                                { type: 'Industrial Cardboard', weight: '800kg', date: 'Yesterday', status: 'Approved', color: 'bg-green-100 text-green-700' },
                                { type: 'Medical Grade Plastic', weight: '120kg', date: '2 days ago', status: 'Rejected', color: 'bg-red-100 text-red-700' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors border-b last:border-0 border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.type}</p>
                                            <p className="text-xs text-gray-400 font-medium">{item.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <p className="font-black text-gray-900">{item.weight}</p>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            Impact Summary
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'CO2 Offset', value: '4.2 Tons', progress: 75, color: 'bg-green-500' },
                                { label: 'Energy Saved', value: '12.8 MWh', progress: 45, color: 'bg-blue-500' },
                                { label: 'Trees Saved', value: '82 Trees', progress: 90, color: 'bg-emerald-500' },
                            ].map((p, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-gray-500">{p.label}</span>
                                        <span className="text-gray-900">{p.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${p.color} transition-all duration-1000`} style={{ width: `${p.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 rounded-2xl bg-green-50 border-2 border-green-100 text-green-700 font-black text-sm uppercase tracking-widest hover:bg-green-100 transition-all">
                            Claim ESG Token
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
                        <h3 className="text-lg font-bold mb-2">Need a Bulk Pickup?</h3>
                        <p className="text-blue-100 text-sm font-medium mb-6">Organizations with over 500kg of material qualify for free premium logistics.</p>
                        <Button fullWidth variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">Request Logistics</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationDashboard;
