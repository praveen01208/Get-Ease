import React, { useState, useEffect } from 'react';
import { Image, File, Video, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { VideoUploader } from '@/components/admin/upload/VideoUploader';
import { FileUploader } from '@/components/admin/upload/FileUploader';
import { StatusBadge } from '@/components/admin/StatusBadge';

type Tab = 'video' | 'files' | 'jobs';

export const AdminMediaLibrary: React.FC = () => {
  const [tab, setTab] = useState<Tab>('video');
  const [jobs, setJobs] = useState<any[]>([]);
  const [testVideoId, setTestVideoId] = useState<string>('');

  const loadJobs = () => adminApi.getUploadJobs().then((r) => setJobs(r.data.data));

  useEffect(() => {
    if (tab === 'jobs') loadJobs();
  }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Media Library</h1>
        <p className="text-secondary text-sm mt-1">
          Currently using <span className="text-amber-400 font-semibold">Mock Storage</span>. Replace with Cloudflare R2 in Phase 5 — zero UI changes required.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
        {([['video', 'Video Upload'], ['files', 'File Upload'], ['jobs', 'Upload Jobs']] as [Tab, string][]).map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-white/[0.08] text-primary' : 'text-secondary hover:text-primary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'video' && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-primary">Test Video Upload</p>
            <p className="text-xs text-secondary">
              This uses the <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-amber-400">MockVideoUploadService</code>. 
              In Phase 4, only the service implementation changes — this UI remains identical.
            </p>
            <VideoUploader
              value={testVideoId || undefined}
              onChange={(id) => setTestVideoId(id)}
              onClear={() => setTestVideoId('')}
            />
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-primary">Test File Upload</p>
            <p className="text-xs text-secondary">
              Uses <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-amber-400">MockStorageService</code>. 
              In Phase 5, only the storage service changes — this UI remains identical.
            </p>
            <FileUploader
              folder="media-library"
              label="Upload PDF, ZIP, or document"
              onUploaded={(r) => console.log('Uploaded:', r)}
            />
          </div>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">{jobs.length} jobs</p>
            <button onClick={loadJobs} className="flex items-center gap-2 text-sm text-secondary hover:text-primary">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Type', 'File', 'Size', 'Provider ID', 'Status', 'Created'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-secondary font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-secondary py-12">No upload jobs yet.</td></tr>
                ) : jobs.map((j) => (
                  <tr key={j.id} className="border-b border-white/[0.04]">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono bg-white/[0.06] px-2 py-0.5 rounded">{j.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-primary max-w-[160px] truncate">{j.fileName || '—'}</td>
                    <td className="px-5 py-3.5 text-secondary text-xs">{j.fileSize ? `${(j.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-secondary truncate max-w-[180px]">{j.providerId || '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={j.status} /></td>
                    <td className="px-5 py-3.5 text-secondary text-xs">{new Date(j.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
