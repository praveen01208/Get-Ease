"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller = __importStar(require("../controllers/student.courses.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public / Semi-public
router.get('/', controller.getCourses);
router.get('/:slug', auth_middleware_1.optionalAuth, controller.getCourseBySlug);
// Protected student actions
router.get('/my/enrolled', auth_middleware_1.requireAuth, controller.getEnrolledCourses);
router.post('/:id/enroll', auth_middleware_1.requireAuth, controller.enrollInCourse);
router.get('/:id/progress', auth_middleware_1.requireAuth, controller.getCourseProgress);
// Protected lesson actions
router.post('/lesson/:id/progress', auth_middleware_1.requireAuth, controller.toggleLessonProgress);
router.post('/lesson/:id/watch-time', auth_middleware_1.requireAuth, controller.saveWatchProgress);
exports.default = router;
//# sourceMappingURL=student.courses.routes.js.map