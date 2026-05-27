import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';

type Tab = 'clock' | 'stopwatch' | 'timer';

const WORLD_CITIES = [
  { name: 'New York', tz: 'America/New_York' },
  { name: 'London', tz: 'Europe/London' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'Paris', tz: 'Europe/Paris' },
  { name: 'Mumbai', tz: 'Asia/Kolkata' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
];

export function ClockApp() {
  const [tab, setTab] = useState<Tab>('clock');

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex border-b border-border">
        {(['clock', 'stopwatch', 'timer'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto win-scrollbar">
        {tab === 'clock' && <WorldClock />}
        {tab === 'stopwatch' && <Stopwatch />}
        {tab === 'timer' && <Timer />}
      </div>
    </div>
  );
}

function WorldClock() {
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-4">
      {/* Local time */}
      <div className="text-center mb-6">
        <p className="text-4xl font-light text-foreground tabular-nums">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* World clocks */}
      <div className="space-y-2">
        {WORLD_CITIES.filter(c => selected.includes(c.tz)).map(city => (
          <div key={city.tz} className="flex items-center justify-between bg-muted rounded-lg p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{city.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {now.toLocaleDateString('en', { timeZone: city.tz, weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-light text-foreground tabular-nums">
                {now.toLocaleTimeString('en', { timeZone: city.tz, hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={() => setSelected(s => s.filter(z => z !== city.tz))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add city */}
      {selected.length < WORLD_CITIES.length && (
        <div className="mt-3">
          <select onChange={e => { if (e.target.value) setSelected(s => [...s, e.target.value]); e.target.value = ''; }}
            className="w-full text-xs bg-muted text-foreground p-2 rounded-lg border border-border">
            <option value="">+ Add city...</option>
            {WORLD_CITIES.filter(c => !selected.includes(c.tz)).map(c => (
              <option key={c.tz} value={c.tz}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startTime = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    if (running) {
      startTime.current = Date.now() - elapsed;
      const tick = () => {
        setElapsed(Date.now() - startTime.current);
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  const format = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-6">
      <p className="text-5xl font-light text-foreground tabular-nums mb-6">{format(elapsed)}</p>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setRunning(!running)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        {running && (
          <button onClick={() => setLaps([elapsed, ...laps])}
            className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        )}
        {!running && elapsed > 0 && (
          <button onClick={() => { setElapsed(0); setLaps([]); }}
            className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
      {laps.length > 0 && (
        <div className="w-full max-w-xs space-y-1">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-xs text-muted-foreground bg-muted rounded px-3 py-1.5">
              <span>Lap {laps.length - i}</span>
              <span className="tabular-nums">{format(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Timer() {
  const [totalSec, setTotalSec] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false);
            try { new Notification('Timer', { body: 'Time is up! ⏰', icon: '/pwa-192.png' }); } catch {}
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const presets = [60, 180, 300, 600, 900, 1800];

  return (
    <div className="flex flex-col items-center p-6">
      <p className="text-5xl font-light text-foreground tabular-nums mb-4">{formatTimer(remaining)}</p>
      <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(remaining / totalSec) * 100}%` }} />
      </div>

      {!running && remaining === totalSec && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {presets.map(p => (
            <button key={p} onClick={() => { setTotalSec(p); setRemaining(p); }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${totalSec === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-secondary'}`}>
              {p >= 60 ? `${p / 60}m` : `${p}s`}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setRunning(!running)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        {!running && remaining < totalSec && (
          <button onClick={() => { setRemaining(totalSec); }}
            className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
