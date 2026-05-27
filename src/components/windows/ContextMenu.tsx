import { useEffect, useRef } from 'react';
import { AppDef } from '@/types/windows';
import { RefreshCw, Monitor, FolderOpen, Terminal, Info } from 'lucide-react';
import { apps } from '@/data/apps';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenApp: (app: AppDef) => void;
  onRefresh: () => void;
}

export function ContextMenu({ x, y, onClose, onOpenApp, onRefresh }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  // Keep menu within viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 280),
    left: Math.min(x, window.innerWidth - 200),
    zIndex: 99999,
  };

  const items = [
    { label: 'View', icon: <Monitor className="w-3.5 h-3.5" />, submenu: true },
    { label: 'Sort by', icon: null, submenu: true },
    { divider: true },
    { label: 'Refresh', icon: <RefreshCw className="w-3.5 h-3.5" />, action: onRefresh },
    { divider: true },
    { label: 'New Folder', icon: <FolderOpen className="w-3.5 h-3.5" />, action: () => onOpenApp(apps.find(a => a.id === 'file-explorer')!) },
    { label: 'Open Terminal', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onOpenApp(apps.find(a => a.id === 'terminal')!) },
    { divider: true },
    { label: 'Display Settings', icon: <Monitor className="w-3.5 h-3.5" />, action: () => onOpenApp(apps.find(a => a.id === 'settings')!) },
    { label: 'About This PC', icon: <Info className="w-3.5 h-3.5" />, action: () => onOpenApp(apps.find(a => a.id === 'about')!) },
  ];

  return (
    <div ref={ref} style={menuStyle}
      className="w-52 rounded-lg overflow-hidden win-glass win-shadow py-1"
    >
      {items.map((item, i) =>
        'divider' in item ? (
          <div key={i} className="h-px bg-border mx-2 my-1" />
        ) : (
          <button key={i}
            onClick={() => { item.action?.(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors"
          >
            <span className="w-4 flex justify-center text-muted-foreground">{item.icon}</span>
            <span>{item.label}</span>
            {item.submenu && <span className="ml-auto text-muted-foreground">›</span>}
          </button>
        )
      )}
    </div>
  );
}
