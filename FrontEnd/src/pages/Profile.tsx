import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Wallet, Camera, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import WalletConnect from '../components/web3/WalletConnect';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isConnected, address } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    bio: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const val = value.replace(/\D/g, ''); // only digits
      if (val.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: val }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const profileStats = [
    { label: 'Materials Uploaded', value: '23' },
    { label: 'Total Earnings', value: '₦12,450' },
    { label: 'EcoPoints', value: user?.ecoPoints?.toLocaleString() || '0' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm border">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-gray-500 capitalize">
                {user?.role === 'collector' ? 'Individual Collector' :
                  user?.role === 'organization' ? 'Company / Organization' :
                    user?.role === 'branch' ? 'Local Branch' :
                      user?.role === 'buyer' ? 'Exporter / Provider' :
                        user?.role}
              </p>

              {user?.isVerified && (
                <div className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {profileStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Web3 Wallet Section */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Web3 Wallet</h4>
              {isConnected && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Connected
                </div>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Address:</span>
                  <p className="font-mono text-xs break-all">{address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setShowWalletModal(true)}
                >
                  Manage Wallet
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Connect your Web3 wallet to unlock blockchain features
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => setShowWalletModal(true)}
                  leftIcon={<Wallet className="h-4 w-4" />}
                >
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isLoading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg text-sm font-semibold">
                    +234
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="8034567890"
                    className="flex-1 block w-full rounded-none rounded-r-lg border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all py-2 px-3 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <Input
                label="Location"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<MapPin className="h-4 w-4" />}
                placeholder="City, State"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-50"
                placeholder="Tell us about yourself and your recycling goals..."
              />
            </div>
          </div>

          {/* Account Settings */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive updates about your materials and payments</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Get instant updates via SMS</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Web3 Features</h4>
                  <p className="text-sm text-gray-500">Enable blockchain-based rewards and features</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={isConnected}
                  readOnly
                />
              </div>

              <div className="pt-4">
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletConnect
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        showAsModal
      />
    </div>
  );
};

export default Profile;