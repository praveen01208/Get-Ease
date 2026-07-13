import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import studentCoursesRoutes from './routes/student.courses.routes';
import studentRoutes from './routes/student.routes';
import { ensureDemoData } from './utils/demoSeed';
import paymentRoutes from './routes/payment.routes';
import adminUploadRoutes from './routes/admin/upload.routes';
import adminCoursesRoutes from './routes/admin/courses.routes';
import adminLessonsRoutes from './routes/admin/lessons.routes';
import adminCategoriesRoutes from './routes/admin/categories.routes';
import adminStudentsRoutes from './routes/admin/students.routes';
import { requireAuth } from './middlewares/auth.middleware';
import { requireRole } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Get Ease API is running 🚀', version: '1.0.0' });
});

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', studentCoursesRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);
app.use('/api/student', studentRoutes);

// Admin Routes (protected: ADMIN role)
const adminGuard = [requireAuth, requireRole(['ADMIN'])];
app.use('/api/admin/upload', adminGuard, adminUploadRoutes);
app.use('/api/admin/courses', adminGuard, adminCoursesRoutes);
app.use('/api/admin/courses/:courseId/lessons', adminGuard, adminLessonsRoutes);
app.use('/api/admin/categories', adminGuard, adminCategoriesRoutes);
app.use('/api/admin/students', adminGuard, adminStudentsRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    ensureDemoData();
  }
});
