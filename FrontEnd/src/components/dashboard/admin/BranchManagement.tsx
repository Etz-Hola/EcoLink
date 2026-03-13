import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin, CheckCircle, XCircle,
    ExternalLink, Search, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface BranchHub {
    _id: string;
    businessName?: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    location?: { address: string; city: string; state: string };
    createdAt: string;
    balance: number;
}

interface Invite {
    _id: string;
    code: string;
    businessName: string;
    expiresAt: string;
    status: string;
    usedBy?: string;
}

const BranchManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('verification');
    const [hubs, setHubs] = useState<BranchHub[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const fetchHubs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            // User requested specific endpoints: GET /admin/branches/pending
            const endpoint = activeTab === 'verification' 
                ? `${API_URL}/admin/branches/pending` 
                : `${API_URL}/admin/users`;
            
            const params = activeTab === 'verification' ? {} : {
                role: 'branch',
                status: 'active',
                search: searchTerm
            };

            const res = await axios.get(endpoint, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setHubs(res.data.data);
            }
        } catch {
            toast.error('Failed to fetch regional hubs');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchHubs();
    }, [fetchHubs]);

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/branches/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Branch approved successfully! 🏢');
                fetchHubs();
            }
        } catch {
            toast.error('Failed to approve branch');
        }
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/branches/${rejectingId}/reject`, 
                { reason: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success('Branch rejected');
                setRejectingId(null);
                setRejectReason('');
                fetchHubs();
            }
        } catch {
            toast.error('Failed to reject branch');
        }
    };

    return (
        <div className="space-y-8 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Branch Management</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest font-black">Verify and monitor regional collection hubs</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200/10"
                    >
                        Generate Invite Code
                    </button>
                    <button
                        onClick={fetchHubs}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Queue
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setActiveTab('invites')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'invites' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Invites
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'verification' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-50 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : hubs.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No hubs in verification queue</p>
                        </div>
                    ) : hubs.map((branch) => (
                        <motion.div
                            key={branch._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center text-emerald-600 border border-emerald-50">
                                        <MapPin size={32} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Verification</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{branch.businessName || `${branch.firstName} ${branch.lastName}`}</h3>
                                <div className="space-y-1 mt-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Manager: {branch.firstName} {branch.lastName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">{branch.email}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Joined: {new Date(branch.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <MapPin size={16} className="text-emerald-500" />
                                    {branch.location?.address || 'Address pending'}, {branch.location?.city || branch.location?.state || 'Location pending'}
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleApprove(branch._id)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200/20"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => setRejectingId(branch._id)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>

                            {rejectingId === branch._id && (
                                <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                                    <input 
                                        type="text"
                                        placeholder="Reason for rejection..."
                                        className="w-full bg-gray-50 border border-rose-100 rounded-xl py-3 px-4 text-xs font-bold mb-3 outline-none focus:ring-2 focus:ring-rose-100"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleReject}
                                            className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button 
                                            onClick={() => setRejectingId(null)}
                                            className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button className="px-8 py-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-emerald-500 transition-colors flex items-center justify-between group mt-auto">
                                View Legal Documents
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'active' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search active hubs..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : hubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active hubs found</p>
                                        </td>
                                    </tr>
                                ) : hubs.map((branch) => (
                                    <tr key={branch._id} className="hover:bg-gray-50/40 group transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black overflow-hidden shadow-sm">
                                                    <MapPin size={20} />
                                                </div>
                                                <span className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{branch.businessName || `${branch.firstName} ${branch.lastName}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{branch.firstName} {branch.lastName}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-500">{branch.location?.city || branch.location?.state || 'Unknown'}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-400">Load Factor</span>
                                                    <span className="text-emerald-500">Optimal</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 shadow-sm" style={{ width: '65%' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 shadow-sm">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'invites' && (
                <InviteManagement />
            )}

            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <InviteManagement closeModal={() => setShowInviteModal(false)} hideExistingList />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const InviteManagement: React.FC<{ closeModal?: () => void, hideExistingList?: boolean }> = ({ closeModal, hideExistingList }) => {
    const [generating, setGenerating] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [expiresDays, setExpiresDays] = useState(30);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastGenerated, setLastGenerated] = useState<string | null>(null);

    const fetchInvites = useCallback(async () => {
        if (hideExistingList) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.get(`${API_URL}/admin/invites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setInvites(res.data.data);
            }
        } catch {
            toast.error('Failed to load invites');
        } finally {
            setLoading(false);
        }
    }, [hideExistingList]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.post(`${API_URL}/admin/invites/generate`, { businessName, expiresDays }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Invite code generated! 🎟️');
                setLastGenerated(res.data.data.code);
                setBusinessName('');
                if (!hideExistingList) fetchInvites();
            }
        } catch {
            toast.error('Failed to generate invite');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`bg-gray-900 ${closeModal ? 'rounded-none' : 'rounded-[2.5rem]'} p-10 text-white shadow-2xl relative overflow-hidden group`}>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Issue Branch Authorization</h2>
                        {closeModal && (
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors font-black text-emerald-400">✕</button>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm font-medium max-w-md">Generate secure invite codes to bypass the 24h approval queue for trusted aggregation partners.</p>
                    
                    <form onSubmit={handleGenerate} className="mt-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Proposed Hub Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Lagos Mainland Aggregator"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expires in (days)</label>
                                <input 
                                    type="number"
                                    value={expiresDays}
                                    onChange={(e) => setExpiresDays(Number(e.target.value))}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={generating}
                            className="w-full bg-emerald-500 text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50"
                        >
                            {generating ? 'Generating...' : 'Issue Code'}
                        </button>
                    </form>

                    {lastGenerated && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 p-6 bg-white/5 border border-emerald-500/30 rounded-2xl flex items-center justify-between"
                        >
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Latest Generated Code</p>
                                <p className="text-2xl font-black text-white tracking-widest">{lastGenerated}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(lastGenerated);
                                    toast.success('Copied to clipboard!');
                                }}
                                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-gray-900 transition-all"
                            >
                                Copy Code
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {!hideExistingList && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Authorization Codes</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{invites.length} Issued</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Business</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Expires</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-4"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : invites.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                            No active codes found
                                        </td>
                                    </tr>
                                ) : invites.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <code className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg text-xs font-black tracking-wider">{inv.code}</code>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-bold text-gray-600">{inv.businessName || 'N/A'}</td>
                                        <td className="px-8 py-4 text-[10px] font-medium text-gray-400">
                                            {new Date(inv.expiresAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                                                inv.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(inv.code);
                                                    toast.success('Code copied!');
                                                }}
                                                className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
