import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { User, Building2, Factory, Truck, ChevronRight } from 'lucide-react';

const RoleSelection: React.FC = () => {
    const { user, updateUser, dispatch } = useAuth() as any; // Using any for dispatch if not in type
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelectRole = async (role: string) => {
        if (loading) return;
        setLoading(true);
        setSelectedId(role);

        try {
            const token = localStorage.getItem('ecolink_token');
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/users/role`,
                { role },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                const { user: updatedUserData, tokens } = res.data;

                // Update local storage and context state with new tokens and user
                localStorage.setItem('ecolink_token', tokens.accessToken);
                localStorage.setItem('ecolink_user', JSON.stringify(updatedUserData));

                // If the context uses a reducer, we might need a direct dispatch or a more robust updateUser
                if (dispatch) {
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user: updatedUserData, token: tokens.accessToken }
                    });
                } else {
                    updateUser(updatedUserData);
                }

                toast.success(`Welcome aboard, ${updatedUserData.firstName}!`);

                // Navigate based on new role
                if (role === 'branch') {
                    navigate('/branch');
                } else {
                    navigate('/home');
                }
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to set role');
            setSelectedId(null);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        {
            id: 'collector',
            label: 'Individual Collector',
            icon: User,
            description: 'Recycle waste from your home and earn eco-points.',
            color: 'bg-green-500'
        },
        {
            id: 'organization',
            label: 'Company / Organization',
            icon: Building2,
            description: 'Manage bulk waste for your business or hotel.',
            color: 'bg-blue-500'
        },
        {
            id: 'branch',
            label: 'Processing Branch',
            icon: Factory,
            description: 'Verify materials and manage regional recycling.',
            color: 'bg-purple-500'
        },
        {
            id: 'buyer',
            label: 'Large Buyer / Exporter',
            icon: Truck,
            description: 'Purchase processed recyclables in large quantities.',
            color: 'bg-orange-500'
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="max-w-4xl w-full relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-green-100 text-green-700 text-sm font-bold tracking-wide uppercase">
                        Configuration
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">
                        One last step...
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Tell us how you plan to use EcoLink so we can customize your experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedId === role.id;

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role.id)}
                                disabled={loading}
                                className={`
                                    group relative flex items-center p-6 bg-white rounded-2xl border-2 transition-all duration-300 text-left
                                    ${isSelected ? 'border-green-500 ring-4 ring-green-500/10' : 'border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-1'}
                                    ${loading && !isSelected ? 'opacity-50 grayscale' : ''}
                                `}
                            >
                                <div className={`p-4 rounded-xl ${role.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="ml-5 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                            {role.label}
                                        </h3>
                                        <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all ${isSelected ? 'text-green-500' : ''}`} />
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {role.description}
                                    </p>
                                </div>

                                {loading && isSelected && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-12 text-center text-sm text-gray-400 font-medium">
                    Choosing a role will grant you access to specialized tools and rewards.
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;
