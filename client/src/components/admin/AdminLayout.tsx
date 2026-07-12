import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

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
  const isBuilderPage = pathname.includes('/admin/courses/') && !pathname.endsWith('/admin/courses');
  const crumb = breadcrumbs[pathname] || (isBuilderPage ? 'Course Builder' : 'Admin');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center px-8 border-b border-white/[0.06] bg-background/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-secondary">Admin</span>
            {crumb !== 'Dashboard' && (
              <>
                <span className="text-white/20">/</span>
                <span className="text-primary font-medium">{crumb}</span>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
