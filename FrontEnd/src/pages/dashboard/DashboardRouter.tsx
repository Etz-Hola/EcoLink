import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import CollectorDashboard from './CollectorDashboard';
import BranchDashboard from './BranchDashboard';
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

    // COLLECTOR types — individual, organizations, hotels all use the same collector dashboard
    if (['collector', 'organization', 'hotel'].includes(user.role)) {
        return <CollectorDashboard />;
    }

    // BRANCH / AGGREGATION HUB
    if (user.role === 'branch') {
        return <BranchDashboard />;
    }

    // FINAL COMPANIES — exporters and buyers
    if (['buyer', 'exporter'].includes(user.role)) {
        return <ExporterDashboard />;
    }

    // ADMIN
    if (user.role === 'admin') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100"
            >
                <h2 className="text-2xl font-black text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-500 mt-2 font-medium">Manage users and global platform settings.</p>
            </motion.div>
        );
    }

    // FALLBACK
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100"
        >
            <h2 className="text-2xl font-black text-gray-900">Setup Required</h2>
            <p className="text-gray-500 mt-2 font-medium">
                Your account role "{user.role}" isn't fully set up yet. Please contact support.
            </p>
        </motion.div>
    );
};

export default DashboardRouter;
