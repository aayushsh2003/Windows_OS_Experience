import { useState, useCallback } from 'react';
import { WindowState, AppDef } from '@/types/windows';

let nextZIndex = 10;

type SnapZone = 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openWindow = useCallback((app: AppDef) => {
    const existing = windows.find(w => w.appId === app.id && w.minimized);
    if (existing) {
      setWindows(prev => prev.map(w =>
        w.id === existing.id
          ? { ...w, minimized: false, zIndex: ++nextZIndex, isActive: true }
          : { ...w, isActive: false }
      ));
      return;
    }

    const id = `${app.id}-${Date.now()}`;
    const offset = (windows.length % 8) * 30;
    const maxH = window.innerHeight - 48;
    const clampedW = Math.min(app.defaultWidth, window.innerWidth - 20);
    const clampedH = Math.min(app.defaultHeight, maxH - 20);
    const newWin: WindowState = {
      id,
      appId: app.id,
      title: app.title,
      x: Math.min(100 + offset, window.innerWidth - clampedW - 10),
      y: Math.min(60 + offset, maxH - clampedH - 10),
      width: clampedW,
      height: clampedH,
      minimized: false,
      maximized: false,
      zIndex: ++nextZIndex,
      isActive: true,
    };
    setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWin]);
  }, [windows]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true, isActive: false } : w));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, maximized: !w.maximized, zIndex: ++nextZIndex, isActive: true } : { ...w, isActive: false }
    ));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id
        ? { ...w, zIndex: ++nextZIndex, isActive: true, minimized: false }
        : { ...w, isActive: false }
    ));
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const updateSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  }, []);

  const snapWindow = useCallback((id: string, zone: SnapZone) => {
    if (!zone) return;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 48; // taskbar height

    const snapPositions: Record<string, { x: number; y: number; width: number; height: number }> = {
      'left': { x: 0, y: 0, width: screenW / 2, height: screenH },
      'right': { x: screenW / 2, y: 0, width: screenW / 2, height: screenH },
      'top-left': { x: 0, y: 0, width: screenW / 2, height: screenH / 2 },
      'top-right': { x: screenW / 2, y: 0, width: screenW / 2, height: screenH / 2 },
      'bottom-left': { x: 0, y: screenH / 2, width: screenW / 2, height: screenH / 2 },
      'bottom-right': { x: screenW / 2, y: screenH / 2, width: screenW / 2, height: screenH / 2 },
    };

    const pos = snapPositions[zone];
    if (pos) {
      setWindows(prev => prev.map(w =>
        w.id === id ? { ...w, ...pos, maximized: false, zIndex: ++nextZIndex, isActive: true } : { ...w, isActive: false }
      ));
    }
  }, []);

  const minimizeAll = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, minimized: true, isActive: false })));
  }, []);

  return { windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updatePosition, updateSize, snapWindow, minimizeAll };
}

export function getSnapZone(x: number, y: number): SnapZone {
  const threshold = 8;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight - 48;

  const atLeft = x <= threshold;
  const atRight = x >= screenW - threshold;
  const atTop = y <= threshold;
  const atBottom = y >= screenH - threshold;

  if (atLeft && atTop) return 'top-left';
  if (atRight && atTop) return 'top-right';
  if (atLeft && atBottom) return 'bottom-left';
  if (atRight && atBottom) return 'bottom-right';
  if (atLeft) return 'left';
  if (atRight) return 'right';
  return null;
}
