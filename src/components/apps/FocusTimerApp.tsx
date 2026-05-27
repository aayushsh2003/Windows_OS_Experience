import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, Volume2 } from 'lucide-react';

type Mode = 'focus' | 'short-break' | 'long-break';

const modeConfig: Record<Mode, { label: string; minutes: number; color: string; icon: React.ReactNode }> = {
  'focus': { label: 'Focus', minutes: 25, color: 'text-red-500', icon: <Brain className="w-5 h-5" /> },
  'short-break': { label: 'Short Break', minutes: 5, color: 'text-green-500', icon: <Coffee className="w-5 h-5" /> },
  'long-break': { label: 'Long Break', minutes: 15, color: 'text-blue-500', icon: <Coffee className="w-5 h-5" /> },
};

export function FocusTimerApp() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem('webos-pomodoro-sessions') || '0'); } catch { return 0; }
  });
  const [playSound, setPlaySound] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('webos-pomodoro-sessions', sessions.toString());
  }, [sessions]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setRunning(false);
            if (mode === 'focus') {
              setSessions(s => s + 1);
              if (playSound) {
                try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczGjl+q9DJdkQiN2yew8F2RiU3Zpmzun5JLDZWZ4N3X0M8PnOOqqqKa0UoOmmStK2Ca0cpOGqbt7GCaUIkN2matbGBZ0AlNGSUsK6GaUMmNWWWr6+Fa0ImNWWVsK+GakQlNGSUr6+HakQlNGOVr7CIa0UlNWWVr7CHa0QlNGSVsLCHa0QkNGSVr7CHbEQlNGSVr7CHa0QlNWSVr6+Ha0UkNGSVr7CHa0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNWSVr7CHa0QlNGSVr6+HbEQlNWSVr6+Ha0QlNGSVr7CHa0QkNGSVsLCHa0QlNGSVr7CHa0QlNGSVr7CHa0QlNWSUr6+Ha0UlNGSVr7CHa0QlNGSVsLCHa0QlNGSVr7CHa0QlNWSVr7CHa0QlNGSVr6+Ha0QkNGSVr7CHa0UlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QkNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QkNWSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr7CHa0QlNWSVr6+Ha0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QkNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNWSVr7CHa0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr7CHa0QlNWSVr6+Ha0QlNGSVr7CHa0QlNGSVr6+Ha0QkNGSVr6+Ha0QlNWSVr6+Ha0QlNGSVr6+Ha0QlNWSVr7CHa0QlNGSVr7CHa0QlNGSVr6+Ha0QlNWSVr6+HbA==').play(); } catch {}
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, playSound]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(modeConfig[m].minutes * 60);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(modeConfig[mode].minutes * 60);
    setRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (modeConfig[mode].minutes * 60);
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="flex flex-col items-center h-full bg-background p-6">
      {/* Mode selector */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
        {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([key, cfg]) => (
          <button key={key} onClick={() => switchMode(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${mode === key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {cfg.icon}
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="relative w-64 h-64 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
          <circle cx="130" cy="130" r="120" stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-mono font-light text-foreground`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className={`text-sm mt-1 ${modeConfig[mode].color}`}>{modeConfig[mode].label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={reset} className="p-3 rounded-full bg-muted hover:bg-secondary transition-colors">
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
        </button>
        <button onClick={() => setRunning(!running)}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 shadow-lg transition-transform active:scale-95">
          {running ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>
        <button onClick={() => setPlaySound(!playSound)} className="p-3 rounded-full bg-muted hover:bg-secondary transition-colors">
          <Volume2 className={`w-5 h-5 ${playSound ? 'text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      {/* Sessions counter */}
      <div className="bg-muted rounded-xl px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground">Completed Sessions</p>
        <p className="text-2xl font-bold text-foreground">{sessions}</p>
        <button onClick={() => setSessions(0)} className="text-[10px] text-primary hover:underline mt-1">Reset</button>
      </div>
    </div>
  );
}
