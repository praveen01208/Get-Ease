// Shared types for the upload service layer.
// These types define the API contract between the service interfaces and the rest of the application.
// They MUST NOT change when swapping implementations (Mock → Bunny → R2).

export interface VideoUploadResult {
  videoId: string;
  status: 'processing' | 'ready';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface VideoStatusResult {
  videoId: string;
  status: 'processing' | 'ready' | 'failed';
  duration?: number;
  resolution?: string;
  fileSize?: number;
  progress?: number;
  error?: string;
}

export interface StorageUploadResult {
  fileId: string;
  storageKey: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storageProvider: string;
}

export type UploadJobStatus = 'QUEUED' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
