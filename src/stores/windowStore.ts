import { create } from 'zustand';
import { WindowState, AppDef } from '@/types/windows';

let nextZIndex = 10;

type SnapZone = 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

interface WindowStore {
  windows: WindowState[];
  openWindow: (app: AppDef) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
  snapWindow: (id: string, zone: string) => void;
  minimizeAll: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],

  openWindow: (app: AppDef) => {
    const { windows } = get();
    const existing = windows.find(w => w.appId === app.id && w.minimized);
    if (existing) {
      set({
        windows: windows.map(w =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: ++nextZIndex, isActive: true }
            : { ...w, isActive: false }
        ),
      });
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
      x: Math.max(0, Math.min(100 + offset, window.innerWidth - clampedW - 10)),
      y: Math.max(0, Math.min(60 + offset, maxH - clampedH - 10)),
      width: clampedW,
      height: clampedH,
      minimized: false,
      maximized: false,
      zIndex: ++nextZIndex,
      isActive: true,
    };
    set({ windows: [...windows.map(w => ({ ...w, isActive: false })), newWin] });
  },

  closeWindow: (id: string) => {
    set(state => ({ windows: state.windows.filter(w => w.id !== id) }));
  },

  minimizeWindow: (id: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: true, isActive: false } : w
      ),
    }));
  },

  maximizeWindow: (id: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id
          ? { ...w, maximized: !w.maximized, zIndex: ++nextZIndex, isActive: true }
          : { ...w, isActive: false }
      ),
    }));
  },

  focusWindow: (id: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id
          ? { ...w, zIndex: ++nextZIndex, isActive: true, minimized: false }
          : { ...w, isActive: false }
      ),
    }));
  },

  updatePosition: (id: string, x: number, y: number) => {
    // Clamp window within screen bounds
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== id) return w;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 48 - 36;
        return {
          ...w,
          x: Math.max(-w.width + 100, Math.min(maxX, x)),
          y: Math.max(0, Math.min(maxY, y)),
        };
      }),
    }));
  },

  updateSize: (id: string, width: number, height: number) => {
    const maxH = window.innerHeight - 48;
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id
          ? { ...w, width: Math.max(300, Math.min(width, window.innerWidth)), height: Math.max(200, Math.min(height, maxH)) }
          : w
      ),
    }));
  },

  snapWindow: (id: string, zone: string) => {
    if (!zone) return;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 48;

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
      set(state => ({
        windows: state.windows.map(w =>
          w.id === id
            ? { ...w, ...pos, maximized: false, zIndex: ++nextZIndex, isActive: true }
            : { ...w, isActive: false }
        ),
      }));
    }
  },

  minimizeAll: () => {
    set(state => ({
      windows: state.windows.map(w => ({ ...w, minimized: true, isActive: false })),
    }));
  },
}));

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
