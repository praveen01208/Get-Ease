import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  overlayOpacity?: number;
}

export const VideoPlayer = ({ 
  src, 
  poster, 
  autoPlay = true, 
  loop = true, 
  muted = true, 
  playsInline = true,
  className,
  overlayOpacity = 50,
  ...props 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(error => {
        console.warn("Video auto-play failed", error);
      });
    }
  }, [autoPlay]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        className="absolute inset-0 w-full h-full object-cover"
        {...props}
      />
      {overlayOpacity > 0 && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none" 
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
    </div>
  );
};
