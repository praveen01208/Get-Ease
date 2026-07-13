import { IStorageService } from '../IStorageService';
import { StorageUploadResult } from '../types';
/**
 * R2StorageService — Phase 5 implementation stub.
 *
 * To activate: set STORAGE_PROVIDER=r2 in .env.
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME in .env.
 *
 * The interface contract is identical to MockStorageService.
 * Zero frontend, API, or DB changes are required when enabling this.
 */
export declare class R2StorageService implements IStorageService {
    uploadFile(_buffer: Buffer, _originalFilename: string, _mimeType: string, _fileSize: number, _folder?: string): Promise<StorageUploadResult>;
    deleteFile(_storageKey: string): Promise<void>;
    getFileUrl(_storageKey: string): Promise<string>;
}
//# sourceMappingURL=R2StorageService.d.ts.map