import React from 'react';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMaterial } from '../../hooks/useMaterial';
import ProcessingQueue from '../../components/dashboard/ProcessingQueue';
import BundleCreator from '../../components/dashboard/BundleCreator';
import NearbyBuyersMap from '../../components/dashboard/NearbyBuyersMap';

const BranchDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserLocation({ lat: 6.5244, lng: 3.3792 })
      );
    } else {
      setUserLocation({ lat: 6.5244, lng: 3.3792 });
    }
  }, []);

  const [stats, setStats] = React.useState<any[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const url = new URL(`${apiUrl}/materials/stats/branch`);
        if (userLocation) {
          url.searchParams.append('lat', userLocation.lat.toString());
          url.searchParams.append('lng', userLocation.lng.toString());
        }

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const s = data.data;
          setStats([
            {
              label: 'Pending Review',
              value: (s.pending || 0).toString(),
              icon: <Clock className="h-5 w-5" />,
              color: 'text-orange-600',
              bg: 'bg-orange-50'
            },
            {
              label: 'Approved',
              value: (s.approved || 0).toString(),
              icon: <CheckCircle className="h-5 w-5" />,
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            {
              label: 'Total Processed',
              value: (s.delivered || 0).toString(),
              icon: <Package className="h-5 w-5" />,
              color: 'text-green-600',
              bg: 'bg-green-50'
            },
            {
              label: 'Rejected',
              value: (s.rejected || 0).toString(),
              icon: <div className="font-black text-[10px]">X</div>,
              color: 'text-red-600',
              bg: 'bg-red-50'
            }
          ]);
        }
      } catch {
        console.error('Failed to fetch branch stats');
      } finally {
        setLoadingStats(false);
      }
    };
    if (userLocation) fetchStats();
  }, [userLocation]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
      {/* Header */}
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Aggregation Hub Dashboard</h1>
        <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
          Hello {user?.name}, manage local intake, quality verification, and export bundling.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                {loadingStats ? (
                  <div className="h-8 w-12 bg-gray-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                )}
              </div>
              <div className={`p-2.5 md:p-3 rounded-xl ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Queue Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6 md:px-2">
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">Incoming Intake Review</h2>
          <span className="text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Real-time</span>
        </div>
        <div className="overflow-x-auto">
          <ProcessingQueue />
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6 md:px-2">
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">Nearby Pending Uploads</h2>
          <span className="text-[9px] md:text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">Geographical View</span>
        </div>
        <div className="px-4 md:px-0">
          <NearbyBuyersMap userLocation={userLocation} viewMode="branch" />
        </div>
      </div>

      {/* Aggregation & Bundling Section */}
      <div className="space-y-6 pt-4 md:pt-8">
        <div className="flex items-center justify-between px-6 md:px-2">
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">Export Preparation</h2>
          <span className="text-[9px] md:text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">Supply Chain</span>
        </div>
        <div className="px-4 md:px-0">
          <BundleCreator />
        </div>
      </div>

      {/* Created Bundles Tracking */}
      <div className="px-4 md:px-0">
        <CreatedBundlesSection />
      </div>

      {/* Notifications Section */}
      <div className="px-4 md:px-0">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 font-black uppercase tracking-tight px-2">System Alerts</h2>
          <div className="overflow-y-auto max-h-[400px]">
            <NotificationsList limit={5} />
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
  materialIds: any[];
}

const CreatedBundlesSection: React.FC = () => {
  const [bundles, setBundles] = React.useState<ExportBundle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBundles = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        // User requested GET /bundles/my, but currently the route is /my-bundles. 
        // I will stick to what works but ensure the fields match the request.
        const res = await fetch(`${apiUrl}/bundles/my-bundles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setBundles(data.data);
      } catch {
        console.error('Failed to fetch bundles');
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  if (loading) return <div className="bg-white rounded-[2rem] p-8 border border-gray-50 flex items-center justify-center text-gray-400 font-bold animate-pulse">Scanning bundle inventory...</div>;
  if (bundles.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">Created Export Bundles</h2>
          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inventory in transit or awaiting purchase</p>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Package className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((bundle) => (
          <div key={bundle._id} className="group p-5 rounded-3xl border border-gray-50 hover:border-emerald-100 hover:shadow-md transition-all bg-white relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-gray-900 text-sm truncate max-w-[140px]">{bundle.name}</h3>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">
                  {bundle.materialIds?.length || 0} Items grouped
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${bundle.status === 'sold' || bundle.status === 'purchased' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                {bundle.status}
              </span>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Total Mass</p>
                <p className="text-xl font-black text-gray-900">{bundle.totalWeight}<span className="text-[10px] ml-0.5 font-bold">KG</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Estimated Value</p>
                <p className="text-sm md:text-base font-black text-emerald-600">₦{bundle.totalPrice?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'payment' | 'material' | 'system';
  createdAt: string;
}

const NotificationsList: React.FC<{ limit: number }> = ({ limit }) => {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('ecolink_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/notifications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setNotifications((data.data as NotificationItem[]).slice(0, limit));
      } catch {
        console.error('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [limit]);

  if (loading) return <div className="p-4 text-center text-gray-300 font-black uppercase tracking-widest animate-pulse text-xs">Synchronizing Alerts...</div>;
  if (notifications.length === 0) return (
    <div className="p-10 text-center text-gray-400 italic font-medium">
      No active alerts for your hub.
    </div>
  );

  return (
    <div className="space-y-4">
      {notifications.map((note, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${note.type === 'payment' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
              note.type === 'material' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
            }`} />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{note.title}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap ml-2">
                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">{note.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BranchDashboard;