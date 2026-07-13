import React, { useState, useCallback, useRef } from 'react';
import { Film, CheckCircle, XCircle, RefreshCw, Clock, Play } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { UploadZone } from './UploadZone';
import { UploadProgress } from './UploadProgress';
import { cn } from '@/utils/cn';

type VideoState = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

interface VideoMeta {
  videoId: string;
  duration?: number;
  resolution?: string;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
}

interface VideoUploaderProps {
  value?: string;           // current bunnyVideoId from DB
  onChange: (videoId: string, meta: VideoMeta) => void;
  onClear?: () => void;
  className?: string;
}

const MAX_POLL_ATTEMPTS = 30;

const formatDuration = (s?: number) => {
  if (!s) return '—';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const VideoUploader: React.FC<VideoUploaderProps> = ({ value, onChange, onClear, className }) => {
  const [state, setState] = useState<VideoState>(value ? 'ready' : 'idle');
  const [progress, setProgress] = useState(0);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [meta, setMeta] = useState<VideoMeta | null>(value ? { videoId: value } : null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pollStatus = useCallback((videoId: string, attempt: number) => {
    if (attempt >= MAX_POLL_ATTEMPTS) {
      setState('failed');
      setError('Processing timed out. Please refresh manually.');
      return;
    }

    const delay = Math.min(2000 * Math.pow(1.3, attempt), 30000); // exponential backoff, max 30s
    pollRef.current = setTimeout(async () => {
      try {
        const res = await adminApi.getVideoStatus(videoId);
        const data = res.data.data;
        setPollAttempts(attempt + 1);

        if (data.status === 'ready') {
          const updatedMeta: VideoMeta = {
            videoId,
            duration: data.duration,
            resolution: data.resolution,
            fileSize: data.fileSize,
          };
          setMeta((prev) => ({ ...prev!, ...updatedMeta }));
          setState('ready');
          onChange(videoId, updatedMeta);
        } else if (data.status === 'failed') {
          setState('failed');
          setError(data.error || 'Video processing failed');
        } else {
          pollStatus(videoId, attempt + 1);
        }
      } catch {
        pollStatus(videoId, attempt + 1);
      }
    }, delay);
  }, [onChange]);

  const handleFile = useCallback(async (file: File) => {
    setState('uploading');
    setProgress(0);
    setError('');

    try {
      const result = await adminApi.uploadVideo(file, setProgress);
      const initialMeta: VideoMeta = {
        videoId: result.videoId,
        fileName: result.fileName,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
      };
      setMeta(initialMeta);

      if (result.status === 'ready') {
        setState('ready');
        onChange(result.videoId, initialMeta);
      } else {
        setState('processing');
        setPollAttempts(0);
        pollStatus(result.videoId, 0);
      }
    } catch (err: any) {
      setState('failed');
      setError(err.message || 'Upload failed');
    }
  }, [pollStatus, onChange]);

  const handleReset = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setState('idle');
    setMeta(null);
    setProgress(0);
    setError('');
    setPollAttempts(0);
    onClear?.();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {state === 'idle' && (
        <UploadZone
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          maxSizeMB={5120}
          onFileSelected={handleFile}
          icon={<Film className="w-5 h-5 text-primary/60" />}
          label="Drop video here or click to browse"
        />
      )}

      {state === 'uploading' && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center animate-pulse">
              <Film className="w-5 h-5 text-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{meta?.fileName || 'Uploading...'}</p>
              <p className="text-xs text-secondary">{formatSize(meta?.fileSize)}</p>
            </div>
          </div>
          <UploadProgress progress={progress} label="Uploading to server..." />
        </div>
      )}

      {state === 'processing' && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Processing video...</p>
              <p className="text-xs text-amber-400/80">
                Attempt {pollAttempts} of {MAX_POLL_ATTEMPTS} · Checking every {Math.min(Math.round(2 * Math.pow(1.3, pollAttempts)), 30)}s
              </p>
            </div>
          </div>
          {pollAttempts >= MAX_POLL_ATTEMPTS && (
            <button
              onClick={() => { setPollAttempts(0); pollStatus(meta!.videoId, 0); }}
              className="text-xs text-amber-400 underline"
            >
              Max attempts reached — click to retry
            </button>
          )}
        </div>
      )}

      {state === 'ready' && meta && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary mb-1">{meta.fileName || 'Video uploaded'}</p>
              <div className="flex flex-wrap gap-3 text-xs text-secondary">
                {meta.duration && <span>⏱ {formatDuration(meta.duration)}</span>}
                {meta.resolution && <span>📐 {meta.resolution}</span>}
                {meta.fileSize && <span>💾 {formatSize(meta.fileSize)}</span>}
                <span className="text-green-400">✓ Ready</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-secondary hover:text-primary transition-colors p-1"
              title="Remove video"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {state === 'failed' && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Upload failed</p>
              <p className="text-xs text-secondary">{error}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-primary underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
