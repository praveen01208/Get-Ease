import { IStorageService } from '../IStorageService';
import { StorageUploadResult } from '../types';
/**
 * MockStorageService — Phase 3 & 4 implementation.
 * Accepts real file uploads, returns mock Cloudflare R2-style keys and URLs.
 *
 * Phase 5: Replace with R2StorageService. Zero other changes required.
 */
export declare class MockStorageService implements IStorageService {
    private readonly PROVIDER;
    private readonly BASE_URL;
    uploadFile(buffer: Buffer, originalFilename: string, mimeType: string, fileSize: number, folder?: string): Promise<StorageUploadResult>;
    deleteFile(storageKey: string): Promise<void>;
    getFileUrl(storageKey: string): Promise<string>;
}
//# sourceMappingURL=MockStorageService.d.ts.map