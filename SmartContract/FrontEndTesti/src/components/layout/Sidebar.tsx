import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Truck,
  BarChart3,
  Users,
  Settings,
  Leaf,
  Upload,
  MapPin
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

  const navigation: SidebarItem[] = [
    { name: 'Dashboard', href: '/home', icon: Home },
    { name: 'Upload Material', href: '/materials/upload', icon: Upload },
    { name: 'My Materials', href: '/materials', icon: Package },
    { name: 'Logistics', href: '/logistics', icon: Truck },
    { name: 'Nearby Branches', href: '/branches', icon: MapPin },
  ];

  const adminNavigation: SidebarItem[] = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Branch Management', href: '/admin/branches', icon: Settings, roles: ['admin', 'branch'] },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: SidebarItem) => {
    if (item.roles && !item.roles.includes(user?.role || '')) {
      return null;
    }

    const isActive = isActiveRoute(item.href);

    return (
      <Link
        key={item.name}
        to={item.href}
        className={classNames(
          isActive
            ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-green-600',
          'group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200'
        )}
      >
        <item.icon
          className={classNames(
            isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
            'mr-3 h-5 w-5 transition-colors duration-200'
          )}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-green-50 border-b border-gray-200">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="ml-2 font-bold text-lg text-gray-900">EcoLink</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 py-4">
              <div className="space-y-1">
                {navigation.map(renderNavItem)}
              </div>

              {/* Admin/Branch specific items */}
              {user && ['admin', 'branch'].includes(user.role) && (
                <div className="mt-8">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Management
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {adminNavigation.map(renderNavItem)}
                  </div>
                </div>
              )}
            </nav>

            {/* User info */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;