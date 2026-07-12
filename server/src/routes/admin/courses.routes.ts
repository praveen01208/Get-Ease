import { Router } from 'express';
import {
  getCourses, getCourse, createCourse,
  updateCourse, updateCourseStatus, deleteCourse,
} from '../../controllers/admin.courses.controller';

const router = Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.put('/:id/status', updateCourseStatus);
router.delete('/:id', deleteCourse);

export default router;
