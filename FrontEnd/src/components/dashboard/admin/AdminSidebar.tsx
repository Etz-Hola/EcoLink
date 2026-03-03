import React from 'react';
import {
    BarChart3, Users, Package, DollarSign, Settings,
    MapPin, LogOut, LayoutDashboard, Tag, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminSidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pricing', label: 'Pricing', icon: Tag },
    { id: 'branches', label: 'Branches', icon: MapPin },
    { id: 'materials', label: 'Materials & Bundles', icon: Package },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange, onLogout }) => {
    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <ShieldCheck size={24} />
                </div>
                <span className="text-xl font-black text-gray-900 tracking-tight">EcoLink<span className="text-emerald-600">Admin</span></span>
            </div>

            <nav className="flex-1 px-4 mt-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${currentView === item.id
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                    >
                        <item.icon size={20} className={currentView === item.id ? 'text-emerald-600' : 'text-gray-400'} />
                        {item.label}
                        {currentView === item.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="ml-auto w-1.5 h-1.5 bg-emerald-600 rounded-full"
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
