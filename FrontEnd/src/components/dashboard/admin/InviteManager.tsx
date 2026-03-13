import React, { useState, useEffect, useCallback } from 'react';
import { 
    UserPlus, Calendar, Hash, Copy, Check, 
    Clock, RefreshCw, Send, Search, Building2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Invite {
    _id: string;
    code: string;
    businessName: string;
    status: 'pending' | 'used' | 'expired' | 'revoked';
    expiresAt: string;
    createdAt: string;
}

const InviteManager: React.FC = () => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Form State
    const [branchName, setBranchName] = useState('');
    const [expiresDays, setExpiresDays] = useState('30');

    const fetchInvites = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const response = await axios.get(`${API_URL}/admin/invites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setInvites(response.data.data);
            }
        } catch (err: unknown) {
            console.error(err);
            toast.error('Failed to load invite codes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branchName) {
            toast.error('Please enter a branch name');
            return;
        }

        setGenerating(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const response = await axios.post(`${API_URL}/admin/invites/generate`, 
                { branchName, expiresDays: parseInt(expiresDays) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Invite code generated successfully!');
                setBranchName('');
                setExpiresDays('30');
                fetchInvites();
                
                // Set the code for easy copying in the UI if needed
                const newCode = response.data.data.code;
                handleCopy(newCode);
            }
        } catch (err: unknown) {
            console.error(err);
            const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Generation failed';
            toast.error(message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Code ${code} copied to clipboard!`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'expired':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'used':
                return 'bg-gray-50 text-gray-500 border-gray-100';
            default:
                return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const filteredInvites = invites.filter(i => 
        i.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Invite Management</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mt-2">Generate and track secure onboarding codes</p>
                </div>
                <button
                    onClick={fetchInvites}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95 group"
                >
                    <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generator Section */}
                <div className="lg:col-span-1">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <UserPlus size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Generate Code</h2>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Branch / Business Name</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="E.g. Lagos West Hub"
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                        value={branchName}
                                        onChange={(e) => setBranchName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expires In (Days)</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="number"
                                        placeholder="30"
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                        value={expiresDays}
                                        onChange={(e) => setExpiresDays(e.target.value)}
                                        min="1"
                                        max="365"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
                            >
                                {generating ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                                {generating ? 'Generating...' : 'Generate New Code'}
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3 text-blue-600">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                                Invite codes grant immediate access with 'Active' status upon registration. Use only for trusted business partners.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col"
                    >
                        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                                <Hash size={24} className="text-emerald-500" />
                                Active Invites
                            </h3>
                            <div className="relative group w-full sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search codes or branches..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Invite Code</th>
                                        <th className="px-8 py-5">Branch Name</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Expires</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <AnimatePresence mode="popLayout">
                                        {loading ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <tr key={`skeleton-${i}`} className="animate-pulse">
                                                    <td colSpan={5} className="px-8 py-6"><div className="h-10 bg-gray-50 rounded-xl w-full" /></td>
                                                </tr>
                                            ))
                                        ) : filteredInvites.length === 0 ? (
                                            <motion.tr 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={5} className="px-8 py-32 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-gray-300">
                                                        <Send size={48} className="opacity-10" />
                                                        <p className="text-sm font-black uppercase tracking-widest">No active invite codes</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : filteredInvites.map((invite) => (
                                            <motion.tr 
                                                key={invite._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="hover:bg-gray-50/30 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm border border-emerald-100">
                                                            {invite.code}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black text-gray-900">{invite.businessName || 'Unnamed Branch'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generated: {new Date(invite.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${getStatusStyles(invite.status)}`}>
                                                        {invite.status === 'pending' ? 'Active' : invite.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {new Date(invite.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleCopy(invite.code)}
                                                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all hover:border-emerald-100 active:scale-90"
                                                        title="Copy Code"
                                                    >
                                                        {copiedCode === invite.code ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default InviteManager;
