import { useState } from 'react';
import { PackageCheck, Plus, Trash2, Box, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface BundleItem {
    materialId: string;
    type: string;
    weightKg: number;
    quality: string;
}

export default function BundleCreator() {
    const [items, setItems] = useState<BundleItem[]>([]);
    const [bundleName, setBundleName] = useState('');
    const [creating, setCreating] = useState(false);

    // This would normally come from API (accepted items in processing)
    const availableItems = [
        { id: 'm1', type: 'PET', weightKg: 45, quality: 'treated_clean' },
        { id: 'm2', type: 'HDPE', weightKg: 120, quality: 'raw_dirty' },
        { id: 'm3', type: 'Aluminum', weightKg: 350, quality: 'treated_clean' },
        { id: 'm4', type: 'PET', weightKg: 85, quality: 'treated_clean' },
    ];

    const addToBundle = (item: { id: string; type: string; weightKg: number; quality: string }) => {
        if (items.some(i => i.materialId === item.id)) {
            toast.error('Item already in bundle');
            return;
        }
        setItems([...items, { materialId: item.id, ...item }]);
    };

    const removeFromBundle = (materialId: string) => {
        setItems(items.filter(i => i.materialId !== materialId));
    };

    const calculateTotalWeight = () => {
        return items.reduce((sum, item) => sum + item.weightKg, 0);
    };

    const handleCreateBundle = async () => {
        if (items.length === 0) {
            toast.error('Add at least one material to create a bundle');
            return;
        }

        if (!bundleName.trim()) {
            toast.error('Please provide a bundle name or description');
            return;
        }

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
                    materialIds: items.map(i => i.materialId),
                    totalWeight: calculateTotalWeight(),
                }),
            });

            if (!res.ok) throw new Error();

            toast.success(`Bundle "${bundleName}" created! (${calculateTotalWeight()} kg) 📦`);
            setItems([]);
            setBundleName('');
        } catch {
            toast.error('Failed to create bundle');
        } finally {
            setCreating(false);
        }
    };

    const totalWeight = calculateTotalWeight();

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-purple-900/5 border border-gray-100 p-8 overflow-hidden">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <PackageCheck className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Export Bundle Creator</h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 italic">Aggregation Hub Tool</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Available Materials */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available for Bundling</h3>
                        <span className="text-[10px] font-bold text-gray-400">{availableItems.length} Items</span>
                    </div>
                    <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableItems.map(item => (
                            <div
                                key={item.id}
                                className={`group border-2 rounded-3xl p-5 transition-all cursor-pointer ${items.some(i => i.materialId === item.id)
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-white border-gray-50 hover:border-purple-100 hover:shadow-md'
                                    }`}
                                onClick={() => addToBundle(item)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xs text-center group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                            {item.type.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 tracking-tight">{item.type}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${item.quality === 'treated_clean' ? 'text-green-500' : 'text-orange-400'
                                                }`}>
                                                {item.quality.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-purple-600 text-lg leading-none">{item.weightKg}<span className="text-[10px] text-gray-300 ml-1">kg</span></p>
                                        <Plus className={`h-5 w-5 ml-auto mt-1 transition-all ${items.some(i => i.materialId === item.id) ? 'rotate-45 text-purple-300' : 'text-gray-200 group-hover:text-purple-400 group-hover:scale-125'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Bundle Configuration */}
                <div className="relative">
                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white h-full flex flex-col shadow-2xl shadow-purple-200">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Live Bundle Summary</h3>

                        <input
                            type="text"
                            value={bundleName}
                            onChange={e => setBundleName(e.target.value)}
                            placeholder="Give your bundle a name..."
                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none mb-8"
                        />

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8 space-y-3 min-h-[200px]">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                                    <Box className="w-10 h-10 text-gray-700 mb-3" />
                                    <p className="text-xs font-bold text-gray-600 max-w-[160px]">Add materials to the left panel to start bundling</p>
                                </div>
                            ) : (
                                items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group/item hover:bg-white/10 transition-all">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-white/50">{item.type}</p>
                                            <p className="text-sm font-bold text-white">{item.weightKg} kg</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromBundle(item.materialId);
                                            }}
                                            className="p-2 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1">Total Mass</p>
                                    <p className="text-3xl font-black text-white">{totalWeight} <span className="text-xs text-gray-600">KG</span></p>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight ${totalWeight >= 500 ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                                    }`}>
                                    <Info className="w-3 h-3" />
                                    {totalWeight >= 500 ? 'Export Ready' : 'Low Volume'}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateBundle}
                                disabled={creating || items.length === 0}
                                className={`
                  w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all
                  ${creating || items.length === 0
                                        ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                                        : 'bg-purple-600 text-white shadow-xl shadow-purple-900/40 hover:bg-purple-500 hover:-translate-y-1 active:scale-95'
                                    }
                `}
                            >
                                {creating ? 'Finalizing Bundle...' : 'Seal Bundle for Export'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
