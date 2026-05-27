import { useState } from 'react';
import { Power, RotateCcw, Moon } from 'lucide-react';

interface PowerMenuProps {
  onClose: () => void;
  onLock: () => void;
}

export function PowerMenu({ onClose, onLock }: PowerMenuProps) {
  const [action, setAction] = useState<'sleep' | 'restart' | 'shutdown' | null>(null);

  const handleAction = (type: 'sleep' | 'restart' | 'shutdown') => {
    setAction(type);
    setTimeout(() => {
      if (type === 'restart') {
        window.location.reload();
      } else if (type === 'shutdown') {
        document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;color:#555;font-family:system-ui;font-size:14px;">WebOS has shut down. Refresh to restart.</div>';
      } else if (type === 'sleep') {
        onLock();
        onClose();
      }
    }, type === 'sleep' ? 500 : 1500);
  };

  if (action) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">
            {action === 'restart' ? 'Restarting...' : action === 'shutdown' ? 'Shutting down...' : 'Going to sleep...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[99998]" onClick={onClose} />
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[99999] win-glass win-shadow rounded-xl p-2 start-menu-animate w-[200px]">
        <button
          onClick={() => handleAction('sleep')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
        >
          <Moon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Sleep</span>
        </button>
        <button
          onClick={() => handleAction('restart')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Restart</span>
        </button>
        <button
          onClick={() => handleAction('shutdown')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left"
        >
          <Power className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Shut down</span>
        </button>
      </div>
    </>
  );
}
