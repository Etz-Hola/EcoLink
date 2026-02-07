import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Chrome, Wallet, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useSignMessage } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, googleLogin, walletLogin, getNonce } = useAuth();
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  const { signMessageAsync } = useSignMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token);
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Google login failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google login failed'),
  });

  const handleWalletLogin = async () => {
    setError(null);
    try {
      if (!isConnected) {
        await connect();
        // Small delay for state sync
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsLoading(true);
      const nonce = await getNonce();
      const message = `Sign in to EcoLink\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });
      await walletLogin(address!, message, signature);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Wallet authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back to EcoLink
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your sustainable journey
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
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-green-600 hover:text-green-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="py-3 rounded-xl shadow-lg shadow-green-200"
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center md:hidden lg:flex"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative px-4 text-xs text-gray-400 bg-white font-bold uppercase tracking-widest">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleGoogleLogin()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all font-semibold text-gray-700 shadow-sm"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Google
            </button>
            <button
              onClick={handleWalletLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all font-semibold text-gray-700 shadow-sm"
            >
              <Wallet className="w-5 h-5 text-blue-500" />
              Wallet
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-gray-500 text-sm">Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-green-600 hover:text-green-500 text-sm"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
