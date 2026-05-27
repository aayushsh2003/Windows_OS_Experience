import { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, FolderOpen } from 'lucide-react';

export function VideoPlayerApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const openFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Video', accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.mkv', '.avi'] } }],
        });
        const file = await handle.getFile();
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setVideoName(file.name);
        setPlaying(true);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
          setVideoName(file.name);
          setPlaying(true);
        };
        input.click();
      }
    } catch {}
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const seek = (val: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = val;
    setCurrent(val);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const skip = (delta: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {!videoUrl ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/50 text-sm">No video loaded</p>
          <button
            onClick={openFile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <FolderOpen className="w-4 h-4" /> Open Video
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 relative flex items-center justify-center bg-black" onClick={togglePlay}>
            <video
              ref={videoRef}
              src={videoUrl}
              className="max-w-full max-h-full"
              onTimeUpdate={() => setCurrent(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => {
                setDuration(videoRef.current?.duration || 0);
                videoRef.current?.play();
              }}
              onEnded={() => setPlaying(false)}
            />
          </div>

          {/* Controls */}
          <div className="bg-black/80 backdrop-blur px-4 py-2 space-y-2">
            <div className="flex items-center gap-2 text-white/60 text-[10px]">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={currentTime}
                onChange={e => seek(Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none bg-white/20 accent-primary cursor-pointer"
              />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[11px] truncate max-w-[150px]">{videoName}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => skip(-10)} className="p-1.5 rounded hover:bg-white/10 text-white/70">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={togglePlay} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => skip(10)} className="p-1.5 rounded hover:bg-white/10 text-white/70">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-white/50" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-16 h-1 rounded-full appearance-none bg-white/20 accent-primary cursor-pointer"
                />
                <button onClick={openFile} className="p-1.5 rounded hover:bg-white/10 text-white/70 ml-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
