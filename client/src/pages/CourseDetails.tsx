import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { studentApi } from '@/lib/studentApi';
import { LessonCard } from '@/components/student/LessonCard';
import type { LessonState } from '@/components/student/LessonCard';
import { PurchaseModal } from '@/components/student/PurchaseModal';
import { PlayCircle, Shield, Award, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      if (!slug) return;
      const { data } = await studentApi.getCourseBySlug(slug);
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonAction = (lesson: any) => {
    if (course.isEnrolled) {
      navigate(`/courses/${course.slug}/learn?lessonId=${lesson.id}`);
      return;
    }

    if (lesson.isFree) {
      navigate(`/courses/${course.slug}/learn?lessonId=${lesson.id}`);
    } else {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        setIsPurchaseModalOpen(true);
      }
    }
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    fetchCourse(); // Refresh to get enrolled state and video IDs
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-20 flex justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-white/10" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="pt-24 pb-20 text-center text-secondary">Course not found.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Course Info & Lessons */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                {course.title}
              </h1>
              <p className="text-xl text-secondary mb-8 leading-relaxed">
                {course.description || "Learn from industry experts and master new skills."}
              </p>

              <div className="flex items-center gap-4 mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="font-bold">{course.instructor?.name?.charAt(0) || 'E'}</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary">Instructor</div>
                    <div className="font-medium text-primary">{course.instructor?.name || 'Expert'}</div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-6">Course Content</h2>
              
              <div className="bg-surface border border-white/10 rounded-2xl p-2 flex flex-col gap-2">
                {course.lessons.map((lesson: any) => {
                  let state: LessonState = 'locked';
                  if (course.isEnrolled) {
                    state = 'continue'; // In a full implementation, we'd fetch progress here too
                  } else if (lesson.isFree) {
                    state = 'preview';
                  }

                  return (
                    <LessonCard
                      key={lesson.id}
                      title={`${lesson.lessonNumber}. ${lesson.title}`}
                      duration={lesson.duration}
                      state={state}
                      onClick={() => handleLessonAction(lesson)}
                    />
                  );
                })}

                {course.lessons.length === 0 && (
                  <div className="p-8 text-center text-secondary">
                    No lessons published yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Sidebar / Sticky Purchase Card */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="sticky top-24 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[16/9] relative">
                  <img 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                    alt="Course Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle className="w-16 h-16 text-white opacity-80 drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="p-6">
                  {course.isEnrolled ? (
                    <button 
                      onClick={() => navigate(`/courses/${course.slug}/learn`)}
                      className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg mb-4 transition-colors"
                    >
                      Go to Course
                    </button>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-primary mb-6">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </div>
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login');
                          else setIsPurchaseModalOpen(true);
                        }}
                        className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg mb-4 shadow-lg shadow-brand-500/20 transition-transform transform hover:-translate-y-1"
                      >
                        {course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                      </button>
                    </>
                  )}

                  <div className="space-y-4 text-sm text-secondary mt-6">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-brand-400" />
                      <span>7-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-brand-400" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-brand-400" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        course={course}
        onSuccess={handlePurchaseSuccess}
      />
    </MainLayout>
  );
};
