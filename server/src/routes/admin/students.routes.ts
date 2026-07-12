import { Router } from 'express';
import { getStudents, getAnalyticsOverview } from '../../controllers/admin.students.controller';

const router = Router();

router.get('/', getStudents);
router.get('/analytics/overview', getAnalyticsOverview);

export default router;
