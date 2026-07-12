import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';
import { studentApi } from '@/lib/studentApi';
import { LessonCard } from '@/components/student/LessonCard';
import type { LessonState } from '@/components/student/LessonCard';
import { PurchaseModal } from '@/components/student/PurchaseModal';
import { ProgressRing } from '@/components/student/ProgressRing';

export const CoursePlayer = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [slug]);

  const fetchCourseAndProgress = async () => {
    try {
      if (!slug) return;
      
      const [courseRes, progressRes] = await Promise.all([
        studentApi.getCourseBySlug(slug),
        // If not logged in, progress endpoint will fail, handle gracefully
        studentApi.getCourseProgress('mock').catch(() => ({ data: { success: false } }))
      ]);

      if (courseRes.data.success) {
        const courseData = courseRes.data.data;
        setCourse(courseData);
        
        // Fetch real progress if course found
        let progressData: any = { completedLessonIds: [], watchProgress: [], percentage: 0 };
        try {
          const p = await studentApi.getCourseProgress(courseData.id);
          if (p.data.success) progressData = p.data.data;
        } catch (e) {}

        setProgress(progressData);

        // Determine which lesson to load
        const lessonIdFromUrl = searchParams.get('lessonId');
        let lessonToLoad = null;

        if (lessonIdFromUrl) {
          lessonToLoad = courseData.lessons.find((l: any) => l.id === lessonIdFromUrl);
        } else if (progressData.watchProgress && progressData.watchProgress.length > 0) {
          // Find last opened
          const lastWatched = [...progressData.watchProgress].sort(
            (a: any, b: any) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
          )[0];
          lessonToLoad = courseData.lessons.find((l: any) => l.id === lastWatched.lessonId);
        }
        
        if (!lessonToLoad) {
          lessonToLoad = courseData.lessons[0];
        }

        if (lessonToLoad) {
          handleLessonSelect(lessonToLoad, progressData);
        }
      }
    } catch (error) {
      console.error('Failed to load course player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: any, currentProg: any = progress) => {
    if (lesson.isAccessible) {
      setCurrentLesson(lesson);
      
      // Setup video state based on watch progress
      if (currentProg) {
        const wp = currentProg.watchProgress.find((w: any) => w.lessonId === lesson.id);
        if (wp && videoRef.current) {
          // Will apply once video metadata loads
          videoRef.current.dataset.resumeTime = wp.timestamp;
          videoRef.current.dataset.playbackRate = wp.playbackSpeed;
        }
      }
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
  };

  const handleTimeUpdate = (e: any) => {
    if (!currentLesson || !course.isEnrolled) return;
    
    // Throttle saves to every 5 seconds
    if (saveTimeoutRef.current) return;
    
    saveTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        studentApi.saveWatchProgress(currentLesson.id, course.id, {
          timestamp: video.currentTime,
          playbackSpeed: video.playbackRate
        }).catch(console.error);
      }
      saveTimeoutRef.current = null;
    }, 5000);
  };

  const handleVideoEnded = () => {
    if (!currentLesson || !course.isEnrolled) return;
    
    // Mark as completed
    studentApi.toggleLessonProgress(currentLesson.id, true).then(() => {
      // Find next lesson
      const currentIndex = course.lessons.findIndex((l: any) => l.id === currentLesson.id);
      if (currentIndex < course.lessons.length - 1) {
        handleLessonSelect(course.lessons[currentIndex + 1]);
      }
      // Refresh progress
      studentApi.getCourseProgress(course.id).then((res) => {
        if (res.data.success) setProgress(res.data.data);
      });
    });
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    fetchCourseAndProgress();
  };

  if (loading || !course) return <div className="h-screen bg-bg flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-surface z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/courses/${course.slug}`)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-secondary hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-primary truncate max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {progress && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary">Your Progress</span>
              <ProgressRing progress={progress.percentage} size={32} strokeWidth={3} />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="w-full bg-black aspect-video relative flex items-center justify-center">
            {currentLesson?.bunnyVideoId ? (
              <video
                ref={videoRef}
                src={`https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`} // Placeholder stream
                controls
                autoPlay
                className="w-full h-full"
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="text-secondary text-center">
                <p>No video available for this lesson.</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            <h2 className="text-3xl font-bold text-primary mb-4">{currentLesson?.title}</h2>
            <div className="prose prose-invert max-w-none text-secondary">
              <p>{currentLesson?.description || "No description provided."}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`w-80 shrink-0 border-l border-white/10 bg-surface flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 hidden lg:flex'}`}>
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-primary">Course Content</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {course.lessons.map((lesson: any) => {
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
