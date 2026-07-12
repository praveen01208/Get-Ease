import { Router } from 'express';
import * as controller from '../controllers/student.courses.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public / Semi-public
router.get('/', controller.getCourses);
router.get('/:slug', optionalAuth, controller.getCourseBySlug);

// Protected student actions
router.get('/my/enrolled', requireAuth, controller.getEnrolledCourses);
router.post('/:id/enroll', requireAuth, controller.enrollInCourse);
router.get('/:id/progress', requireAuth, controller.getCourseProgress);

// Protected lesson actions
router.post('/lesson/:id/progress', requireAuth, controller.toggleLessonProgress);
router.post('/lesson/:id/watch-time', requireAuth, controller.saveWatchProgress);

export default router;
