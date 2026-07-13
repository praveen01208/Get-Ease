import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const dayKey = (d: Date) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
};

// Consecutive-day streak ending today (or yesterday, so a streak isn't lost
// before the student studies today)
const computeStreak = (dates: Date[]): number => {
  const days = new Set(dates.map(dayKey));
  if (days.size === 0) return 0;

  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [enrollments, lessonProgress, watchProgress, payments, wishlistCount] =
      await Promise.all([
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                category: true,
                instructor: { select: { id: true, name: true } },
                lessons: { select: { id: true, duration: true }, orderBy: { order: 'asc' } },
                _count: { select: { lessons: true, enrollments: true } },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        }),
        prisma.lessonProgress.findMany({
          where: { userId, completed: true },
          include: { lesson: { select: { id: true, courseId: true, duration: true } } },
        }),
        prisma.watchProgress.findMany({
          where: { userId },
          orderBy: { lastOpenedAt: 'desc' },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                lessonNumber: true,
                courseId: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnail: true,
                    instructor: { select: { name: true } },
                    _count: { select: { lessons: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.payment.count({ where: { userId, status: 'SUCCESS' } }),
        prisma.wishlist.count({ where: { userId } }),
      ]);

    // Per-course progress
    const completedByCourse: Record<string, number> = {};
    for (const p of lessonProgress) {
      completedByCourse[p.lesson.courseId] = (completedByCourse[p.lesson.courseId] || 0) + 1;
    }

    const myLearning = enrollments.map((e) => {
      const totalLessons = e.course._count.lessons;
      const completed = completedByCourse[e.course.id] || 0;
      const { lessons, ...courseRest } = e.course as any;
      return {
        enrollmentId: e.id,
        enrolledAt: e.enrolledAt,
        course: courseRest,
        totalLessons,
        completedLessons: completed,
        percentage: totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100),
      };
    });

    // Continue learning = most recently opened lesson in an enrolled course
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    const lastWatch = watchProgress.find((w) => enrolledCourseIds.has(w.lesson.courseId));
    const continueLearning = lastWatch
      ? {
          course: lastWatch.lesson.course,
          lesson: {
            id: lastWatch.lesson.id,
            title: lastWatch.lesson.title,
            lessonNumber: lastWatch.lesson.lessonNumber,
          },
          timestamp: lastWatch.timestamp,
          lastOpenedAt: lastWatch.lastOpenedAt,
          ...(myLearning.find((m) => m.course.id === lastWatch.lesson.courseId) || {}),
        }
      : myLearning[0] || null;

    // Stats
    const hoursLearned =
      lessonProgress.reduce((acc, p) => acc + (p.lesson.duration || 0), 0) / 3600;
    const certificates = myLearning
      .filter((m) => m.totalLessons > 0 && m.percentage === 100)
      .map((m) => ({
        courseId: m.course.id,
        courseTitle: m.course.title,
        slug: m.course.slug,
        instructor: m.course.instructor?.name,
        completedLessons: m.completedLessons,
        earnedAt: lessonProgress
          .filter((p) => p.lesson.courseId === m.course.id)
          .reduce(
            (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
            new Date(0)
          ),
      }));

    const activityDates = [
      ...lessonProgress.map((p) => p.updatedAt),
      ...watchProgress.map((w) => w.lastOpenedAt),
    ];
    const streak = computeStreak(activityDates);

    // Recently viewed = distinct courses from watch history
    const seen = new Set<string>();
    const recentlyViewed = watchProgress
      .filter((w) => {
        if (seen.has(w.lesson.courseId)) return false;
        seen.add(w.lesson.courseId);
        return true;
      })
      .slice(0, 8)
      .map((w) => ({
        course: w.lesson.course,
        lesson: { id: w.lesson.id, title: w.lesson.title },
        lastOpenedAt: w.lastOpenedAt,
        isEnrolled: enrolledCourseIds.has(w.lesson.courseId),
      }));

    // Notifications (derived; a real notification system arrives in a later phase)
    const recentCourses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { title: true, slug: true, createdAt: true },
    });
    const notifications = [
      ...recentCourses.map((c) => ({
        type: 'NEW_COURSE',
        title: 'New course available',
        message: `"${c.title}" just landed on GetEase.`,
        link: `/courses/${c.slug}`,
        date: c.createdAt,
      })),
      {
        type: 'DISCOUNT',
        title: 'Limited-time launch pricing',
        message: 'All premium courses are ₹249 for a limited time.',
        link: '/courses',
        date: new Date(),
      },
      {
        type: 'ANNOUNCEMENT',
        title: 'Welcome to GetEase',
        message: 'Track your streak, earn certificates and learn every day.',
        link: '/dashboard',
        date: new Date(),
      },
    ];

    res.json({
      success: true,
      data: {
        myLearning,
        continueLearning,
        recentlyViewed,
        certificates,
        notifications,
        stats: {
          coursesPurchased: enrollments.length,
          hoursLearned: Math.round(hoursLearned * 10) / 10,
          lessonsCompleted: lessonProgress.length,
          certificatesEarned: certificates.length,
          currentStreak: streak,
          wishlistCount,
          paymentsCount: payments,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Wishlist ----------

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          include: {
            category: true,
            instructor: { select: { name: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const item = await prisma.wishlist.upsert({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      update: {},
      create: { userId: req.user!.id, courseId },
    });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    await prisma.wishlist.deleteMany({ where: { userId: req.user!.id, courseId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Purchases ----------

export const getPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Profile ----------

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatar: true, createdAt: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatar: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    res.json({ success: true, message: 'Password updated' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
