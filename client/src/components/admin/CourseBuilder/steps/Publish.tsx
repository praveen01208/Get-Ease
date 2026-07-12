import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';

interface Props { course: any; onUpdate: (c: any) => void; }

const STATUSES = ['DRAFT', 'PRIVATE', 'PUBLISHED', 'ARCHIVED'] as const;

const checks = (course: any) => [
  { label: 'Title set',       pass: !!course?.title },
  { label: 'Has lessons',     pass: (course?._count?.lessons ?? 0) > 0 },
  { label: 'Price configured',pass: course?.price !== undefined },
  { label: 'Slug set',        pass: !!course?.slug },
];

export const PublishStep: React.FC<Props> = ({ course, onUpdate }) => {
  const [status, setStatus] = useState(course?.status || 'DRAFT');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const save = async () => {
    setSaving(true);
    const res = await adminApi.updateCourseStatus(course.id, status);
    onUpdate(res.data.data);
    setSaving(false);
  };

  const readyChecks = checks(course);
  const allPass = readyChecks.every((c) => c.pass);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Publish</h2>
        <p className="text-sm text-secondary mt-1">Review and set the course live.</p>
      </div>

      {/* Readiness checklist */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-primary mb-1">Readiness Check</p>
        {readyChecks.map((check) => (
          <div key={check.label} className="flex items-center gap-3">
            {check.pass
              ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            }
            <span className={`text-sm ${check.pass ? 'text-primary' : 'text-secondary'}`}>{check.label}</span>
          </div>
        ))}
      </div>

      {/* Status selector */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">Course Status</p>
        <div className="grid grid-cols-2 gap-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`p-3 rounded-xl border text-left transition-all ${status === s ? 'border-white/30 bg-white/[0.08]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'}`}
            >
              <StatusBadge status={s} />
              <p className="text-xs text-secondary mt-1">
                {s === 'DRAFT' && 'Only visible to you'}
                {s === 'PRIVATE' && 'Accessible by link only'}
                {s === 'PUBLISHED' && 'Visible in course catalog'}
                {s === 'ARCHIVED' && 'Hidden, data preserved'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <SecondaryButton onClick={() => navigate('/admin/courses')} className="rounded-xl">
          Back to Courses
        </SecondaryButton>
        <PrimaryButton onClick={save} disabled={saving}>
          {saving ? 'Saving...' : `Set to ${status}`}
        </PrimaryButton>
      </div>
    </div>
  );
};
