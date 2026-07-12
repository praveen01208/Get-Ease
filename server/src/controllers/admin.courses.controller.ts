import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import slugify from 'slugify';

export const getCourses = async (req: Request, res: Response) => {
  const { search, status } = req.query;
  try {
    const courses = await prisma.course.findMany({
      where: {
        ...(search ? { title: { contains: search as string } } : {}),
        ...(status ? { status: status as string } : {}),
      },
      include: {
        category: true,
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  const { title, slug, description, categoryId, thumbnail } = req.body;
  try {
    const course = await prisma.course.create({
      data: {
        title,
        slug: slug || slugify(title, { lower: true }),
        description,
        categoryId: categoryId || null,
        thumbnail,
        authorId: req.user!.userId,
        status: 'DRAFT',
        price: 0,
      },
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { lessons: true } },
      },
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const course = await prisma.course.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourseStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const course = await prisma.course.update({
      where: { id },
      data: { status },
      include: {
        _count: { select: { lessons: true } },
      },
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
