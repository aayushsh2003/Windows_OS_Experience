import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  date: string;
}

export function VoiceRecorderApp() {
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordings(prev => [{
          id: Date.now().toString(),
          name: `Recording ${prev.length + 1}`,
          blob, url,
          duration: elapsed,
          date: new Date().toLocaleString(),
        }, ...prev]);
        stream.getTracks().forEach(t => t.stop());
        setElapsed(0);
      };

      recorder.start();
      setRecording(true);
      const start = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 100);
    } catch {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const playRecording = (rec: Recording) => {
    if (playing === rec.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.url);
    audio.onended = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(rec.id);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const downloadRecording = (rec: Recording) => {
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = `${rec.name}.webm`;
    a.click();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Record area */}
      <div className="flex flex-col items-center justify-center py-8 border-b border-border">
        <p className="text-4xl font-light text-foreground tabular-nums mb-6">{formatTime(elapsed)}</p>

        {/* Visualizer placeholder */}
        {recording && (
          <div className="flex items-end gap-1 h-8 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${300 + Math.random() * 400}ms`,
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            recording
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {recording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          {recording ? 'Tap to stop' : 'Tap to record'}
        </p>
      </div>

      {/* Recordings list */}
      <div className="flex-1 overflow-y-auto win-scrollbar p-3 space-y-1">
        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mic className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No recordings yet</p>
          </div>
        ) : (
          recordings.map(rec => (
            <div key={rec.id} className="group flex items-center gap-3 p-3 rounded-lg bg-muted/60 hover:bg-muted transition-colors">
              <button
                onClick={() => playRecording(rec)}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
              >
                {playing === rec.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{rec.name}</p>
                <p className="text-[10px] text-muted-foreground">{rec.date} • {formatTime(rec.duration)}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => downloadRecording(rec)} className="p-1.5 rounded hover:bg-secondary">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => deleteRecording(rec.id)} className="p-1.5 rounded hover:bg-secondary">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
