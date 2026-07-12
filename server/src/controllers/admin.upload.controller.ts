import { Request, Response } from 'express';
import { getVideoUploadService, getStorageService } from '../services/upload/registry';
import { prisma } from '../utils/prisma';

export const uploadVideo = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

  const { buffer, originalname, mimetype, size } = req.file;

  // Create an UploadJob record
  const job = await prisma.uploadJob.create({
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
    const service = getVideoUploadService();
    const result = await service.uploadVideo(buffer, originalname, mimetype, size);

    // Update UploadJob with provider ID
    await prisma.uploadJob.update({
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
  } catch (err: any) {
    await prisma.uploadJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: err.message },
    });
    res.status(500).json({ success: false, message: 'Video upload failed', error: err.message });
  }
};

export const getVideoStatus = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  try {
    const service = getVideoUploadService();
    const status = await service.getVideoStatus(videoId);

    // Sync UploadJob status
    if (status.status === 'ready' || status.status === 'failed') {
      await prisma.uploadJob.updateMany({
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get status', error: err.message });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const { buffer, originalname, mimetype, size } = req.file;
  const folder = (req.query.folder as string) || 'resources';

  const job = await prisma.uploadJob.create({
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
    const service = getStorageService();
    const result = await service.uploadFile(buffer, originalname, mimetype, size, folder);

    await prisma.uploadJob.update({
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
  } catch (err: any) {
    await prisma.uploadJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: err.message },
    });
    res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
  }
};

export const getUploadJobs = async (_req: Request, res: Response) => {
  const jobs = await prisma.uploadJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: jobs });
};
