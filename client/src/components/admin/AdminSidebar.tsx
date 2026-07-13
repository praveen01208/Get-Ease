import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Users,
  Tag, Image, LogOut, ChevronRight, ArrowLeftRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/media', icon: Image, label: 'Media Library' },
  { to: '/dashboard', icon: ArrowLeftRight, label: 'Student Dashboard' },
];

export const AdminSidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <p className="text-xl font-bold text-primary tracking-tight">Get<span className="text-white/40">Ease</span></p>
        <p className="text-xs text-secondary mt-0.5">Admin CMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'bg-white/[0.08] text-primary'
                : 'text-secondary hover:bg-white/[0.04] hover:text-primary'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{user?.name}</p>
            <p className="text-xs text-secondary truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-secondary hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

// Desktop-only fixed sidebar. Mobile uses a drawer rendered from AdminLayout instead.
export const AdminSidebar: React.FC = () => (
  <aside className="hidden lg:flex w-64 shrink-0 flex-col h-full border-r border-white/[0.06] bg-[#0d0d0d]">
    <AdminSidebarContent />
  </aside>
);
