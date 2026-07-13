import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, X, Loader2 } from 'lucide-react';
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
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailFile = async (file: File) => {
    setUploadingThumb(true);
    setThumbProgress(0);
    try {
      const result = await adminApi.uploadFile(file, 'thumbnails', setThumbProgress);
      setField('thumbnail', result.url);
    } catch {
      setError('Thumbnail upload failed. Please try again.');
    } finally {
      setUploadingThumb(false);
    }
  };

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

        <Field label="Course Thumbnail">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleThumbnailFile(e.target.files[0])}
          />

          {form.thumbnail && !uploadingThumb ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/[0.08] group">
              <img src={form.thumbnail} alt="Course thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 h-9 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-primary backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setField('thumbnail', '')}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-primary backdrop-blur-md hover:bg-red-500/30 hover:border-red-500/40 transition-colors flex items-center justify-center"
                  aria-label="Remove thumbnail"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => !uploadingThumb && fileInputRef.current?.click()}
              disabled={uploadingThumb}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center gap-2.5 text-center px-6"
            >
              {uploadingThumb ? (
                <>
                  <Loader2 className="w-6 h-6 text-primary/60 animate-spin" />
                  <p className="text-sm font-semibold text-primary">Uploading… {thumbProgress}%</p>
                </>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary/60" />
                  </div>
                  <p className="text-sm font-semibold text-primary">Click to upload a cover photo</p>
                  <p className="text-xs text-secondary">PNG, JPG or WEBP · 16:9 recommended</p>
                </>
              )}
            </button>
          )}
        </Field>
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
