"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoUploadService = getVideoUploadService;
exports.getStorageService = getStorageService;
const MockVideoUploadService_1 = require("./mock/MockVideoUploadService");
const MockStorageService_1 = require("./mock/MockStorageService");
const BunnyVideoUploadService_1 = require("./bunny/BunnyVideoUploadService");
const R2StorageService_1 = require("./r2/R2StorageService");
/**
 * Service Registry — the only place where implementations are selected.
 * Controlled by environment variables:
 *   UPLOAD_PROVIDER=mock (Phase 3) | bunny (Phase 4)
 *   STORAGE_PROVIDER=mock (Phase 3 & 4) | r2 (Phase 5)
 *
 * To swap implementations, only change .env.
 * No other files need to be modified.
 */
let _videoService = null;
let _storageService = null;
function getVideoUploadService() {
    if (!_videoService) {
        const provider = process.env.UPLOAD_PROVIDER || 'mock';
        if (provider === 'bunny') {
            _videoService = new BunnyVideoUploadService_1.BunnyVideoUploadService();
        }
        else {
            _videoService = new MockVideoUploadService_1.MockVideoUploadService();
        }
        console.log(`[UploadRegistry] Video provider: ${provider}`);
    }
    return _videoService;
}
function getStorageService() {
    if (!_storageService) {
        const provider = process.env.STORAGE_PROVIDER || 'mock';
        if (provider === 'r2') {
            _storageService = new R2StorageService_1.R2StorageService();
        }
        else {
            _storageService = new MockStorageService_1.MockStorageService();
        }
        console.log(`[UploadRegistry] Storage provider: ${provider}`);
    }
    return _storageService;
}
//# sourceMappingURL=registry.js.map