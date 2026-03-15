import React, { useState, useEffect } from 'react';
import { 
    Ticket, Plus, Copy, CheckCircle, 
    XCircle, RefreshCw, Search,
    ArrowRight, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface InviteCode {
    _id: string;
    code: string;
    businessName: string;
    role: 'branch' | 'exporter';
    expiresAt: string;
    status: 'active' | 'used' | 'expired';
    usedBy?: string;
    createdAt: string;
}

const InviteManager: React.FC = () => {
    const [invites, setInvites] = useState<InviteCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Generator Form State
    const [businessName, setBusinessName] = useState('');
    const [role, setRole] = useState<'branch' | 'exporter'>('branch');
    const [expiresDays, setExpiresDays] = useState(30);

    const fetchInvites = async () => {
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
            toast.error('Failed to fetch invite codes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.post(`${API_URL}/admin/invites/generate`, 
                { businessName, expiresDays, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (res.data.success) {
                toast.success('New invite code generated! 🎟️');
                setBusinessName('');
                fetchInvites();
            }
        } catch {
            toast.error('Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const activeInvites = invites.filter(i => 
        (i.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
        (i.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    return (
        <div className="space-y-8 px-4 md:px-0 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Invite Code Control</h1>
                <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Issue secure authentication codes for restricted roles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generator Section */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Plus size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Code Generator</h2>
                            </div>

                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Entity</label>
                                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setRole('branch')}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'branch' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Local Branch
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('exporter')}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'exporter' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Exporter
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Business Name</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g. Lagos Central Hub"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expiration Days</label>
                                    <input 
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                                        value={expiresDays}
                                        onChange={(e) => setExpiresDays(Number(e.target.value))}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50 mt-4"
                                >
                                    {generating ? 'Encrypting...' : 'Generate Secure Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                    <Ticket size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Recent Issues</h3>
                            </div>

                            <div className="flex items-center gap-4 flex-1 max-w-md">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search codes or entities..."
                                        className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={fetchInvites}
                                    className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-all active:scale-95"
                                >
                                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Security Hash</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Entity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                            </tr>
                                        ))
                                    ) : activeInvites.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <Ticket size={40} className="mx-auto text-gray-100 mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No invite history found</p>
                                            </td>
                                        </tr>
                                    ) : activeInvites.map((invite) => (
                                        <tr key={invite._id} className="hover:bg-gray-50/40 group transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <code className="px-3 py-1.5 bg-gray-900 text-emerald-400 font-black text-xs rounded-lg tracking-widest shadow-sm">
                                                        {invite.code}
                                                    </code>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate max-w-[150px]">{invite.businessName}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Created {new Date(invite.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                    invite.role === 'branch' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {invite.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const isUsed = invite.status === 'used';
                                                        const isExpired = new Date(invite.expiresAt) < new Date() || invite.status === 'expired';
                                                        
                                                        if (isUsed) {
                                                            return (
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                                                    <CheckCircle size={10} />
                                                                    Redeemed
                                                                </span>
                                                            );
                                                        }

                                                        if (isExpired) {
                                                            return (
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                                                    <XCircle size={10} />
                                                                    Expired
                                                                </span>
                                                            );
                                                        }

                                                        // If not used and not expired, it's available (status could be 'pending' or 'active')
                                                        return (
                                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Available
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => copyToClipboard(invite.code)}
                                                    className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Security Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tight">Security Protocol Active</h4>
                        <p className="text-blue-100 text-sm font-medium mt-1">All generated codes are cryptographically secured and unique to each entity.</p>
                    </div>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2">
                        View Audit Log <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteManager;
