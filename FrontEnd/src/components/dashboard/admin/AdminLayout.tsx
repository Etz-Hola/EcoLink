import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
    user: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentView, onViewChange, onLogout, user }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar currentView={currentView} onViewChange={onViewChange} onLogout={onLogout} />

            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <AdminNavbar user={user} />

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
