import { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Plus, X, Box } from 'lucide-react';
import toast from 'react-hot-toast';

interface Material {
    type: string;
    weightKg: number;
    quality: 'raw_dirty' | 'treated_clean';
    photo?: File;
    previewUrl?: string;
}

export default function UploadMaterialsForm() {
    const [materials, setMaterials] = useState<Partial<Material>[]>([{
        type: '',
        weightKg: 0,
        quality: 'raw_dirty'
    }]);
    const [uploading, setUploading] = useState(false);

    const addMaterial = () => {
        setMaterials([...materials, { type: '', weightKg: 0, quality: 'raw_dirty' }]);
    };

    const updateMaterial = (index: number, field: keyof Material, value: any) => {
        const newMaterials = [...materials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setMaterials(newMaterials);
    };

    const removeMaterial = (index: number) => {
        const material = materials[index];
        if (material.previewUrl) {
            URL.revokeObjectURL(material.previewUrl);
        }
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create preview
            const previewUrl = URL.createObjectURL(file);
            updateMaterial(index, 'photo', file);
            updateMaterial(index, 'previewUrl', previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (materials.some(m => !m.type || !m.weightKg || m.weightKg <= 0)) {
            toast.error('Please fill all material details correctly');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            const token = localStorage.getItem('ecolink_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

            materials.forEach((m, i) => {
                formData.append(`materials[${i}][type]`, m.type!);
                formData.append(`materials[${i}][weightKg]`, m.weightKg!.toString());
                formData.append(`materials[${i}][quality]`, m.quality!);
                if (m.photo) {
                    formData.append(`materials[${i}][photo]`, m.photo);
                }
            });

            const res = await fetch(`${apiUrl}/materials/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            toast.success('Your materials have been submitted for review! 🚀');

            // Cleanup previews
            materials.forEach(m => {
                if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });

            // Reset form
            setMaterials([{ type: '', weightKg: 0, quality: 'raw_dirty' }]);
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload materials');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-green-900/5 border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Recyclables</h2>
                        <p className="text-gray-500 font-medium text-sm">Add items you want to recycle today</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={addMaterial}
                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all border border-gray-100 group"
                    title="Add Item"
                >
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {materials.map((material, index) => (
                        <div key={index} className="bg-gray-50/50 rounded-3xl p-6 relative group border border-transparent hover:border-green-100 hover:bg-white hover:shadow-lg transition-all">
                            {materials.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMaterial(index)}
                                    className="absolute -top-2 -right-2 p-2 bg-white rounded-xl shadow-md text-red-400 hover:text-red-600 hover:scale-110 transition-all border border-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Material Details */}
                                <div className="md:col-span-8 flex flex-col gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Material Type */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                                Material Category
                                            </label>
                                            <select
                                                value={material.type || ''}
                                                onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                                                className="w-full h-12 bg-white border-2 border-gray-100 rounded-2xl px-4 font-bold text-gray-900 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                                required
                                            >
                                                <option value="">Select type</option>
                                                <option value="PET">🥤 PET (Plastic Bottles)</option>
                                                <option value="HDPE">🧴 HDPE (Hard Plastic)</option>
                                                <option value="aluminum">🥫 Aluminum Cans</option>
                                                <option value="steel">⛓️ Steel / Ferrous</option>
                                                <option value="paper">🗞️ Paper / Cardboard</option>
                                            </select>
                                        </div>

                                        {/* Weight */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                                Weight Estimation (kg)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    value={material.weightKg || ''}
                                                    onChange={(e) => updateMaterial(index, 'weightKg', parseFloat(e.target.value))}
                                                    className="w-full h-12 bg-white border-2 border-gray-100 rounded-2xl px-4 pr-12 font-bold text-gray-900 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none placeholder:text-gray-300"
                                                    placeholder="0.0"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">kg</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quality Selection */}
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                            Material Quality
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateMaterial(index, 'quality', 'raw_dirty')}
                                                className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${material.quality === 'raw_dirty'
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-orange-100'
                                                    }`}
                                            >
                                                Untreated / Raw
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateMaterial(index, 'quality', 'treated_clean')}
                                                className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${material.quality === 'treated_clean'
                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-green-100'
                                                    }`}
                                            >
                                                Sorted / Clean
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Photo Upload Area */}
                                <div className="md:col-span-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Photo Evidence
                                    </label>
                                    <label className="relative flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-full min-h-[140px] bg-white border-3 border-dashed border-gray-100 rounded-3xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-all group overflow-hidden">
                                        {material.previewUrl ? (
                                            <>
                                                <img src={material.previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                                                    <ImageIcon className="h-6 w-6 text-gray-300 group-hover:text-green-600" />
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase group-hover:text-green-600 transition-colors">Click to Capture</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => handlePhotoChange(index, e)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Box className="w-5 h-5" />
                        </div>
                        Total Items: <span className="text-gray-900">{materials.length}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className={`
              relative w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95
              ${uploading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 hover:shadow-green-300 hover:-translate-y-1'
                            }
            `}
                    >
                        {uploading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin h-4 w-4" />
                                Processing...
                            </div>
                        ) : (
                            'Send to Review'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
