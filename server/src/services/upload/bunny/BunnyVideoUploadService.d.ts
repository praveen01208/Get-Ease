import { IVideoUploadService } from '../IVideoUploadService';
import { VideoUploadResult, VideoStatusResult } from '../types';
/**
 * BunnyVideoUploadService — Phase 4 implementation stub.
 *
 * To activate: set UPLOAD_PROVIDER=bunny in .env.
 * Requires: BUNNY_LIBRARY_ID, BUNNY_API_KEY, BUNNY_CDN_HOSTNAME in .env.
 *
 * The interface contract is identical to MockVideoUploadService.
 * Zero frontend, API, or DB changes are required when enabling this.
 */
export declare class BunnyVideoUploadService implements IVideoUploadService {
    uploadVideo(_buffer: Buffer, _fileName: string, _mimeType: string, _fileSize: number): Promise<VideoUploadResult>;
    getVideoStatus(_videoId: string): Promise<VideoStatusResult>;
    deleteVideo(_videoId: string): Promise<void>;
}
//# sourceMappingURL=BunnyVideoUploadService.d.ts.map