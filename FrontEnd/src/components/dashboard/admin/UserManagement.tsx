import React, { useState } from 'react';
import {
    Search, Filter, Edit2, ShieldOff,
    Trash2, BadgeCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';

const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Mock data for UI development
    const users = [
        { id: '1', name: 'Doris Oyinloye', email: 'doris@delishdine.ng', role: 'collector', balance: '₦45,000', status: 'active', joinDate: '2026-01-12' },
        { id: '2', name: 'EcoHub Lagos', email: 'contact@ecohub.ng', role: 'branch_manager', balance: '₦1,250,000', status: 'active', joinDate: '2025-12-05' },
        { id: '3', name: 'John Doe', email: 'john@gmail.com', role: 'collector', balance: '₦0', status: 'suspended', joinDate: '2026-02-20' },
        { id: '4', name: 'Regency Hotel', email: 'admin@regency.com', role: 'organization', balance: '₦890,000', status: 'pending', joinDate: '2026-03-01' },
        { id: '5', name: 'Waste Management Co', email: 'ops@wmco.com', role: 'branch_manager', balance: '₦5,400,000', status: 'active', joinDate: '2025-11-15' },
        { id: '6', name: 'Sarah Smith', email: 'sarah@hotmail.com', role: 'collector', balance: '₦12,500', status: 'active', joinDate: '2026-02-28' },
    ];

    const ROLE_COLORS: Record<string, string> = {
        collector: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        branch_manager: 'bg-blue-50 text-blue-600 border-blue-100',
        organization: 'bg-purple-50 text-purple-600 border-purple-100',
        admin: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const STATUS_COLORS: Record<string, string> = {
        active: 'bg-emerald-500',
        suspended: 'bg-rose-500',
        pending: 'bg-amber-500',
    };

    return (
        <div className="space-y-6 px-4 md:px-0 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="ml-0 md:ml-0">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Manage platform participants and internal roles</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                        <BadgeCheck size={16} /> Export User List
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Table Filters */}
                <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or wallet..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                            <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`} onClick={() => setRoleFilter('all')}>All</button>
                            <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'collectors' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`} onClick={() => setRoleFilter('collectors')}>Collectors</button>
                            <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'branches' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`} onClick={() => setRoleFilter('branches')}>Branches</button>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 border border-gray-100 transition-all">
                        <Filter size={14} /> More Filters
                    </button>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wallet Balance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors">{user.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${ROLE_COLORS[user.role]}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-gray-900">{user.balance}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Paystack Balance</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[user.status]}`} />
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest capitalize">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-500">{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit Profile">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Suspend User">
                                                <ShieldOff size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete User">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing 1 to 6 of 1,284 users</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30"><ChevronLeft size={20} /></button>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 rounded-lg bg-gray-900 text-white text-[10px] font-black">1</button>
                            <button className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 text-[10px] font-black transition-colors">2</button>
                            <button className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 text-[10px] font-black transition-colors">3</button>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
