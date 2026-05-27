import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Calendar, Clock, Cpu, HardDrive, X } from 'lucide-react';

interface WidgetsPanelProps {
  onClose: () => void;
}

export function WidgetsPanel({ onClose }: WidgetsPanelProps) {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch {}
    });
  }, []);

  const tips = [
    '💡 Press Win+D to show desktop',
    '💡 Right-click for context menu',
    '💡 Drag windows to edges to snap',
    '💡 Double-click title bar to maximize',
  ];
  const [tipIdx] = useState(Math.floor(Math.random() * tips.length));

  return (
    <>
      <div className="fixed inset-0 z-[9997]" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-12 w-80 z-[9998] overflow-y-auto win-scrollbar start-menu-animate"
        style={{ background: 'hsl(var(--win-start-bg) / 0.92)', backdropFilter: 'blur(40px)' }}>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-win-start-fg">Widgets</h2>
            <button onClick={onClose} className="p-1 hover:bg-[hsl(0,0%,100%,0.08)] rounded">
              <X className="w-4 h-4 text-win-start-fg" />
            </button>
          </div>

          {/* Clock Widget */}
          <div className="bg-[hsl(0,0%,100%,0.06)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-win-start-fg">Clock</span>
            </div>
            <p className="text-3xl font-light text-win-start-fg">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Weather Widget */}
          <div className="bg-[hsl(0,0%,100%,0.06)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-win-start-fg">Weather</span>
            </div>
            {weather ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{weather.weathercode < 3 ? '☀️' : weather.weathercode < 50 ? '☁️' : '🌧️'}</span>
                <div>
                  <p className="text-2xl font-light text-win-start-fg">{weather.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">Wind: {weather.windspeed} km/h</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Loading weather...</p>
            )}
          </div>

          {/* Calendar Widget */}
          <div className="bg-[hsl(0,0%,100%,0.06)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-win-start-fg">Calendar</span>
            </div>
            <MiniCalendar />
          </div>

          {/* System Widget */}
          <div className="bg-[hsl(0,0%,100%,0.06)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-win-start-fg">System</span>
            </div>
            <div className="space-y-2">
              <StatBar label="CPU" value={Math.round(30 + Math.random() * 40)} color="bg-primary" />
              <StatBar label="RAM" value={Math.round(40 + Math.random() * 30)} color="bg-purple-500" />
              <StatBar label="Disk" value={Math.round(50 + Math.random() * 20)} color="bg-green-500" />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[hsl(0,0%,100%,0.06)] rounded-xl p-4">
            <p className="text-xs text-win-start-fg">{tips[tipIdx]}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <span key={i} className="text-[10px] text-muted-foreground py-1">{d}</span>
        ))}
        {days.map((d, i) => (
          <span key={i} className={`text-[11px] py-1 rounded ${d === today ? 'bg-primary text-primary-foreground font-bold' : d ? 'text-win-start-fg' : ''}`}>
            {d || ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-win-start-fg">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-[hsl(0,0%,100%,0.1)] rounded-full">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
