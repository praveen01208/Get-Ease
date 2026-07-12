"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_students_controller_1 = require("../../controllers/admin.students.controller");
const router = (0, express_1.Router)();
router.get('/', admin_students_controller_1.getStudents);
router.get('/analytics/overview', admin_students_controller_1.getAnalyticsOverview);
exports.default = router;
//# sourceMappingURL=students.routes.js.map