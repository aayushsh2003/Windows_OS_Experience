import { useState, useEffect } from 'react';
import { WindowState, AppDef } from '@/types/windows';
import { apps } from '@/data/apps';
import { Search, Wifi, Volume2, BatteryFull, ChevronUp, Lock, LayoutGrid, Layers } from 'lucide-react';

interface TaskbarProps {
  windows: WindowState[];
  onFocus: (id: string) => void;
  onClose?: (id: string) => void;
  onOpenApp: (app: AppDef) => void;
  onStartToggle: () => void;
  startOpen: boolean;
  onNotifToggle?: () => void;
  onLock?: () => void;
  onWidgetsToggle?: () => void;
  onSearchToggle?: () => void;
  onQuickSettingsToggle?: () => void;
  onTaskViewToggle?: () => void;
}

export function Taskbar({ windows, onFocus, onClose, onOpenApp, onStartToggle, startOpen, onNotifToggle, onLock, onWidgetsToggle, onSearchToggle, onQuickSettingsToggle, onTaskViewToggle }: TaskbarProps) {
  const [time, setTime] = useState(new Date());
  const [contextApp, setContextApp] = useState<{ app: AppDef; x: number; y: number } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pinnedApps = apps.filter(a => a.startMenu).slice(0, 8);

  const handleAppContext = (e: React.MouseEvent, app: AppDef) => {
    e.preventDefault();
    setContextApp({ app, x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 win-taskbar-glass flex items-center px-2 z-[9999]">
        {/* Start button */}
        <button
          onClick={onStartToggle}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${startOpen ? 'bg-primary/20' : 'hover:bg-[hsla(var(--win-hover))]'}`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" className="text-win-taskbar-fg">
            <rect x="1" y="1" width="7" height="7" fill="currentColor" rx="1" />
            <rect x="10" y="1" width="7" height="7" fill="currentColor" rx="1" />
            <rect x="1" y="10" width="7" height="7" fill="currentColor" rx="1" />
            <rect x="10" y="10" width="7" height="7" fill="currentColor" rx="1" />
          </svg>
        </button>

        {/* Search */}
        <button onClick={onSearchToggle} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[hsla(var(--win-hover))] ml-1">
          <Search className="w-4 h-4 text-win-taskbar-fg" />
        </button>

        {/* Task View */}
        {onTaskViewToggle && (
          <button onClick={onTaskViewToggle} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[hsla(var(--win-hover))] ml-0.5" title="Task View">
            <Layers className="w-4 h-4 text-win-taskbar-fg" />
          </button>
        )}

        {/* Widgets */}
        {onWidgetsToggle && (
          <button onClick={onWidgetsToggle} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[hsla(var(--win-hover))] ml-0.5" title="Widgets">
            <LayoutGrid className="w-4 h-4 text-win-taskbar-fg" />
          </button>
        )}

        {/* Pinned / Running apps — centered */}
        <div className="flex items-center gap-0.5 flex-1 justify-center">
          {pinnedApps.map(app => {
            const appWindows = windows.filter(w => w.appId === app.id);
            const hasActive = appWindows.some(w => w.isActive && !w.minimized);
            const isOpen = appWindows.length > 0;

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (appWindows.length > 0) {
                    onFocus(appWindows[0].id);
                  } else {
                    onOpenApp(app);
                  }
                }}
                onContextMenu={(e) => handleAppContext(e, app)}
                className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors relative hover:bg-[hsla(var(--win-hover))] group ${hasActive ? 'bg-[hsla(var(--win-hover))]' : ''}`}
                title={app.title}
              >
                <span className="text-lg">{app.icon}</span>
                {isOpen && (
                  <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${hasActive ? 'bg-primary w-3' : 'bg-muted-foreground'}`} />
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 px-2 py-1 rounded bg-card text-foreground text-[10px] font-medium shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {app.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <div className="flex items-center gap-0.5 mr-1">
          {onLock && (
            <button onClick={onLock} className="p-1.5 rounded hover:bg-[hsla(var(--win-hover))]" title="Lock">
              <Lock className="w-3.5 h-3.5 text-win-taskbar-fg" />
            </button>
          )}
          <button onClick={onNotifToggle} className="p-1.5 rounded hover:bg-[hsla(var(--win-hover))]">
            <ChevronUp className="w-3.5 h-3.5 text-win-taskbar-fg" />
          </button>
          <button onClick={onQuickSettingsToggle} className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[hsla(var(--win-hover))]">
            <Wifi className="w-3.5 h-3.5 text-win-taskbar-fg" />
            <Volume2 className="w-3.5 h-3.5 text-win-taskbar-fg" />
            <BatteryFull className="w-3.5 h-3.5 text-win-taskbar-fg" />
          </button>
        </div>

        {/* Clock */}
        <div className="flex flex-col items-end text-win-taskbar-fg px-2 py-1 rounded hover:bg-[hsla(var(--win-hover))] cursor-default min-w-[70px]">
          <span className="text-[11px] leading-tight">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[11px] leading-tight">
            {time.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>

        {/* Show desktop button */}
        <div className="w-1 h-full hover:bg-primary/30 cursor-pointer transition-colors" title="Show desktop" />
      </div>

      {/* Taskbar app right-click context menu */}
      {contextApp && (
        <>
          <div className="fixed inset-0 z-[99999]" onClick={() => setContextApp(null)} />
          <div
            className="fixed z-[100000] w-48 py-1 rounded-lg win-glass win-shadow border border-border start-menu-animate"
            style={{ left: contextApp.x, top: 'auto', bottom: window.innerHeight - contextApp.y + 8 }}
          >
            <button
              onClick={() => { onOpenApp(contextApp.app); setContextApp(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent/10 transition-colors"
            >
              {contextApp.app.title}
            </button>
            <div className="h-px bg-border mx-2 my-1" />
            {windows.filter(w => w.appId === contextApp.app.id).length > 0 && onClose && (
              <button
                onClick={() => {
                  const appWins = windows.filter(w => w.appId === contextApp.app.id);
                  appWins.forEach(w => onClose(w.id));
                  setContextApp(null);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent/10 transition-colors"
              >
                Close window
              </button>
            )}
            <button
              onClick={() => { onOpenApp(contextApp.app); setContextApp(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent/10 transition-colors"
            >
              Open new window
            </button>
          </div>
        </>
      )}
    </>
  );
}
