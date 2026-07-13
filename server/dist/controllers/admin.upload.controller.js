"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadJobs = exports.uploadFile = exports.getVideoStatus = exports.uploadVideo = void 0;
const registry_1 = require("../services/upload/registry");
const prisma_1 = require("../utils/prisma");
const uploadVideo = async (req, res) => {
    if (!req.file)
        return res.status(400).json({ success: false, message: 'No video file provided' });
    const { buffer, originalname, mimetype, size } = req.file;
    // Create an UploadJob record
    const job = await prisma_1.prisma.uploadJob.create({
        data: {
            type: 'VIDEO',
            status: 'UPLOADING',
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
            entityType: 'LESSON_VIDEO',
        },
    });
    try {
        const service = (0, registry_1.getVideoUploadService)();
        const result = await service.uploadVideo(buffer, originalname, mimetype, size);
        // Update UploadJob with provider ID
        await prisma_1.prisma.uploadJob.update({
            where: { id: job.id },
            data: {
                status: result.status === 'ready' ? 'COMPLETED' : 'PROCESSING',
                providerId: result.videoId,
                attempts: 1,
            },
        });
        res.json({
            success: true,
            data: {
                jobId: job.id,
                videoId: result.videoId,
                status: result.status,
                fileName: originalname,
                fileSize: size,
                mimeType: mimetype,
            },
        });
    }
    catch (err) {
        await prisma_1.prisma.uploadJob.update({
            where: { id: job.id },
            data: { status: 'FAILED', error: err.message },
        });
        res.status(500).json({ success: false, message: 'Video upload failed', error: err.message });
    }
};
exports.uploadVideo = uploadVideo;
const getVideoStatus = async (req, res) => {
    const { videoId } = req.params;
    try {
        const service = (0, registry_1.getVideoUploadService)();
        const status = await service.getVideoStatus(videoId);
        // Sync UploadJob status
        if (status.status === 'ready' || status.status === 'failed') {
            await prisma_1.prisma.uploadJob.updateMany({
                where: { providerId: videoId, type: 'VIDEO' },
                data: {
                    status: status.status === 'ready' ? 'COMPLETED' : 'FAILED',
                    duration: status.duration,
                    resolution: status.resolution,
                    error: status.error,
                },
            });
        }
        res.json({ success: true, data: status });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to get status', error: err.message });
    }
};
exports.getVideoStatus = getVideoStatus;
const uploadFile = async (req, res) => {
    if (!req.file)
        return res.status(400).json({ success: false, message: 'No file provided' });
    const { buffer, originalname, mimetype, size } = req.file;
    const folder = req.query.folder || 'resources';
    const job = await prisma_1.prisma.uploadJob.create({
        data: {
            type: 'FILE',
            status: 'UPLOADING',
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
            entityType: 'LESSON_RESOURCE',
        },
    });
    try {
        const service = (0, registry_1.getStorageService)();
        const result = await service.uploadFile(buffer, originalname, mimetype, size, folder);
        await prisma_1.prisma.uploadJob.update({
            where: { id: job.id },
            data: { status: 'COMPLETED', providerId: result.fileId },
        });
        res.json({
            success: true,
            data: {
                jobId: job.id,
                fileId: result.fileId,
                storageKey: result.storageKey,
                url: result.url,
                originalFilename: result.originalFilename,
                mimeType: result.mimeType,
                fileSize: result.fileSize,
                storageProvider: result.storageProvider,
            },
        });
    }
    catch (err) {
        await prisma_1.prisma.uploadJob.update({
            where: { id: job.id },
            data: { status: 'FAILED', error: err.message },
        });
        res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
    }
};
exports.uploadFile = uploadFile;
const getUploadJobs = async (_req, res) => {
    const jobs = await prisma_1.prisma.uploadJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json({ success: true, data: jobs });
};
exports.getUploadJobs = getUploadJobs;
//# sourceMappingURL=admin.upload.controller.js.map