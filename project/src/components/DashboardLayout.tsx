import { NavLink, useNavigate } from 'react-router-dom';
import { type ReactNode, useState, useEffect } from 'react';
import {
  LayoutDashboard, Plus, Package, Activity, Truck, BarChart3,
  Bell, User, LogOut, Menu, X, MapPin, ShoppingBag, ClipboardList,
  Users, Home, Heart, Shield, Search, Settings, FileWarning,
  CheckCircle, Bike, PackageCheck, Award, Building2, FileText,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navByRole: Record<Role, NavItem[]> = {
  donor: [
    { to: '/donor', label: 'Overview', icon: LayoutDashboard },
    { to: '/donor/post', label: 'Post Donation', icon: Plus },
    { to: '/donor/my-donations', label: 'My Donations', icon: Package },
    { to: '/donor/active-donations', label: 'Active Donations', icon: Activity },
    { to: '/donor/pickup-requests', label: 'Pickup Requests', icon: Truck },
    { to: '/donor/impact', label: 'Impact', icon: BarChart3 },
    { to: '/donor/notifications', label: 'Notifications', icon: Bell },
    { to: '/donor/profile', label: 'Profile', icon: User },
  ],
  ngo: [
    { to: '/ngo', label: 'Overview', icon: LayoutDashboard },
    { to: '/ngo/nearby-food', label: 'Nearby Food', icon: MapPin },
    { to: '/ngo/my-claims', label: 'My Claims', icon: ClipboardList },
    { to: '/ngo/food-requests', label: 'Food Requests', icon: ShoppingBag },
    { to: '/ngo/deliveries', label: 'Deliveries', icon: Truck },
    { to: '/ngo/volunteers', label: 'Volunteers', icon: Users },
    { to: '/ngo/impact', label: 'Impact', icon: BarChart3 },
    { to: '/ngo/notifications', label: 'Notifications', icon: Bell },
    { to: '/ngo/profile', label: 'Organization Profile', icon: Building2 },
  ],
  volunteer: [
    { to: '/volunteer', label: 'Available Tasks', icon: MapPin },
    { to: '/volunteer/active', label: 'Active Task', icon: Activity },
    { to: '/volunteer/my-deliveries', label: 'My Deliveries', icon: Truck },
    { to: '/volunteer/completed', label: 'Completed Tasks', icon: CheckCircle },
    { to: '/volunteer/impact', label: 'Impact', icon: BarChart3 },
    { to: '/volunteer/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/ngos', label: 'NGOs', icon: Building2 },
    { to: '/admin/donations', label: 'Donations', icon: Package },
    { to: '/admin/deliveries', label: 'Deliveries', icon: Truck },
    { to: '/admin/volunteers', label: 'Volunteers', icon: Bike },
    { to: '/admin/verification', label: 'Verification', icon: Shield },
    { to: '/admin/reports', label: 'Reports', icon: FileWarning },
  ],
};

const roleLabels: Record<Role, string> = {
  donor: 'Donor Portal',
  ngo: 'NGO Portal',
  volunteer: 'Volunteer Portal',
  admin: 'Admin Panel',
};

const roleIcons: Record<Role, LucideIcon> = {
  donor: Heart,
  ngo: Home,
  volunteer: Bike,
  admin: Shield,
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { users, currentUserId, logout, notifications } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = users.find((u) => u.id === currentUserId);
  if (!user) return null;

  const navItems = navByRole[user.role];
  const RoleIcon = roleIcons[user.role];
  const unreadCount = notifications.filter((n) => n.userId === user.id && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-ink-100">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-glow">
          <RoleIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-ink-900 leading-none">FoodBridge</p>
          <p className="text-xs text-ink-400 mt-0.5">{roleLabels[user.role]}</p>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} color={user.avatarColor} size="md" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-ink-800 truncate">{user.name}</p>
            <p className="text-xs text-ink-400 truncate">{user.location}</p>
          </div>
        </div>
        {user.role === 'ngo' && (
          <div className="mt-2">
            <VerificationBadge status={user.verified} size="sm" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showBadge = item.label === 'Notifications' && unreadCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${user.role}` || item.to === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                    : 'text-ink-500 hover:bg-surface-3 hover:text-ink-800 border border-transparent'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-accent-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-ink-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dashboard-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-ink-100 fixed inset-y-0 left-0 z-30 flex-col">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full animate-slide-in-right shadow-float">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass-nav px-4 lg:px-8 h-16 flex items-center justify-between gap-4 border-b border-ink-100/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 hover:bg-surface-3"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search donations, NGOs, food..."
                className="w-full h-10 pl-11 pr-4 rounded-xl bg-surface-3 border border-ink-100 focus:border-brand-400 text-sm text-ink-800 placeholder:text-ink-400 transition-all outline-none focus-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to={`/${user.role}/notifications`}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 hover:bg-surface-3 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white" />
              )}
            </NavLink>
            <NavLink
              to={`/${user.role}/profile`}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-surface-3 transition-colors"
            >
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
