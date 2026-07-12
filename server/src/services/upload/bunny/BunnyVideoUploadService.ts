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
export class BunnyVideoUploadService implements IVideoUploadService {
  async uploadVideo(
    _buffer: Buffer,
    _fileName: string,
    _mimeType: string,
    _fileSize: number
  ): Promise<VideoUploadResult> {
    // Phase 4: Implement Bunny Stream TUS upload here
    // 1. POST to https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos to get a videoId
    // 2. Upload via TUS protocol
    // 3. Return { videoId, status: 'processing', ... }
    throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
  }

  async getVideoStatus(_videoId: string): Promise<VideoStatusResult> {
    // Phase 4: GET https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{videoId}
    throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
  }

  async deleteVideo(_videoId: string): Promise<void> {
    // Phase 4: DELETE https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{videoId}
    throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
  }
}
