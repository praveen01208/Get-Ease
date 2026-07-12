import { IVideoUploadService } from '../IVideoUploadService';
import { VideoUploadResult, VideoStatusResult } from '../types';
/**
 * MockVideoUploadService — Phase 3 implementation.
 * Accepts a real file upload, generates a fake Bunny video ID,
 * and simulates the processing lifecycle.
 *
 * Phase 4: Replace with BunnyVideoUploadService. Zero other changes required.
 */
export declare class MockVideoUploadService implements IVideoUploadService {
    uploadVideo(buffer: Buffer, fileName: string, mimeType: string, fileSize: number): Promise<VideoUploadResult>;
    getVideoStatus(videoId: string): Promise<VideoStatusResult>;
    deleteVideo(videoId: string): Promise<void>;
}
//# sourceMappingURL=MockVideoUploadService.d.ts.map