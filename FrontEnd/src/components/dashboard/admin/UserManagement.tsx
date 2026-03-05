import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Edit2, ShieldOff,
    BadgeCheck,
    ChevronLeft, ChevronRight, X, Save, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    status: string;
    balance: number;
    createdAt: string;
    businessName?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ role: '', status: '', balance: 0 });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: {
                    search: searchTerm,
                    role: roleFilter,
                    page,
                    limit
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setUsers(res.data.data);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter, page, limit]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchUsers]);

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/users/${editingUser._id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('User updated successfully');
                setEditingUser(null);
                fetchUsers();
            }
        } catch {
            toast.error('Failed to update user');
        }
    };

    const ROLE_COLORS: Record<string, string> = {
        collector: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        branch_manager: 'bg-blue-50 text-blue-600 border-blue-100',
        organization: 'bg-purple-50 text-purple-600 border-purple-100',
        admin: 'bg-rose-50 text-rose-600 border-rose-100',
        owner: 'bg-amber-50 text-amber-600 border-amber-100',
        staff: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };

    const STATUS_COLORS: Record<string, string> = {
        active: 'bg-emerald-500',
        suspended: 'bg-rose-500',
        pending: 'bg-amber-500',
    };

    return (
        <div className="space-y-6 px-4 md:px-0 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">User Management</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed font-black">Platform-wide Access Control</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchUsers()}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 shadow-gray-200">
                        <BadgeCheck size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Table Filters */}
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or wallet..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-100 outline-none appearance-none cursor-pointer text-gray-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="collector">Collectors</option>
                            <option value="branch_manager">Branches</option>
                            <option value="organization">Organizations</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Search size={48} className="opacity-20" />
                                            <p className="text-sm font-black uppercase tracking-widest">No matching users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                                                {u.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                    {u.firstName} {u.lastName}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400">{u.email}</p>
                                                {u.businessName && <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-0.5">{u.businessName}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-gray-900">
                                        ₦{u.balance.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[u.status] || 'bg-gray-300'}`} />
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest capitalize">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(u);
                                                    setEditForm({ role: u.role, status: u.status, balance: u.balance });
                                                }}
                                                className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm active:scale-90"
                                                title="Edit Permissions"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm active:scale-90" title="Revoke Access">
                                                <ShieldOff size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Showing {users.length} of {total} Members</p>
                    <div className="flex items-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <span className="bg-gray-900 text-white w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-gray-200">{page}</span>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-20"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Update Access</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {editingUser._id.slice(-8)}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
                                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-xl">
                                    {editingUser.firstName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">{editingUser.firstName} {editingUser.lastName}</p>
                                    <p className="text-xs font-bold text-gray-400">{editingUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full bg-gray-100 border-none rounded-2xl py-4 px-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-100 outline-none"
                                    >
                                        <option value="collector">Collector</option>
                                        <option value="branch_manager">Branch Manager</option>
                                        <option value="organization">Organization</option>
                                        <option value="owner">Owner</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full bg-gray-100 border-none rounded-2xl py-4 px-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-100 outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Manual Balance Adjustment (₦)</label>
                                <input
                                    type="number"
                                    value={editForm.balance}
                                    onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                    className="w-full bg-gray-100 border-none rounded-2xl py-4 px-4 text-lg font-black text-gray-900 focus:ring-2 focus:ring-emerald-100 outline-none"
                                />
                            </div>

                            <button
                                onClick={handleUpdateUser}
                                className="w-full py-5 bg-emerald-500 text-white font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Save size={20} />
                                Commit Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
