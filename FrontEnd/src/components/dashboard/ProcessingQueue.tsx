import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, Filter, Truck, BadgeCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QueueItem {
    id: string;
    collectorName: string;
    materialType: string;
    weightKg: number;
    quality: string;
    status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'processed' | 'approved' | 'delivered';
    submittedAt: string;
    photoUrl?: string;
    pricePerKg?: number;
    location?: string;
}

interface AdminDefault {
    pricePerKg: number;
    minAllowed: number;
    maxAllowed: number;
}

type AdminPriceCache = Record<string, AdminDefault | null>;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProcessingQueue() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
    const [adminPrices, setAdminPrices] = useState<AdminPriceCache>({});

    const authToken = localStorage.getItem('ecolink_token');
    const authHeaders = { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };

    // Fetch admin default price for a material type (cached)
    const fetchAdminDefault = async (materialType: string) => {
        const key = materialType.toLowerCase();
        if (key in adminPrices) return; // already cached
        try {
            const res = await fetch(`${API_URL}/pricing/defaults/${encodeURIComponent(key)}`, {
                headers: authHeaders
            });
            const data = await res.json();
            setAdminPrices(prev => ({
                ...prev,
                [key]: data.success && data.data ? data.data : null
            }));
            if (data.success && data.data) {
                // Pre-fill the price input if not already set
                setPriceInputs(prev => {
                    const updated = { ...prev };
                    // We'll use materialType key to pre-fill items on render
                    return updated;
                });
            }
        } catch {
            setAdminPrices(prev => ({ ...prev, [key]: null }));
        }
    };

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch(`${API_URL}/materials/pending`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                if (data.success) {
                    const mapped = (data.data || []).map((m: {
                        _id: string;
                        submittedBy?: { username?: string; businessName?: string; firstName?: string; lastName?: string };
                        materialType: string;
                        weight: number;
                        condition: string;
                        status: string;
                        createdAt: string;
                        images?: { url: string }[];
                        pricing?: { pricePerKg?: number };
                        pickupLocation?: { address?: string; city?: string };
                    }) => ({
                        id: m._id,
                        collectorName: m.submittedBy?.businessName ||
                            (m.submittedBy?.firstName ? `${m.submittedBy.firstName} ${m.submittedBy.lastName || ''}`.trim() : null) ||
                            m.submittedBy?.username || 'Anonymous',
                        materialType: m.materialType,
                        weightKg: m.weight,
                        quality: m.condition,
                        status: m.status as QueueItem['status'],
                        submittedAt: m.createdAt,
                        photoUrl: m.images?.[0]?.url,
                        pricePerKg: m.pricing?.pricePerKg,
                        location: m.pickupLocation?.city || m.pickupLocation?.address,
                    }));
                    setQueue(mapped);

                    // Trigger admin price fetch for each unique material type
                    const uniqueTypes = [...new Set((mapped as QueueItem[]).map(i => i.materialType.toLowerCase()))];
                    uniqueTypes.forEach(type => fetchAdminDefault(type));
                }
            } catch {
                toast.error('Failed to load processing queue');
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When a pending item has no price input yet but we have admin default, pre-fill it
    useEffect(() => {
        setQueue(prevQueue => {
            let changed = false;
            const newInputs: Record<string, string> = {};
            prevQueue.forEach(item => {
                if (item.status === 'pending' && !priceInputs[item.id]) {
                    const def = adminPrices[item.materialType.toLowerCase()];
                    if (def) {
                        newInputs[item.id] = String(def.pricePerKg);
                        changed = true;
                    }
                }
            });
            if (changed) {
                setPriceInputs(prev => ({ ...prev, ...newInputs }));
            }
            return prevQueue;
        });
    }, [adminPrices]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAccept = async (id: string) => {
        const price = parseFloat(priceInputs[id] || '');
        if (!price || price <= 0) {
            toast.error('Please set a price per kg before accepting');
            return;
        }

        const item = queue.find(i => i.id === id);
        const def = item ? adminPrices[item.materialType.toLowerCase()] : null;
        if (def && (price < def.minAllowed || price > def.maxAllowed)) {
            toast.error(`Price must be between ₦${def.minAllowed.toLocaleString()} – ₦${def.maxAllowed.toLocaleString()} (±20% of admin rate)`, {
                duration: 6000, icon: '⚠️'
            });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/materials/${id}/review`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'approved', offeredPrice: price })
            });

            if (!res.ok) throw new Error();

            setQueue(prev => prev.map(i =>
                i.id === id ? { ...i, status: 'approved', pricePerKg: price } : i
            ));

            const total = item ? (item.weightKg * price) : 0;
            toast.success(`Accepted at ₦${price.toLocaleString()}/kg — Total: ₦${total.toLocaleString()}`, {
                icon: '✅', duration: 5000
            });
        } catch {
            toast.error('Failed to accept material');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/materials/${id}/review`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'rejected' })
            });

            if (!res.ok) throw new Error();

            setQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'rejected' } : i));
            toast.success('Rejected — uploader notified', { icon: '❌' });
        } catch {
            toast.error('Failed to reject material');
        }
    };

    const handleVerify = async (id: string) => {
        try {
            const item = queue.find(i => i.id === id);
            const res = await fetch(`${API_URL}/materials/${id}/verify`, {
                method: 'PATCH',
                headers: authHeaders,
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            const price = data.data?.pricing?.pricePerKg || item?.pricePerKg || 0;
            const amount = price * (data.data?.weight || item?.weightKg || 0);

            setQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'delivered' } : i));
            toast.success(
                amount > 0
                    ? `Payment released! ₦${amount.toLocaleString()} sent to ${item?.collectorName}`
                    : `Delivery verified! Payment released to ${item?.collectorName}`,
                { duration: 6000, icon: '💸' }
            );
        } catch {
            toast.error('Failed to verify delivery');
        }
    };

    const FILTER_TABS = ['all', 'pending', 'approved', 'delivered', 'rejected'];

    const filteredQueue = queue.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'approved') return item.status === 'approved' || item.status === 'accepted';
        return item.status === filter;
    });

    const STATUS_BADGE: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border border-amber-100',
        accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        rejected: 'bg-red-50 text-red-700 border border-red-100',
        delivered: 'bg-blue-50 text-blue-700 border border-blue-100',
        processed: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        processing: 'bg-purple-50 text-purple-700 border border-purple-100',
    };

    const STATUS_LABEL: Record<string, string> = {
        pending: 'Awaiting Review',
        accepted: 'Accepted',
        approved: 'Accepted',
        rejected: 'Rejected',
        delivered: 'Delivered & Paid',
        processed: 'Processed',
        processing: 'Processing',
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center">
                <div className="inline-block p-4 rounded-3xl bg-blue-50 mb-4">
                    <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Loading Material Queue...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Processing Queue</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                            {queue.length} item{queue.length !== 1 ? 's' : ''} · Active Intake
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-wrap">
                    {FILTER_TABS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <Filter className="w-3.5 h-3.5 text-gray-300 mr-2" />
                </div>
            </div>

            {/* Queue Cards */}
            <div className="divide-y divide-gray-50">
                {filteredQueue.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Clock className="h-10 w-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold text-sm tracking-tight italic">No items for this filter</p>
                    </div>
                ) : (
                    filteredQueue.map(item => {
                        const quoted = item.pricePerKg ? item.pricePerKg * item.weightKg : null;
                        const isAccepted = item.status === 'approved' || item.status === 'accepted';
                        const def = adminPrices[item.materialType.toLowerCase()];

                        return (
                            <div key={item.id} className="p-6 hover:bg-gray-50/40 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center font-black text-white text-sm shadow-md">
                                        {item.collectorName.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-black text-gray-900 text-sm">{item.collectorName}</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[item.status] || 'bg-gray-50 text-gray-600'}`}>
                                                {STATUS_LABEL[item.status] || item.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-[11px] font-bold text-gray-500 mb-3">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded-lg uppercase tracking-wider">{item.materialType}</span>
                                            <span>{item.weightKg} kg</span>
                                            <span className={item.quality?.includes('clean') || item.quality === 'Grade A' ? 'text-green-600' : 'text-orange-500'}>
                                                {item.quality?.replace('_', ' ')}
                                            </span>
                                            {item.location && <span>📍 {item.location}</span>}
                                            <span className="text-gray-400">{new Date(item.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>

                                        {/* ── PENDING: price input + accept/reject ── */}
                                        {item.status === 'pending' && (
                                            <div className="flex flex-wrap items-start gap-2.5 mt-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 focus-within:border-blue-400 transition-colors">
                                                        <span className="text-[11px] font-black text-gray-400">₦</span>
                                                        <input
                                                            type="number"
                                                            placeholder={def ? `${def.pricePerKg} (admin rate)` : 'Price / kg'}
                                                            value={priceInputs[item.id] || ''}
                                                            onChange={e => setPriceInputs(p => ({ ...p, [item.id]: e.target.value }))}
                                                            className="w-28 text-sm font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                    {def && (
                                                        <p className="text-[10px] text-amber-600 font-bold px-1">
                                                            Admin rate: ₦{def.pricePerKg.toLocaleString()} · Range: ₦{def.minAllowed.toLocaleString()}–₦{def.maxAllowed.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                {priceInputs[item.id] && (
                                                    <span className="text-[11px] font-black text-emerald-600 pt-2">
                                                        → ₦{(parseFloat(priceInputs[item.id]) * item.weightKg).toLocaleString()} total
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleAccept(item.id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-200 active:scale-95"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {/* ── ACCEPTED/APPROVED: quoted total + verify ── */}
                                        {isAccepted && (
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                {quoted ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Quoted</span>
                                                        <span className="text-sm font-black text-emerald-700">₦{quoted.toLocaleString()}</span>
                                                        <span className="text-[9px] text-emerald-400">({item.weightKg}kg × ₦{item.pricePerKg?.toLocaleString()}/kg)</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-amber-500 font-bold italic">Awaiting pickup scheduling by uploader</span>
                                                )}
                                                <button
                                                    onClick={() => toast('Uploader notified to confirm pickup availability! 📅', { icon: '📅', duration: 4000 })}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Truck className="h-3.5 w-3.5" /> Notify Pickup
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(item.id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                                >
                                                    <BadgeCheck className="h-3.5 w-3.5" /> Verify Delivery & Release Payment
                                                </button>
                                            </div>
                                        )}

                                        {/* ── DELIVERED: payment success banner ── */}
                                        {item.status === 'delivered' && (
                                            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl w-fit">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                                                    ✅ Payment released to {item.collectorName}
                                                    {quoted ? ` — ₦${quoted.toLocaleString()} transferred` : ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* ── REJECTED: info ── */}
                                        {item.status === 'rejected' && (
                                            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl w-fit">
                                                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                                <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">Rejected — Uploader has been notified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
