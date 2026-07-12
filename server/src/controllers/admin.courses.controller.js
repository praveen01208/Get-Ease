"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourseStatus = exports.updateCourse = exports.getCourse = exports.createCourse = exports.getCourses = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const slugify_1 = __importDefault(require("slugify"));
const getCourses = async (req, res) => {
    const { search, status } = req.query;
    try {
        const courses = await prisma_1.prisma.course.findMany({
            where: {
                ...(search ? { title: { contains: search } } : {}),
                ...(status ? { status: status } : {}),
            },
            include: {
                category: true,
                _count: { select: { lessons: true, enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: courses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourses = getCourses;
const createCourse = async (req, res) => {
    const { title, slug, description, categoryId, thumbnail } = req.body;
    try {
        const course = await prisma_1.prisma.course.create({
            data: {
                title,
                slug: slug || (0, slugify_1.default)(title, { lower: true }),
                description,
                categoryId: categoryId || null,
                thumbnail,
                authorId: req.user.userId,
                status: 'DRAFT',
                price: 0,
            },
        });
        res.json({ success: true, data: course });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCourse = createCourse;
const getCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await prisma_1.prisma.course.findUnique({
            where: { id },
            include: {
                category: true,
                _count: { select: { lessons: true } },
            },
        });
        if (!course)
            return res.status(404).json({ success: false, message: 'Course not found' });
        res.json({ success: true, data: course });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourse = getCourse;
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const course = await prisma_1.prisma.course.update({
            where: { id },
            data,
        });
        res.json({ success: true, data: course });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCourse = updateCourse;
const updateCourseStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const course = await prisma_1.prisma.course.update({
            where: { id },
            data: { status },
            include: {
                _count: { select: { lessons: true } },
            },
        });
        res.json({ success: true, data: course });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCourseStatus = updateCourseStatus;
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.course.delete({ where: { id } });
        res.json({ success: true, message: 'Course deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=admin.courses.controller.js.map