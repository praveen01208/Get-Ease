import React, { useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { PrimaryButton } from '@/components/ui/Button';

interface Props { course: any; onUpdate: (c: any) => void; }

export const PricingStep: React.FC<Props> = ({ course, onUpdate }) => {
  const [isFree, setIsFree] = useState((course?.price || 0) === 0);
  const [price, setPrice] = useState(String(course?.price || ''));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await adminApi.updateCourse(course.id, { price: isFree ? 0 : parseFloat(price) });
    onUpdate(res.data.data);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Pricing</h2>
        <p className="text-sm text-secondary mt-1">Set access type and price.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[{ label: 'Free', sub: 'Open to everyone', val: true }, { label: 'Paid', sub: 'Requires purchase', val: false }].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => setIsFree(opt.val)}
              className={`p-4 rounded-2xl border text-left transition-all ${isFree === opt.val ? 'border-white/30 bg-white/[0.08]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'}`}
            >
              <p className="text-sm font-bold text-primary">{opt.label}</p>
              <p className="text-xs text-secondary mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>

        {!isFree && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="admin-input"
              placeholder="999"
              min="0"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/[0.06]">
        <PrimaryButton onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Pricing'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export const SEOStep: React.FC<Props> = ({ course, onUpdate }) => {
  const [form, setForm] = useState({ metaTitle: course?.metaTitle || '', metaDesc: course?.metaDesc || '', slug: course?.slug || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await adminApi.updateCourse(course.id, form);
    onUpdate(res.data.data);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">SEO</h2>
        <p className="text-sm text-secondary mt-1">Improve search engine visibility.</p>
      </div>

      <div className="space-y-5">
        {[
          { label: 'URL Slug', key: 'slug', placeholder: 'advanced-system-design', mono: true },
          { label: 'Meta Title', key: 'metaTitle', placeholder: 'Advanced System Design — Get Ease' },
          { label: 'Meta Description', key: 'metaDesc', placeholder: 'Learn advanced system design concepts...', textarea: true },
        ].map(({ label, key, placeholder, mono, textarea }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-primary">{label}</label>
            {textarea ? (
              <textarea
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="admin-input resize-none"
                rows={3}
                placeholder={placeholder}
              />
            ) : (
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className={`admin-input ${mono ? 'font-mono text-sm' : ''}`}
                placeholder={placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/[0.06]">
        <PrimaryButton onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save SEO'}
        </PrimaryButton>
      </div>
    </div>
  );
};
