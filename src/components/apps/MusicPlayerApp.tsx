import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, FolderOpen, Music, Repeat, Shuffle } from 'lucide-react';

interface Track {
  name: string;
  file: File;
  url: string;
  duration: number;
}

export function MusicPlayerApp() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;

  useEffect(() => {
    return () => { tracks.forEach(t => URL.revokeObjectURL(t.url)); };
  }, []);

  const openFiles = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*';
    input.onchange = () => {
      if (!input.files) return;
      const newTracks: Track[] = Array.from(input.files).map(f => ({
        name: f.name.replace(/\.[^/.]+$/, ''),
        file: f,
        url: URL.createObjectURL(f),
        duration: 0,
      }));
      setTracks(prev => [...prev, ...newTracks]);
      if (currentIndex === -1 && newTracks.length > 0) {
        setCurrentIndex(tracks.length);
      }
    };
    input.click();
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    if (shuffle) {
      setCurrentIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentIndex((currentIndex + 1) % tracks.length);
    }
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    setCurrentIndex(currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1);
    setIsPlaying(true);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => repeat ? (audioRef.current!.currentTime = 0, audioRef.current!.play()) : nextTrack()}
      />

      {/* Album art area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="w-32 h-32 rounded-xl bg-muted flex items-center justify-center mb-4 shadow-lg">
          <Music className="w-16 h-16 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground truncate max-w-[80%] text-center">
          {currentTrack?.name || 'No track selected'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {tracks.length} track{tracks.length !== 1 ? 's' : ''} loaded
        </p>
      </div>

      {/* Progress */}
      <div className="px-4 pb-1">
        <input
          type="range" min={0} max={duration || 1} step={0.1} value={currentTime}
          onChange={e => { if (audioRef.current) audioRef.current.currentTime = +e.target.value; }}
          className="w-full h-1 accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-3">
        <button onClick={() => setShuffle(!shuffle)} className={`p-2 rounded-full transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Shuffle className="w-4 h-4" />
        </button>
        <button onClick={prevTrack} className="p-2 rounded-full hover:bg-muted text-foreground"><SkipBack className="w-5 h-5" /></button>
        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={nextTrack} className="p-2 rounded-full hover:bg-muted text-foreground"><SkipForward className="w-5 h-5" /></button>
        <button onClick={() => setRepeat(!repeat)} className={`p-2 rounded-full transition-colors ${repeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <button onClick={() => setMuted(!muted)} className="text-muted-foreground">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
          onChange={e => { setVolume(+e.target.value); setMuted(false); }}
          className="flex-1 h-1 accent-primary cursor-pointer" />
      </div>

      {/* Playlist */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-foreground">Playlist</span>
          <button onClick={openFiles} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <FolderOpen className="w-3.5 h-3.5" /> Add Files
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto win-scrollbar">
          {tracks.map((t, i) => (
            <button key={i} onClick={() => { setCurrentIndex(i); setIsPlaying(true); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors ${i === currentIndex ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>
              <Music className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.name}</span>
            </button>
          ))}
          {tracks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Click "Add Files" to load music from your PC</p>
          )}
        </div>
      </div>
    </div>
  );
}
