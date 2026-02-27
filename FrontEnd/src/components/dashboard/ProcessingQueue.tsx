import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, ExternalLink, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface QueueItem {
    id: string;
    collectorName: string;
    materialType: string;
    weightKg: number;
    quality: string;
    status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'processed' | 'approved';
    submittedAt: string;
    photoUrl?: string;
}

export default function ProcessingQueue() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const token = localStorage.getItem('ecolink_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

                const res = await fetch(`${apiUrl}/materials/pending`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                if (data.success) {
                    const mapped = (data.data || []).map((m: any) => ({
                        id: m._id,
                        collectorName: m.submittedBy?.username || m.submittedBy?.businessName || 'Anonymous',
                        materialType: m.materialType,
                        weightKg: m.weight,
                        quality: m.condition,
                        status: m.status,
                        submittedAt: m.createdAt,
                        photoUrl: m.images?.[0]?.url
                    }));
                    setQueue(mapped);
                }
            } catch (err) {
                toast.error('Failed to load processing queue');
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, []);

    const handleAction = async (id: string, action: 'accept' | 'reject', offeredPrice?: number) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

            const status = action === 'accept' ? 'approved' : 'rejected';
            const res = await fetch(`${apiUrl}/materials/${id}/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status, offeredPrice })
            });

            if (!res.ok) throw new Error();

            setQueue(prev => prev.map(item => item.id === id || (item as any)._id === id ? { ...item, status } : item));
            toast.success(`Material ${action}ed successfully`);
        } catch {
            toast.error(`Failed to ${action} material`);
        }
    };

    const filteredQueue = queue.filter(item => filter === 'all' || item.status === filter);

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
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Processing Queue</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">Active Intake</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    {['pending', 'accepted', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
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

            <div className="overflow-x-auto">
                {filteredQueue.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Clock className="h-10 w-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold text-sm tracking-tight italic">No items found for this filter</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Source</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Material</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Weight</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Quality</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredQueue.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-[10px]">
                                                {item.collectorName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm tracking-tight">{item.collectorName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                            {item.materialType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-gray-900">{item.weightKg} <span className="text-[10px] text-gray-400 uppercase">kg</span></p>
                                    </td>
                                    <td className="px-8 py-6 capitalize">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.quality === 'treated_clean' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                            {item.quality.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'accepted' ? 'bg-green-50 text-green-700' :
                                            item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                'bg-orange-50 text-orange-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {item.status === 'pending' ? (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction(item.id, 'accept')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Verify & Accept"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'reject')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="text-gray-300 hover:text-blue-600 transition-colors p-2">
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
