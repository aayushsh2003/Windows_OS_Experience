import { useState, useRef, useCallback } from 'react';
import { AppDef } from '@/types/windows';
import { apps } from '@/data/apps';

interface DesktopIconsProps {
  onOpenApp: (app: AppDef) => void;
}

export function DesktopIcons({ onOpenApp }: DesktopIconsProps) {
  const desktopApps = apps.filter(a => a.desktopIcon);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const saved = localStorage.getItem('webos-icon-positions');
    if (saved) return JSON.parse(saved);
    // Grid layout defaults
    const pos: Record<string, { x: number; y: number }> = {};
    desktopApps.forEach((app, i) => {
      const col = Math.floor(i / Math.floor((window.innerHeight - 64) / 88));
      const row = i % Math.floor((window.innerHeight - 64) / 88);
      pos[app.id] = { x: 8 + col * 88, y: 8 + row * 88 };
    });
    return pos;
  });

  const dragRef = useRef<{ id: string; startX: number; startY: number; iconX: number; iconY: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent, app: AppDef) => {
    e.preventDefault();
    setSelected(app.id);
    const pos = positions[app.id] || { x: 0, y: 0 };
    dragRef.current = { id: app.id, startX: e.clientX, startY: e.clientY, iconX: pos.x, iconY: pos.y };
    setDragging(null);

    const handleMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setDragging(dragRef.current.id);
      }
      const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.iconX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 110, dragRef.current.iconY + dy));
      setPositions(prev => {
        const next = { ...prev, [dragRef.current!.id]: { x: newX, y: newY } };
        return next;
      });
    };

    const handleUp = () => {
      if (dragRef.current) {
        localStorage.setItem('webos-icon-positions', JSON.stringify(positions));
      }
      dragRef.current = null;
      setTimeout(() => setDragging(null), 50);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [positions]);

  return (
    <div className="absolute inset-0 z-[1]" onClick={() => setSelected(null)}>
      {desktopApps.map(app => {
        const pos = positions[app.id] || { x: 0, y: 0 };
        return (
          <button
            key={app.id}
            onPointerDown={e => handlePointerDown(e, app)}
            onDoubleClick={() => { if (!dragging) onOpenApp(app); }}
            className={`absolute flex flex-col items-center gap-1 w-20 p-2 rounded-md transition-colors group ${
              selected === app.id ? 'bg-[hsl(0,0%,100%,0.18)]' : 'hover:bg-[hsl(0,0%,100%,0.12)]'
            } ${dragging === app.id ? 'opacity-70 scale-105' : ''}`}
            style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
          >
            <span className="text-3xl drop-shadow-lg">{app.icon}</span>
            <span className="text-[11px] text-primary-foreground desktop-icon-text leading-tight text-center break-words">
              {app.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
