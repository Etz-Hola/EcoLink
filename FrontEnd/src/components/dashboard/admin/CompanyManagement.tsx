import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2, CheckCircle, XCircle,
    ExternalLink, Search, ChevronRight, RefreshCw, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Company {
    _id: string;
    businessName?: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    location?: { address: string; city: string; state: string };
    createdAt: string;
}

const CompanyManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('verification');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const endpoint = activeTab === 'verification' 
                ? `${API_URL}/admin/exporters/pending` 
                : `${API_URL}/admin/users`;
            
            const params = activeTab === 'verification' ? {} : {
                role: 'exporter',
                status: 'active',
                search: searchTerm
            };

            const res = await axios.get(endpoint, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCompanies(res.data.data);
            }
        } catch {
            toast.error('Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/exporters/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Exporter approved successfully! 🚢');
                fetchCompanies();
            }
        } catch {
            toast.error('Failed to approve exporter');
        }
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(`${API_URL}/admin/exporters/${rejectingId}/reject`, 
                { reason: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success('Exporter rejected');
                setRejectingId(null);
                setRejectReason('');
                fetchCompanies();
            }
        } catch {
            toast.error('Failed to reject exporter');
        }
    };

    return (
        <div className="space-y-8 px-4 md:px-0 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Company Management</h1>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Approve and monitor material exporters & providers</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-200/10"
                    >
                        Issue Exporter Code
                    </button>
                    <button
                        onClick={fetchCompanies}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-blue-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Queue
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Approved
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
                    ) : companies.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No companies in verification queue</p>
                        </div>
                    ) : companies.map((company) => (
                        <motion.div
                            key={company._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center text-blue-600 border border-blue-50">
                                        <Building2 size={32} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">Exporter Pending</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{company.businessName || `${company.firstName} ${company.lastName}`}</h3>
                                <div className="space-y-1 mt-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Owner: {company.firstName} {company.lastName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">{company.email}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Joined: {new Date(company.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <MapPin size={16} className="text-blue-500" />
                                    {company.location?.address || 'Address pending'}, {company.location?.city || company.location?.state || 'Location pending'}
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleApprove(company._id)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200/20"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => setRejectingId(company._id)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>

                            {rejectingId === company._id && (
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

                            <button className="px-8 py-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-blue-500 transition-colors flex items-center justify-between group mt-auto">
                                View Verification Documents
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
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search active exporters..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6"><div className="h-8 bg-gray-50 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : companies.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active exporters found</p>
                                        </td>
                                    </tr>
                                ) : companies.map((company) => (
                                    <tr key={company._id} className="hover:bg-gray-50/40 group transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black overflow-hidden shadow-sm">
                                                    <Building2 size={20} />
                                                </div>
                                                <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{company.businessName || `${company.firstName} ${company.lastName}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{company.firstName} {company.lastName}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-500">{company.location?.city || company.location?.state || 'Unknown'}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-95 shadow-sm">
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

            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="bg-gray-900 p-10 text-white relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Issue Exporter Auth</h2>
                                    <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors font-black text-blue-400">✕</button>
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Generate invite codes specifically for trusted exporters.</p>
                                <ExporterInviteGenerator onGenerated={() => {
                                    setShowInviteModal(false);
                                    fetchCompanies();
                                }} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const ExporterInviteGenerator: React.FC<{ onGenerated?: () => void }> = ({ onGenerated }) => {
    const [generating, setGenerating] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [expiresDays, setExpiresDays] = useState(30);
    const [lastCode, setLastCode] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.post(`${API_URL}/admin/invites/generate`, 
                { businessName, expiresDays, role: 'exporter' }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success('Exporter code generated!');
                setLastCode(res.data.data.code);
                if (onGenerated) onGenerated();
            }
        } catch {
            toast.error('Failed to generate invite');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <form onSubmit={handleGenerate} className="mt-8 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Company Name</label>
                    <input 
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Globex Materials Inc."
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expires in (days)</label>
                    <input 
                        type="number"
                        value={expiresDays}
                        onChange={(e) => setExpiresDays(Number(e.target.value))}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>
            <button 
                type="submit"
                disabled={generating}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50"
            >
                {generating ? 'Generating...' : 'Generate Code'}
            </button>
            {lastCode && (
                <div className="mt-4 p-4 bg-white/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                    <code className="text-blue-400 font-black tracking-widest">{lastCode}</code>
                    <button 
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(lastCode);
                            toast.success('Copied!');
                        }}
                        className="text-[10px] font-black uppercase text-gray-400 hover:text-white"
                    >
                        Copy
                    </button>
                </div>
            )}
        </form>
    );
};

export default CompanyManagement;
