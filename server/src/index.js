"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_courses_routes_1 = __importDefault(require("./routes/student.courses.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const upload_routes_1 = __importDefault(require("./routes/admin/upload.routes"));
const courses_routes_1 = __importDefault(require("./routes/admin/courses.routes"));
const lessons_routes_1 = __importDefault(require("./routes/admin/lessons.routes"));
const categories_routes_1 = __importDefault(require("./routes/admin/categories.routes"));
const students_routes_1 = __importDefault(require("./routes/admin/students.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const auth_middleware_2 = require("./middlewares/auth.middleware");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Get Ease API is running 🚀', version: '1.0.0' });
});
// Public Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/courses', student_courses_routes_1.default);
app.use('/api/payments', auth_middleware_1.requireAuth, payment_routes_1.default);
// Admin Routes (protected: ADMIN role)
const adminGuard = [auth_middleware_1.requireAuth, (0, auth_middleware_2.requireRole)(['ADMIN'])];
app.use('/api/admin/upload', adminGuard, upload_routes_1.default);
app.use('/api/admin/courses', adminGuard, courses_routes_1.default);
app.use('/api/admin/courses/:courseId/lessons', adminGuard, lessons_routes_1.default);
app.use('/api/admin/categories', adminGuard, categories_routes_1.default);
app.use('/api/admin/students', adminGuard, students_routes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map