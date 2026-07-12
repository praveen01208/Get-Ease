import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    adminApi.getStudents().then((r) => { setStudents(r.data.data); setTotal(r.data.meta.total); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Students</h1>
        <p className="text-secondary text-sm mt-1">{total} registered</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Name', 'Email', 'Enrolled', 'Joined'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-secondary font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-secondary py-16">No students yet.</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 font-medium text-primary">{s.name}</td>
                <td className="px-5 py-3.5 text-secondary">{s.email}</td>
                <td className="px-5 py-3.5 text-secondary">{s._count?.enrollments ?? 0} courses</td>
                <td className="px-5 py-3.5 text-secondary">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
