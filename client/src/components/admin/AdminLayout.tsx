import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdminSidebar, AdminSidebarContent } from './AdminSidebar';

const breadcrumbs: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/courses': 'Courses',
  '/admin/courses/new': 'New Course',
  '/admin/categories': 'Categories',
  '/admin/students': 'Students',
  '/admin/media': 'Media Library',
};

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isBuilderPage = pathname.includes('/admin/courses/') && !pathname.endsWith('/admin/courses');
  const crumb = breadcrumbs[pathname] || (isBuilderPage ? 'Course Builder' : 'Admin');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d0d] border-r border-white/[0.08] animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 p-2 rounded-xl hover:bg-white/5 text-secondary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 lg:h-16 flex items-center gap-3 px-4 lg:px-8 border-b border-white/[0.06] bg-background/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/5 text-primary shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/admin" className="lg:hidden font-bold text-primary tracking-tight shrink-0">
            Get<span className="text-white/40">Ease</span>
          </Link>
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-secondary">Admin</span>
            {crumb !== 'Dashboard' && (
              <>
                <span className="text-white/20">/</span>
                <span className="text-primary font-medium">{crumb}</span>
              </>
            )}
          </div>
          <div className="lg:hidden flex-1 min-w-0 text-sm text-primary font-medium truncate text-right">
            {crumb}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
