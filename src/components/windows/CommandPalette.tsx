import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Command as CmdIcon } from 'lucide-react';
import { apps } from '@/data/apps';
import { AppDef } from '@/types/windows';

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  run: () => void;
}

interface Props {
  onClose: () => void;
  onOpenApp: (app: AppDef) => void;
  onLock: () => void;
  onMinimizeAll: () => void;
  onToggleTheme: () => void;
  onToggleSounds: () => void;
  soundsOn: boolean;
}

export function CommandPalette({ onClose, onOpenApp, onLock, onMinimizeAll, onToggleTheme, onToggleSounds, soundsOn }: Props) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const actions: Action[] = useMemo(() => [
    ...apps.map(a => ({
      id: `open-${a.id}`, label: `Open ${a.title}`, hint: 'App', icon: a.icon,
      run: () => { onOpenApp(a); onClose(); },
    })),
    { id: 'lock', label: 'Lock screen', hint: 'System', icon: '🔒', run: () => { onLock(); onClose(); } },
    { id: 'min', label: 'Show desktop', hint: 'System', icon: '🖥️', run: () => { onMinimizeAll(); onClose(); } },
    { id: 'theme', label: 'Toggle dark / light theme', hint: 'System', icon: '🌓', run: () => { onToggleTheme(); onClose(); } },
    { id: 'sounds', label: `Turn sounds ${soundsOn ? 'off' : 'on'}`, hint: 'System', icon: '🔊', run: () => { onToggleSounds(); onClose(); } },
    { id: 'reload', label: 'Reload OS', hint: 'System', icon: '🔄', run: () => location.reload() },
  ], [onOpenApp, onClose, onLock, onMinimizeAll, onToggleTheme, onToggleSounds, soundsOn]);

  const filtered = useMemo(() => {
    if (!q.trim()) return actions.slice(0, 30);
    const lq = q.toLowerCase();
    return actions.filter(a => a.label.toLowerCase().includes(lq)).slice(0, 30);
  }, [actions, q]);

  useEffect(() => { setIdx(0); }, [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[idx]?.run(); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100000]" onClick={onClose} />
      <div className="fixed left-1/2 top-24 -translate-x-1/2 w-[560px] max-w-[92vw] z-[100001] rounded-xl win-glass win-shadow border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a command or app name..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">ESC</kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto py-1">
          {filtered.length === 0 && <div className="px-4 py-6 text-center text-xs text-muted-foreground">No matches</div>}
          {filtered.map((a, i) => (
            <button
              key={a.id}
              onClick={a.run}
              onMouseEnter={() => setIdx(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left ${i === idx ? 'bg-primary/15' : ''}`}
            >
              <span className="text-base">{a.icon}</span>
              <span className="flex-1 text-sm text-foreground">{a.label}</span>
              {a.hint && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{a.hint}</span>}
            </button>
          ))}
        </div>
        <div className="px-3 py-1.5 border-t border-border bg-muted/40 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><CmdIcon className="w-3 h-3" /> Command Palette</span>
          <span>↑↓ navigate · ⏎ run · ESC close</span>
        </div>
      </div>
    </>
  );
}
