import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, DollarSign, TrendingUp } from 'lucide-react';
import { useMaterial } from '../../hooks/useMaterial';
import PricingManager from '../../components/dashboard/PricingManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface AdminStats {
  counts: {
    users: number;
    materials: number;
    bundles: number;
  };
  financials?: {
    totalCommission?: number;
    totalBalances?: number;
  };
}

const AdminDashboard: React.FC = () => {
  const { materials } = useMaterial();
  const [dateRange, setDateRange] = useState('7d');
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setStatsData(data.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Users',
      value: statsLoading ? '—' : (statsData?.counts.users?.toLocaleString() || '0'),
      change: '+12%',
      positive: true,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total Materials',
      value: statsLoading ? '—' : (statsData?.counts.materials?.toString() || '0'),
      change: '+3 new',
      positive: true,
      icon: <Package className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Active Bundles',
      value: statsLoading ? '—' : (statsData?.counts.bundles?.toString() || '0'),
      change: '+18%',
      positive: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Materials Processed',
      value: materials.filter(m => m.status === 'processed').length.toString(),
      change: '+25%',
      positive: true,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Commission Earned',
      value: statsData?.financials?.totalCommission
        ? `₦${statsData.financials.totalCommission.toLocaleString()}`
        : '₦—',
      change: '+5%',
      positive: true,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
  ];

  const recentActivities = [
    { type: 'user', message: 'New collector registered in Lagos', time: '2 minutes ago' },
    { type: 'material', message: '50kg of plastic bottles processed', time: '15 minutes ago' },
    { type: 'branch', message: 'Ile-Ife branch reached capacity', time: '1 hour ago' },
    { type: 'payment', message: '₦125,000 paid to collectors', time: '2 hours ago' },
    { type: 'system', message: 'Daily backup completed', time: '3 hours ago' },
  ];

  const topMaterials = [
    { name: 'Plastic Bottles', weight: '2,450 kg', value: '₦367,500', percentage: 85 },
    { name: 'Aluminum Cans', weight: '1,200 kg', value: '₦240,000', percentage: 65 },
    { name: 'Paper/Cardboard', weight: '800 kg', value: '₦64,000', percentage: 45 },
    { name: 'Glass Bottles', weight: '600 kg', value: '₦36,000', percentage: 30 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of platform performance and key metrics.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Pricing Manager ── */}
      <PricingManager />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Revenue chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Materials by Volume</h3>
          <div className="space-y-4">
            {topMaterials.map((material, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{material.name}</span>
                  <span className="text-sm text-gray-600">{material.value}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{material.weight}</span>
                  <span>{material.percentage}% of total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${material.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'API Response Time', value: '125ms', color: 'text-green-600', bar: 'bg-green-500', width: '80%' },
              { label: 'Database Load', value: '68%', color: 'text-yellow-600', bar: 'bg-yellow-500', width: '68%' },
              { label: 'Server Uptime', value: '99.8%', color: 'text-green-600', bar: 'bg-green-500', width: '100%' },
              { label: 'Storage Used', value: '2.4TB / 5TB', color: 'text-blue-600', bar: 'bg-blue-500', width: '48%' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.bar} h-2 rounded-full`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;