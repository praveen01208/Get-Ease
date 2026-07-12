import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import slugify from 'slugify';

export const getLessons = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: { resources: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: lessons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { title, lessonNumber, order, description, isFree } = req.body;
  try {
    // Check if it's the first lesson
    const existingLessonsCount = await prisma.lesson.count({ where: { courseId } });
    const shouldBeFree = existingLessonsCount === 0 || isFree;

    const lesson = await prisma.$transaction(async (tx) => {
      if (shouldBeFree) {
        await tx.lesson.updateMany({
          where: { courseId },
          data: { isFree: false }
        });
      }

      return tx.lesson.create({
        data: {
          title,
          slug: slugify(title, { lower: true }),
          lessonNumber,
          order,
          description,
          isFree: shouldBeFree,
          courseId,
        },
        include: { resources: true },
      });
    });

    res.json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const lesson = await prisma.$transaction(async (tx) => {
      if (data.isFree === true) {
        // Find the course ID for this lesson
        const currentLesson = await tx.lesson.findUnique({ where: { id } });
        if (currentLesson) {
          await tx.lesson.updateMany({
            where: { courseId: currentLesson.courseId, id: { not: id } },
            data: { isFree: false }
          });
        }
      }

      return tx.lesson.update({
        where: { id },
        data,
        include: { resources: true },
      });
    });

    res.json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.lesson.delete({ where: { id } });
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderLessons = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { orderedIds } = req.body; // array of lesson ids in order
  try {
    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.lesson.update({
          where: { id },
          data: { order: index, lessonNumber: index + 1 },
        })
      )
    );
    res.json({ success: true, message: 'Lessons reordered' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addResource = async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const data = req.body;
  try {
    const resource = await prisma.resource.create({
      data: {
        ...data,
        lessonId,
      },
    });
    res.json({ success: true, data: resource });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.resource.delete({ where: { id } });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
