import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { Material, Notification } from '../types';

interface BranchStats {
  pending: number;
  approved: number;
  delivered: number;
  rejected: number;
  processing: number;
  activeBundles: number;
  totalWeight: number;
}

interface ExportBundle {
  _id: string;
  name: string;
  totalWeight: number;
  totalPrice: number;
  status: string;
  materialIds: string[];
}

export const useBranchData = (lat?: number, lng?: number, radius: number = 50) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [verifiedMaterials, setVerifiedMaterials] = useState<Material[]>([]);
  const [bundles, setBundles] = useState<ExportBundle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const fetchData = useCallback(async () => {
    if (!user || user.status === 'pending_approval' || lat === undefined || lng === undefined) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('ecolink_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Build query for nearby pending materials
      let pendingUrl = `${API_URL}/materials/pending?status=pending`;
      if (lat && lng) {
        pendingUrl += `&lat=${lat}&lng=${lng}&radius=${radius}`;
      }

      const [statsRes, pendingRes, claimedRes, bundlesRes, notifsRes, branchRes] = await Promise.all([
        axios.get(`${API_URL}/materials/stats/branch`, { headers }),
        axios.get(pendingUrl, { headers }),
        axios.get(`${API_URL}/materials/pending?status=approved,pickup_scheduled,delivered`, { headers }),
        axios.get(`${API_URL}/bundles/my-bundles`, { headers }),
        axios.get(`${API_URL}/notifications/me`, { headers }),
        axios.get(`${API_URL}/branches/my-branch`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (pendingRes.data.success) setPendingMaterials(pendingRes.data.data);
      if (claimedRes.data.success) setVerifiedMaterials(claimedRes.data.data);
      if (bundlesRes.data.success) setBundles(bundlesRes.data.data);
      if (notifsRes.data.success) setNotifications(notifsRes.data.data);
      if (branchRes.data.success) setBalance(branchRes.data.data.balance || 0);

    } catch (err: unknown) {
      console.error('Error fetching branch data:', err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || 'Failed to sync hub data'
        : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_URL, user, lat, lng, radius]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    pendingMaterials,
    verifiedMaterials,
    bundles,
    notifications,
    balance,
    loading,
    error,
    refreshData: fetchData
  };
};
