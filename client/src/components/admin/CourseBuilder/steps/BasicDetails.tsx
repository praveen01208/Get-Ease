import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';
import { PrimaryButton } from '@/components/ui/Button';

interface Props { course: any; onSaved: (c: any) => void; onUpdate: (c: any) => void; }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const BasicDetails: React.FC<Props> = ({ course, onSaved, onUpdate }) => {
  const [form, setForm] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    categoryId: course?.categoryId || '',
    thumbnail: course?.thumbnail || '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getCategories().then((r) => setCategories(r.data.data));
  }, []);

  const setField = (field: string, val: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'title' && !course?.id) next.slug = slugify(val);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (course?.id) {
        const res = await adminApi.updateCourse(course.id, form);
        onUpdate(res.data.data);
      } else {
        const res = await adminApi.createCourse(form as any);
        onSaved(res.data.data);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Basic Details</h2>
        <p className="text-sm text-secondary mt-1">Set the core information for your course.</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      <div className="space-y-5">
        <Field label="Course Title">
          <input
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="admin-input"
            placeholder="e.g. Advanced System Design"
          />
        </Field>

        <Field label="Slug">
          <input
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
            className="admin-input font-mono text-sm"
            placeholder="advanced-system-design"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="admin-input resize-none"
            rows={5}
            placeholder="What will students learn?"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
              className="admin-input"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Thumbnail URL">
            <input
              value={form.thumbnail}
              onChange={(e) => setField('thumbnail', e.target.value)}
              className="admin-input"
              placeholder="https://..."
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/[0.06]">
        <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.slug}>
          {saving ? 'Saving...' : course?.id ? 'Save Changes' : 'Create Course & Continue'}
        </PrimaryButton>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-primary">{label}</label>
    {children}
  </div>
);
