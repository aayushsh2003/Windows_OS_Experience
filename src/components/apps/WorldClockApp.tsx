import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

const PRESETS = [
  { city: 'New York', tz: 'America/New_York' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Paris', tz: 'Europe/Paris' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Singapore', tz: 'Asia/Singapore' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Sydney', tz: 'Australia/Sydney' },
  { city: 'Los Angeles', tz: 'America/Los_Angeles' },
  { city: 'São Paulo', tz: 'America/Sao_Paulo' },
];

export function WorldClockApp() {
  const [clocks, setClocks] = useState<{ city: string; tz: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('webos-worldclock') || 'null') || PRESETS.slice(0, 4); }
    catch { return PRESETS.slice(0, 4); }
  });
  const [now, setNow] = useState(new Date());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { localStorage.setItem('webos-worldclock', JSON.stringify(clocks)); }, [clocks]);

  const fmt = (tz: string) => {
    try {
      const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
      const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(now);
      const offset = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';
      return { time, date, offset };
    } catch {
      return { time: '--:--', date: '', offset: '' };
    }
  };

  const add = (c: typeof PRESETS[0]) => {
    if (!clocks.some(x => x.tz === c.tz)) setClocks([...clocks, c]);
    setAdding(false);
  };

  return (
    <div className="h-full bg-background overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">World Clock</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(a => !a)}>
          <Plus className="w-4 h-4 mr-1" />Add City
        </Button>
      </div>

      {adding && (
        <div className="mb-4 p-2 bg-muted rounded-lg grid grid-cols-2 gap-1">
          {PRESETS.filter(p => !clocks.some(c => c.tz === p.tz)).map(p => (
            <button key={p.tz} onClick={() => add(p)} className="text-left px-2 py-1.5 rounded hover:bg-background text-sm">
              {p.city}
            </button>
          ))}
          {PRESETS.every(p => clocks.some(c => c.tz === p.tz)) && <div className="col-span-2 text-center text-xs text-muted-foreground py-2">All cities added</div>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {clocks.map((c, i) => {
          const f = fmt(c.tz);
          return (
            <div key={c.tz} className="relative p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border">
              <button onClick={() => setClocks(cs => cs.filter((_, j) => j !== i))}
                className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
              <div className="text-sm font-medium text-muted-foreground">{c.city}</div>
              <div className="text-4xl font-mono font-bold mt-1 tracking-tight">{f.time}</div>
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>{f.date}</span>
                <span>{f.offset}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
