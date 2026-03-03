import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, Package, DollarSign, TrendingUp,
    MapPin, Clock, ArrowUpRight, ArrowDownRight,
    ShieldCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface StatCardProps {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const StatCard = ({ label, value, change, positive, icon: Icon, color, bg }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} transition-transform group-hover:scale-110 shadow-sm`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
    </motion.div>
);

interface ActivityItemProps {
    title: string;
    subtitle: string;
    time: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const ActivityItem = ({ title, subtitle, time, icon: Icon, color, bg }: ActivityItemProps) => (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{title}</p>
            <p className="text-xs font-medium text-gray-500 truncate">{subtitle}</p>
        </div>
        <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap uppercase tracking-widest">{time}</span>
    </div>
);

const AdminOverview: React.FC = () => {
    const { user } = useAuth();
    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Admin';

    const metrics = [
        { label: 'Total Users', value: '1,284', change: '12%', positive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Branches', value: '156', change: '3%', positive: true, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Processed Materials', value: '12,450 kg', change: '18%', positive: true, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Platform Revenue', value: '₦4,250,000', change: '8%', positive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6 md:space-y-8 pb-10 px-0 sm:px-2 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 ml-4 md:ml-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Global Platform Metrics & Real-time Monitoring
                    </p>
                </div>
                <p className="text-xs md:text-sm font-bold text-gray-500">
                    Welcome, <span className="text-gray-900">{firstName}</span>
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <StatCard key={i} {...m} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart / Stats Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <TrendingUp size={200} />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Growth & Performance</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Platform volume over the last 30 days</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button className="px-3 py-1.5 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-emerald-50">Volume</button>
                                <button className="px-3 py-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-gray-600 transition-colors">Revenue</button>
                            </div>
                        </div>

                        <div className="h-72 w-full bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center flex-col gap-4">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300">
                                <TrendingUp size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 italic">Advanced Analytics Visualization Coming Soon</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Pending Verifications</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-500">You have <span className="text-amber-600 font-bold whitespace-nowrap">12 branches</span> awaiting identity verification.</p>
                                <button className="w-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-[0.98]">
                                    Review Queue
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">System Status</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Health</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Optimal</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2">All systems operational. Last security audit 2h ago.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Activity Feed */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-fit">
                    <div className="p-8 border-b border-gray-50">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Clock size={20} className="text-emerald-500" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="p-4 space-y-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        <ActivityItem
                            title="New Branch Registered"
                            subtitle="EcoHub South - Lagos, Nigeria"
                            time="2m ago"
                            icon={MapPin} color="text-blue-600" bg="bg-blue-50"
                        />
                        <ActivityItem
                            title="Identity Appeal Submitted"
                            subtitle="Collector: Doris Oyinloye (Rejected ID)"
                            time="15m ago"
                            icon={AlertCircle} color="text-amber-600" bg="bg-amber-50"
                        />
                        <ActivityItem
                            title="New High-Value Transaction"
                            subtitle="₦1,250,400 released by Exporter Group"
                            time="1h ago"
                            icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50"
                        />
                        <ActivityItem
                            title="Bulk Material Bundle Verified"
                            subtitle="5,000kg PET Bottles by Ikeja Branch"
                            time="3h ago"
                            icon={Package} color="text-purple-600" bg="bg-purple-50"
                        />
                        <ActivityItem
                            title="New User Onboarded"
                            subtitle="Hotel Regency - Organization Account"
                            time="5h ago"
                            icon={Users} color="text-indigo-600" bg="bg-indigo-50"
                        />
                        <ActivityItem
                            title="Service Maintenance"
                            subtitle="Daily Database Backup Completed"
                            time="12h ago"
                            icon={ShieldCheck} color="text-gray-600" bg="bg-gray-50"
                        />
                    </div>
                    <div className="p-6">
                        <button className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest py-3 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 hover:text-emerald-500 transition-all active:scale-[0.98]">
                            View Full Activity Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
