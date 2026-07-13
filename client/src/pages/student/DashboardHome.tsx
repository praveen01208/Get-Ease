import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, PlayCircle, BookOpen, Clock, CheckCircle2, Award,
  Target, Heart, Bell, Sparkles, Rocket, GraduationCap, Compass,
  Megaphone, BadgePercent, Download, Eye, ArrowRight,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { ProgressRing } from '@/components/student/ProgressRing';
import { studentApi } from '@/lib/studentApi';
import { useAuthStore } from '@/store/useAuthStore';
import {
  greeting, getDailyGoalMinutes, getTodayLearnedSeconds, formatDate,
} from '@/lib/learning';
import { SectionHeader, ProgressBar, EmptyState } from '@/components/student/ui';
import { CourseProgressCard } from '@/components/student/CourseProgressCard';
import { FeaturedCourseCard } from '@/components/student/FeaturedCourseCard';
import { downloadCertificate, certificateSvg } from '@/components/student/certificate';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

const sectionAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' },
} as const;

const notificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_COURSE': return Sparkles;
    case 'DISCOUNT': return BadgePercent;
    case 'ANNOUNCEMENT': return Megaphone;
    default: return Bell;
  }
};

// Compact sidebar-rail card wrapper — consistent header + "view all" link,
// reused across notifications / wishlist / certificates so the rail reads
// as one cohesive widget stack instead of repeating full course cards.
const RailCard = ({
  title, to, children,
}: { title: string; to?: string; children: React.ReactNode }) => (
  <GlassCard className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-primary">{title}</h3>
      {to && (
        <Link to={to} className="text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-0.5">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
    {children}
  </GlassCard>
);

const RailRow = ({
  icon, iconClass, title, subtitle, onClick, right,
}: {
  icon: React.ReactNode; iconClass?: string; title: string; subtitle?: string;
  onClick?: () => void; right?: React.ReactNode;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 ${onClick ? 'cursor-pointer group' : ''}`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass || 'bg-white/[0.05] border border-white/[0.06]'}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold text-primary truncate ${onClick ? 'group-hover:text-white' : ''}`}>{title}</p>
      {subtitle && <p className="text-xs text-secondary truncate">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const DashboardHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [dash, setDash] = useState<any>(null);
  const [featured, setFeatured] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState<any>(null);

  useEffect(() => {
    Promise.allSettled([
      studentApi.getDashboard(),
      studentApi.getCourses(),
      studentApi.getWishlist(),
    ]).then(([d, c, w]) => {
      if (d.status === 'fulfilled' && d.value.data.success) setDash(d.value.data.data);
      if (c.status === 'fulfilled' && c.value.data.success) setFeatured(c.value.data.data.slice(0, 6));
      if (w.status === 'fulfilled' && w.value.data.success) setWishlist(w.value.data.data);
      setLoading(false);
    });
  }, []);

  const purchasedIds = useMemo(
    () => new Set((dash?.myLearning || []).map((m: any) => m.course.id)),
    [dash]
  );
  const wishlistIds = useMemo(
    () => new Set(wishlist.map((w: any) => w.courseId)),
    [wishlist]
  );

  const toggleWishlist = async (courseId: string) => {
    if (wishlistIds.has(courseId)) {
      setWishlist((prev) => prev.filter((w) => w.courseId !== courseId));
      await studentApi.removeFromWishlist(courseId).catch(() => {});
    } else {
      setWishlist((prev) => [...prev, { courseId, course: featured.find((f) => f.id === courseId) }]);
      await studentApi.addToWishlist(courseId).catch(() => {});
    }
  };

  const goalMinutes = getDailyGoalMinutes();
  const learnedMinutes = Math.floor(getTodayLearnedSeconds() / 60);
  const goalPct = Math.min(100, Math.round((learnedMinutes / goalMinutes) * 100));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 glass-card animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-56 glass-card animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-48 glass-card animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 glass-card animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  const stats = dash?.stats || {};
  const myLearning = dash?.myLearning || [];
  const hasCourses = myLearning.length > 0;
  const cl = dash?.continueLearning;

  const statTiles = [
    { icon: BookOpen, label: 'Courses', value: stats.coursesPurchased ?? 0 },
    { icon: Clock, label: 'Hours Learned', value: stats.hoursLearned ?? 0 },
    { icon: CheckCircle2, label: 'Lessons Done', value: stats.lessonsCompleted ?? 0 },
    { icon: Award, label: 'Certificates', value: stats.certificatesEarned ?? 0 },
  ];

  return (
    <div className="space-y-8">
      {/* ===== Welcome Hero ===== */}
      <motion.div {...sectionAnim}>
        <GlassCard className="relative overflow-hidden p-7 lg:p-9">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary tracking-tight mb-1.5">
                {greeting()}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-secondary text-sm mb-4">Keep learning. You're doing great.</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-semibold">
                  <Flame className="w-4 h-4" /> {stats.currentStreak ?? 0} Day Streak
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-secondary text-sm font-medium">
                  <Target className="w-4 h-4" /> Goal: {goalMinutes} min/day
                </span>
              </div>
            </div>
            <div className="shrink-0">
              {cl?.course ? (
                <button
                  onClick={() => navigate(`/courses/${cl.course.slug}/learn`)}
                  className="h-12 px-6 rounded-full bg-primary text-background font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                >
                  <PlayCircle className="w-4 h-4" /> Continue Learning
                </button>
              ) : (
                <button
                  onClick={() => navigate('/courses')}
                  className="h-12 px-6 rounded-full bg-primary text-background font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                >
                  <Compass className="w-4 h-4" /> Browse Courses
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ===== Two-column dashboard body ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ---------- Main column ---------- */}
        <div className="lg:col-span-2 space-y-10">
          {/* Continue Learning / Start Journey */}
          <motion.section {...sectionAnim}>
            {cl?.course ? (
              <>
                <SectionHeader title="Continue Learning" subtitle="Pick up right where you left off" />
                <GlassCard
                  className="group overflow-hidden cursor-pointer hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row"
                  onClick={() => navigate(`/courses/${cl.course.slug}/learn`)}
                >
                  <div className="relative sm:w-2/5 aspect-[16/9] sm:aspect-auto overflow-hidden bg-surface">
                    <img
                      src={cl.course.thumbnail || FALLBACK_THUMB}
                      alt={cl.course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden sm:block" />
                  </div>
                  <div className="flex-1 p-6 lg:p-7 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-semibold">Current Course</p>
                    <h3 className="text-xl font-bold text-primary mb-1.5">{cl.course.title}</h3>
                    {cl.lesson && (
                      <p className="text-sm text-secondary mb-5">
                        Lesson {cl.lesson.lessonNumber}: {cl.lesson.title}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-secondary mb-2">
                      <span>{(cl.totalLessons ?? 0) - (cl.completedLessons ?? 0)} lessons remaining</span>
                      <span className="font-semibold text-primary">{cl.percentage ?? 0}%</span>
                    </div>
                    <ProgressBar value={cl.percentage ?? 0} className="mb-6" />
                    <div>
                      <span className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-background font-semibold text-sm group-hover:bg-primary/90 transition-colors">
                        <PlayCircle className="w-4 h-4" /> Resume Learning
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </>
            ) : (
              <GlassCard className="relative overflow-hidden p-8 lg:p-10 text-center">
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🚀</div>
                  <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">Start Your Learning Journey</h2>
                  <p className="text-secondary max-w-md mx-auto mb-7 text-sm">
                    Unlock premium courses taught by industry experts. Watch a free preview lesson on any course — no purchase needed.
                  </p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-primary text-background font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    <Compass className="w-4 h-4" /> Browse Courses
                  </Link>
                </div>
              </GlassCard>
            )}
          </motion.section>

          {/* My Learning */}
          {hasCourses && (
            <motion.section {...sectionAnim}>
              <SectionHeader title="My Learning" subtitle="Your purchased courses" to="/dashboard/my-learning" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {myLearning.slice(0, 4).map((m: any) => (
                  <CourseProgressCard
                    key={m.enrollmentId}
                    course={m.course}
                    completedLessons={m.completedLessons}
                    totalLessons={m.totalLessons}
                    percentage={m.percentage}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Featured / Trending Courses */}
          {featured.length > 0 && (
            <motion.section {...sectionAnim}>
              <SectionHeader
                title={hasCourses ? 'Featured Courses' : 'Trending Courses'}
                subtitle="Hand-picked by our team"
                to="/courses"
                linkLabel="Browse all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {featured.slice(0, 4).map((course) => (
                  <FeaturedCourseCard
                    key={course.id}
                    course={course}
                    isPurchased={purchasedIds.has(course.id)}
                    isWishlisted={wishlistIds.has(course.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Recently Viewed */}
          {(dash?.recentlyViewed?.length ?? 0) > 0 && (
            <motion.section {...sectionAnim}>
              <SectionHeader title="Recently Viewed" />
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
                {dash.recentlyViewed.map((rv: any) => (
                  <GlassCard
                    key={rv.course.id}
                    className="group w-60 shrink-0 snap-start overflow-hidden cursor-pointer hover:border-white/10 transition-all"
                    onClick={() =>
                      navigate(rv.isEnrolled ? `/courses/${rv.course.slug}/learn` : `/courses/${rv.course.slug}`)
                    }
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-surface">
                      <img
                        src={rv.course.thumbnail || FALLBACK_THUMB}
                        alt={rv.course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-primary line-clamp-1 mb-1">{rv.course.title}</h4>
                      <p className="text-xs text-secondary line-clamp-1">
                        {rv.lesson?.title} · {formatDate(rv.lastOpenedAt)}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* ---------- Right rail ---------- */}
        <div className="space-y-6">
          {/* Daily Goal */}
          <motion.div {...sectionAnim}>
            <GlassCard className="p-5 flex items-center gap-5">
              <ProgressRing progress={goalPct} size={56} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-primary mb-0.5">Today's Goal</h3>
                <p className="text-xs text-secondary">
                  <span className="font-semibold text-primary">{learnedMinutes}</span> / {goalMinutes} min
                </p>
                <p className="text-xs text-secondary mt-1 line-clamp-1">
                  {goalPct >= 100 ? '🎉 Goal reached!' : 'Watch a lesson to progress.'}
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats mini-grid */}
          <motion.div {...sectionAnim}>
            <div className="grid grid-cols-2 gap-3">
              {statTiles.map(({ icon: Icon, label, value }) => (
                <GlassCard key={label} className="p-4">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary/80" />
                  </div>
                  <div className="text-xl font-bold text-primary tracking-tight leading-none mb-1">{value}</div>
                  <div className="text-[11px] text-secondary font-medium">{label}</div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          {(dash?.notifications?.length ?? 0) > 0 && (
            <motion.div {...sectionAnim}>
              <RailCard title="Notifications">
                <div className="divide-y divide-white/[0.05]">
                  {dash.notifications.slice(0, 3).map((n: any, i: number) => {
                    const Icon = notificationIcon(n.type);
                    return (
                      <Link key={i} to={n.link || '#'} className="block">
                        <RailRow
                          icon={<Icon className="w-4 h-4 text-primary/80" />}
                          title={n.title}
                          subtitle={n.message}
                        />
                      </Link>
                    );
                  })}
                </div>
              </RailCard>
            </motion.div>
          )}

          {/* Wishlist */}
          <motion.div {...sectionAnim}>
            <RailCard title="Wishlist" to="/dashboard/wishlist">
              {wishlist.length > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {wishlist.slice(0, 3).filter((w) => w.course).map((w: any) => (
                    <RailRow
                      key={w.courseId}
                      onClick={() => navigate(`/courses/${w.course.slug}`)}
                      icon={
                        <img
                          src={w.course.thumbnail || FALLBACK_THUMB}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                      }
                      title={w.course.title}
                      subtitle={w.course.price === 0 ? 'Free' : `₹${w.course.price}`}
                      right={<Heart className="w-3.5 h-3.5 fill-current text-red-400 shrink-0" />}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary py-2">
                  Tap the heart on any course to save it here.
                </p>
              )}
            </RailCard>
          </motion.div>

          {/* Certificates */}
          <motion.div {...sectionAnim}>
            <RailCard title="Certificates" to="/dashboard/certificates">
              {(dash?.certificates?.length ?? 0) > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {dash.certificates.slice(0, 3).map((cert: any) => (
                    <RailRow
                      key={cert.courseId}
                      iconClass="bg-yellow-500/10 border border-yellow-500/20"
                      icon={<Award className="w-4 h-4 text-yellow-400" />}
                      title={cert.courseTitle}
                      subtitle={`Earned ${formatDate(cert.earnedAt)}`}
                      right={
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-secondary hover:text-primary transition-colors"
                            aria-label="Preview certificate"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              downloadCertificate({
                                studentName: user?.name || 'Student',
                                courseTitle: cert.courseTitle,
                                instructor: cert.instructor,
                                earnedAt: cert.earnedAt,
                              })
                            }
                            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-secondary hover:text-primary transition-colors"
                            aria-label="Download certificate"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-secondary mb-3">
                    Complete a course to earn your first certificate.
                  </p>
                  <Link
                    to={hasCourses ? '/dashboard/my-learning' : '/courses'}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                  >
                    <Rocket className="w-3.5 h-3.5" /> {hasCourses ? 'Keep learning' : 'Start a course'}
                  </Link>
                </div>
              )}
            </RailCard>
          </motion.div>
        </div>
      </div>

      {/* Empty-state nudge when there's truly nothing yet, shown full-width */}
      {!hasCourses && featured.length === 0 && wishlist.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="Nothing here yet"
          message="Once courses are published you'll see recommendations and progress right here."
          action={
            <Link to="/courses" className="h-10 px-5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-primary inline-flex items-center hover:bg-white/[0.1] transition-colors">
              Explore courses
            </Link>
          }
        />
      )}

      {/* Certificate preview modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewCert(null)} />
          <div className="relative w-full max-w-3xl glass-panel p-4">
            <div
              className="w-full rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: certificateSvg({
                  studentName: user?.name || 'Student',
                  courseTitle: previewCert.courseTitle,
                  instructor: previewCert.instructor,
                  earnedAt: previewCert.earnedAt,
                }),
              }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setPreviewCert(null)}
                className="h-10 px-5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-primary hover:bg-white/[0.1] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() =>
                  downloadCertificate({
                    studentName: user?.name || 'Student',
                    courseTitle: previewCert.courseTitle,
                    instructor: previewCert.instructor,
                    earnedAt: previewCert.earnedAt,
                  })
                }
                className="h-10 px-5 rounded-full bg-primary text-background text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
