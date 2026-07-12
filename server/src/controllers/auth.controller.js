"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const generateTokens = (userId, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        }
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.login = login;
const refresh = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        prisma_1.prisma.user.findUnique({ where: { id: decoded.id } })
            .then(user => {
            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
            res.json({ success: true, accessToken });
        })
            .catch(() => res.status(500).json({ success: false, message: 'Server error' }));
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map