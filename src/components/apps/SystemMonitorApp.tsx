import { useState, useEffect, useRef } from 'react';
import { Cpu, HardDrive, Wifi, Monitor } from 'lucide-react';

export function SystemMonitorApp() {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(40).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(40).fill(0));
  const [tab, setTab] = useState<'cpu' | 'memory' | 'network' | 'gpu'>('cpu');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(5, Math.min(95, last + (Math.random() - 0.48) * 20));
        return [...prev.slice(1), next];
      });
      setMemHistory(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(20, Math.min(85, last + (Math.random() - 0.5) * 5));
        return [...prev.slice(1), next];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    const data = tab === 'cpu' ? cpuHistory : memHistory;
    const color = tab === 'cpu' ? '#3b82f6' : '#8b5cf6';

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let i = 0; i < data.length; i++) {
      const x = (w / (data.length - 1)) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (w / (data.length - 1)) * i;
      const y = h - (v / 100) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('#', '');
    // Simple alpha fill
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, [cpuHistory, memHistory, tab]);

  const currentVal = tab === 'cpu' ? cpuHistory[cpuHistory.length - 1] : memHistory[memHistory.length - 1];

  const tabs = [
    { id: 'cpu' as const, label: 'CPU', icon: Cpu },
    { id: 'memory' as const, label: 'Memory', icon: HardDrive },
    { id: 'network' as const, label: 'Network', icon: Wifi },
    { id: 'gpu' as const, label: 'GPU', icon: Monitor },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2
              ${tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{tab === 'cpu' ? 'CPU Usage' : tab === 'memory' ? 'Memory Usage' : tab === 'network' ? 'Network Activity' : 'GPU Usage'}</span>
          <span className="text-2xl font-bold text-foreground">{Math.round(currentVal)}%</span>
        </div>
        <canvas ref={canvasRef} width={500} height={200} className="w-full h-48 rounded-lg border border-border bg-card" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          <InfoCard label="Cores" value={`${navigator.hardwareConcurrency || '?'}`} />
          <InfoCard label="Platform" value={navigator.platform} />
          <InfoCard label="Language" value={navigator.language} />
          <InfoCard label="Screen" value={`${screen.width}×${screen.height}`} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
