"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_courses_controller_1 = require("../../controllers/admin.courses.controller");
const router = (0, express_1.Router)();
router.get('/', admin_courses_controller_1.getCourses);
router.post('/', admin_courses_controller_1.createCourse);
router.get('/:id', admin_courses_controller_1.getCourse);
router.put('/:id', admin_courses_controller_1.updateCourse);
router.put('/:id/status', admin_courses_controller_1.updateCourseStatus);
router.delete('/:id', admin_courses_controller_1.deleteCourse);
exports.default = router;
//# sourceMappingURL=courses.routes.js.map