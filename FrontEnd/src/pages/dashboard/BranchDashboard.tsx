import React from 'react';
import { Package, Users, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMaterial } from '../../hooks/useMaterial';
import ProcessingQueue from '../../components/dashboard/ProcessingQueue';
import BundleCreator from '../../components/dashboard/BundleCreator';

const BranchDashboard: React.FC = () => {
  const { user } = useAuth();
  const { materials } = useMaterial();

  // Filter materials for quick stats
  const pendingMaterials = materials.filter(m => m.status === 'pending');
  const processedMaterials = materials.filter(m => m.status === 'processed');

  const stats = [
    {
      label: 'Pending Review',
      value: pendingMaterials.length.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Total Processed',
      value: processedMaterials.length.toString(),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Branch Capacity',
      value: '85%',
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Collectors',
      value: '23',
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Aggregation Hub Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">
          Hello {user?.name}, manage local intake, quality verification, and export bundling.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Queue Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Incoming Intake Review</h2>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Real-time</span>
        </div>
        <ProcessingQueue />
      </div>

      {/* Aggregation & Bundling Section */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Export Preparation</h2>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">Supply Chain</span>
        </div>
        <BundleCreator />
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-black uppercase tracking-tight px-4">System Alerts</h2>
        <div className="space-y-4">
          {[
            { title: 'New material from Al-Hikmah', time: '5m ago', type: 'info' },
            { title: 'Exporter requested a bundle', time: '1h ago', type: 'alert' },
            { title: 'Daily capacity reached 85%', time: '3h ago', type: 'warning' },
          ].map((note, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
              <div className={`w-2 h-2 rounded-full mt-2 ${note.type === 'alert' ? 'bg-red-500' : note.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
              <div>
                <p className="text-sm font-bold text-gray-900">{note.title}</p>
                <p className="text-xs text-gray-400 font-medium">{note.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;