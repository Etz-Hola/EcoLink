import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Phone, Eye, EyeOff, Chrome, Wallet, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useSignMessage } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import Input from '../common/Input';
import Button from '../common/Button';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'collector' as 'collector' | 'branch'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, googleLogin, walletLogin, getNonce } = useAuth();
  const navigate = useNavigate();
  const { isConnected, address, connect } = useWallet();
  const { signMessageAsync } = useSignMessage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || 'User',
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        username: formData.email.split('@')[0]
      });
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token, formData.role);
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Google registration failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google sign up failed'),
  });

  const handleWalletSignup = async () => {
    setError(null);
    try {
      if (!isConnected) {
        await connect();
        // Small delay to ensure Wagmi state is synced
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsLoading(true);
      const nonce = await getNonce();
      const message = `Sign in to EcoLink\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });
      await walletLogin(address!, message, signature, formData.role);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Wallet registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join EcoLink Today
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your sustainable recycling journey
          </p>
        </div>

        <div className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  leftIcon={<UserIcon className="h-4 w-4" />}
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                leftIcon={<Phone className="h-4 w-4" />}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 py-3 px-4 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-medium"
                  required
                >
                  <option value="collector">Individual Collector</option>
                  <option value="branch">Branch/Organization</option>
                </select>
              </div>

              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-600 font-medium font-medium">
                I agree to the <Link to="/terms" className="text-green-600 hover:text-green-500 font-bold">Terms</Link> and <Link to="/privacy" className="text-green-600 hover:text-green-500 font-bold">Privacy</Link>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="py-3 rounded-xl shadow-lg shadow-green-200"
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center md:hidden lg:flex"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative px-4 text-xs text-gray-400 bg-white font-bold uppercase tracking-widest">or sign up with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleGoogleSignup()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all font-semibold text-gray-700 shadow-sm"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Google
            </button>
            <button
              onClick={handleWalletSignup}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all font-semibold text-gray-700 shadow-sm"
            >
              <Wallet className="w-5 h-5 text-blue-500" />
              Wallet
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-green-600 hover:text-green-500 text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
