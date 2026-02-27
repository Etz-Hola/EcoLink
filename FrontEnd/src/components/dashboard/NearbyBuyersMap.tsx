import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapItem {
    id: string;
    name: string;
    type: 'branch' | 'organization' | 'hotel' | 'material' | 'bundle';
    lat: number;
    lng: number;
    details?: any;
}

interface NearbyBuyersMapProps {
    userLocation: { lat: number; lng: number } | null;
    radiusKm?: number;
    viewMode?: 'collector' | 'branch' | 'exporter' | 'admin';
}

export default function NearbyBuyersMap({
    userLocation,
    radiusKm = 50,
    viewMode = 'collector'
}: NearbyBuyersMapProps) {
    const [items, setItems] = useState<MapItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userLocation) return;

        const fetchMarkers = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('ecolink_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

                let endpoint = '';
                switch (viewMode) {
                    case 'collector':
                        endpoint = `${apiUrl}/branches/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radiusKm}`;
                        break;
                    case 'branch':
                        endpoint = `${apiUrl}/materials/pending?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radiusKm}`;
                        break;
                    case 'exporter':
                        endpoint = `${apiUrl}/bundles/available`;
                        break;
                    case 'admin':
                        endpoint = `${apiUrl}/admin/stats`; // We might need a specific "all markers" endpoint
                        break;
                }

                if (!endpoint) return;

                const res = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error(`Failed to load ${viewMode} data`);

                const data = await res.json();

                if (data.success) {
                    let mappedItems: MapItem[] = [];
                    if (viewMode === 'collector') {
                        mappedItems = data.data.map((b: any) => ({
                            id: b.id || b._id,
                            name: b.name || b.businessName,
                            type: b.type || 'branch',
                            lat: b.lat || (b.location?.coordinates[1]),
                            lng: b.lng || (b.location?.coordinates[0]),
                            details: b
                        }));
                    } else if (viewMode === 'branch') {
                        mappedItems = data.data.map((m: any) => ({
                            id: m._id,
                            name: m.title,
                            type: 'material',
                            lat: m.pickupLocation.coordinates[1],
                            lng: m.pickupLocation.coordinates[0],
                            details: m
                        }));
                    } else if (viewMode === 'exporter') {
                        mappedItems = data.data.map((b: any) => ({
                            id: b._id,
                            name: b.name,
                            type: 'bundle',
                            lat: b.branchId?.location?.coordinates[1] || 6.5244,
                            lng: b.branchId?.location?.coordinates[0] || 3.3792,
                            details: b
                        }));
                    }
                    setItems(mappedItems);
                }
            } catch (err: any) {
                setError(err.message);
                toast.error(`Could not load map data for ${viewMode}`);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkers();
    }, [userLocation, radiusKm, viewMode]);

    if (!userLocation) {
        return (
            <div className="h-96 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Please enable location access to see the interactive map</p>
            </div>
        );
    }

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'material': return 'bg-orange-500';
            case 'bundle': return 'bg-purple-600';
            case 'branch': return 'bg-green-600';
            default: return 'bg-blue-600';
        }
    };

    return (
        <div className="h-[500px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl relative z-0">
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Updating Map...</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={12}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                        <div className="p-2 text-center">
                            <p className="font-bold text-gray-900">Your Location</p>
                        </div>
                    </Popup>
                </Marker>

                {items.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={L.divIcon({
                            className: 'custom-marker',
                            html: `<div class="${getMarkerColor(item.type)} text-white p-1 rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-4 border-white transform hover:scale-110 transition-transform">
                <span class="font-black text-xs">${item.type.charAt(0).toUpperCase()}</span>
              </div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                        })}
                    >
                        <Popup className="custom-popup">
                            <div className="min-w-[220px] p-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 ${getMarkerColor(item.type)} text-white text-[10px] font-black uppercase tracking-widest rounded-full`}>
                                        {item.type}
                                    </span>
                                    {item.type === 'material' && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {item.details.status}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>

                                <div className="bg-gray-50 p-3 rounded-xl mb-4 text-xs">
                                    {item.type === 'material' && (
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-600">Weight: <span className="text-gray-900">{item.details.weight}kg</span></p>
                                            <p className="font-bold text-gray-600">Offered: <span className="text-green-600">₦{item.details.pricing?.offeredPrice || 'Pending'}</span></p>
                                        </div>
                                    )}
                                    {item.type === 'bundle' && (
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-600">Total Weight: <span className="text-gray-900">{item.details.totalWeight}kg</span></p>
                                            <p className="font-bold text-gray-600">Value: <span className="text-green-600">₦{item.details.totalPrice.toLocaleString()}</span></p>
                                        </div>
                                    )}
                                    {item.type === 'branch' && (
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-600">Accepts: <span className="text-gray-900">{item.details.materialFocus || 'All'}</span></p>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-green-600 transition-all text-xs font-black uppercase tracking-widest">
                                    {item.type === 'material' ? 'Review Material' : item.type === 'bundle' ? 'Purchase Bundle' : 'Contact Branch'}
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-50 border-2 border-red-100 text-red-700 px-6 py-4 rounded-3xl shadow-xl z-[1000]">
                    <p className="text-sm font-bold flex items-center gap-2">⚠️ {error}</p>
                </div>
            )}
        </div>
    );
}
