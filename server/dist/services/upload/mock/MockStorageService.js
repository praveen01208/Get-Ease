"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockStorageService = void 0;
/**
 * MockStorageService — Phase 3 & 4 implementation.
 * Accepts real file uploads, returns mock Cloudflare R2-style keys and URLs.
 *
 * Phase 5: Replace with R2StorageService. Zero other changes required.
 */
class MockStorageService {
    PROVIDER = 'MOCK';
    BASE_URL = 'https://r2.mock.getease.dev';
    async uploadFile(buffer, originalFilename, mimeType, fileSize, folder = 'uploads') {
        const ext = originalFilename.split('.').pop() || 'bin';
        const fileId = `mock-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const storageKey = `${folder}/${fileId}.${ext}`;
        const url = `${this.BASE_URL}/${storageKey}`;
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
        return {
            fileId,
            storageKey,
            url,
            originalFilename,
            mimeType,
            fileSize,
            storageProvider: this.PROVIDER,
        };
    }
    async deleteFile(storageKey) {
        // No-op in mock
        console.log(`[MockStorage] Deleted: ${storageKey}`);
    }
    async getFileUrl(storageKey) {
        return `${this.BASE_URL}/${storageKey}`;
    }
}
exports.MockStorageService = MockStorageService;
//# sourceMappingURL=MockStorageService.js.map