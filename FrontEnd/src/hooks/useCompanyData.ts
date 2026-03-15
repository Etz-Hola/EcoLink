import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

interface CompanyData {
  _id: string;
  name: string;
  balance: number;
  status: string;
  isVerified: boolean;
}

export const useCompanyData = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'exporter') return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('ecolink_token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_URL}/companies/my-company`, { headers });

      if (response.data.success) {
        setCompany(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.response?.data?.message || 'Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  }, [API_URL, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    company,
    balance: company?.balance || 0,
    loading,
    error,
    refreshData: fetchData
  };
};
