import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { User, Building2, Factory, Truck } from 'lucide-react';

const RoleSelection: React.FC = () => {
    const { user, login } = useAuth(); // Assuming login updates the user state
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSelectRole = async (role: string) => {
        if (loading) return;
        setLoading(true);

        try {
            // Update role on backend
            // We need the token from localStorage or context
            const token = localStorage.getItem('token');
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users/role`,
                { role },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Update local user state via auth context if possible, or just force a reload/refetch
            // For now, we assume the backend returns the updated user and token
            if (res.data.success) {
                // If response contains updated token/user, update context
                // Otherwise, we might need to fetch user profile again

                // Temporary: dispatch a custom event or force update if useAuth doesn't have a direct 'updateUser' method
                // Ideally useAuth should expose setUser or similar. 
                // For now, we'll try to re-login or manually update if possible, 
                // but since we are just redirecting, the next page load (e.g. dashboard) should fetch fresh data.

                toast.success(`Role set to ${role}`);

                if (role === 'admin') { // Should not happen via UI
                    navigate('/admin/dashboard');
                } else if (role === 'branch') {
                    navigate('/branch');
                } else {
                    navigate('/home');
                }
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to set role');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        {
            id: 'collector',
            label: 'Individual Collector',
            icon: User,
            description: 'I want to recycle my own waste and earn rewards.'
        },
        {
            id: 'organization',
            label: 'Company / Organization',
            icon: Building2,
            description: 'We are a business or hotel managing large waste volumes.'
        },
        {
            id: 'branch',
            label: 'Processing Branch',
            icon: Factory,
            description: 'We verify and process collected materials.'
        },
        {
            id: 'buyer',
            label: 'Large Buyer / Exporter',
            icon: Truck,
            description: 'We buy processed materials in bulk.'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to EcoLink!</h1>
                    <p className="mt-2 text-gray-600">Please select your primary role to continue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role.id)}
                                disabled={loading}
                                className={`
                  relative flex flex-col items-start p-6 bg-white rounded-xl border-2 border-transparent
                  shadow-sm hover:shadow-md hover:border-green-500 transition-all text-left
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                            >
                                <div className="p-3 bg-green-50 rounded-lg mb-4">
                                    <Icon className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.label}</h3>
                                <p className="text-sm text-gray-500">{role.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
