import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const total = await prisma.user.count({ where: { role: 'STUDENT' } });
    res.json({ success: true, data: students, meta: { total } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalCourses, publishedCourses, totalEnrollments] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        publishedCourses,
        totalEnrollments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
