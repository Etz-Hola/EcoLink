import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminOverview from '../../components/dashboard/admin/Overview';
import UserManagement from '../../components/dashboard/admin/UserManagement';
import PricingManager from '../../components/dashboard/PricingManager';
import BranchManagement from '../../components/dashboard/admin/BranchManagement';
import MaterialMonitor from '../../components/dashboard/admin/MaterialMonitor';
import FinanceManager from '../../components/dashboard/admin/FinanceManager';
import PlatformSettings from '../../components/dashboard/admin/PlatformSettings';

const AdminDashboard: React.FC = () => {
  const location = useLocation();

  // Extract the section from the URL /admin/:section
  const pathParts = location.pathname.split('/');
  // If it's just /admin, default to overview. If it's /admin/something, use that.
  let currentView = pathParts[2] || 'overview';

  // Map 'analytics' to 'overview' if needed
  if (currentView === 'analytics') currentView = 'overview';

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
    <div className="max-w-7xl mx-auto py-2">
      {renderView()}
    </div>
  );
};

export default AdminDashboard;
