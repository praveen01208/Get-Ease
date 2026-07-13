import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayCircle, Shield, Award, Check, Star, Users, Globe, BarChart3,
  CalendarDays, Clock, ChevronDown, Heart, Infinity as InfinityIcon,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { studentApi } from '@/lib/studentApi';
import { LessonCard } from '@/components/student/LessonCard';
import type { LessonState } from '@/components/student/LessonCard';
import { PurchaseModal } from '@/components/student/PurchaseModal';
import { FeaturedCourseCard } from '@/components/student/FeaturedCourseCard';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDuration, formatDate } from '@/lib/learning';
import { cn } from '@/utils/cn';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

const OUTCOMES = [
  'Build real-world projects from scratch',
  'Understand core concepts deeply, not just syntax',
  'Follow industry best practices used by professionals',
  'Earn a certificate to showcase your skills',
  'Get lifetime access including all future updates',
  'Learn at your own pace on any device',
];

const REQUIREMENTS = [
  'A computer with an internet connection',
  'No prior experience needed — we start from the basics',
  'Curiosity and willingness to practice',
];

const FAQS = [
  {
    q: 'How long do I have access to the course?',
    a: 'Forever. One payment gives you lifetime access, including every future update to the course.',
  },
  {
    q: 'Can I watch a lesson before buying?',
    a: 'Yes! Every course includes a free preview lesson that anyone can watch — no account required.',
  },
  {
    q: 'Do I get a certificate?',
    a: 'Yes. Complete all lessons and a certificate of completion is generated automatically in your dashboard.',
  },
  {
    q: 'What if I am not satisfied?',
    a: 'We offer a 7-day money-back guarantee. If the course is not for you, contact us for a full refund.',
  },
];

