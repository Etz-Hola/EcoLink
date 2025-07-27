import React, { useState } from 'react';
import { Truck, MapPin, Calendar, Clock, Package, Plus } from 'lucide-react';
import { useLogistics } from '../hooks/useLogistics';
import { useMaterial } from '../hooks/useMaterial';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, formatDate } from '../utils/helpers';
import Button from '../components/common/Button';
import LogisticsScheduler from '../components/feature/LogisticsScheduler';

const Logistics: React.FC = () => {
  const { user } = useAuth();
  const { materials } = useMaterial();
  const { requests, createLogisticsRequest, updateRequestStatus } = useLogistics();
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState('all');

  const userMaterials = materials.filter(m => m.uploadedBy === user?.id && m.status === 'accepted');
  
  const tabs = [
    { id: 'all', label: 'All Requests', count: requests.length },
    { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { id: 'scheduled', label: 'Scheduled', count: requests.filter(r => r.status === 'scheduled').length },
    { id: 'in_transit', label: 'In Transit', count: requests.filter(r => r.status === 'in_transit').length },
    { id: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length }
  ];

  const getFilteredRequests = () => {
    if (selectedTab === 'all') return requests;
    return requests.filter(r => r.status === selectedTab);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSchedulePickup = (materialId: string) => {
    setSelectedMaterialId(materialId);
    setShowScheduler(true);
  };

  const handleScheduleRequest = async (request: any) => {
    try {
      await createLogisticsRequest(request);
      setShowScheduler(false);
    } catch (error) {
      console.error('Failed to schedule pickup:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistics</h1>
          <p className="text-gray-600 mt-1">
            Schedule pickups and track transportation of your materials.
          </p>
        </div>
      </div>

      {/* Available Materials for Pickup */}
      {userMaterials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ready for Pickup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMaterials.slice(0, 6).map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{material.name}</h3>
                  <span className="text-green-600 font-bold">
                    {formatPrice(material.totalValue)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    <span>{material.weight} kg • {material.subcategory}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  fullWidth
                  className="mt-3"
                  leftIcon={<Truck className="h-4 w-4" />}
                  onClick={() => handleSchedulePickup(material.id)}
                >
                  Schedule Pickup
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Requests List */}
        <div className="p-6">
          {getFilteredRequests().length > 0 ? (
            <div className="space-y-4">
              {getFilteredRequests().map((request) => {
                const material = materials.find(m => m.id === request.materialId);
                return (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            {material?.name || 'Material'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-green-500" />
                            <span>From: {request.pickupLocation}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <span>To: {request.dropoffLocation}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(request.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2" />
                            <span>Cost: {formatPrice(request.cost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-2 ${
                          ['pending', 'scheduled', 'in_transit', 'completed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            ['pending', 'scheduled', 'in_transit', 'completed'].includes(request.status) ? 'bg-green-600' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm">Scheduled</span>
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${
                          ['in_transit', 'completed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            ['in_transit', 'completed'].includes(request.status) ? 'bg-green-600' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm">In Transit</span>
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${
                          request.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            request.status === 'completed' ? 'bg-green-600' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {selectedTab === 'all' ? 'logistics' : selectedTab} requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTab === 'all' 
                  ? 'Schedule your first pickup to get started.' 
                  : `No ${selectedTab.replace('_', ' ')} requests at the moment.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logistics Scheduler Modal */}
      <LogisticsScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        materialId={selectedMaterialId}
        onSchedule={handleScheduleRequest}
      />
    </div>
  );
};

export default Logistics;