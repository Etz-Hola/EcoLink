import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, Settings, Wallet, ChevronDown, Search } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected, address, disconnect, connect } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  // Track scroll for subtle shadow lift
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    if (isConnected) disconnect();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Account';

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-sm font-semibold transition-all duration-200 rounded-lg ${isActive(to)
        ? 'text-white bg-white/10'
        : 'text-white/70 hover:text-white hover:bg-white/8'
        }`}
    >
      {children}
      {isActive(to) && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
      )}
    </Link>
  );

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/20'
          : 'bg-gray-950'
          }`}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-shadow">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-xl text-white tracking-tight hidden sm:inline">
                Eco<span className="text-green-400">Link</span>
              </span>
            </Link>

            {/* Admin Search Bar (Visible for admins only) */}
            {user?.role === 'admin' && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/30 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-medium"
                    placeholder="Search users, branches, materials..."
                  />
                </div>
              </div>
            )}

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <NavLink to="/home">Dashboard</NavLink>
                  <NavLink to="/materials">Materials</NavLink>
                  <NavLink to="/logistics">Logistics</NavLink>

                  {/* Profile dropdown */}
                  <div className="relative ml-3" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/8 border border-white/10 hover:bg-white/14 hover:border-white/20 text-sm font-bold text-white transition-all duration-200"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-[10px] font-black">{firstName.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="max-w-[90px] truncate">{firstName}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                        {/* User info */}
                        <div className="px-4 py-3.5 border-b border-white/8">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-black text-sm">{firstName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white truncate">{user.name || firstName}</p>
                              <p className="text-xs text-white/40 font-medium truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                          {isConnected && (
                            <div className="mt-2.5 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-xs text-green-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                            </div>
                          )}
                        </div>

                        <div className="py-1.5">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 text-white/40" />
                            Profile Settings
                          </Link>
                          {!isConnected && (
                            <button
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 transition-colors text-left"
                              onClick={() => { connect(); setIsProfileMenuOpen(false); }}
                            >
                              <Wallet className="h-4 w-4 text-white/40" />
                              Connect Wallet
                            </button>
                          )}
                        </div>

                        <div className="border-t border-white/8 py-1.5">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  {!isConnected && (
                    <button
                      onClick={connect}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
                    >
                      <Wallet className="h-4 w-4" />
                      <span className="hidden lg:inline">Wallet</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-px"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-white/8">
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  {/* User info row */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white/5 rounded-xl border border-white/8">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm">{firstName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{user.name || firstName}</p>
                      <p className="text-[11px] text-white/40 font-medium">{user.email}</p>
                    </div>
                  </div>

                  {[
                    { to: '/home', label: 'Dashboard' },
                    { to: '/materials', label: 'Materials' },
                    { to: '/logistics', label: 'Logistics' },
                    { to: '/profile', label: 'Profile Settings' },
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${isActive(link.to)
                        ? 'bg-green-500/15 text-green-400'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="pt-2 border-t border-white/8 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-3 text-sm font-bold text-white/80 border border-white/15 rounded-xl hover:bg-white/8 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/20"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;