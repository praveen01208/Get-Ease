"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BunnyVideoUploadService = void 0;
/**
 * BunnyVideoUploadService — Phase 4 implementation stub.
 *
 * To activate: set UPLOAD_PROVIDER=bunny in .env.
 * Requires: BUNNY_LIBRARY_ID, BUNNY_API_KEY, BUNNY_CDN_HOSTNAME in .env.
 *
 * The interface contract is identical to MockVideoUploadService.
 * Zero frontend, API, or DB changes are required when enabling this.
 */
class BunnyVideoUploadService {
    async uploadVideo(_buffer, _fileName, _mimeType, _fileSize) {
        // Phase 4: Implement Bunny Stream TUS upload here
        // 1. POST to https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos to get a videoId
        // 2. Upload via TUS protocol
        // 3. Return { videoId, status: 'processing', ... }
        throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
    }
    async getVideoStatus(_videoId) {
        // Phase 4: GET https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{videoId}
        throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
    }
    async deleteVideo(_videoId) {
        // Phase 4: DELETE https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{videoId}
        throw new Error('BunnyVideoUploadService not yet implemented. Phase 4.');
    }
}
exports.BunnyVideoUploadService = BunnyVideoUploadService;
//# sourceMappingURL=BunnyVideoUploadService.js.map