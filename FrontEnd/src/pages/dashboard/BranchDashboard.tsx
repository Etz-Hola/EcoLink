import React, { useState, useEffect } from 'react';
import { Package, Clock, RefreshCw, MapPin, Layout, ShoppingCart, Bell, Search, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProcessingQueue from '../../components/dashboard/ProcessingQueue';
import BundleCreator from '../../components/dashboard/BundleCreator';
import NearbyBuyersMap from '../../components/dashboard/NearbyBuyersMap';
import { useBranchData } from '../../hooks/useBranchData';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

const BranchDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { 
    stats, 
    pendingMaterials, 
    verifiedMaterials, 
    bundles, 
    notifications, 
    balance, 
    loading, 
    refreshData 
  } = useBranchData(userLocation?.lat, userLocation?.lng);
  const [isSyncing, setIsSyncing] = useState(false);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserLocation({ lat: 6.5244, lng: 3.3792 }),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation({ lat: 6.5244, lng: 3.3792 });
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await refreshData();
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Organization data synced! 🏢');
    }, 800);
  };

  const dashboardStats = [
    { label: 'In Queue', value: stats?.processing?.toString() || '0', icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Bundles', value: stats?.activeBundles?.toString() || '0', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Traffic', value: `${(stats?.totalWeight || 0).toLocaleString()}kg`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Platform Credit', value: `₦${(balance || 0).toLocaleString()}`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
      {/* Pending Approval Banner */}
      {user?.status === 'pending_approval' && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-pulse-slow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight leading-none">Account Pending Verification</h3>
              <p className="text-sm font-medium text-amber-700 mt-1">Your hub is currently being reviewed by EcoLink admin. You can set up your profile, but material intake is limited.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10">
            Contact Support
          </button>
        </div>
      )}

      {/* Header with Sync Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Hub Terminal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">Aggregation Center</h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Managing materials for <span className="text-gray-900 font-bold uppercase tracking-tighter">{user?.businessName || 'Local Branch'}</span>. Organization-wide data is synced.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-white border border-gray-100 rounded-[1.5rem] px-6 py-3 shadow-sm flex items-center gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Entity Balance</p>
              <p className="text-xl font-black text-emerald-600">₦{(balance || 0).toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-gray-100 mx-2" />
            <button className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-emerald-600 transition-colors">
              Withdraw
            </button>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizing...' : 'Sync Hub Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Icon className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 leading-none mb-1">{loading ? '...' : stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        {/* Processing Queue - Main Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 md:p-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Layout className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Intake Management</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shared Organization Queue</span>
            </div>
            <div className="overflow-x-auto">
              <ProcessingQueue 
                materials={[...pendingMaterials, ...verifiedMaterials]} 
                refreshData={refreshData}
                loading={loading}
              />
            </div>
          </div>

          {/* Bundle Creator */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 md:p-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Export Preparation</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregation Layer</span>
            </div>
            <BundleCreator 
                availableMaterials={verifiedMaterials} 
                refreshData={refreshData}
                loading={loading}
            />
          </div>

          <CreatedBundlesSection bundles={bundles} refreshData={refreshData} loading={loading} />
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          {/* Map View */}
          <div className="bg-[#061a14] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
              <MapPin className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-lg font-black uppercase tracking-tight">Supply Map</h2>
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden h-[300px] border border-white/5 shadow-inner">
                <NearbyBuyersMap userLocation={userLocation} viewMode="branch" />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4 text-center">Identifying pending pickups in shared territory</p>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Hub Alerts</h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <NotificationsList notifications={notifications} limit={5} loading={loading} />
            <button className="w-full mt-6 py-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
              Enter Alert History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExportBundle {
  _id: string;
  name: string;
  totalWeight: number;
  totalPrice: number;
  status: string;
  materialIds: string[];
}

interface CreatedBundlesSectionProps {
  bundles: ExportBundle[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

const CreatedBundlesSection: React.FC<CreatedBundlesSectionProps> = ({ bundles, refreshData, loading }) => {
  const handleAcceptRequest = async (bundleId: string) => {
    try {
      const token = localStorage.getItem('ecolink_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/bundles/${bundleId}/accept-request`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Purchase Request Accepted! Exporter notified. ✅');
        refreshData();
      }
    } catch {
      toast.error('Failed to accept request');
    }
  };

  if (loading) return <div className="h-32 bg-gray-50 animate-pulse rounded-[2rem]" />;
  if (bundles.length === 0) return null;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Export Inventory</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{bundles.length} Created Bundles</p>
        </div>
        <ShoppingCart className="w-6 h-6 text-gray-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div key={bundle._id} className="p-6 rounded-[2rem] border border-gray-50 hover:shadow-lg hover:border-emerald-100 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-gray-900 text-sm group-hover:text-emerald-700 transition-colors truncate w-2/3">{bundle.name}</h3>
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${bundle.status === 'purchased' ? 'bg-emerald-100 text-emerald-700' :
                bundle.status === 'requested' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-50 text-blue-600'
                }`}>
                {bundle.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lot Weight</p>
                <p className="text-xl font-black text-gray-900">{bundle.totalWeight}kg</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Hub Value</p>
                <p className="text-sm font-black text-emerald-600">₦{bundle.totalPrice?.toLocaleString()}</p>
              </div>
            </div>

            {bundle.status === 'requested' && (
              <button
                onClick={() => handleAcceptRequest(bundle._id)}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/10"
              >
                Accept Purchase Request
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface NotificationsListProps {
  notifications: Notification[];
  limit: number;
  loading: boolean;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications, limit, loading }) => {
  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-16 bg-gray-50 animate-pulse rounded-2xl" />)}</div>;

  return (
    <div className="space-y-4">
      {notifications.slice(0, limit).map((note, idx) => (
        <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-black text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{note.title}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap ml-2">
                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-tight line-clamp-2">{note.message}</p>
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest py-10">No alerts found</p>
      )}
    </div>
  );
};

export default BranchDashboard;
