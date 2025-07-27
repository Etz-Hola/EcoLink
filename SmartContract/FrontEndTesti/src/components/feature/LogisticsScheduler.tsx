import React, { useState } from 'react';
import { Calendar, MapPin, Truck, Clock } from 'lucide-react';
import { LogisticsRequest } from '../../types';
import { formatPrice, formatDate } from '../../utils/helpers';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface LogisticsSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  onSchedule: (request: Omit<LogisticsRequest, 'id'>) => void;
}

const LogisticsScheduler: React.FC<LogisticsSchedulerProps> = ({
  isOpen,
  onClose,
  materialId,
  onSchedule
}) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock logistics options
  const logisticsOptions = [
    { id: 'standard', name: 'Standard Pickup', cost: 500, duration: '2-3 days' },
    { id: 'express', name: 'Express Pickup', cost: 800, duration: '1-2 days' },
    { id: 'same-day', name: 'Same Day Pickup', cost: 1200, duration: 'Same day' }
  ];

  const [selectedOption, setSelectedOption] = useState(logisticsOptions[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const request: Omit<LogisticsRequest, 'id'> = {
        materialId,
        pickupLocation,
        dropoffLocation,
        scheduledDate: new Date(`${scheduledDate}T${scheduledTime}`),
        status: 'pending',
        cost: selectedOption.cost,
        estimatedDuration: parseInt(selectedOption.duration)
      };

      onSchedule(request);
      onClose();
      
      // Reset form
      setPickupLocation('');
      setDropoffLocation('');
      setScheduledDate('');
      setScheduledTime('');
    } catch (error) {
      console.error('Error scheduling logistics:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Logistics"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <Input
          label="Pickup Location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          placeholder="Enter pickup address"
          required
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Dropoff Location */}
        <Input
          label="Drop-off Location"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          placeholder="Enter drop-off address"
          required
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Pickup Date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
            leftIcon={<Calendar className="h-4 w-4" />}
            min={new Date().toISOString().split('T')[0]}
          />
          
          <Input
            type="time"
            label="Pickup Time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
            leftIcon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Logistics Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Option
          </label>
          
          {logisticsOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedOption.id === option.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedOption.id === option.id}
                      onChange={() => setSelectedOption(option)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label className="ml-2 font-medium text-gray-900">
                      {option.name}
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    Estimated delivery: {option.duration}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatPrice(option.cost)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Logistics Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{selectedOption.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-medium">{formatPrice(selectedOption.cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Duration:</span>
              <span className="font-medium">{selectedOption.duration}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1"
            leftIcon={<Truck className="h-4 w-4" />}
          >
            Schedule Pickup
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogisticsScheduler;