"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const admin_upload_controller_1 = require("../../controllers/admin.upload.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 * 1024 } }); // 5GB
router.post('/video', upload.single('video'), admin_upload_controller_1.uploadVideo);
router.get('/video/:videoId/status', admin_upload_controller_1.getVideoStatus);
router.post('/file', upload.single('file'), admin_upload_controller_1.uploadFile);
router.get('/jobs', admin_upload_controller_1.getUploadJobs);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map