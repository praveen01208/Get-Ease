import { VideoUploadResult, VideoStatusResult } from './types';
/**
 * Interface for video upload providers (Bunny Stream, etc.).
 * Implementations: MockVideoUploadService (Phase 3), BunnyVideoUploadService (Phase 4).
 * The application ONLY depends on this interface.
 */
export interface IVideoUploadService {
    /**
     * Upload a video file. Returns immediately with a videoId and initial status.
     * The video may still be processing after this call.
     */
    uploadVideo(buffer: Buffer, fileName: string, mimeType: string, fileSize: number): Promise<VideoUploadResult>;
    /**
     * Poll the status of an uploaded video.
     * Call this until status is 'ready' or 'failed'.
     */
    getVideoStatus(videoId: string): Promise<VideoStatusResult>;
    /**
     * Delete a video from the provider.
     */
    deleteVideo(videoId: string): Promise<void>;
}
//# sourceMappingURL=IVideoUploadService.d.ts.map