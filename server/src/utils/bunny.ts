/**
 * Deterministic Bunny Stream playback/thumbnail URL builders.
 *
 * We never store a playback URL in the database — only the Bunny videoId
 * (`bunnyVideoId`). The actual URL is always derived on read from
 * BUNNY_CDN_HOSTNAME + videoId, so the frontend never needs its own Bunny
 * configuration and URLs stay correct even if the CDN hostname changes.
 */

export function getBunnyVideoUrl(videoId: string | null | undefined): string | null {
  if (!videoId) return null;
  const cdnHostname = process.env.BUNNY_CDN_HOSTNAME;
  if (!cdnHostname) return null;
  return `https://${cdnHostname}/${videoId}/playlist.m3u8`;
}

export function getBunnyThumbnailUrl(videoId: string | null | undefined): string | null {
  if (!videoId) return null;
  const cdnHostname = process.env.BUNNY_CDN_HOSTNAME;
  if (!cdnHostname) return null;
  return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
}
