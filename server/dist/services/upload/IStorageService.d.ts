import { StorageUploadResult } from './types';
/**
 * Interface for file storage providers (Cloudflare R2, etc.).
 * Implementations: MockStorageService (Phase 3 & 4), R2StorageService (Phase 5).
 * The application ONLY depends on this interface.
 */
export interface IStorageService {
    /**
     * Upload a file. Returns a stable storage key and a presigned or permanent URL.
     */
    uploadFile(buffer: Buffer, originalFilename: string, mimeType: string, fileSize: number, folder?: string): Promise<StorageUploadResult>;
    /**
     * Delete a file by its storage key.
     */
    deleteFile(storageKey: string): Promise<void>;
    /**
     * Get a (potentially short-lived) access URL for a file.
     */
    getFileUrl(storageKey: string): Promise<string>;
}
//# sourceMappingURL=IStorageService.d.ts.map