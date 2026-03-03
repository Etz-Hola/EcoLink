import React from 'react';
import { Search, Bell, User as UserIcon, ChevronDown, Settings } from 'lucide-react';

interface AdminNavbarProps {
    user: any;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ user }) => {
    return (
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users, transactions, branches..."
                        className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-emerald-500 rounded-xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </button>

                <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-emerald-500 rounded-xl transition-all">
                    <Settings size={20} />
                </button>

                <div className="w-px h-6 bg-gray-100 mx-2" />

                <button className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-all group">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <UserIcon size={18} />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-xs font-black text-gray-900 group-hover:text-emerald-600 transition-colors truncate max-w-[100px]">
                            {user?.firstName || 'Admin'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
