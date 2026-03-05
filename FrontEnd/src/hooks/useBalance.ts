import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

interface BalanceData {
    balance: number;
    currency: string;
    organizationId: string;
}

export const useBalance = () => {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    const fetchBalance = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('ecolink_token');
            const response = await axios.get(`${API_URL}/users/organization/balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setBalanceData(response.data.data);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to fetch balance');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (user) {
            fetchBalance();
        }
    }, [user, fetchBalance]);

    return {
        balance: balanceData?.balance || 0,
        currency: balanceData?.currency || 'NGN',
        loading,
        error,
        refreshBalance: fetchBalance,
        isAdmin: user?.role === 'admin' || user?.role === 'organization' || user?.role === 'branch'
    };
};