export const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCourse();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchCourse = async () => {
    try {
      if (!slug) return;
      const { data } = await studentApi.getCourseBySlug(slug);
      if (data.success) {
        setCourse(data.data);
        // Related courses = other courses, same category first
        studentApi.getCourses().then(({ data: list }) => {
          if (list.success) {
            const others = list.data.filter((c: any) => c.slug !== slug);
            others.sort((a: any, b: any) =>
              (b.categoryId === data.data.categoryId ? 1 : 0) - (a.categoryId === data.data.categoryId ? 1 : 0)
            );
            setRelated(others.slice(0, 3));
          }
        }).catch(() => {});
        if (isAuthenticated) {
          studentApi.getWishlist().then(({ data: w }) => {
            if (w.success) setIsWishlisted(w.data.some((i: any) => i.courseId === data.data.id));
          }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () =>
    navigate('/login', { state: { from: { pathname: location.pathname } } });

  const handleLessonAction = (lesson: any) => {
    if (course.isEnrolled || lesson.isFree) {
      navigate(`/courses/${course.slug}/learn?lessonId=${lesson.id}`);
      return;
    }
    // Locked lesson: login first, then purchase
    if (!isAuthenticated) goToLogin();
    else setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    // Unlock instantly: straight into the course player, no manual refresh
    navigate(`/courses/${course.slug}/learn`);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) return goToLogin();
    setIsWishlisted((v) => !v);
    if (isWishlisted) await studentApi.removeFromWishlist(course.id).catch(() => {});
    else await studentApi.addToWishlist(course.id).catch(() => {});
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-6">
          <div className="h-64 glass-card animate-pulse" />
          <div className="h-96 glass-card animate-pulse" />
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

  const totalDuration = course.lessons.reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
  const avgRating = course.reviews?.length
    ? course.reviews.reduce((a: number, r: any) => a + r.rating, 0) / course.reviews.length
    : 4.8;
  const students = course._count?.enrollments ?? 0;
  const freeLesson = course.lessons.find((l: any) => l.isFree);

  const heroFacts = [
    { icon: Star, label: `${avgRating.toFixed(1)} rating`, className: 'text-warning' },
    { icon: Users, label: `${students.toLocaleString()} learners` },
    { icon: Globe, label: course.language || 'English' },
    { icon: BarChart3, label: course.difficulty || 'Beginner' },
    { icon: CalendarDays, label: `Updated ${formatDate(course.updatedAt)}` },
  ];

  return (
    <MainLayout>
      {/* ===== Hero banner ===== */}
      <div className="relative pt-24 pb-14 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={course.thumbnail || FALLBACK_THUMB}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl"
          >
            {course.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-secondary mb-5">
                {course.category.name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight tracking-tight">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-xl text-secondary mb-6 leading-relaxed">{course.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-secondary mb-6">
              {heroFacts.map(({ icon: Icon, label, className }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className={cn('w-4 h-4 opacity-80', className)} /> {label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-primary">
                {course.instructor?.name?.charAt(0) || 'E'}
              </div>
              <div>
                <div className="text-xs text-secondary">Created by</div>
                <div className="font-semibold text-primary">{course.instructor?.name || 'Expert Instructor'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* ===== Left column ===== */}
            <div className="flex-1 min-w-0 space-y-12">
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">About This Course</h2>
                <p className="text-secondary leading-relaxed">
                  {course.description || 'Learn from industry experts and master new skills.'}
                </p>
              </section>

              {/* Learning outcomes */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-5">What You'll Learn</h2>
                <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {OUTCOMES.map((o) => (
                    <div key={o} className="flex items-start gap-3 text-sm text-secondary">
                      <Check className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Curriculum */}
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="text-2xl font-bold text-primary">Curriculum</h2>
                  <span className="text-sm text-secondary">
                    {course.lessons.length} lessons · {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="glass-card p-2 flex flex-col gap-1.5">
                  {course.lessons.map((lesson: any) => {
                    let state: LessonState = 'locked';
                    if (course.isEnrolled) state = 'continue';
                    else if (lesson.isFree) state = 'preview';

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
                    <div className="p-8 text-center text-secondary">No lessons published yet.</div>
                  )}
                </div>
              </section>

              {/* Requirements */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-5">Requirements</h2>
                <ul className="space-y-2.5">
                  {REQUIREMENTS.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-sm text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Instructor */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-5">Your Instructor</h2>
                <div className="glass-card p-6 flex flex-col sm:flex-row gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
                    {course.instructor?.name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">
                      {course.instructor?.name || 'Expert Instructor'}
                    </h3>
                    <p className="text-sm text-secondary mb-3">Senior Engineer & Educator</p>
                    <p className="text-sm text-secondary leading-relaxed">
                      A passionate educator with years of industry experience, dedicated to making
                      complex topics simple. Thousands of students have transformed their careers
                      through these courses.
                    </p>
                  </div>
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-5">Student Reviews</h2>
                {course.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {course.reviews.map((r: any) => (
                      <div key={r.id} className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-primary">
                            {r.user?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-sm font-semibold text-primary">{r.user?.name}</span>
                          <span className="flex items-center gap-0.5 ml-auto">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn('w-3.5 h-3.5', i < r.rating ? 'text-warning fill-current' : 'text-white/15')} />
                            ))}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-secondary">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Star className="w-8 h-8 text-warning/60 mx-auto mb-3" />
                    <p className="text-sm text-secondary">
                      No reviews yet — be the first to review this course after enrolling.
                    </p>
                  </div>
                )}
              </section>

              {/* FAQ */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-5">Frequently Asked Questions</h2>
                <div className="glass-card divide-y divide-white/[0.05]">
                  {FAQS.map((faq, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-sm font-semibold text-primary">{faq.q}</span>
                        <ChevronDown className={cn('w-4 h-4 text-secondary transition-transform duration-200', openFaq === i && 'rotate-180')} />
                      </button>
                      {openFaq === i && (
                        <p className="px-5 pb-5 text-sm text-secondary leading-relaxed">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ===== Right: sticky price card ===== */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="sticky top-24 glass-panel overflow-hidden">
                <div className="aspect-[16/9] relative group cursor-pointer"
                  onClick={() => freeLesson && navigate(`/courses/${course.slug}/learn?lessonId=${freeLesson.id}`)}
                >
                  <img
                    src={course.thumbnail || FALLBACK_THUMB}
                    alt="Course Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                    <PlayCircle className="w-14 h-14 text-white drop-shadow-lg mb-2" />
                    {freeLesson && !course.isEnrolled && (
                      <span className="text-xs font-bold text-white bg-green-500/80 px-3 py-1 rounded-full">
                        Watch Free Preview
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {course.isEnrolled ? (
                    <button
                      onClick={() => navigate(`/courses/${course.slug}/learn`)}
                      className="w-full h-13 py-4 bg-primary text-background rounded-2xl font-bold text-base mb-4 hover:bg-primary/90 transition-all active:scale-[0.99]"
                    >
                      Go to Course
                    </button>
                  ) : (
                    <>
                      <div className="flex items-end gap-3 mb-5">
                        <span className="text-4xl font-bold text-primary tracking-tight">
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                        {course.price > 0 && (
                          <span className="text-lg text-secondary line-through mb-1">
                            ₹{Math.round(course.price * 1.5)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) goToLogin();
                          else setIsPurchaseModalOpen(true);
                        }}
                        className="w-full py-4 bg-primary text-background rounded-2xl font-bold text-base mb-3 hover:bg-primary/90 transition-all active:scale-[0.99] shadow-lg shadow-white/5"
                      >
                        {course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                      </button>
                      <button
                        onClick={toggleWishlist}
                        className={cn(
                          'w-full py-3 rounded-2xl font-semibold text-sm mb-4 border transition-all flex items-center justify-center gap-2',
                          isWishlisted
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-white/[0.03] border-white/[0.1] text-secondary hover:text-primary'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
                        {isWishlisted ? 'In your wishlist' : 'Add to wishlist'}
                      </button>
                    </>
                  )}

                  <div className="space-y-3.5 text-sm text-secondary mt-5">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-4.5 h-4.5 text-primary/70" />
                      <span>{course.lessons.length} lessons · {formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <InfinityIcon className="w-4.5 h-4.5 text-primary/70" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4.5 h-4.5 text-primary/70" />
                      <span>Certificate included</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4.5 h-4.5 text-primary/70" />
                      <span>7-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4.5 h-4.5 text-primary/70" />
                      <span>Learn at your own pace</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Related courses ===== */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-primary mb-6">Related Courses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((c) => (
                  <FeaturedCourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          )}
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
