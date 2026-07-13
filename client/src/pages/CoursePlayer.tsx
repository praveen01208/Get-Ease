import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Menu, Search, FileText, StickyNote, Download,
  MessagesSquare, BookOpen, X,
} from 'lucide-react';
import { studentApi } from '@/lib/studentApi';
import { LessonCard } from '@/components/student/LessonCard';
import type { LessonState } from '@/components/student/LessonCard';
import { PurchaseModal } from '@/components/student/PurchaseModal';
import { ProgressRing } from '@/components/student/ProgressRing';
import { useAuthStore } from '@/store/useAuthStore';
import { addLearnedSeconds } from '@/lib/learning';
import { cn } from '@/utils/cn';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'discussion', label: 'Discussion', icon: MessagesSquare },
] as const;

export const CoursePlayer = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [lessonSearch, setLessonSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [note, setNote] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimeoutRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const noteSaveRef = useRef<any>(null);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [slug]);

  // Notes live per-lesson in localStorage (server-side notes arrive in a later phase)
  const noteKey = (lessonId: string) => `getease-note-${lessonId}`;
  useEffect(() => {
    if (currentLesson) setNote(localStorage.getItem(noteKey(currentLesson.id)) || '');
  }, [currentLesson?.id]);

  const handleNoteChange = (value: string) => {
    setNote(value);
    clearTimeout(noteSaveRef.current);
    noteSaveRef.current = setTimeout(() => {
      if (currentLesson) localStorage.setItem(noteKey(currentLesson.id), value);
    }, 400);
  };

  const fetchCourseAndProgress = async () => {
    try {
      if (!slug) return;

      const courseRes = await studentApi.getCourseBySlug(slug);
      if (courseRes.data.success) {
        const courseData = courseRes.data.data;
        setCourse(courseData);

        let progressData: any = { completedLessonIds: [], watchProgress: [], percentage: 0 };
        if (isAuthenticated && courseData.isEnrolled) {
          try {
            const p = await studentApi.getCourseProgress(courseData.id);
            if (p.data.success) progressData = p.data.data;
          } catch (e) {}
        }
        setProgress(progressData);

        // Determine which lesson to load
        const lessonIdFromUrl = searchParams.get('lessonId');
        let lessonToLoad = null;

        if (lessonIdFromUrl) {
          lessonToLoad = courseData.lessons.find((l: any) => l.id === lessonIdFromUrl);
        } else if (progressData.watchProgress?.length > 0) {
          // Auto-resume: last opened lesson
          const lastWatched = [...progressData.watchProgress].sort(
            (a: any, b: any) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
          )[0];
          lessonToLoad = courseData.lessons.find((l: any) => l.id === lastWatched.lessonId);
        }

        if (!lessonToLoad) {
          // Guests / non-enrolled land on the free preview
          lessonToLoad = courseData.isEnrolled
            ? courseData.lessons[0]
            : courseData.lessons.find((l: any) => l.isFree) || courseData.lessons[0];
        }

        if (lessonToLoad) {
          handleLessonSelect(lessonToLoad, progressData, courseData);
        }
      }
    } catch (error) {
      console.error('Failed to load course player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: any, currentProg: any = progress, currentCourse: any = course) => {
    if (lesson.isAccessible) {
      setCurrentLesson(lesson);
      lastTimeRef.current = 0;

      if (currentProg) {
        const wp = currentProg.watchProgress.find((w: any) => w.lessonId === lesson.id);
        if (wp && videoRef.current) {
          videoRef.current.dataset.resumeTime = wp.timestamp;
          videoRef.current.dataset.playbackRate = wp.playbackSpeed;
        }
      }
    } else if (!isAuthenticated) {
      // Locked + logged out → login, then come right back to this course
      navigate('/login', { state: { from: { pathname: location.pathname } } });
    } else {
      setIsPurchaseModalOpen(true);
    }
  };

  const handleVideoLoadedMetadata = (e: any) => {
    const video = e.target;
    if (video.dataset.resumeTime) {
      video.currentTime = parseFloat(video.dataset.resumeTime);
      delete video.dataset.resumeTime;
    }
    if (video.dataset.playbackRate) {
      video.playbackRate = parseFloat(video.dataset.playbackRate);
      delete video.dataset.playbackRate;
    }
    lastTimeRef.current = video.currentTime;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !currentLesson) return;

    // Count real watch time toward the daily goal (small forward deltas only)
    const delta = video.currentTime - lastTimeRef.current;
    if (delta > 0 && delta < 2) addLearnedSeconds(delta);
    lastTimeRef.current = video.currentTime;

    if (!course?.isEnrolled || !isAuthenticated) return;

    // Throttle server saves to every 5 seconds
    if (saveTimeoutRef.current) return;
    saveTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        studentApi.saveWatchProgress(currentLesson.id, course.id, {
          timestamp: videoRef.current.currentTime,
          playbackSpeed: videoRef.current.playbackRate,
        }).catch(console.error);
      }
      saveTimeoutRef.current = null;
    }, 5000);
  };

  const handleVideoEnded = () => {
    if (!currentLesson || !course.isEnrolled) return;

    studentApi.toggleLessonProgress(currentLesson.id, true).then(() => {
      const currentIndex = course.lessons.findIndex((l: any) => l.id === currentLesson.id);
      if (currentIndex < course.lessons.length - 1) {
        handleLessonSelect(course.lessons[currentIndex + 1]);
      }
      studentApi.getCourseProgress(course.id).then((res) => {
        if (res.data.success) setProgress(res.data.data);
      });
    });
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    fetchCourseAndProgress(); // Course unlocks instantly, no manual refresh
  };

  const filteredLessons = useMemo(() => {
    if (!course) return [];
    if (!lessonSearch.trim()) return course.lessons;
    const q = lessonSearch.toLowerCase();
    return course.lessons.filter((l: any) => l.title.toLowerCase().includes(q));
  }, [course, lessonSearch]);

  if (loading || !course) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse w-14 h-14 rounded-full bg-white/10" />
      </div>
    );
  }

  const lessonResources = currentLesson?.resources || [];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-white/[0.08] flex items-center justify-between px-4 bg-[#0d0d0d]/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/courses/${course.slug}`)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-secondary hover:text-primary"
            aria-label="Back to course"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-primary truncate max-w-[50vw] md:max-w-md">{course.title}</h1>
        </div>

        <div className="flex items-center gap-5">
          {progress && course.isEnrolled && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-medium text-secondary">Your Progress</span>
              <ProgressRing progress={progress.percentage} size={32} strokeWidth={3} />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-primary lg:hidden"
            aria-label="Toggle course outline"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="w-full bg-black aspect-video relative flex items-center justify-center shrink-0">
            {currentLesson?.bunnyVideoId ? (
              <video
                ref={videoRef}
                src={`https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`} // Placeholder stream until Bunny integration (Phase 4)
                controls
                autoPlay
                className="w-full h-full"
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="text-secondary text-center px-6">
                <p>No video available for this lesson yet.</p>
              </div>
            )}
          </div>

          {/* Tabs below the player */}
          <div className="border-b border-white/[0.06] px-4 sm:px-8 flex gap-1 overflow-x-auto shrink-0 bg-background/95 backdrop-blur">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary'
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 sm:p-8">
            {activeTab === 'overview' && (
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                  Lesson {currentLesson?.lessonNumber}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">{currentLesson?.title}</h2>
                <p className="text-secondary leading-relaxed max-w-3xl">
                  {currentLesson?.description || 'No description provided for this lesson.'}
                </p>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="max-w-3xl">
                <h3 className="text-lg font-bold text-primary mb-4">Lesson Resources</h3>
                {lessonResources.length > 0 ? (
                  <div className="space-y-2">
                    {lessonResources.map((r: any) => (
                      <a
                        key={r.id}
                        href={r.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-card p-4 flex items-center gap-3 hover:border-white/10 transition-colors"
                      >
                        <FileText className="w-4.5 h-4.5 text-primary/70" />
                        <span className="text-sm font-medium text-primary">{r.title}</span>
                        <span className="ml-auto text-xs text-secondary uppercase">{r.type}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary">No resources attached to this lesson.</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="max-w-3xl">
                <h3 className="text-lg font-bold text-primary mb-1">My Notes</h3>
                <p className="text-xs text-secondary mb-4">
                  Notes save automatically and stay attached to this lesson.
                </p>
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Write your thoughts, key takeaways, timestamps…"
                  className="w-full min-h-48 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-white/20 transition-all resize-y leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="max-w-3xl">
                <h3 className="text-lg font-bold text-primary mb-4">Downloads</h3>
                {lessonResources.filter((r: any) => r.url).length > 0 ? (
                  <div className="space-y-2">
                    {lessonResources.filter((r: any) => r.url).map((r: any) => (
                      <a
                        key={r.id}
                        href={r.url}
                        download
                        className="glass-card p-4 flex items-center gap-3 hover:border-white/10 transition-colors"
                      >
                        <Download className="w-4.5 h-4.5 text-primary/70" />
                        <span className="text-sm font-medium text-primary">{r.title}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary">Nothing to download for this lesson.</p>
                )}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="max-w-3xl text-center py-10">
                <MessagesSquare className="w-10 h-10 text-secondary/50 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-primary mb-1.5">Discussion coming soon</h3>
                <p className="text-sm text-secondary">
                  Soon you'll be able to ask questions and discuss lessons with other students right here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: course outline */}
        <div
          className={cn(
            'w-80 shrink-0 border-l border-white/[0.08] bg-[#0f0f0f] flex-col transition-all duration-300',
            sidebarOpen ? 'flex absolute inset-y-16 right-0 z-20 lg:static lg:inset-auto' : 'hidden lg:flex'
          )}
        >
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">Course Outline</h3>
              {course.isEnrolled && progress && (
                <span className="text-xs font-semibold text-secondary">
                  {progress.completedLessonIds?.length ?? 0}/{course.lessons.length} done
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
              <input
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                placeholder="Search lessons"
                className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 text-xs text-primary placeholder:text-secondary/60 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
            {filteredLessons.map((lesson: any) => {
              let state: LessonState = 'locked';
              if (currentLesson?.id === lesson.id) {
                state = 'current';
              } else if (progress?.completedLessonIds?.includes(lesson.id)) {
                state = 'completed';
              } else if (course.isEnrolled) {
                state = 'continue';
              } else if (lesson.isFree) {
                state = 'preview';
              }

              return (
                <LessonCard
                  key={lesson.id}
                  title={`${lesson.lessonNumber}. ${lesson.title}`}
                  duration={lesson.duration}
                  state={state}
                  isActive={currentLesson?.id === lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                />
              );
            })}
            {filteredLessons.length === 0 && (
              <p className="text-xs text-secondary text-center py-6">No lessons match "{lessonSearch}"</p>
            )}
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        course={course}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};
