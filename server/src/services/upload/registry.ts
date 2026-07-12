import { IVideoUploadService } from './IVideoUploadService';
import { IStorageService } from './IStorageService';
import { MockVideoUploadService } from './mock/MockVideoUploadService';
import { MockStorageService } from './mock/MockStorageService';
import { BunnyVideoUploadService } from './bunny/BunnyVideoUploadService';
import { R2StorageService } from './r2/R2StorageService';

/**
 * Service Registry — the only place where implementations are selected.
 * Controlled by environment variables:
 *   UPLOAD_PROVIDER=mock (Phase 3) | bunny (Phase 4)
 *   STORAGE_PROVIDER=mock (Phase 3 & 4) | r2 (Phase 5)
 * 
 * To swap implementations, only change .env.
 * No other files need to be modified.
 */

let _videoService: IVideoUploadService | null = null;
let _storageService: IStorageService | null = null;

export function getVideoUploadService(): IVideoUploadService {
  if (!_videoService) {
    const provider = process.env.UPLOAD_PROVIDER || 'mock';
    if (provider === 'bunny') {
      _videoService = new BunnyVideoUploadService();
    } else {
      _videoService = new MockVideoUploadService();
    }
    console.log(`[UploadRegistry] Video provider: ${provider}`);
  }
  return _videoService;
}

export function getStorageService(): IStorageService {
  if (!_storageService) {
    const provider = process.env.STORAGE_PROVIDER || 'mock';
    if (provider === 'r2') {
      _storageService = new R2StorageService();
    } else {
      _storageService = new MockStorageService();
    }
    console.log(`[UploadRegistry] Storage provider: ${provider}`);
  }
  return _storageService;
}
