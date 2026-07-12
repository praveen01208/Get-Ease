import { IVideoUploadService } from '../IVideoUploadService';
import { VideoUploadResult, VideoStatusResult } from '../types';

// In-memory store for mock video status (simulates Bunny processing)
const mockVideos = new Map<string, VideoStatusResult>();

/**
 * MockVideoUploadService — Phase 3 implementation.
 * Accepts a real file upload, generates a fake Bunny video ID,
 * and simulates the processing lifecycle.
 * 
 * Phase 4: Replace with BunnyVideoUploadService. Zero other changes required.
 */
export class MockVideoUploadService implements IVideoUploadService {
  async uploadVideo(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number
  ): Promise<VideoUploadResult> {
    const videoId = `mock-video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // Simulate processing state initially
    mockVideos.set(videoId, {
      videoId,
      status: 'processing',
      fileSize,
      progress: 0,
    });

    // Simulate async processing: mark ready after 3–5 seconds
    const processingTime = 3000 + Math.random() * 2000;
    setTimeout(() => {
      mockVideos.set(videoId, {
        videoId,
        status: 'ready',
        duration: Math.floor(30 + Math.random() * 1800), // 30s–30min mock
        resolution: ['1280x720', '1920x1080', '3840x2160'][Math.floor(Math.random() * 3)],
        fileSize,
        progress: 100,
      });
    }, processingTime);

    return {
      videoId,
      status: 'processing',
      fileName,
      fileSize,
      mimeType,
    };
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResult> {
    const stored = mockVideos.get(videoId);
    if (!stored) {
      return { videoId, status: 'failed', error: 'Video not found' };
    }
    // Increment a fake progress for processing state
    if (stored.status === 'processing') {
      stored.progress = Math.min(95, (stored.progress || 0) + 15);
    }
    return stored;
  }

  async deleteVideo(videoId: string): Promise<void> {
    mockVideos.delete(videoId);
  }
}
