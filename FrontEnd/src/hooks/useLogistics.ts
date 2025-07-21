import { useState, useCallback } from 'react';
import { LogisticsRequest } from '../types';

export const useLogistics = () => {
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLogisticsRequest = useCallback(async (requestData: Omit<LogisticsRequest, 'id'>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual implementation
      const newRequest: LogisticsRequest = {
        ...requestData,
        id: `LOG-${Date.now()}`
      };

      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create logistics request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRequestStatus = useCallback(async (requestId: string, status: LogisticsRequest['status']) => {
    setIsLoading(true);
    try {
      setRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status }
            : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRequestsByStatus = useCallback((status: LogisticsRequest['status']) => {
    return requests.filter(request => request.status === status);
  }, [requests]);

  const calculateLogisticsCost = useCallback((weight: number, distance: number, serviceType: 'standard' | 'express' | 'same-day' = 'standard') => {
    const baseRates = {
      standard: 50,
      express: 80,
      'same-day': 120
    };

    const baseCost = weight * baseRates[serviceType];
    const distanceCost = distance * 10; // ₦10 per km
    
    return baseCost + distanceCost;
  }, []);

  return {
    requests,
    isLoading,
    error,
    createLogisticsRequest,
    updateRequestStatus,
    getRequestsByStatus,
    calculateLogisticsCost
  };
};