import React from 'react';
import {
    Settings, Bell, ShieldCheck, Globe,
    Database, Zap, Save, RefreshCw,
    Lock, Mail, CreditCard, Share2
} from 'lucide-react';

const PlatformSettings: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configure global parameters and security protocols</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar for Settings */}
                <div className="md:col-span-1 space-y-2">
                    {[
                        { label: 'General Config', icon: Settings, active: true },
                        { label: 'Financial Rules', icon: CreditCard },
                        { label: 'Notifications', icon: Bell },
                        { label: 'Security & Access', icon: ShieldCheck },
                        { label: 'API & Integrations', icon: Zap },
                        { label: 'Database Backup', icon: Database },
                    ].map((item, i) => (
                        <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${item.active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}>
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Settings Form Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-emerald-500" />
                                Regional Settings
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Currency</label>
                                        <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
                                            <option>Nigerian Naira (₦)</option>
                                            <option>US Dollar ($)</option>
                                            <option>EcoCoin (WEB3)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Default Language</label>
                                        <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
                                            <option>English (Nigeria)</option>
                                            <option>Yoruba</option>
                                            <option>Igbo</option>
                                            <option>Hausa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                                <Share2 size={20} className="text-emerald-500" />
                                Platform Commission Model
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <div>
                                        <p className="text-sm font-black text-emerald-900">Global Service Fee</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Percentage deducted from every transaction</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" defaultValue="2" className="w-16 bg-white border-2 border-emerald-100 rounded-lg px-2 py-1 text-center font-black text-emerald-600 outline-none" />
                                        <span className="font-black text-emerald-600">%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Min Withdrawal Amount', value: '₦5,000', icon: CreditCard },
                                        { label: 'Admin Approval Threshold', value: '₦500,000', icon: ShieldCheck },
                                    ].map((field, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                                                    <field.icon size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{field.label}</span>
                                            </div>
                                            <input type="text" defaultValue={field.value} className="bg-transparent text-right font-black text-gray-900 text-sm outline-none w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex items-center gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95">
                                <Save size={18} /> Save Changes
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 text-gray-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                                <RefreshCw size={18} /> Reset Defaults
                            </button>
                        </div>
                    </div>

                    <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 transition-transform group-hover:rotate-12">
                                <Lock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-rose-900 tracking-tight">Maintenance Mode</p>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Instantly disable all platform intake operations</p>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 shadow-inner" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformSettings;
