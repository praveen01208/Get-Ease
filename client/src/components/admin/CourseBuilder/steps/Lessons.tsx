import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { VideoUploader } from '@/components/admin/upload/VideoUploader';
import { PrimaryButton } from '@/components/ui/Button';

interface Props { course: any; }

export const LessonsStep: React.FC<Props> = ({ course }) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (course?.id) {
      adminApi.getLessons(course.id).then((r) => setLessons(r.data.data));
    }
  }, [course?.id]);

  const addLesson = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await adminApi.createLesson(course.id, {
        title: newTitle,
        lessonNumber: lessons.length + 1,
        order: lessons.length,
      });
      setLessons((prev) => [...prev, res.data.data]);
      setNewTitle('');
      setExpandedId(res.data.data.id);
    } finally { setAdding(false); }
  };

  const deleteLesson = async (id: string) => {
    await adminApi.deleteLesson(course.id, id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const onVideoSaved = async (lessonId: string, videoId: string, meta: any) => {
    await adminApi.updateLesson(course.id, lessonId, {
      bunnyVideoId: videoId,
      duration: meta.duration,
      resolution: meta.resolution,
    });
    setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, bunnyVideoId: videoId, ...meta } : l));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Lessons</h2>
        <p className="text-sm text-secondary mt-1">Add, reorder, and upload video for each lesson.</p>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, i) => (
          <div key={lesson.id} className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="w-4 h-4 text-secondary/40 cursor-grab" />
              <span className="text-xs font-mono text-secondary/60 w-6">{i + 1}</span>
              <p className="flex-1 text-sm font-semibold text-primary truncate">{lesson.title}</p>
              {lesson.bunnyVideoId && (
                <span className="text-xs text-green-400 font-medium">✓ Video</span>
              )}
              <button onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)} className="text-secondary hover:text-primary p-1">
                {expandedId === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => deleteLesson(lesson.id)} className="text-secondary hover:text-red-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedId === lesson.id && (
              <div className="px-4 pb-5 pt-1 border-t border-white/[0.06] space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Description</label>
                  <textarea
                    defaultValue={lesson.description || ''}
                    onBlur={(e) => adminApi.updateLesson(course.id, lesson.id, { description: e.target.value })}
                    className="admin-input resize-none"
                    rows={2}
                    placeholder="What will students learn in this lesson?"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Lesson Video</label>
                  <VideoUploader
                    value={lesson.bunnyVideoId}
                    onChange={(vid, meta) => onVideoSaved(lesson.id, vid, meta)}
                    onClear={() => adminApi.updateLesson(course.id, lesson.id, { bunnyVideoId: null })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={lesson.isFree}
                    onChange={async (e) => {
                      const isFree = e.target.checked;
                      await adminApi.updateLesson(course.id, lesson.id, { isFree });
                      setLessons(prev => prev.map(l => ({
                        ...l,
                        isFree: l.id === lesson.id ? isFree : (isFree ? false : l.isFree)
                      })));
                    }}
                    className="rounded"
                    id={`free-${lesson.id}`}
                  />
                  <label htmlFor={`free-${lesson.id}`} className="text-sm text-secondary">Free preview lesson</label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Lesson */}
      <div className="flex gap-3">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLesson()}
          className="admin-input flex-1"
          placeholder="New lesson title..."
        />
        <PrimaryButton onClick={addLesson} disabled={adding || !newTitle.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Add Lesson
        </PrimaryButton>
      </div>
    </div>
  );
};
