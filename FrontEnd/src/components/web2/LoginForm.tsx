import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Chrome, Wallet, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useSignMessage } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }),
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { login, googleLogin, walletLogin, getNonce } = useAuth();
  const navigate = useNavigate();
  const { address, isConnected, connect, connectors } = useWallet();
  const { signMessageAsync } = useSignMessage();
  const [showWalletList, setShowWalletList] = useState(false);

  const navigateToDashboard = (role: string) => {
    if (role === 'branch') navigate('/branch');
    else navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      const userData = JSON.parse(localStorage.getItem('ecolink_user') || '{}');
      toast.success('Welcome back! 👋');
      navigateToDashboard(userData.role);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (resp) => {
      setIsLoading(true);
      setError(null);
      try {
        await googleLogin(resp.access_token);
        const userData = JSON.parse(localStorage.getItem('ecolink_user') || '{}');
        toast.success('Logged in with Google!');
        navigateToDashboard(userData.role);
      } catch (err: any) {
        setError(err.message || 'Google login failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google login failed'),
  });

  const handleWalletLogin = async (connector?: any) => {
    setError(null);
    try {
      if (!isConnected) {
        if (!connector && connectors.length > 1) { setShowWalletList(p => !p); return; }
        await connect(connector);
        await new Promise(r => setTimeout(r, 500));
      }
      setShowWalletList(false);
      setIsLoading(true);
      const nonce = await getNonce();
      const message = `Sign in to EcoLink\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });
      await walletLogin(address!, message, signature);
      const userData = JSON.parse(localStorage.getItem('ecolink_user') || '{}');
      navigateToDashboard(userData.role);
    } catch (err: any) {
      setError(err.message || 'Wallet authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (name: string) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none ${focusedField === name
      ? 'border-green-500 ring-4 ring-green-500/10 bg-white'
      : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col relative overflow-hidden bg-gray-950">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-green-600/10 blur-3xl" />

        {/* Main copy - Centered vertically since logo is gone */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Sustainable Recycling</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
              Turn Waste<br />Into <span className="text-green-400">Wealth</span>
            </h2>
            <p className="text-white/50 font-medium leading-relaxed max-w-sm text-base">
              Join thousands of collectors across Nigeria earning money while building a cleaner future.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            {[
              { num: '2M+', label: 'Tons recovered' },
              { num: '₦800', label: 'Avg. PET/kg price' },
              { num: '5,200+', label: 'Active collectors' },
              { num: '100%', label: 'On-chain tracking' },
            ].map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white/5 border border-white/8 rounded-xl p-4"
              >
                <p className="text-2xl font-black text-green-400">{s.num}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
        <div className="w-full max-w-md">

          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-400 font-medium mb-8 text-sm">Sign in to continue your journey</p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@email.com"
                  required
                  className={`${inputCls('email')} pl-10`}
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-green-600 hover:text-green-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  className={`${inputCls('password')} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 accent-green-600 rounded"
              />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">Remember me</label>
            </motion.div>

            <motion.button
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                or continue with
              </span>
            </div>
          </motion.div>

          {/* Social buttons */}
          <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGoogleLogin()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
            >
              <Chrome className="w-4 h-4 text-red-500" /> Google
            </button>

            <div className="relative">
              <button
                onClick={() => handleWalletLogin()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
              >
                <Wallet className="w-4 h-4 text-indigo-500" /> Wallet
              </button>
              {showWalletList && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-50 mb-1">
                    Choose wallet
                  </p>
                  {connectors.map(c => (
                    <button
                      key={c.uid}
                      onClick={() => handleWalletLogin(c)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-all group"
                    >
                      {c.icon && <img src={c.icon} alt={c.name} className="w-4 h-4 rounded" />}
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={7}
            initial="hidden"
            animate="show"
            className="text-center text-sm text-gray-400 font-medium mt-8"
          >
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-green-600 hover:text-green-700 transition-colors">
              Sign up free
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
