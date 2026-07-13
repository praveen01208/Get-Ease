"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2StorageService = void 0;
/**
 * R2StorageService — Phase 5 implementation stub.
 *
 * To activate: set STORAGE_PROVIDER=r2 in .env.
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME in .env.
 *
 * The interface contract is identical to MockStorageService.
 * Zero frontend, API, or DB changes are required when enabling this.
 */
class R2StorageService {
    async uploadFile(_buffer, _originalFilename, _mimeType, _fileSize, _folder) {
        // Phase 5: Implement @aws-sdk/client-s3 upload to Cloudflare R2 here
        // 1. PutObjectCommand with Bucket = R2_BUCKET_NAME
        // 2. Generate a presigned URL with GetObjectCommand (short-lived)
        // 3. Return { fileId, storageKey, url, ... }
        throw new Error('R2StorageService not yet implemented. Phase 5.');
    }
    async deleteFile(_storageKey) {
        // Phase 5: DeleteObjectCommand
        throw new Error('R2StorageService not yet implemented. Phase 5.');
    }
    async getFileUrl(_storageKey) {
        // Phase 5: Generate a new presigned URL on demand
        throw new Error('R2StorageService not yet implemented. Phase 5.');
    }
}
exports.R2StorageService = R2StorageService;
//# sourceMappingURL=R2StorageService.js.map