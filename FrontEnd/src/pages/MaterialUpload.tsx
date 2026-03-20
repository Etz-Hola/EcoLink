import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, X, AlertCircle, MapPin, Loader, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const MATERIAL_TYPES = [
  { value: 'plastic', label: 'Plastic', subtypes: ['pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps', 'other'] },
  { value: 'metal', label: 'Metal', subtypes: ['aluminum', 'copper', 'steel', 'iron', 'other'] },
  { value: 'household', label: 'Paper / Organic', subtypes: ['paper', 'cardboard', 'glass', 'textile', 'other'] },
];

interface AdminDefaultPrice {
  pricePerKg: number;
  minAllowed: number;
  maxAllowed: number;
  materialType: string;
  condition: string | null;
  name: string;
} 

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

const MaterialUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    materialType: 'plastic',
    subType: 'pet',
    condition: 'clean',
    weight: '',
    description: '',
  }); 

  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [indicativePrice, setIndicativePrice] = useState<AdminDefaultPrice | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  // Get user location & indicative price on mount
  useEffect(() => {
    detectLocation();
    fetchIndicativePrice('plastic', 'clean');
  }, []);

  const fetchIndicativePrice = async (materialType: string, condition: string) => {
    setLoadingPrice(true);
    try {
      const token = localStorage.getItem('ecolink_token');
      const query = condition ? `?condition=${encodeURIComponent(condition)}` : '';
      const res = await fetch(
        `${API_URL}/pricing/defaults/${encodeURIComponent(materialType)}${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setIndicativePrice(data.data);
      } else {
        setIndicativePrice(null);
      }
    } catch {
      setIndicativePrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await res.json();
          const address = geo.display_name || 'Unknown location';
          const city = geo.address?.city || geo.address?.town || geo.address?.village || 'Lagos';
          const state = geo.address?.state || 'Lagos';

          setLocation({ lat: latitude, lng: longitude, address, city, state });
          setManualAddress(address);
        } catch {
          // If reverse geocoding fails, use coordinates
          setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, city: 'Lagos', state: 'Lagos' });
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        setLocationError('Could not get your location. Please enter it manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectedMaterialType = MATERIAL_TYPES.find(t => t.value === formData.materialType);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subtype when material changes
      ...(name === 'materialType' ? { subType: MATERIAL_TYPES.find(t => t.value === value)?.subtypes[0] || '' } : {})
    }));

    if (name === 'materialType' || name === 'condition') {
      const nextMaterial = name === 'materialType' ? value : formData.materialType;
      const nextCondition = name === 'condition' ? value : formData.condition;
      fetchIndicativePrice(nextMaterial, nextCondition);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError('Images must be smaller than 5MB');
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) {
      setError(null);
      setPhotos(prev => [...prev, ...validFiles]);
      validFiles.forEach(f => setPreviewUrls(prev => [...prev, URL.createObjectURL(f)]));
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) { setError('Please log in to upload materials'); return; }
    if (!formData.weight || parseFloat(formData.weight) <= 0) { setError('Please enter a valid weight'); return; }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('ecolink_token');
      const body = new FormData();

      // Material data
      body.append('type', formData.materialType);
      body.append('subType', formData.subType);
      body.append('quality', formData.condition);
      body.append('condition', formData.condition);
      body.append('weightKg', formData.weight);
      body.append('weight', formData.weight);
      body.append('description', formData.description);

      // Location data
      const loc = location || { lat: 6.5244, lng: 3.3792, address: manualAddress || 'Lagos', city: 'Lagos', state: 'Lagos' };
      body.append('lat', String(loc.lat));
      body.append('lng', String(loc.lng));
      body.append('address', manualAddress || loc.address);
      body.append('city', loc.city);
      body.append('state', loc.state);

      // Photos
      photos.forEach(photo => body.append('photos', photo));

      const res = await fetch(`${API_URL}/materials/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Upload failed');

      setSuccess(true);
      toast.success('Material uploaded successfully! 🎉');
      setTimeout(() => navigate('/materials'), 2000);
    } catch (err: any) {
      const msg = err.message || 'Failed to upload material';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Upload Successful!</h2>
        <p className="text-gray-500 font-medium">Redirecting you to your materials list...</p>
      </motion.div>
    );
  }

  const weightNumber = parseFloat(formData.weight || '0');
  const estimatedPayout =
    indicativePrice && weightNumber > 0
      ? indicativePrice.pricePerKg * weightNumber
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Upload Material</h1>
        <p className="text-gray-500 mt-1 font-medium">Add recyclable materials and we'll connect you with nearby collection branches.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Photos
            </h3>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · max 5MB each · up to 5 photos</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Material Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-black text-gray-900">Material Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Category *</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  {MATERIAL_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Sub-type *</label>
                <select
                  name="subType"
                  value={formData.subType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  {selectedMaterialType?.subtypes.map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingPrice && (
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                Fetching indicative admin price for this material...
              </p>
            )}
            {!loadingPrice && indicativePrice && (
              <>
                <div className="mt-2 inline-flex flex-col sm:flex-row sm:items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    Indicative admin rate
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    ₦{indicativePrice.pricePerKg.toLocaleString()}/kg
                  </span>
                  <span className="text-[10px] text-emerald-600">
                    (branches can pay between ₦{indicativePrice.minAllowed.toLocaleString()}–₦{indicativePrice.maxAllowed.toLocaleString()} per kg)
                  </span>
                </div>
                {estimatedPayout && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-bold">
                    Estimated payout: ₦{estimatedPayout.toLocaleString()} (based on your weight × admin rate)
                  </p>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Weight (kg) *</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 5.5"
                  required
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty / Contaminated</option>
                  <option value="treated">Treated</option>
                  <option value="untreated">Untreated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Description (optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional details about the material..."
                className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Pickup Location
              <span className="text-xs font-medium text-gray-400 ml-auto">Used by nearby branches to find you</span>
            </h3>

            {locationLoading ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Loader className="w-5 h-5 text-green-600 animate-spin" />
                <span className="text-sm font-medium text-green-700">Detecting your location...</span>
              </div>
            ) : locationError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-medium text-amber-700">{locationError}</p>
                <button type="button" onClick={detectLocation} className="mt-2 text-xs font-bold text-amber-600 underline">
                  Try again
                </button>
              </div>
            ) : location ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-green-700 uppercase tracking-wider">✓ Location Detected</span>
                  <button type="button" onClick={detectLocation} className="text-xs font-bold text-green-600 underline">
                    Refresh
                  </button>
                </div>
                <p className="text-sm font-medium text-green-800 line-clamp-2">{location.address}</p>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Address / Landmark</label>
              <input
                value={manualAddress}
                onChange={e => setManualAddress(e.target.value)}
                placeholder="Enter or confirm your address"
                className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1 font-medium">This helps the branch know exactly where to pick up your materials.</p>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isUploading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Material
              </>
            )}
          </motion.button>
        </div>

        {/* Tips Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <h3 className="font-black text-lg mb-4">📸 Photo Tips</h3>
            <ul className="space-y-3">
              {[
                'Take clear, well-lit photos',
                'Show material condition clearly',
                'Photograph from multiple angles',
                'Include labels or markings',
                'Group similar items together',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-black text-green-900 mb-3">💡 How It Works</h3>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Upload', desc: 'Submit your materials with photos and location' },
                { step: '2', label: 'Review', desc: 'A nearby branch reviews and accepts your listing' },
                { step: '3', label: 'Pickup', desc: 'The branch collects from your location' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="text-sm font-bold text-green-900">{s.label}</p>
                    <p className="text-xs text-green-700">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MaterialUpload;