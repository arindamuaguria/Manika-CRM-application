import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Globe,
  Users,
  Target,
  Handshake,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Map,
  FileText,
  Building2,
  MapPin,
} from 'lucide-react';
import { cn } from '@/utils';

const adminNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    label: 'Geography',
    icon: Globe,
    children: [
      { label: 'Divisions', icon: Building2, path: '/geography/divisions' },
      { label: 'Territories', icon: Map, path: '/geography/territories' },
      { label: 'Localities', icon: MapPin, path: '/geography/localities' },
    ],
  },
  {
    label: 'CRM',
    icon: Target,
    children: [
      { label: 'Leads', icon: Users, path: '/crm/leads' },
      { label: 'Deals', icon: FileText, path: '/crm/deals' },
    ],
  },
  { label: 'Partners', icon: Handshake, path: '/partners' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Geography', 'CRM']);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <h1 className="text-lg font-bold text-white tracking-tight">Manika CRM</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-hover text-sidebar-text transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {adminNavItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.label);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      'hover:bg-sidebar-hover transition-colors',
                      collapsed && 'justify-center'
                    )}
                  >
                    <item.icon size={20} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          size={14}
                          className={cn('transition-transform', isExpanded && 'rotate-90')}
                        />
                      </>
                    )}
                  </button>
                  {isExpanded && !collapsed && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'bg-sidebar-active text-sidebar-text-active'
                                : 'hover:bg-sidebar-hover'
                            )
                          }
                        >
                          <child.icon size={16} />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-active text-sidebar-text-active'
                      : 'hover:bg-sidebar-hover',
                    collapsed && 'justify-center'
                  )
                }
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-text truncate">{user?.roles?.[0]?.name}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-sidebar-hover text-sidebar-text transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shadow-sm">
          <div>
            {/* Breadcrumb will go here */}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <Bell size={20} className="text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
