import React, { useState, useMemo, useCallback } from 'react';
import {
    Package, CheckCircle, Clock,
    BadgeCheck, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Material } from '../../types';

interface QueueItem {
    id: string;
    collectorName: string;
    materialType: string;
    weightKg: number;
    quality: string;
    status: string;
    pricePerKg: number;
    totalValue: number;
    location: string;
    photo?: string;
}

interface ProcessingQueueProps {
    materials: Material[];
    refreshData: () => Promise<void>;
    loading: boolean;
}

export default function ProcessingQueue({ materials, refreshData, loading }: ProcessingQueueProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'delivered' | 'alerts'>('pending');
    const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

    const authToken = localStorage.getItem('ecolink_token');
    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    }), [authToken]);

    const queue = useMemo(() => {
        const filtered = materials.filter(m => {
            if (activeTab === 'alerts') return ['pending', 'approved', 'delivered', 'pickup_scheduled'].includes(m.status);
            return m.status === activeTab;
        });

        return filtered.map((m: any) => ({
            id: m._id,
            collectorName: m.submittedBy?.name || m.submittedBy?.username || 'Anonymous',
            materialType: m.materialType,
            weightKg: m.weight,
            quality: m.condition,
            status: m.status,
            pricePerKg: m.pricing?.offeredPrice || 0,
            totalValue: (m.weight * (m.pricing?.offeredPrice || 0)),
            location: m.pickupLocation?.address || 'Unknown',
            photo: m.images?.[0]?.url
        }));
    }, [materials, activeTab]);

    const handleAccept = useCallback(async (id: string) => {
        const price = priceInputs[id];
        if (!price || isNaN(Number(price))) return toast.error('Enter a valid price');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${apiUrl}/materials/${id}/review`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'approved', pricePerKg: Number(price) })
            });

            if (res.ok) {
                toast.success('Material Accepted & Uploader Notified!');
                refreshData();
            }
        } catch {
            toast.error('Submission failed');
        }
    }, [authHeaders, refreshData, priceInputs]);

    const handleVerify = useCallback(async (id: string) => {
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
        }
    }, [authHeaders, refreshData]);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-purple-900/5 border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-gray-50/50 p-2 border-b border-gray-100">
                {[
                    { id: 'pending', label: 'Pending Review', icon: Clock, color: 'text-orange-600' },
                    { id: 'approved', label: 'Approved & Logistics', icon: BadgeCheck, color: 'text-blue-600' },
                    { id: 'delivered', label: 'Delivered Stock', icon: CheckCircle, color: 'text-green-600' },
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
                                <p className="text-gray-300 font-bold italic">No items for the selected status.</p>
                            </div>
                        ) : queue.map((item) => (
                            <div key={item.id} className="group bg-white rounded-[2rem] border-2 border-gray-50 hover:border-purple-100 transition-all p-6 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                                        {item.photo ? (
                                            <img src={item.photo} alt="Material" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Package className="text-gray-200" /></div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-lg leading-tight">{item.weightKg}kg</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${item.quality === 'treated_clean' ? 'text-green-500' : 'text-orange-400'
                                            }`}>{item.quality.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.collectorName}</p>
                                    <p className="font-bold text-gray-900 text-sm truncate">{item.materialType}</p>
                                    <p className="text-[9px] text-gray-400 font-medium truncate italic">{item.location}</p>
                                </div>

                                {activeTab === 'pending' && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs text-gray-300">₦/kg</span>
                                            <input
                                                type="number"
                                                placeholder="Set Price"
                                                className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-xl py-3 pl-14 pr-4 text-xs font-bold outline-none focus:border-orange-200 transition-all"
                                                value={priceInputs[item.id] || ''}
                                                onChange={(e) => setPriceInputs({ ...priceInputs, [item.id]: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleAccept(item.id)}
                                            className="w-full py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-900/10 hover:bg-orange-500 hover:-translate-y-0.5 transition-all"
                                        >
                                            Intake & Notify
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'approved' && (
                                    <div className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                {item.status === 'pickup_scheduled' ? 'Collection Target' : 'Quote Sent'}
                                            </span>
                                            <span className="font-black text-blue-600 text-sm">₦{(item.pricePerKg * item.weightKg).toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleVerify(item.id)}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 hover:bg-blue-500 transition-all"
                                        >
                                            Verify & Release
                                        </button>
                                        {item.status === 'approved' && (
                                            <p className="text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Waiting for collector to schedule pickup</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'delivered' && (
                                    <div className="flex items-center gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest leading-none">Paid & Stocked</p>
                                            <p className="text-xs font-bold text-gray-700 mt-1">₦{item.totalValue.toLocaleString()}</p>
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
