import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Package, Truck, BarChart3, Users,
  Settings, Leaf, Upload, MapPin, FileText, ChevronRight, Wallet
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isCollector = ['collector', 'organization', 'hotel', 'exporter', 'buyer'].includes(user?.role || '');
  const isBranch = user?.role === 'branch';
  const isAdmin = user?.role === 'admin';

  const navigation: SidebarItem[] = [
    { name: 'Dashboard', href: '/home', icon: Home },
    ...(isCollector ? [
      { name: 'Upload Material', href: '/materials/upload', icon: Upload },
      { name: 'My Materials', href: '/materials', icon: Package },
    ] : []),
    ...(isBranch ? [
      { name: 'Pending Materials', href: '/branch', icon: FileText },
    ] : []),
    { name: 'Logistics', href: '/logistics', icon: Truck },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Nearby Branches', href: '/branches', icon: MapPin },
    { name: 'Profile', href: '/profile', icon: Settings },
  ];

  const adminNavigation: SidebarItem[] = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Branch Management', href: '/admin/branches', icon: Settings, roles: ['admin', 'branch'] },
  ];

  const isActiveRoute = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  const renderNavItem = (nav: SidebarItem) => {
    if (nav.roles && !nav.roles.includes(user?.role || '')) return null;
    const isActive = isActiveRoute(nav.href);
    const Icon = nav.icon;

    return (
      <Link
        key={nav.name}
        to={nav.href}
        className={classNames(
          isActive
            ? 'bg-green-600 text-white shadow-sm shadow-green-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          'group flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 mx-2'
        )}
      >
        <Icon
          className={classNames(
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700',
            'mr-3 h-5 w-5 transition-colors duration-200'
          )}
        />
        {nav.name}
      </Link>
    );
  };

  const roleLabels: Record<string, string> = {
    collector: 'Individual Collector',
    organization: 'Company / Org',
    hotel: 'Hotel Hub',
    branch: 'Local Branch',
    buyer: 'Exporter / Buyer',
    exporter: 'Exporter',
    admin: 'Administrator',
    pending: 'Pending Setup',
  };

  const displayName = user?.firstName || user?.name || 'User';
  const roleLabel = roleLabels[user?.role || ''] || user?.role;

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-lg text-gray-900">EcoLink</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto py-4">
            <nav className="flex-1 space-y-1">
              {navigation.map(renderNavItem)}

              {/* Admin/Branch specific items */}
              {(isAdmin || isBranch) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="px-6 mb-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</h3>
                  </div>
                  {adminNavigation.map(renderNavItem)}
                </div>
              )}
            </nav>
          </div>

          {/* User info at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-black text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{roleLabel}</p>
              </div>
              <Link to="/profile">
                <ChevronRight className="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;