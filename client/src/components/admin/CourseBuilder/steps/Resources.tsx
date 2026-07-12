import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { FileUploader } from '@/components/admin/upload/FileUploader';
import { PrimaryButton } from '@/components/ui/Button';

interface Props { course: any; }

export const ResourcesStep: React.FC<Props> = ({ course }) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (course?.id) {
      adminApi.getLessons(course.id).then((r) => {
        setLessons(r.data.data);
        if (r.data.data.length > 0) setSelectedLesson(r.data.data[0].id);
      });
    }
  }, [course?.id]);

  const currentLesson = lessons.find((l) => l.id === selectedLesson);

  const onFileUploaded = async (result: any) => {
    if (!selectedLesson) return;
    await adminApi.addResource(course.id, selectedLesson, {
      title: result.originalFilename,
      type: result.mimeType.includes('pdf') ? 'PDF' : result.mimeType.includes('zip') ? 'ZIP' : 'FILE',
      url: result.url,
      storageProvider: result.storageProvider,
      storageKey: result.storageKey,
      originalFilename: result.originalFilename,
      mimeType: result.mimeType,
      fileSize: result.fileSize,
    });
    adminApi.getLessons(course.id).then((r) => setLessons(r.data.data));
  };

  const addLink = async () => {
    if (!selectedLesson || !linkTitle || !linkUrl) return;
    await adminApi.addResource(course.id, selectedLesson, {
      title: linkTitle,
      type: 'LINK',
      url: linkUrl,
      storageProvider: 'EXTERNAL',
    });
    setLinkTitle('');
    setLinkUrl('');
    adminApi.getLessons(course.id).then((r) => setLessons(r.data.data));
  };

  const deleteResource = async (resourceId: string) => {
    await adminApi.deleteResource(course.id, resourceId);
    adminApi.getLessons(course.id).then((r) => setLessons(r.data.data));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Resources</h2>
        <p className="text-sm text-secondary mt-1">Attach files and links to each lesson.</p>
      </div>

      {lessons.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-secondary">Add lessons first to attach resources.</p>
        </div>
      ) : (
        <>
          {/* Lesson Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary">Select Lesson</label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="admin-input"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.lessonNumber || l.order + 1}. {l.title}</option>
              ))}
            </select>
          </div>

          {/* Existing Resources */}
          {currentLesson?.resources?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Attached Resources</p>
              {currentLesson.resources.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 glass-card rounded-xl">
                  <span className="text-xs font-mono bg-white/[0.06] px-2 py-0.5 rounded text-secondary">{r.type}</span>
                  <p className="flex-1 text-sm text-primary truncate">{r.title}</p>
                  {r.fileSize && <span className="text-xs text-secondary">{(r.fileSize / 1024 / 1024).toFixed(1)} MB</span>}
                  <button onClick={() => deleteResource(r.id)} className="text-secondary hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload File */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Upload File</p>
            <FileUploader
              accept=".pdf,.zip,.docx,.xlsx,.pptx"
              folder="lesson-resources"
              label="Drop PDF, ZIP, or document"
              onUploaded={onFileUploaded}
            />
          </div>

          {/* Add Link */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Add External Link</p>
            <div className="flex gap-2">
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="admin-input flex-1"
                placeholder="Link title"
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="admin-input flex-1"
                placeholder="https://..."
              />
              <PrimaryButton onClick={addLink} disabled={!linkTitle || !linkUrl}>
                <Plus className="w-4 h-4" />
              </PrimaryButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
