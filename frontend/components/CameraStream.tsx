'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, Maximize2, Minimize2, Camera, 
  Settings, AlertTriangle, Play, Pause, Wifi, Radio, ExternalLink,
  Zap, ZapOff, Scaling, Maximize, Sliders, Sun
} from 'lucide-react';

interface CameraStreamProps {
  defaultStreamUrl?: string;
}

function normalizeStreamUrl(url: string): string {
  let trimmed = url.trim();
  if (!trimmed) return 'http://10.38.152.203:81/stream';
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `http://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    // If no port specified and pathname is empty or /
    if (!parsed.port && (parsed.pathname === '/' || parsed.pathname === '')) {
      parsed.port = '81';
      parsed.pathname = '/stream';
      return parsed.toString().replace(/\/$/, '');
    }
    // If port 80 and no pathname
    if (parsed.port === '80' && (parsed.pathname === '/' || parsed.pathname === '')) {
      parsed.port = '81';
      parsed.pathname = '/stream';
      return parsed.toString().replace(/\/$/, '');
    }
    // If user enters http://...:81 without pathname
    if (parsed.port === '81' && (parsed.pathname === '/' || parsed.pathname === '')) {
      parsed.pathname = '/stream';
      return parsed.toString().replace(/\/$/, '');
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  defaultStreamUrl = 'http://10.38.152.203:81/stream'
}) => {
  const initialUrl = normalizeStreamUrl(defaultStreamUrl);
  const [streamUrl, setStreamUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  
  // New features: Fit mode & ESP32-CAM Flash control
  const [fitMode, setFitMode] = useState<'cover' | 'fill' | 'contain'>('cover');
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [activeFramesize, setActiveFramesize] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Live timestamp clock overlay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString());
    return () => clearInterval(timer);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Get base URL (e.g. http://10.38.152.203) for port 80 camera control API
  const getCameraBaseUrl = (): string => {
    try {
      const urlObj = new URL(streamUrl);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return 'http://10.38.152.203';
    }
  };

  // Toggle ESP32-CAM built-in Flash LED (GPIO 4)
  const handleToggleFlash = async () => {
    const nextState = !isFlashOn;
    setIsFlashOn(nextState);
    const baseUrl = getCameraBaseUrl();
    const intensityVal = nextState ? 255 : 0;
    
    try {
      // Fire across common ESP32-CAM firmware control endpoints
      fetch(`${baseUrl}/control?var=led_intensity&val=${intensityVal}`, { mode: 'no-cors' }).catch(() => {});
      fetch(`${baseUrl}/control?var=flash&val=${nextState ? 1 : 0}`, { mode: 'no-cors' }).catch(() => {});
      fetch(`${baseUrl}/control?var=lamp&val=${intensityVal}`, { mode: 'no-cors' }).catch(() => {});
    } catch (e) {
      console.warn('Flash LED control request dispatched (no-cors):', e);
    }
  };

  // Change ESP32-CAM resolution / frame size via Port 80 Control API
  const handleChangeResolution = (framesizeVal: number) => {
    setActiveFramesize(framesizeVal);
    const baseUrl = getCameraBaseUrl();
    try {
      fetch(`${baseUrl}/control?var=framesize&val=${framesizeVal}`, { mode: 'no-cors' }).catch(() => {});
      handleRefresh();
    } catch (e) {
      console.warn('Resolution change request dispatched:', e);
    }
  };

  // Toggle video fit modes (Cover / Fill / Contain)
  const cycleFitMode = () => {
    if (fitMode === 'cover') setFitMode('fill');
    else if (fitMode === 'fill') setFitMode('contain');
    else setFitMode('cover');
  };

  // Refresh stream
  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIsPaused(false);
    setCacheBuster(Date.now());
  };

  // Toggle Pause/Play
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setCacheBuster(Date.now());
      setIsLoading(true);
    } else {
      setIsPaused(true);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen failed:', err);
      });
    }
  };

  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Bulletproof Multi-Strategy Snapshot Capture
  const handleTakeSnapshot = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const baseUrl = getCameraBaseUrl();
    const captureUrl = `${baseUrl}/capture?_ts=${Date.now()}`;
    const filename = `esp32-cam-snapshot-${Date.now()}.jpg`;

    // Helper to trigger browser file download from Blob
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

    // Strategy 1: Direct Client Fetch from Camera Port 80 (/capture)
    try {
      const res = await fetch(captureUrl, { cache: 'no-store' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 100) {
          downloadBlob(blob);
          setIsCapturing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Strategy 1 (Direct fetch) blocked by CORS or network:', err);
    }

    // Strategy 2: FastAPI Backend Proxy (/api/camera/snapshot)
    try {
      const proxyUrl = `http://localhost:8000/api/camera/snapshot?target=${encodeURIComponent(`${baseUrl}/capture`)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 100) {
          downloadBlob(blob);
          setIsCapturing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Strategy 2 (Backend proxy fetch) failed:', err);
    }

    // Strategy 3: Canvas Draw (if image non-tainted)
    if (imgRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth || 640;
        canvas.height = imgRef.current.naturalHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
          setIsCapturing(false);
          return;
        }
      } catch (e) {
        console.warn('Strategy 3 (Canvas draw) tainted by CORS:', e);
      }
    }

    // Strategy 4: Fallback window.open
    window.open(`${baseUrl}/capture`, '_blank');
    setIsCapturing(false);
  };

  // Save new URL with auto-normalization
  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeStreamUrl(inputUrl);
    setStreamUrl(normalized);
    setInputUrl(normalized);
    setIsEditingUrl(false);
    setIsLoading(true);
    setHasError(false);
    setCacheBuster(Date.now());
  };

  const setTargetUrl = (url: string) => {
    setStreamUrl(url);
    setInputUrl(url);
    setIsEditingUrl(false);
    setIsLoading(true);
    setHasError(false);
    setCacheBuster(Date.now());
  };

  // Compute active image source cleanly without query params that break ESP32 httpd URI matching
  // Use undefined (not '') when paused so the browser never receives an empty src attribute
  const activeSrc = isPaused ? undefined : streamUrl;

  return (
    <div 
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-2xl shadow-2xl space-y-4 relative flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              ESP32-CAM Video Stream
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              LIVE OPTICAL FEED
            </h2>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          
          {/* Flashlight LED Toggle */}
          <button
            type="button"
            onClick={handleToggleFlash}
            title={isFlashOn ? 'Turn OFF Onboard Flash LED (GPIO 4)' : 'Turn ON Onboard Flash LED (GPIO 4)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isFlashOn 
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            {isFlashOn ? <Zap className="w-4 h-4 fill-slate-950" /> : <ZapOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFlashOn ? 'FLASH ON' : 'FLASH'}</span>
          </button>

          {/* Video Display Fit Mode Toggle (Cover / Fill / Contain) */}
          <button
            type="button"
            onClick={cycleFitMode}
            title={`Current View Mode: ${fitMode.toUpperCase()} - Click to change aspect ratio rendering`}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <Scaling className="w-4 h-4" />
            <span className="uppercase text-[11px]">{fitMode}</span>
          </button>

          {/* Pause / Play */}
          <button
            type="button"
            onClick={handleTogglePause}
            title={isPaused ? 'Resume Stream' : 'Pause Stream'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Video Stream"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Snapshot */}
          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={isCapturing}
            title={isCapturing ? 'Capturing High-Res Snapshot...' : 'Capture High-Res Snapshot'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isCapturing 
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Camera className={`w-4 h-4 ${isCapturing ? 'animate-spin text-slate-950' : 'text-cyan-400'}`} />
          </button>

          {/* Open Camera WebServer Page in new tab */}
          <a
            href={getCameraBaseUrl()}
            target="_blank"
            rel="noreferrer"
            title="Open ESP32-CAM Controls & Settings Page (Port 80)"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer inline-flex items-center"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
          </a>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setIsEditingUrl(!isEditingUrl)}
            title="Configure Camera Settings & Resolution"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isEditingUrl 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* URL & Camera Controls Panel */}
      {isEditingUrl && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/40 space-y-3 animate-in fade-in duration-200">
          
          {/* Section 1: Stream Address */}
          <form onSubmit={handleSaveUrl} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>ESP32-CAM Stream Address:</span>
              <span className="text-[10px] text-amber-400 font-mono">Stream is on Port 81 (:81/stream)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://10.38.152.203:81/stream"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Section 2: Camera Resolution Control */}
          <div className="border-t border-slate-800 pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sliders className="w-3.5 h-3.5" />
                Change ESP32-CAM Hardware Resolution:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sets OV2640 Sensor Framesize</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '720p HD (16:9 Widescreen)', val: 13 },
                { label: 'VGA 640x480 (4:3)', val: 6 },
                { label: 'SVGA 800x600', val: 7 },
                { label: 'UXGA 1600x1200', val: 10 },
                { label: 'QVGA 320x240', val: 4 }
              ].map((res) => (
                <button
                  key={res.val}
                  type="button"
                  onClick={() => handleChangeResolution(res.val)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                    activeFramesize === res.val
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Quick Preset Targets */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">Quick Endpoints:</span>
            <button
              type="button"
              onClick={() => setTargetUrl('http://10.38.152.203:81/stream')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold cursor-pointer"
            >
              :81/stream (ESP32-CAM Default)
            </button>
            <button
              type="button"
              onClick={() => setTargetUrl('http://10.38.152.203/stream')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono cursor-pointer"
            >
              :80/stream
            </button>
            <button
              type="button"
              onClick={() => setTargetUrl('http://10.38.152.203/capture')}
              className="px-2.5 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 text-[10px] font-mono cursor-pointer"
            >
              :80/capture (Still Frame)
            </button>
          </div>
        </div>
      )}

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
        
        {/* Loading Spinner */}
        {isLoading && !hasError && !isPaused && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-xs font-mono text-slate-400 animate-pulse">
              Establishing MJPEG stream from {streamUrl}...
            </span>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 space-y-2">
            <Pause className="w-10 h-10 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Stream Paused
            </span>
            <button
              type="button"
              onClick={handleTogglePause}
              className="mt-2 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 cursor-pointer"
            >
              Resume Stream
            </button>
          </div>
        )}

        {/* Error / Offline Screen */}
        {hasError && !isPaused && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center space-y-3 overflow-y-auto">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Camera Stream Waiting / Busy
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
                Active target: <span className="text-amber-300 font-bold">{streamUrl}</span>
              </p>
            </div>

            {/* Quick Fix Options */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTargetUrl('http://10.38.152.203:81/stream')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Use :81/stream (Standard ESP32-CAM)
              </button>
              <button
                type="button"
                onClick={() => setTargetUrl('http://10.38.152.203/stream')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Use :80/stream
              </button>
              <button
                type="button"
                onClick={() => setTargetUrl('http://10.38.152.203/capture')}
                className="px-3 py-1.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-purple-200 text-xs font-semibold border border-purple-600/50 transition-colors cursor-pointer"
              >
                Use :80/capture (Still Frame)
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            </div>

            {/* Crucial ESP32-CAM Tips */}
            <div className="text-[11px] text-slate-400 max-w-md pt-2 space-y-1 bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-left">
              <p className="text-amber-300 font-bold flex items-center gap-1">
                <span>💡</span> ESP32-CAM Dual Port Architecture:
              </p>
              <p>• The settings control webpage runs on port 80: <a href="http://10.38.152.203" target="_blank" rel="noreferrer" className="underline text-blue-400">http://10.38.152.203 ↗</a></p>
              <p>• The live MJPEG stream runs on port 81: <span className="font-mono text-emerald-400 font-bold">http://10.38.152.203:81/stream</span></p>
              <p className="text-rose-300 font-semibold">• ⚠️ Important: ESP32-CAM allows only <strong>one active stream client</strong> at a time. If the stream is currently playing in your other browser tab, please stop or close that tab so this dashboard can connect!</p>
            </div>
          </div>
        )}

        {/* Live MJPEG Image Feed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${streamUrl}-${cacheBuster}`}
          ref={imgRef}
          src={activeSrc}
          alt="ESP32-CAM Live Feed"
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full select-none transition-all duration-300 ${
            fitMode === 'cover' 
              ? 'object-cover' 
              : fitMode === 'fill' 
                ? 'object-fill' 
                : 'object-contain'
          } ${isLoading || hasError || isPaused ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Top Floating HUD Indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-mono font-black text-[11px] tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.6)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 font-mono text-[10px] backdrop-blur-md hidden sm:inline-block">
              MJPEG
            </span>
            {isFlashOn && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-mono font-bold text-[10px] backdrop-blur-md animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 fill-slate-950" />
                FLASH ACTIVE
              </span>
            )}
          </div>

          <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-xs backdrop-blur-md shadow-sm">
            {currentTime}
          </div>
        </div>

        {/* Bottom Floating HUD Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/80 text-slate-400 font-mono text-[10px] backdrop-blur-md">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>{streamUrl}</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700/80 backdrop-blur-md uppercase">
            {fitMode} MODE • OV2640
          </span>
        </div>

      </div>

      {/* Footer Info Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Stream Target:</span>
          <span className="font-mono text-slate-300 font-semibold">{streamUrl}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>FLASH: {isFlashOn ? 'ON' : 'OFF'}</span>
          <span>FIT: {fitMode.toUpperCase()}</span>
          <span>FORMAT: MJPEG / HTTP</span>
        </div>
      </div>

    </div>
  );
};
