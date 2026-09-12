'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Maximize2, 
  Settings, 
  Tv, 
  Shield, 
  Gauge, 
  RotateCw, 
  FlipHorizontal, 
  ChevronDown,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface CameraStreamProps {
  defaultStreamUrl?: string;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  defaultStreamUrl = 'http://10.38.152.203:81/stream'
}) => {
  const [streamUrl, setStreamUrl] = useState<string>(defaultStreamUrl);
  const [resolution, setResolution] = useState<string>('800 × 600 (SVGA)');
  const [quality, setQuality] = useState<string>('High');
  const [frameRate, setFrameRate] = useState<string>('15 FPS');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Extract base IP for ESP32 control (e.g. http://10.38.152.203)
  const getCameraBaseUrl = (): string => {
    try {
      const urlObj = new URL(streamUrl);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return 'http://10.38.152.203';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setCacheBuster(Date.now());
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Change ESP32 framesize if selected
  const handleResolutionChange = (val: string) => {
    setResolution(val);
    const baseUrl = getCameraBaseUrl();
    const frameSizeMap: Record<string, number> = {
      '1600 × 1200 (UXGA)': 10,
      '1280 × 1024 (SXGA)': 9,
      '1024 × 768 (XGA)': 8,
      '800 × 600 (SVGA)': 7,
      '640 × 480 (VGA)': 6,
      '320 × 240 (QVGA)': 4,
    };
    const code = frameSizeMap[val] ?? 7;
    try {
      fetch(`${baseUrl}/control?var=framesize&val=${code}`, { mode: 'no-cors' }).catch(() => {});
      handleRefresh();
    } catch {
      // Ignored
    }
  };

  // Multi-strategy Snapshot Capture
  const handleCapturePhoto = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const baseUrl = getCameraBaseUrl();
    const filename = `aquasentinel-snapshot-${Date.now()}.jpg`;

    const downloadBlob = (blob: Blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    };

    try {
      // Try direct fetch from ESP32 port 80 capture
      const res = await fetch(`${baseUrl}/capture?_ts=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 100) {
          downloadBlob(blob);
          setIsCapturing(false);
          return;
        }
      }
    } catch {
      // Fallback to canvas
    }

    // Canvas fallback
    if (imgRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth || 800;
        canvas.height = imgRef.current.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          if (isFlipped) {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
          }
          ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
          setIsCapturing(false);
          return;
        }
      } catch {
        // Ignored
      }
    }

    // Fallback: Open stream in new tab
    window.open(`${baseUrl}/capture`, '_blank');
    setIsCapturing(false);
  };

  // Transform matrix for flip and mirror
  const transformStyle = {
    transform: `${isMirrored ? 'scaleX(-1)' : ''} ${isFlipped ? 'scaleY(-1)' : ''}`.trim() || undefined
  };

  return (
    <div 
      ref={containerRef}
      className="bg-[#0b1428] border border-[#162544] rounded-2xl p-5 shadow-2xl space-y-4"
    >
      {/* Card Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1d64f2] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              ESP Cam Live
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </div>

        {/* Fullscreen Expand Icon */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162544] transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Card Body (Split into Viewport + Camera Settings Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Section: Live Video Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-black/60 rounded-2xl border border-[#182849] overflow-hidden relative flex items-center justify-center min-h-[340px] sm:min-h-[420px]">
          
          {/* Loading Indicator */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070e1c]/80 backdrop-blur-xs text-slate-300 gap-2">
              <Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" />
              <span className="text-xs font-medium">Connecting to ESP32-CAM stream...</span>
            </div>
          )}

          {/* Connection Error View */}
          {hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070e1c]/90 text-slate-300 p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Stream Offline / Reconnecting</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Ensure ESP32-CAM is powered and reachable at <span className="font-mono text-cyan-400">{streamUrl}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl bg-[#1d64f2] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            </div>
          )}

          {/* Live MJPEG Image Feed */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${streamUrl}-${cacheBuster}`}
            ref={imgRef}
            src={streamUrl}
            alt="ESP32-CAM Live Feed"
            style={transformStyle}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={`w-full h-full object-cover select-none transition-opacity duration-300 ${
              isLoading || hasError ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Right Section: Camera Settings Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-[#081023] border border-[#142340] rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#142340] pb-2.5">
              <Settings className="w-4 h-4 text-[#00d2ff]" />
              <span>Camera Settings</span>
            </div>

            {/* Resolution Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-slate-400" />
                Resolution
              </label>
              <div className="relative">
                <select
                  value={resolution}
                  onChange={(e) => handleResolutionChange(e.target.value)}
                  className="w-full bg-[#0b1428] border border-[#1b2b4e] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="1600 × 1200 (UXGA)">1600 × 1200 (UXGA)</option>
                  <option value="1280 × 1024 (SXGA)">1280 × 1024 (SXGA)</option>
                  <option value="1024 × 768 (XGA)">1024 × 768 (XGA)</option>
                  <option value="800 × 600 (SVGA)">800 × 600 (SVGA)</option>
                  <option value="640 × 480 (VGA)">640 × 480 (VGA)</option>
                  <option value="320 × 240 (QVGA)">320 × 240 (QVGA)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quality Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Quality
              </label>
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-[#0b1428] border border-[#1b2b4e] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Frame Rate Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Frame Rate (FPS)
              </label>
              <div className="relative">
                <select
                  value={frameRate}
                  onChange={(e) => setFrameRate(e.target.value)}
                  className="w-full bg-[#0b1428] border border-[#1b2b4e] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="15 FPS">15 FPS</option>
                  <option value="20 FPS">20 FPS</option>
                  <option value="25 FPS">25 FPS</option>
                  <option value="30 FPS">30 FPS</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Flip Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Flip</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isFlipped ? 'bg-[#1d64f2]' : 'bg-[#152445]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                    isFlipped ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Mirror Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <FlipHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Mirror</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isMirrored ? 'bg-[#1d64f2]' : 'bg-[#152445]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                    isMirrored ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Capture Photo Full-Width Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isCapturing}
              onClick={handleCapturePhoto}
              className="w-full bg-[#1d64f2] hover:bg-[#1956cf] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? 'Capturing...' : 'Capture Photo'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
