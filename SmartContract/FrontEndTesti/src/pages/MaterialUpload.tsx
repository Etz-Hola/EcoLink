import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMaterial } from '../hooks/useMaterial';
import { MATERIAL_CATEGORIES } from '../utils/constants';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PriceCalculator from '../components/feature/PriceCalculator';

const MaterialUpload: React.FC = () => {
  const { user } = useAuth();
  const { uploadMaterial, isUploading } = useMaterial();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategory: '',
    weight: 0,
    condition: 'clean' as 'clean' | 'dirty' | 'treated' | 'untreated',
    description: ''
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = MATERIAL_CATEGORIES.find(cat => cat.id === formData.categoryId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        return false;
      }
      
      if (!isValidSize) {
        setError('Images must be smaller than 5MB');
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setError(null);
      setPhotos(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => [...prev, url]);
      });
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

    if (!user) {
      setError('Please log in to upload materials');
      return;
    }

    if (photos.length === 0) {
      setError('Please add at least one photo');
      return;
    }

    if (!formData.name || !formData.categoryId || !formData.subcategory || formData.weight <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await uploadMaterial({
        ...formData,
        photos,
        uploadedBy: user.id
      });

      navigate('/materials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload material');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Material</h1>
        <p className="text-gray-600 mt-2">
          Add photos and details of your recyclable materials to get instant pricing and connect with buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-green-600 hover:text-green-500 font-medium">
                        Click to upload photos
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP up to 5MB each (max 5 photos)
                  </p>
                </div>
              </div>

              {/* Photo Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Material Name */}
            <Input
              label="Material Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Plastic Water Bottles"
              required
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Select category</option>
                {MATERIAL_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Select subcategory</option>
                  {selectedCategory.subcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Weight */}
            <Input
              type="number"
              label="Weight (kg)"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="Enter weight in kilograms"
              min="0.1"
              step="0.1"
              required
            />

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="clean">Clean</option>
                <option value="dirty">Dirty/Contaminated</option>
                <option value="treated">Treated (labels removed)</option>
                <option value="untreated">Untreated</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Additional details about the material..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isUploading}
              fullWidth
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Upload Material
            </Button>
          </form>
        </div>

        {/* Price Calculator */}
        <div className="space-y-6">
          <PriceCalculator
            initialValues={{
              materialType: formData.categoryId,
              weight: formData.weight,
              condition: formData.condition
            }}
          />

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-3">📸 Photo Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Take clear, well-lit photos from multiple angles</li>
              <li>• Show the material's condition clearly</li>
              <li>• Include any labels or markings</li>
              <li>• Group similar items together</li>
              <li>• Clean materials get better assessments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialUpload;