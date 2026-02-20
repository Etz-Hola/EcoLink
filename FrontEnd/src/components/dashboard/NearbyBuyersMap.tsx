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

interface Buyer {
    id: string;
    name: string;
    type: 'branch' | 'organization' | 'buyer';
    lat: number;
    lng: number;
    distance?: number;
    buyPricePerKg?: number;
    materialFocus?: string;
}

interface NearbyBuyersMapProps {
    userLocation: { lat: number; lng: number } | null;
    radiusKm?: number; // default 50
}

export default function NearbyBuyersMap({
    userLocation,
    radiusKm = 50,
}: NearbyBuyersMapProps) {
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userLocation) return;

        const fetchNearbyBuyers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('ecolink_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

                const res = await fetch(
                    `${apiUrl}/branches/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radiusKm}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) throw new Error('Failed to load nearby buyers');

                const data = await res.json();
                setBuyers(data.success ? (data.data || []) : []);
            } catch (err: any) {
                setError(err.message);
                toast.error('Could not load nearby buyers');
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyBuyers();
    }, [userLocation, radiusKm]);

    if (!userLocation) {
        return (
            <div className="h-96 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Please enable location access to see nearby buyers</p>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl relative z-0">
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Scanning Area...</p>
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

                {/* User's location */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                        <div className="p-2 text-center">
                            <p className="font-bold text-gray-900">Your Location</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Nearby buyers */}
                {buyers.map((buyer) => (
                    <Marker
                        key={buyer.id}
                        position={[buyer.lat, buyer.lng]}
                        icon={L.divIcon({
                            className: 'custom-marker',
                            html: `<div class="bg-green-600 text-white p-1 rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-4 border-white transform hover:scale-110 transition-transform">
                <span class="font-black text-xs">${buyer.type.charAt(0).toUpperCase()}</span>
              </div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                        })}
                    >
                        <Popup className="custom-popup">
                            <div className="min-w-[220px] p-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {buyer.type}
                                    </span>
                                </div>
                                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{buyer.name}</h3>
                                {buyer.distance && (
                                    <p className="text-xs text-gray-500 font-bold mb-3 flex items-center gap-1">
                                        📍 ≈ {buyer.distance.toFixed(1)} km away
                                    </p>
                                )}

                                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                                    {buyer.buyPricePerKg && (
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Avg Pay</span>
                                            <span className="text-sm font-black text-green-600">₦{buyer.buyPricePerKg.toLocaleString()}/kg</span>
                                        </div>
                                    )}
                                    {buyer.materialFocus && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Accepting</span>
                                            <span className="text-sm font-bold text-gray-700">{buyer.materialFocus}</span>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-green-600 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-200">
                                    Send Request
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-50 border-2 border-red-100 text-red-700 px-6 py-4 rounded-3xl shadow-xl z-[1000] animate-in slide-in-from-bottom-2">
                    <p className="text-sm font-bold flex items-center gap-2">
                        ⚠️ {error}
                    </p>
                </div>
            )}
        </div>
    );
}
