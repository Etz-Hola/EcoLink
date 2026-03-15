import { useState, useMemo, useCallback } from 'react';
import {
    Package, CheckCircle, Clock,
    BadgeCheck, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Material } from '../../types';

interface ProcessingQueueProps {
    materials: Material[];
    refreshData: () => Promise<void>;
    loading: boolean;
}

export default function ProcessingQueue({ materials, refreshData, loading }: ProcessingQueueProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'delivered' | 'alerts'>('pending');
    const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    const authToken = localStorage.getItem('ecolink_token');
    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    }), [authToken]);

    const queue = useMemo(() => {
        const filtered = materials.filter(m => {
            if (activeTab === 'alerts') return ['pending', 'approved', 'delivered', 'pickup_scheduled'].includes(m.status);
            // 'pending' items are "Nearby Supplies" (unclaimed)
            // 'approved' / 'pickup_scheduled' / 'delivered' are "Hub Stock" (claimed by this branch)
            if (activeTab === 'approved') return ['approved', 'pickup_scheduled'].includes(m.status);
            return m.status === activeTab;
        });

        return filtered.map((m: any) => ({
            id: m._id,
            collectorName: m.submittedBy?.firstName ? `${m.submittedBy.firstName} ${m.submittedBy.lastName || ''}` : m.submittedBy?.name || m.submittedBy?.username || 'Anonymous',
            materialType: m.materialType,
            subType: m.subType,
            weightKg: m.weight,
            quality: m.condition,
            status: m.status,
            pricePerKg: m.pricing?.offeredPrice || 0,
            totalValue: (m.weight * (m.pricing?.offeredPrice || 0)),
            location: m.pickupLocation?.address || m.location?.address || 'Unknown',
            photo: m.images?.[0]?.url
        }));
    }, [materials, activeTab]);

    const handleAccept = useCallback(async (id: string) => {
        const price = priceInputs[id];
        if (!price || isNaN(Number(price))) return toast.error('Enter a valid price');

        setProcessingAction(id);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${apiUrl}/materials/${id}/review`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'approved', pricePerKg: Number(price) })
            });

            if (res.ok) {
                toast.success('Material Accepted & Uploader Notified! ✅');
                refreshData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Acceptance failed');
            }
        } catch {
            toast.error('Network error during acceptance');
        } finally {
            setProcessingAction(null);
        }
    }, [authHeaders, refreshData, priceInputs]);

    const handleReject = useCallback(async (id: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;

        setProcessingAction(id);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${apiUrl}/materials/${id}/review`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
            });

            if (res.ok) {
                toast.success('Material Rejected');
                refreshData();
            }
        } catch {
            toast.error('Rejection failed');
        } finally {
            setProcessingAction(null);
        }
    }, [authHeaders, refreshData]);

    const handleVerify = useCallback(async (id: string) => {
        setProcessingAction(id);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${apiUrl}/materials/${id}/verify`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'delivered' })
            });

            if (res.ok) {
                toast.success('Delivery Verified & Payment Released! 💸');
                refreshData();
            }
        } catch {
            toast.error('Verification failed');
        } finally {
            setProcessingAction(null);
        }
    }, [authHeaders, refreshData]);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-purple-900/5 border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-gray-50/50 p-2 border-b border-gray-100">
                {[
                    { id: 'pending', label: 'Nearby Supply', icon: Clock, color: 'text-orange-600' },
                    { id: 'approved', label: 'Processing & Pickups', icon: BadgeCheck, color: 'text-blue-600' },
                    { id: 'delivered', label: 'Verified Stock', icon: CheckCircle, color: 'text-green-600' },
                    { id: 'alerts', label: 'Activity Hub', icon: Bell, color: 'text-purple-600' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white shadow-sm ring-1 ring-gray-100 text-gray-900 scale-[1.02]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-300'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-8">
                {activeTab === 'alerts' ? (
                    <p className="p-20 text-center text-gray-300 font-bold italic">Activity logging is managed in the Sidebar Alerts.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full p-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">Hydrating Intake Data...</div>
                        ) : queue.length === 0 ? (
                            <div className="col-span-full p-20 text-center border-2 border-dashed border-gray-50 rounded-[3rem]">
                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-300 font-bold italic uppercase tracking-widest text-[10px]">No items found in this section</p>
                            </div>
                        ) : queue.map((item) => (
                            <div key={item.id} className="group bg-white rounded-[2rem] border-2 border-gray-50 hover:border-purple-100 transition-all p-6 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 font-black flex items-center justify-center text-gray-300">
                                        {item.photo ? (
                                            <img src={item.photo} alt="Material" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={24} />
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-lg leading-tight">{item.weightKg}kg</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 text-emerald-500`}>
                                            {item.quality?.replace('_', ' ') || 'Standard'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6 text-gray-900">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.collectorName}</p>
                                    <p className="font-bold text-gray-900 text-sm truncate">{item.materialType} - {item.subType}</p>
                                    <p className="text-[9px] text-gray-400 font-medium truncate italic">{item.location}</p>
                                </div>

                                {activeTab === 'pending' && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs text-gray-300">₦/kg</span>
                                            <input
                                                type="number"
                                                placeholder="Set Price"
                                                className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-xl py-3 pl-14 pr-4 text-xs font-bold outline-none focus:border-green-200 transition-all text-gray-900"
                                                value={priceInputs[item.id] || ''}
                                                onChange={(e) => setPriceInputs({ ...priceInputs, [item.id]: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                disabled={processingAction === item.id}
                                                onClick={() => handleAccept(item.id)}
                                                className="py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10 hover:bg-emerald-500 disabled:opacity-50 transition-all"
                                            >
                                                {processingAction === item.id ? '...' : 'Accept'}
                                            </button>
                                            <button
                                                disabled={processingAction === item.id}
                                                onClick={() => handleReject(item.id)}
                                                className="py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 disabled:opacity-50 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'approved' && (
                                    <div className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center text-gray-900">
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                {item.status === 'pickup_scheduled' ? 'Scheduled Pickup' : 'Claimed Supply'}
                                            </span>
                                            <span className="font-black text-blue-600 text-sm">₦{(item.pricePerKg * item.weightKg).toLocaleString()}</span>
                                        </div>
                                        <button
                                            disabled={processingAction === item.id}
                                            onClick={() => handleVerify(item.id)}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-blue-500 disabled:opacity-50 transition-all"
                                        >
                                            {processingAction === item.id ? 'Verifying...' : 'Verify Delivery'}
                                        </button>
                                        {item.status === 'approved' && (
                                            <p className="text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest mt-1 italic leading-tight">Waiting for uploader to schedule pickup</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'delivered' && (
                                    <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <div className="text-gray-900">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Stocked & Verified</p>
                                            <p className="text-xs font-bold text-gray-700 mt-1">Value: ₦{item.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
