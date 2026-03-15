import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Chrome, Wallet, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useSignMessage } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }),
};

const ACCOUNT_TYPES = [
  {
    value: 'collector',
    label: 'Individual Collector',
    desc: 'Collect and sell recyclable materials',
    icon: '♻️',
    color: 'border-green-400 bg-green-50',
    active: 'border-green-500 bg-green-50 ring-2 ring-green-500/20',
  },
  {
    value: 'organization',
    label: 'Company / Organization / Hotel',
    desc: 'Business-level material collection',
    icon: '🏢',
    color: 'border-gray-200 bg-white',
    active: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20',
  },
  {
    value: 'branch',
    label: 'Local Branch / Aggregation Hub',
    desc: 'Accept and process materials',
    icon: '🏭',
    color: 'border-gray-200 bg-white',
    active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20',
  },
  {
    value: 'exporter',
    label: 'Final Company (Exporter / Provider)',
    desc: 'Buy and export processed materials',
    icon: '🚢',
    color: 'border-gray-200 bg-white',
    active: 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20',
  },
];

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'collector' as string,
    inviteCode: '',
    businessName: '',
  });
  const [isJoining, setIsJoining] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, googleLogin, walletLogin, getNonce } = useAuth();
  const navigate = useNavigate();
  const { isConnected, address, connect, connectors } = useWallet();
  const { signMessageAsync } = useSignMessage();
  const [showWalletList, setShowWalletList] = useState(false);

  const navigateToDashboard = (role: string) => {
    if (role === 'branch') navigate('/branch');
    else navigate('/home');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 11) setFormData(p => ({ ...p, phone: digits }));
      return;
    }
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const user = await register({
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || 'User',
        email: formData.email,
        password: formData.password,
        role: formData.role,
        username: formData.email.split('@')[0],
        inviteCode: (isJoining || ['branch', 'exporter'].includes(formData.role)) ? formData.inviteCode : undefined,
        businessName: formData.role !== 'collector' ? formData.businessName : undefined,
        businessType: formData.role, // Default business type to the role for now
      });
      toast.success('Welcome to EcoLink! 🎉');
      navigateToDashboard(user.role);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (resp) => {
      setIsLoading(true);
      setError(null);
      try {
        await googleLogin(resp.access_token, formData.role);
        toast.success('Signed up with Google!');
        navigateToDashboard(formData.role);
      } catch (err: any) {
        setError(err.message || 'Google registration failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google sign up failed'),
  });

  const handleWalletSignup = async (connector?: any) => {
    let walletAddress = address;
    setError(null);
    try {
      if (!isConnected) {
        if (!connector && connectors.length > 1) { setShowWalletList(p => !p); return; }
        const connectedAddress = await connect(connector);
        if (connectedAddress) walletAddress = connectedAddress as `0x${string}`;
        await new Promise(r => setTimeout(r, 500));
      }
      if (!walletAddress) throw new Error('No wallet address found.');
      setShowWalletList(false);
      setIsLoading(true);
      const nonce = await getNonce();
      const message = `Sign in to EcoLink\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });
      await walletLogin(walletAddress, message, signature, formData.role);
      toast.success('Signed up with Wallet!');
      navigateToDashboard(formData.role);
    } catch (err: any) {
      setError(err.message || 'Wallet registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (name: string) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none ${focusedField === name
      ? 'border-green-500 ring-4 ring-green-500/10 bg-white'
      : 'border-gray-200 hover:border-gray-300'
    }`;

  const selectedType = ACCOUNT_TYPES.find(t => t.value === formData.role)!;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col relative overflow-hidden bg-gray-950">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-green-600/10 blur-3xl" />

        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
              Start Your<br /><span className="text-green-400">Eco Journey</span>
            </h2>
            <p className="text-white/50 font-medium max-w-sm text-base leading-relaxed">
              Sign up now and join a growing network of collectors, branches and exporters building a sustainable Nigeria.
            </p>
          </motion.div>

          {/* Why join cards */}
          <div className="space-y-3 mt-10">
            {[
              { icon: '💰', title: 'Earn Real Money', body: 'Get paid market rates for your recyclables' },
              { icon: '📍', title: 'Local Pickup', body: 'Nearest branch comes to your location' },
              { icon: '🔗', title: 'On-chain Traceability', body: 'Every batch tracked transparently' },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl p-4"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="text-xs text-white/40 font-medium mt-0.5">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-10 bg-gradient-to-br from-primary-100/70 via-white to-primary-50/40">
        <div className="w-full max-w-md">

          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-400 font-medium mb-6 text-sm">Join thousands earning from recycling</p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            variants={fadeUp} custom={0.5} initial="hidden" animate="show"
            className="flex items-center gap-3 mb-6"
          >
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${step > s
                  ? 'bg-green-500 text-white'
                  : step === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs font-bold ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Account Type' : 'Your Details'}
                </span>
                {s < 2 && <div className={`w-8 h-0.5 rounded-full ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ─ Step 1: Account Type ─ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                  Choose your account type
                </p>
                <div className="space-y-3">
                  {ACCOUNT_TYPES.map((type, i) => (
                    <motion.button
                      key={type.value}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, role: type.value }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${formData.role === type.value ? type.active : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                    >
                      <span className="text-2xl flex-shrink-0">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{type.label}</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">{type.desc}</p>
                      </div>
                      {formData.role === type.value && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ─ Step 2: Personal Details ─ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Selected role chip */}
                <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-lg">{selectedType.icon}</span>
                  <div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Signing up as</p>
                    <p className="text-sm font-black text-gray-900">{selectedType.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ml-auto text-xs font-bold text-green-600 hover:text-green-700"
                  >
                    Change
                  </button>
                </div>

                {/* Organization Join Toggle */}
                {formData.role !== 'collector' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 space-y-4"
                  >
                    <div className="flex p-1 bg-gray-100/50 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setIsJoining(false)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${!isJoining ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Start New
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsJoining(true)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${isJoining ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Join Team
                      </button>
                    </div>

                    {isJoining && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Invite Code</label>
                        <input
                          name="inviteCode"
                          value={formData.inviteCode}
                          onChange={handleChange}
                          placeholder="e.g. ECO-JOIN-123"
                          required
                          className={inputCls('inviteCode')}
                        />
                        <p className="text-[10px] font-medium text-gray-400 mt-2 px-1">
                          Enter the code provided by your organization administrator.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                      {['branch', 'exporter'].includes(formData.role) ? 'Manager Full Name' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={['branch', 'exporter'].includes(formData.role) ? 'Manager Full Name' : 'Your full name'}
                        required
                        className={`${inputCls('name')} pl-10`}
                      />
                    </div>
                  </motion.div>

                  {/* Invite Code for Business Accounts (Instant Access) */}
                  {['branch', 'exporter'].includes(formData.role) && !isJoining && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
                        Invite Code (Optional - Instant Access)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="inviteCode"
                          value={formData.inviteCode}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('inviteCode')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Enter code (if you have one)"
                          required={false}
                          className={`${inputCls('inviteCode')} pl-10`}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-amber-600 px-1 leading-relaxed">
                        If you have an invite code, your account is activated instantly. Otherwise, it will require admin approval.
                      </p>
                    </motion.div>
                  )}
 
                   {/* Business Name (for non-collectors) */}
                   {formData.role !== 'collector' && !isJoining && (
                     <motion.div
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       variants={fadeUp}
                       custom={1.5}
                     >
                       <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Business / Hub Name</label>
                       <div className="relative">
                         <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">🏢</div>
                         <input
                           name="businessName"
                           value={formData.businessName}
                           onChange={handleChange}
                           onFocus={() => setFocusedField('businessName')}
                           onBlur={() => setFocusedField(null)}
                           placeholder="e.g. Lagos Central Hub"
                           required
                           className={`${inputCls('businessName')} pl-10`}
                         />
                       </div>
                     </motion.div>
                   )}

                  {/* Email */}
                  <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@email.com"
                        required
                        className={`${inputCls('email')} pl-10`}
                      />
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Phone (Optional)</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="08012345678"
                      className={inputCls('phone')}
                    />
                  </motion.div>

                  {/* Password row */}
                  <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Min 6 chars"
                          required
                          className={`${inputCls('password')} pl-10 pr-9`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Confirm</label>
                      <input
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Repeat password"
                        required
                        className={inputCls('confirmPassword')}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                    >
                      Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-60 text-sm"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Create Account <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignup()}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
                  >
                    <Chrome className="w-4 h-4 text-red-500" /> Google
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleWalletSignup()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
                    >
                      <Wallet className="w-4 h-4 text-indigo-500" /> Wallet
                    </button>
                    {showWalletList && (
                      <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-50 mb-1">Choose wallet</p>
                        {connectors.map(c => (
                          <button
                            key={c.uid}
                            type="button"
                            onClick={() => handleWalletSignup(c)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 group"
                          >
                            {c.icon && <img src={c.icon} alt={c.name} className="w-4 h-4 rounded" />}
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-400 font-medium mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-green-600 hover:text-green-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
