import { Router } from 'express';
import {
  getLessons, createLesson, updateLesson,
  deleteLesson, reorderLessons, addResource, deleteResource,
} from '../../controllers/admin.lessons.controller';

const router = Router({ mergeParams: true });

router.get('/', getLessons);
router.post('/', createLesson);
router.put('/reorder', reorderLessons);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

// Resources
router.post('/:lessonId/resources', addResource);
router.delete('/resources/:id', deleteResource);

export default router;
