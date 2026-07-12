"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWatchProgress = exports.toggleLessonProgress = exports.getCourseProgress = exports.enrollInCourse = exports.getEnrolledCourses = exports.getCourseBySlug = exports.getCourses = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const getCourses = async (req, res) => {
    try {
        const { category, search } = req.query;
        let whereClause = { status: 'PUBLISHED' };
        if (category)
            whereClause.categoryId = category;
        if (search) {
            whereClause.title = { contains: search };
        }
        const courses = await prisma_1.prisma.course.findMany({
            where: whereClause,
            include: {
                category: true,
                instructor: { select: { id: true, name: true, email: true } },
                _count: { select: { lessons: true } },
                lessons: {
                    select: { duration: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate total duration for each course
        const formatted = courses.map(c => {
            const totalDuration = c.lessons.reduce((acc, curr) => acc + (curr.duration || 0), 0);
            const { lessons, ...rest } = c;
            return { ...rest, totalDuration };
        });
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourses = getCourses;
const getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user?.id;
        const course = await prisma_1.prisma.course.findUnique({
            where: { slug },
            include: {
                category: true,
                instructor: { select: { id: true, name: true, email: true } },
                lessons: {
                    orderBy: { order: 'asc' },
                    include: { resources: true }
                },
                _count: { select: { lessons: true } }
            }
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        let isEnrolled = false;
        if (userId) {
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId: course.id } }
            });
            isEnrolled = !!enrollment;
        }
        // Strip video IDs and resource URLs if not enrolled (except for free preview lessons)
        const sanitizedLessons = course.lessons.map(lesson => {
            const canAccess = isEnrolled || lesson.isFree;
            return {
                ...lesson,
                bunnyVideoId: canAccess ? lesson.bunnyVideoId : null,
                resources: canAccess ? lesson.resources : [],
                isAccessible: canAccess
            };
        });
        res.json({
            success: true,
            data: {
                ...course,
                lessons: sanitizedLessons,
                isEnrolled
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourseBySlug = getCourseBySlug;
const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        category: true,
                        instructor: { select: { name: true } },
                        _count: { select: { lessons: true } }
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });
        res.json({ success: true, data: enrollments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
const enrollInCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user.id;
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (course.price > 0) {
            return res.status(400).json({ success: false, message: 'Course requires payment' });
        }
        const enrollment = await prisma_1.prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: {},
            create: { userId, courseId }
        });
        res.json({ success: true, data: enrollment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.enrollInCourse = enrollInCourse;
const getCourseProgress = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user.id;
        const completedLessons = await prisma_1.prisma.lessonProgress.findMany({
            where: {
                userId,
                completed: true,
                lesson: { courseId }
            },
            select: { lessonId: true }
        });
        const watchProgress = await prisma_1.prisma.watchProgress.findMany({
            where: { userId, courseId }
        });
        const totalLessons = await prisma_1.prisma.lesson.count({ where: { courseId } });
        res.json({
            success: true,
            data: {
                completedLessonIds: completedLessons.map(p => p.lessonId),
                watchProgress,
                totalLessons,
                percentage: totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourseProgress = getCourseProgress;
const toggleLessonProgress = async (req, res) => {
    try {
        const { id: lessonId } = req.params;
        const { completed } = req.body;
        const userId = req.user.id;
        const progress = await prisma_1.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { completed },
            create: { userId, lessonId, completed }
        });
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.toggleLessonProgress = toggleLessonProgress;
const saveWatchProgress = async (req, res) => {
    try {
        const { id: lessonId } = req.params;
        const { timestamp, playbackSpeed, courseId } = req.body;
        const userId = req.user.id;
        const progress = await prisma_1.prisma.watchProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { timestamp, playbackSpeed, lastOpenedAt: new Date() },
            create: { userId, lessonId, courseId, timestamp, playbackSpeed }
        });
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveWatchProgress = saveWatchProgress;
//# sourceMappingURL=student.courses.controller.js.map