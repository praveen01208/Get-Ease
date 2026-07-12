import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PrimaryButton } from '@/components/ui/Button';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const load = () => adminApi.getCourses({ search, status: statusFilter || undefined }).then((r) => setCourses(r.data.data));

  useEffect(() => { load(); }, [search, statusFilter]);

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await adminApi.deleteCourse(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Courses</h1>
          <p className="text-secondary text-sm mt-1">{courses.length} total</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/courses/new/edit')} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </PrimaryButton>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
            placeholder="Search courses..."
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input w-40">
          <option value="">All Status</option>
          {['DRAFT', 'PRIVATE', 'PUBLISHED', 'ARCHIVED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Title', 'Category', 'Price', 'Lessons', 'Students', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-secondary font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-secondary py-16">No courses found.</td></tr>
            ) : courses.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-medium text-primary max-w-[220px] truncate">{c.title}</td>
                <td className="px-5 py-4 text-secondary">{c.category?.name || '—'}</td>
                <td className="px-5 py-4 text-secondary">{c.price ? `₹${c.price}` : 'Free'}</td>
                <td className="px-5 py-4 text-secondary">{c._count?.lessons ?? 0}</td>
                <td className="px-5 py-4 text-secondary">{c._count?.enrollments ?? 0}</td>
                <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/admin/courses/${c.id}/edit`)} className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-white/[0.06] transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCourse(c.id)} className="text-secondary hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
