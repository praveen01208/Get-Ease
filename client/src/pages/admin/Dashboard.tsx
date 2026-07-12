import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, BarChart3, Plus } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { StatsCard } from '@/components/admin/StatsCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PrimaryButton } from '@/components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getOverview().then((r) => setStats(r.data.data));
    adminApi.getCourses({ limit: 5 }).then((r) => setCourses(r.data.data));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary text-sm mt-1">Overview of your LMS.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/courses/new/edit')} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </PrimaryButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats?.totalStudents ?? '—'} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="Total Courses" value={stats?.totalCourses ?? '—'} icon={<BookOpen className="w-5 h-5" />} />
        <StatsCard title="Enrollments" value={stats?.totalEnrollments ?? '—'} icon={<GraduationCap className="w-5 h-5" />} />
        <StatsCard title="Published" value={stats?.publishedCourses ?? '—'} icon={<BarChart3 className="w-5 h-5" />} />
      </div>

      {/* Recent Courses */}
      <div>
        <h2 className="text-base font-semibold text-primary mb-4">Recent Courses</h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-secondary font-medium text-xs">Title</th>
                <th className="text-left px-5 py-3.5 text-secondary font-medium text-xs">Category</th>
                <th className="text-left px-5 py-3.5 text-secondary font-medium text-xs">Lessons</th>
                <th className="text-left px-5 py-3.5 text-secondary font-medium text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-secondary py-12">No courses yet.</td></tr>
              ) : courses.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/courses/${c.id}/edit`)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-primary truncate max-w-xs">{c.title}</td>
                  <td className="px-5 py-3.5 text-secondary">{c.category?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-secondary">{c._count?.lessons ?? 0}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
