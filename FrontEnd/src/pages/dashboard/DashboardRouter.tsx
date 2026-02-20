import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import CollectorDashboard from './CollectorDashboard';
import BranchDashboard from './BranchDashboard';
import OrganizationDashboard from './OrganizationDashboard';
import ExporterDashboard from './ExporterDashboard';

const DashboardRouter: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    switch (user.role) {
        case 'collector':
            return <CollectorDashboard />;
        case 'branch':
            return <BranchDashboard />;
        case 'organization':
            return <OrganizationDashboard />;
        case 'buyer':
            return <ExporterDashboard />;
        case 'admin':
            return (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                    <p className="text-gray-600 mt-2">Manage users and global platform settings.</p>
                </div>
            );
        default:
            return (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Not Found</h2>
                    <p className="text-gray-600 mt-2">We couldn't find a specialized dashboard for your role: {user.role}</p>
                </div>
            );
    }
};

export default DashboardRouter;
