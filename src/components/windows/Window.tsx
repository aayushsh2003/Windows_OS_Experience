import React, { useRef, useCallback, useState, memo } from 'react';
import { WindowState } from '@/types/windows';
import { Minus, Square, X, Copy } from 'lucide-react';
import { getSnapZone } from '@/stores/windowStore';

interface WindowProps {
  win: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onSnap?: (id: string, zone: string) => void;
  children: React.ReactNode;
}

export const Window = memo(function Window({ win, onClose, onMinimize, onMaximize, onFocus, onMove, onResize, onSnap, children }: WindowProps) {
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; dir: string } | null>(null);
  const [snapPreview, setSnapPreview] = useState<string | null>(null);

  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (win.maximized) return;
    e.preventDefault();
    onFocus(win.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.winX + dx;
      const newY = dragRef.current.winY + dy;
      onMove(win.id, newX, newY);

      const zone = getSnapZone(e.clientX, e.clientY);
      setSnapPreview(zone);
    };
    const handleUp = (e: MouseEvent) => {
      const zone = getSnapZone(e.clientX, e.clientY);
      if (zone && onSnap) {
        onSnap(win.id, zone);
      }
      setSnapPreview(null);
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [win.id, win.x, win.y, win.maximized, onFocus, onMove, onSnap]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, dir: string = 'se') => {
    if (win.maximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(win.id);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: win.width, startH: win.height, dir };

    const handleMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = e.clientX - resizeRef.current.startX;
      const dh = e.clientY - resizeRef.current.startY;
      const newW = Math.max(300, resizeRef.current.startW + dw);
      const newH = Math.max(200, resizeRef.current.startH + dh);
      onResize(win.id, newW, newH);
    };
    const handleUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [win.id, win.width, win.height, win.maximized, onFocus, onResize]);

  if (win.minimized) return null;

  const style: React.CSSProperties = win.maximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', zIndex: win.zIndex }
    : { top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <>
      {snapPreview && <SnapPreview zone={snapPreview} zIndex={win.zIndex - 1} />}
      <div
        className="absolute flex flex-col win-glass win-shadow rounded-lg overflow-hidden window-animate select-none"
        style={style}
        onMouseDown={() => onFocus(win.id)}
      >
        {/* Title bar */}
        <div
          className={`flex items-center h-9 px-3 shrink-0 transition-colors ${win.isActive ? 'bg-card' : 'bg-muted'}`}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={() => onMaximize(win.id)}
        >
          <span className="text-xs font-medium text-foreground truncate flex-1">{win.title}</span>
          <div className="flex items-center gap-0">
            <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} className="w-11 h-9 flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="relative group">
              <button onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }} className="w-11 h-9 flex items-center justify-center hover:bg-muted/80 transition-colors">
                {win.maximized ? <Copy className="w-3 h-3 text-muted-foreground" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
              {onSnap && !win.maximized && (
                <div className="absolute top-full right-0 mt-1 w-[200px] p-3 rounded-lg win-glass win-shadow border border-border hidden group-hover:block z-50">
                  <p className="text-[10px] text-muted-foreground mb-2 text-center">Snap layouts</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'left'); }} className="col-span-1 h-10 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors">
                      <div className="w-full h-full rounded bg-primary/20 border-2 border-primary/40" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'right'); }} className="col-span-2 h-10 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors">
                      <div className="w-full h-full rounded bg-muted" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'top-left'); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'top-right'); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                    <button onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'bottom-left'); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                    <button onClick={(e) => { e.stopPropagation(); onSnap(win.id, 'bottom-right'); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                    <button onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }} className="h-8 rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors" />
                  </div>
                </div>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }} className="w-11 h-9 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden bg-background">{children}</div>
        {/* Resize handles */}
        {!win.maximized && (
          <>
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
            <div className="absolute bottom-0 left-0 right-4 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
            <div className="absolute top-9 right-0 bottom-4 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          </>
        )}
      </div>
    </>
  );
});

const SnapPreview = memo(function SnapPreview({ zone, zIndex }: { zone: string; zIndex: number }) {
  const screenH = 'calc(100vh - 48px)';
  const styles: Record<string, React.CSSProperties> = {
    'left': { top: 0, left: 0, width: '50%', height: screenH },
    'right': { top: 0, right: 0, width: '50%', height: screenH },
    'top-left': { top: 0, left: 0, width: '50%', height: `calc(${screenH} / 2)` },
    'top-right': { top: 0, right: 0, width: '50%', height: `calc(${screenH} / 2)` },
    'bottom-left': { bottom: '48px', left: 0, width: '50%', height: `calc(${screenH} / 2)` },
    'bottom-right': { bottom: '48px', right: 0, width: '50%', height: `calc(${screenH} / 2)` },
  };

  const s = styles[zone];
  if (!s) return null;

  return (
    <div
      className="fixed rounded-lg border-2 border-primary/50 bg-primary/10 backdrop-blur-sm pointer-events-none transition-all duration-150"
      style={{ ...s, zIndex }}
    />
  );
});
