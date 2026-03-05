import { useState, useEffect } from 'react';
import { PackageCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvailableMaterial {
    id: string;
    type: string;
    weightKg: number;
    quality: string;
    value: number;
}

export default function BundleCreator() {
    const [availableItems, setAvailableItems] = useState<AvailableMaterial[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bundleName, setBundleName] = useState('');
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAvailableMaterials = async () => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

            const res = await fetch(`${apiUrl}/materials/pending?status=approved,delivered`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success) {
                setAvailableItems(data.data.map((m: any) => ({
                    id: m._id,
                    type: m.materialType,
                    weightKg: m.weight,
                    quality: m.condition,
                    value: (m.weight * (m.pricing?.offeredPrice || m.pricing?.finalPrice || 0))
                })));
            }
        } catch {
            toast.error('Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableMaterials();
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectedItems = availableItems.filter(item => selectedIds.has(item.id));
    const totalWeight = selectedItems.reduce((sum: number, item: AvailableMaterial) => sum + item.weightKg, 0);

    const handleCreateBundle = async () => {
        if (selectedIds.size === 0) return toast.error('Select items to bundle');
        if (!bundleName.trim()) return toast.error('Enter bundle name');

        setCreating(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

            const res = await fetch(`${apiUrl}/bundles/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: bundleName,
                    materialIds: Array.from(selectedIds),
                    description: `Bundle of ${selectedIds.size} materials - ${totalWeight}kg`
                }),
            });

            if (res.ok) {
                toast.success('Bundle Sealed & Ready! 🚢');
                setBundleName('');
                setSelectedIds(new Set());
                fetchAvailableMaterials();
            }
        } catch {
            toast.error('Bundling failed');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-purple-900/5 border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <PackageCheck className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Export Preparation</h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Select materials for bulk export</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivered Stock</h3>
                        <span className="text-[10px] font-bold text-gray-400">{availableItems.length} Available</span>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase text-[10px]">Syncing Stock...</div>
                        ) : availableItems.length === 0 ? (
                            <div className="p-12 text-center text-gray-300 italic border-2 border-dashed border-gray-50 rounded-[2rem]">No materials ready for bundling.</div>
                        ) : availableItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelection(item.id)}
                                className={`group p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${selectedIds.has(item.id) ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-50 hover:border-purple-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-200 group-hover:border-purple-300'
                                        }`}>
                                        {selectedIds.has(item.id) && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm leading-tight uppercase">{item.type}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.quality.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-purple-600 text-sm">{item.weightKg}kg</p>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Value: ₦{item.value.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bundle Summary */}
                <div className="bg-gray-900 rounded-[3rem] p-8 text-white h-fit shadow-2xl shadow-purple-900/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 text-center">Export Configuration</h3>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-2 px-1">Bundle Identifier</label>
                            <input
                                type="text"
                                placeholder="E.g. Lagos West PET Batch A"
                                value={bundleName}
                                onChange={e => setBundleName(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700"
                            />
                        </div>

                        <div className="flex justify-between items-center bg-white/[0.03] p-6 rounded-[2rem]">
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Items Selected</p>
                                <p className="text-2xl font-black text-white">{selectedIds.size}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Mass</p>
                                <p className="text-2xl font-black text-purple-400">{totalWeight} <span className="text-xs text-gray-600">KG</span></p>
                            </div>
                        </div>

                        <button
                            disabled={selectedIds.size === 0 || creating}
                            onClick={handleCreateBundle}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${selectedIds.size === 0 || creating
                                    ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                                    : 'bg-purple-600 text-white shadow-xl shadow-purple-900/20 hover:bg-purple-500 hover:-translate-y-1'
                                }`}
                        >
                            {creating ? 'Sealing...' : 'Seal Bundle for Export'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
