import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const MATERIAL_TYPES = ['plastic', 'metal', 'paper', 'glass', 'electronic', 'textile', 'household', 'organic'];
const CONDITIONS = ['', 'treated_clean', 'clean', 'good', 'dirty', 'damaged'];
const CONDITION_LABELS: Record<string, string> = {
    '': 'Any Condition',
    'treated_clean': 'Treated / Clean',
    'clean': 'Clean',
    'good': 'Good',
    'dirty': 'Dirty',
    'damaged': 'Damaged',
};

interface PricingRule {
    _id: string;
    materialType: string;
    conditions: string[];
    basePrice: number;
    name: string;
    updatedAt: string;
}

interface FormState {
    materialType: string;
    condition: string;
    pricePerKg: string;
    description: string;
}

const PricingManager: React.FC = () => {
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FormState>({
        materialType: 'plastic',
        condition: '',
        pricePerKg: '',
        description: '',
    });

    const fetchRules = async () => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await fetch(`${API_URL}/pricing`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setRules(data.data);
        } catch {
            toast.error('Failed to load pricing rules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRules(); }, []);

    const handleSave = async () => {
        if (!form.pricePerKg || parseFloat(form.pricePerKg) <= 0) {
            toast.error('Please enter a valid price per kg');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await fetch(`${API_URL}/pricing/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    materialType: form.materialType,
                    condition: form.condition || undefined,
                    pricePerKg: parseFloat(form.pricePerKg),
                    description: form.description || undefined
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save rule');

            toast.success(`₦${parseFloat(form.pricePerKg).toLocaleString()}/kg rate set for ${form.materialType}`, { icon: '💰' });
            setShowForm(false);
            setForm({ materialType: 'plastic', condition: '', pricePerKg: '', description: '' });
            fetchRules();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save pricing rule');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (id: string, name: string) => {
        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await fetch(`${API_URL}/pricing/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            toast.success(`Pricing rule "${name}" deactivated`, { icon: '🗑️' });
            setRules(prev => prev.filter(r => r._id !== id));
        } catch {
            toast.error('Failed to deactivate rule');
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Global Pricing Manager</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin-Controlled Base Rates</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                    {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showForm ? 'Cancel' : 'Set Price'}
                </motion.button>
            </div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                            <p className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-5 flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                Branches can adjust by ±20% from this rate during material review.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Material Type</label>
                                    <select
                                        value={form.materialType}
                                        onChange={e => setForm(f => ({ ...f, materialType: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none capitalize"
                                    >
                                        {MATERIAL_TYPES.map(t => (
                                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Condition (optional)</label>
                                    <select
                                        value={form.condition}
                                        onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                                    >
                                        {CONDITIONS.map(c => (
                                            <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Price per KG (₦)</label>
                                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                                        <span className="text-sm font-black text-gray-400">₦</span>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 500"
                                            value={form.pricePerKg}
                                            onChange={e => setForm(f => ({ ...f, pricePerKg: e.target.value }))}
                                            className="flex-1 text-sm font-bold text-gray-900 outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Clean PET bottles nationwide"
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                                    />
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-60"
                            >
                                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                {saving ? 'Saving...' : 'Save Global Price'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rules Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-400">Loading pricing rules...</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="p-10 text-center">
                        <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">No pricing rules set yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Set Price" to add the first global rate.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/60">
                                {['Material', 'Condition', 'Base Rate (₦/kg)', 'Branch Allow. Range', 'Last Updated', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rules.map((rule, i) => (
                                <motion.tr
                                    key={rule._id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                    className="hover:bg-gray-50/40 transition-colors group"
                                >
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest capitalize">
                                            {rule.materialType}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-bold text-gray-500">
                                        {rule.conditions?.[0] ? CONDITION_LABELS[rule.conditions[0]] || rule.conditions[0] : 'Any'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-lg font-black text-emerald-600">₦{rule.basePrice.toLocaleString()}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">/kg</span>
                                    </td>
                                    <td className="px-5 py-4 text-[11px] font-bold text-gray-500">
                                        ₦{Math.floor(rule.basePrice * 0.8).toLocaleString()} – ₦{Math.ceil(rule.basePrice * 1.2).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-4 text-[11px] font-medium text-gray-400">
                                        {new Date(rule.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => handleDeactivate(rule._id, rule.name)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                            title="Deactivate rule"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PricingManager;
