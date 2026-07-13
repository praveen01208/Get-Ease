import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { IStorageService } from '../IStorageService';
import { StorageUploadResult } from '../types';

/**
 * R2StorageService — Phase 5 implementation.
 *
 * Activated when STORAGE_PROVIDER=r2 in .env.
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME in .env.
 *
 * Cloudflare R2 is S3-compatible, so the AWS SDK v3 S3 client works against it
 * by pointing `endpoint` at the R2 account endpoint.
 *
 * We store only the object key (`storageKey`) in the database and always
 * regenerate a short-lived presigned URL on demand — never a permanent URL.
 */

const PRESIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY;
  const secretKey = process.env.R2_SECRET_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKey || !secretKey || !bucket) {
    throw new Error(
      'Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, and R2_BUCKET_NAME in .env.'
    );
  }
  return { accountId, accessKey, secretKey, bucket };
}

let _client: S3Client | null = null;
function getClient(): S3Client {
  if (_client) return _client;
  const { accountId, accessKey, secretKey } = getConfig();
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
  return _client;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export class R2StorageService implements IStorageService {
  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    fileSize: number,
    folder?: string
  ): Promise<StorageUploadResult> {
    const { bucket } = getConfig();
    const client = getClient();

    const fileId = randomUUID();
    const safeName = sanitizeFilename(originalFilename);
    const storageKey = `${folder ? `${folder}/` : ''}${fileId}-${safeName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
        ContentLength: fileSize,
      })
    );

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: storageKey }),
      { expiresIn: PRESIGNED_URL_TTL_SECONDS }
    );

    return {
      fileId,
      storageKey,
      url,
      originalFilename,
      mimeType,
      fileSize,
      storageProvider: 'R2',
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const { bucket } = getConfig();
    const client = getClient();

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
  }

  async getFileUrl(storageKey: string): Promise<string> {
    const { bucket } = getConfig();
    const client = getClient();

    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: storageKey }), {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });
  }
}
