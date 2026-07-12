import React, { useState, useCallback } from 'react';
import { File, CheckCircle, XCircle, FileText, Archive, Link } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { UploadZone } from './UploadZone';
import { UploadProgress } from './UploadProgress';
import { cn } from '@/utils/cn';

type FileState = 'idle' | 'uploading' | 'done' | 'failed';

interface FileResult {
  fileId: string;
  storageKey: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storageProvider: string;
}

interface FileUploaderProps {
  accept?: string;
  folder?: string;
  label?: string;
  onUploaded: (result: FileResult) => void;
  className?: string;
}

const typeIcon = (mime: string) => {
  if (mime.includes('pdf')) return <FileText className="w-4 h-4" />;
  if (mime.includes('zip') || mime.includes('compressed')) return <Archive className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '.pdf,.zip,.mp4,.docx,.xlsx',
  folder = 'resources',
  label,
  onUploaded,
  className,
}) => {
  const [state, setState] = useState<FileState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FileResult | null>(null);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setState('uploading');
    setProgress(0);
    setError('');

    try {
      const data = await adminApi.uploadFile(file, folder, setProgress);
      setResult(data);
      setState('done');
      onUploaded(data);
    } catch (err: any) {
      setState('failed');
      setError(err.message || 'Upload failed');
    }
  }, [folder, onUploaded]);

  const reset = () => {
    setState('idle');
    setResult(null);
    setProgress(0);
    setError('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {state === 'idle' && (
        <UploadZone
          accept={accept}
          maxSizeMB={500}
          onFileSelected={handleFile}
          label={label || 'Drop file here or click to browse'}
        />
      )}

      {state === 'uploading' && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-primary/60">
              <File className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-primary">Uploading file...</p>
          </div>
          <UploadProgress progress={progress} />
        </div>
      )}

      {state === 'done' && result && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{result.originalFilename}</p>
              <div className="flex gap-3 text-xs text-secondary">
                <span>{formatSize(result.fileSize)}</span>
                <span>·</span>
                <span className="text-green-400">{result.storageProvider}</span>
              </div>
              <p className="text-[10px] text-secondary/50 mt-0.5 font-mono truncate">{result.storageKey}</p>
            </div>
            <button onClick={reset} className="text-secondary hover:text-primary p-1">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {state === 'failed' && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Upload failed</p>
              <p className="text-xs text-secondary">{error}</p>
            </div>
            <button onClick={reset} className="text-xs text-primary underline">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
};
