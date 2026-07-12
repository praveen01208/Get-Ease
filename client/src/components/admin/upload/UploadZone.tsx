import React, { useRef, useState, useCallback, type DragEvent } from 'react';
import { cn } from '@/utils/cn';
import { Upload, Film, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  accept: string;
  maxSizeMB?: number;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  accept, maxSizeMB = 5120, onFileSelected, disabled, label, icon, className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validate = (file: File): string | null => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024)
      return `File exceeds ${maxSizeMB}MB limit`;
    const accepted = accept.split(',').map((a) => a.trim());
    const matches = accepted.some((a) => {
      if (a.startsWith('.')) return file.name.endsWith(a);
      if (a.endsWith('/*')) return file.type.startsWith(a.replace('/*', ''));
      return file.type === a;
    });
    if (!matches) return 'File type not supported';
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    onFileSelected(file);
  }, [onFileSelected]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer',
        isDragging ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.1] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
        disabled && 'opacity-40 pointer-events-none',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
          {icon || <Upload className="w-5 h-5 text-primary/60" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">
            {label || 'Drop file here or click to browse'}
          </p>
          <p className="text-xs text-secondary mt-1">Max {maxSizeMB}MB · {accept}</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}
      </div>
    </div>
  );
};
