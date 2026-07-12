"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: { _count: { select: { courses: true } } },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    const { name, slug, description } = req.body;
    try {
        const category = await prisma_1.prisma.category.create({
            data: { name, slug, description },
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    try {
        const category = await prisma_1.prisma.category.update({
            where: { id },
            data: { name, slug, description },
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.category.delete({ where: { id } });
        res.json({ success: true, message: 'Category deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=admin.categories.controller.js.map