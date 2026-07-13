"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_lessons_controller_1 = require("../../controllers/admin.lessons.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', admin_lessons_controller_1.getLessons);
router.post('/', admin_lessons_controller_1.createLesson);
router.put('/reorder', admin_lessons_controller_1.reorderLessons);
router.put('/:id', admin_lessons_controller_1.updateLesson);
router.delete('/:id', admin_lessons_controller_1.deleteLesson);
// Resources
router.post('/:lessonId/resources', admin_lessons_controller_1.addResource);
router.delete('/resources/:id', admin_lessons_controller_1.deleteResource);
exports.default = router;
//# sourceMappingURL=lessons.routes.js.map