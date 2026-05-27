import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, X } from 'lucide-react';

interface ProcessInfo {
  name: string;
  cpu: number;
  memory: number;
  status: 'Running' | 'Suspended';
}

interface TaskManagerProps {
  windows?: { id: string; appId: string; title: string; minimized: boolean; isActive?: boolean }[];
  onEndTask?: (id: string) => void;
}

export function TaskManagerApp({ windows = [], onEndTask }: TaskManagerProps) {
  const [tab, setTab] = useState<'processes' | 'performance'>('processes');
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(30).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(new Array(30).fill(0));
  const [sysInfo, setSysInfo] = useState({ cores: 0, memory: 0, online: true });
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  useEffect(() => {
    setSysInfo({
      cores: navigator.hardwareConcurrency || 4,
      memory: (navigator as any).deviceMemory || 8,
      online: navigator.onLine,
    });

    const interval = setInterval(() => {
      const baseCpu = 5 + windows.length * 8 + Math.random() * 15;
      const baseMem = 20 + windows.length * 5 + Math.random() * 10;
      setCpuHistory(prev => [...prev.slice(1), Math.min(100, baseCpu)]);
      setMemHistory(prev => [...prev.slice(1), Math.min(100, baseMem)]);
    }, 1000);

    return () => clearInterval(interval);
  }, [windows.length]);

  const systemProcesses: ProcessInfo[] = [
    { name: 'System', cpu: 0.1, memory: 12, status: 'Running' },
    { name: 'Desktop Window Manager', cpu: 1.2, memory: 45, status: 'Running' },
    { name: 'WebOS Shell', cpu: 0.5, memory: 32, status: 'Running' },
    { name: 'Service Host', cpu: 0.3, memory: 18, status: 'Running' },
    { name: 'Runtime Broker', cpu: 0.1, memory: 8, status: 'Running' },
  ];

  const appProcesses: ProcessInfo[] = windows.map(w => ({
    name: w.title,
    cpu: Math.round(Math.random() * 50 + 5) / 10,
    memory: Math.round(Math.random() * 80 + 20),
    status: w.minimized ? 'Suspended' as const : 'Running' as const,
  }));

  const allProcesses = [...appProcesses, ...systemProcesses];

  return (
    <div className="flex flex-col h-full bg-background text-xs">
      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/50">
        <button onClick={() => setTab('processes')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${tab === 'processes' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Processes
        </button>
        <button onClick={() => setTab('performance')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${tab === 'performance' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Performance
        </button>
      </div>

      {tab === 'processes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr,60px,70px,70px,32px] gap-2 px-3 py-1.5 bg-muted text-muted-foreground font-medium border-b border-border">
            <span>Name</span><span>CPU</span><span>Memory</span><span>Status</span><span></span>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto win-scrollbar">
            {windows.length > 0 && (
              <>
                <p className="px-3 py-1 text-[10px] text-muted-foreground font-semibold bg-muted/30">Apps ({windows.length})</p>
                {windows.map((w, i) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedProcess(w.id)}
                    className={`grid grid-cols-[1fr,60px,70px,70px,32px] gap-2 px-3 py-1.5 items-center cursor-pointer transition-colors ${
                      w.isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    } ${selectedProcess === w.id ? 'bg-primary/15' : 'hover:bg-muted/50'}`}
                  >
                    <span className="text-foreground truncate flex items-center gap-1.5">
                      {w.isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      {w.title}
                    </span>
                    <span className="text-muted-foreground">{appProcesses[i]?.cpu}%</span>
                    <span className="text-muted-foreground">{appProcesses[i]?.memory} MB</span>
                    <span className={w.minimized ? 'text-yellow-500' : 'text-green-500'}>
                      {w.minimized ? 'Suspended' : 'Running'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); onEndTask?.(w.id); }}
                      className="p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
                      title="End task"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </>
            )}
            <p className="px-3 py-1 text-[10px] text-muted-foreground font-semibold bg-muted/30">Background processes ({systemProcesses.length})</p>
            {systemProcesses.map(p => (
              <div key={p.name} className="grid grid-cols-[1fr,60px,70px,70px,32px] gap-2 px-3 py-1.5 hover:bg-muted/50 items-center">
                <span className="text-foreground truncate">{p.name}</span>
                <span className="text-muted-foreground">{p.cpu}%</span>
                <span className="text-muted-foreground">{p.memory} MB</span>
                <span className="text-green-500">Running</span>
                <span />
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/50">
            <span className="text-muted-foreground">{allProcesses.length} processes</span>
            {onEndTask && selectedProcess && windows.some(w => w.id === selectedProcess) && (
              <button onClick={() => { onEndTask(selectedProcess); setSelectedProcess(null); }}
                className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
                End task
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="flex-1 overflow-y-auto win-scrollbar p-4 space-y-4">
          <PerfCard title="CPU" icon={<Cpu className="w-4 h-4" />} value={`${cpuHistory[cpuHistory.length - 1].toFixed(0)}%`}
            subtitle={`${sysInfo.cores} Logical Processors`} history={cpuHistory} color="hsl(var(--primary))" />
          <PerfCard title="Memory" icon={<Activity className="w-4 h-4" />} value={`${memHistory[memHistory.length - 1].toFixed(0)}%`}
            subtitle={`${sysInfo.memory} GB Available`} history={memHistory} color="hsl(270, 70%, 60%)" />
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Network</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${sysInfo.online ? 'bg-green-500' : 'bg-destructive'}`} />
              <span className="text-xs text-muted-foreground">{sysInfo.online ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Disk</span>
            </div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PerfCard({ title, icon, value, subtitle, history, color }: {
  title: string; icon: React.ReactNode; value: string; subtitle: string;
  history: number[]; color: string;
}) {
  const w = 260, h = 60;
  const points = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - (v / 100) * h}`).join(' ');

  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className="text-lg font-semibold text-foreground">{value}</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="rounded">
        <rect width={w} height={h} className="fill-muted-foreground/10" rx="4" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
        <polygon points={`0,${h} ${points} ${w},${h}`} fill={color} opacity="0.15" />
      </svg>
      <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
