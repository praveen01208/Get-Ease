import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { PrimaryButton } from '@/components/ui/Button';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getCategories().then((r) => setCategories(r.data.data));
  useEffect(() => { load(); }, []);

  const handleNameChange = (name: string) => {
    setForm((p) => ({ ...p, name, slug: editing ? p.slug : slugify(name) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await adminApi.updateCategory(editing, form);
      else await adminApi.createCategory(form);
      setForm({ name: '', slug: '', description: '' });
      setEditing(null);
      load();
    } finally { setSaving(false); }
  };

  const editCat = (c: any) => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description || '' }); };
  const deleteCat = async (id: string) => { await adminApi.deleteCategory(id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Categories</h1>

      {/* Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-primary">{editing ? 'Edit Category' : 'New Category'}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary">Name</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="admin-input" placeholder="Web Development" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary">Slug</label>
            <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="admin-input font-mono text-sm" placeholder="web-development" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-secondary">Description</label>
          <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="admin-input" placeholder="Optional description" />
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={save} disabled={saving || !form.name || !form.slug} className="rounded-xl">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create Category'}
          </PrimaryButton>
          {editing && <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '' }); }} className="text-secondary hover:text-primary text-sm">Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Name', 'Slug', 'Courses', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-secondary font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-secondary py-12">No categories yet.</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 font-medium text-primary">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-secondary">{c.slug}</td>
                <td className="px-5 py-3.5 text-secondary">{c._count?.courses ?? 0}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => editCat(c)} className="text-secondary hover:text-primary p-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteCat(c.id)} className="text-secondary hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
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
