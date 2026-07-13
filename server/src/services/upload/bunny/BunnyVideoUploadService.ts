import { IVideoUploadService } from '../IVideoUploadService';
import { VideoUploadResult, VideoStatusResult } from '../types';

/**
 * BunnyVideoUploadService — Phase 4 implementation.
 *
 * Activated when UPLOAD_PROVIDER=bunny in .env.
 * Requires: BUNNY_LIBRARY_ID, BUNNY_API_KEY, BUNNY_CDN_HOSTNAME in .env.
 *
 * The interface contract is identical to MockVideoUploadService.
 * Zero frontend, API, or DB changes are required when enabling this
 * (the frontend only ever sees `videoId` + derived playback/thumbnail URLs).
 */

const BUNNY_API_BASE = 'https://video.bunnycdn.com/library';

// Bunny Stream numeric status codes -> our tri-state model.
// 0 Created, 1 Uploaded, 2 Processing, 3 Transcoding/Encoding, 4 Finished,
// 5 Error, 6 UploadFailed. Anything unrecognized is treated as "processing".
const READY_STATUSES = new Set([4]);
const FAILED_STATUSES = new Set([5, 6]);

function getConfig() {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  if (!libraryId || !apiKey) {
    throw new Error(
      'Bunny Stream is not configured. Set BUNNY_LIBRARY_ID and BUNNY_API_KEY in .env.'
    );
  }
  return { libraryId, apiKey };
}

function mapStatus(bunnyStatus: number): 'processing' | 'ready' | 'failed' {
  if (READY_STATUSES.has(bunnyStatus)) return 'ready';
  if (FAILED_STATUSES.has(bunnyStatus)) return 'failed';
  return 'processing';
}

export class BunnyVideoUploadService implements IVideoUploadService {
  async uploadVideo(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number
  ): Promise<VideoUploadResult> {
    const { libraryId, apiKey } = getConfig();

    // 1. Create the video object in the library to obtain a videoId (guid).
    const createRes = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ title: fileName }),
    });

    if (!createRes.ok) {
      const text = await createRes.text().catch(() => '');
      throw new Error(`Bunny Stream: failed to create video (${createRes.status}): ${text}`);
    }

    const created = (await createRes.json()) as { guid: string };
    const videoId = created.guid;

    // 2. Upload the actual video bytes to that video object.
    const uploadRes = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(buffer),
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => '');
      // Best-effort cleanup of the orphaned video object.
      await this.deleteVideo(videoId).catch(() => {});
      throw new Error(`Bunny Stream: failed to upload video (${uploadRes.status}): ${text}`);
    }

    return {
      videoId,
      status: 'processing',
      fileName,
      fileSize,
      mimeType,
    };
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResult> {
    const { libraryId, apiKey } = getConfig();

    const res = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos/${videoId}`, {
      method: 'GET',
      headers: { AccessKey: apiKey, accept: 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Bunny Stream: failed to get video status (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      status: number;
      length?: number;
      width?: number;
      height?: number;
      storageSize?: number;
      encodeProgress?: number;
    };

    const status = mapStatus(data.status);

    return {
      videoId,
      status,
      duration: data.length,
      resolution: data.width && data.height ? `${data.width}x${data.height}` : undefined,
      fileSize: data.storageSize,
      progress: data.encodeProgress,
      error: status === 'failed' ? 'Bunny Stream reported an encoding failure.' : undefined,
    };
  }

  async deleteVideo(videoId: string): Promise<void> {
    const { libraryId, apiKey } = getConfig();

    const res = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: { AccessKey: apiKey, accept: 'application/json' },
    });

    if (!res.ok && res.status !== 404) {
      const text = await res.text().catch(() => '');
      throw new Error(`Bunny Stream: failed to delete video (${res.status}): ${text}`);
    }
  }
}
