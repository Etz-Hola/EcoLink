import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/dashboard/admin/AdminLayout';
import AdminOverview from '../../components/dashboard/admin/Overview';
import UserManagement from '../../components/dashboard/admin/UserManagement';
import PricingManager from '../../components/dashboard/PricingManager';
import BranchManagement from '../../components/dashboard/admin/BranchManagement';
import MaterialMonitor from '../../components/dashboard/admin/MaterialMonitor';
import FinanceManager from '../../components/dashboard/admin/FinanceManager';
import PlatformSettings from '../../components/dashboard/admin/PlatformSettings';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Admin Terminal');
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <UserManagement />;
      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Material Pricing</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Set global base rates for recyclables</p>
            </div>
            <PricingManager />
          </div>
        );
      case 'branches':
        return <BranchManagement />;
      case 'materials':
        return <MaterialMonitor />;
      case 'financials':
        return <FinanceManager />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
      user={user}
    >
      {renderView()}
    </AdminLayout>
  );
};

export default AdminDashboard;