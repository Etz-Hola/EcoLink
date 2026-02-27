import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, User, LogOut, Settings, Wallet, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected, address, disconnect, connect } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    if (isConnected) disconnect();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path: string) =>
    `relative px-1 py-1.5 text-sm font-semibold transition-colors duration-200 ${isActive(path)
      ? 'text-green-600'
      : 'text-gray-700 hover:text-green-600'
    }`;

  const firstName = user?.firstName || user?.name?.split(' ')[0] || user?.name || 'Account';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">EcoLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link to="/home" className={navLinkClass('/home')}>
                  Dashboard
                  {isActive('/home') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />}
                </Link>
                <Link to="/materials" className={navLinkClass('/materials')}>
                  Materials
                  {isActive('/materials') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />}
                </Link>
                <Link to="/logistics" className={navLinkClass('/logistics')}>
                  Logistics
                  {isActive('/logistics') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative ml-4" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-sm font-bold text-gray-800 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-black">{firstName.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="max-w-[100px] truncate">{firstName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-1.5 border border-gray-100 z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-black text-gray-900">{user.name || firstName}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{user.email}</p>
                        {isConnected && (
                          <p className="text-xs text-green-600 font-mono mt-1.5 bg-green-50 px-2 py-1 rounded-lg">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                          </p>
                        )}
                      </div>

                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Profile Settings
                        </Link>

                        {!isConnected && (
                          <button
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                            onClick={() => { connect(); setIsProfileMenuOpen(false); }}
                          >
                            <Wallet className="h-4 w-4 text-gray-400" />
                            Connect Wallet
                          </button>
                        )}
                      </div>

                      <div className="border-t border-gray-50 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden lg:inline">Connect Wallet</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-green-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {user ? (
              <>
                {/* User info on mobile */}
                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{firstName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{user.name || firstName}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{user.email}</p>
                  </div>
                </div>

                <Link to="/home" className="flex items-center px-3 py-2.5 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                  Dashboard
                </Link>
                <Link to="/materials" className="flex items-center px-3 py-2.5 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                  Materials
                </Link>
                <Link to="/logistics" className="flex items-center px-3 py-2.5 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                  Logistics
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                  <Settings className="h-4 w-4" /> Profile Settings
                </Link>

                <div className="pt-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full px-4 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;