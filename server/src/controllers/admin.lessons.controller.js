"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResource = exports.addResource = exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.getLessons = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const slugify_1 = __importDefault(require("slugify"));
const getLessons = async (req, res) => {
    const { courseId } = req.params;
    try {
        const lessons = await prisma_1.prisma.lesson.findMany({
            where: { courseId },
            include: { resources: true },
            orderBy: { order: 'asc' },
        });
        res.json({ success: true, data: lessons });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLessons = getLessons;
const createLesson = async (req, res) => {
    const { courseId } = req.params;
    const { title, lessonNumber, order, description, isFree } = req.body;
    try {
        // Check if it's the first lesson
        const existingLessonsCount = await prisma_1.prisma.lesson.count({ where: { courseId } });
        const shouldBeFree = existingLessonsCount === 0 || isFree;
        const lesson = await prisma_1.prisma.$transaction(async (tx) => {
            if (shouldBeFree) {
                await tx.lesson.updateMany({
                    where: { courseId },
                    data: { isFree: false }
                });
            }
            return tx.lesson.create({
                data: {
                    title,
                    slug: (0, slugify_1.default)(title, { lower: true }),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createLesson = createLesson;
const updateLesson = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const lesson = await prisma_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateLesson = updateLesson;
const deleteLesson = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.lesson.delete({ where: { id } });
        res.json({ success: true, message: 'Lesson deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteLesson = deleteLesson;
const reorderLessons = async (req, res) => {
    const { courseId } = req.params;
    const { orderedIds } = req.body; // array of lesson ids in order
    try {
        await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.lesson.update({
            where: { id },
            data: { order: index, lessonNumber: index + 1 },
        })));
        res.json({ success: true, message: 'Lessons reordered' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.reorderLessons = reorderLessons;
const addResource = async (req, res) => {
    const { lessonId } = req.params;
    const data = req.body;
    try {
        const resource = await prisma_1.prisma.resource.create({
            data: {
                ...data,
                lessonId,
            },
        });
        res.json({ success: true, data: resource });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addResource = addResource;
const deleteResource = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.resource.delete({ where: { id } });
        res.json({ success: true, message: 'Resource deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteResource = deleteResource;
//# sourceMappingURL=admin.lessons.controller.js.map