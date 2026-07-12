"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsOverview = exports.getStudents = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const getStudents = async (req, res) => {
    try {
        const students = await prisma_1.prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: {
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const total = await prisma_1.prisma.user.count({ where: { role: 'STUDENT' } });
        res.json({ success: true, data: students, meta: { total } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStudents = getStudents;
const getAnalyticsOverview = async (req, res) => {
    try {
        const [totalStudents, totalCourses, publishedCourses, totalEnrollments] = await Promise.all([
            prisma_1.prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma_1.prisma.course.count(),
            prisma_1.prisma.course.count({ where: { status: 'PUBLISHED' } }),
            prisma_1.prisma.enrollment.count(),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAnalyticsOverview = getAnalyticsOverview;
//# sourceMappingURL=admin.students.controller.js.map