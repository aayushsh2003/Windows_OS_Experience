import { create } from 'zustand';

interface AppStore {
  booted: boolean;
  locked: boolean;
  startOpen: boolean;
  searchOpen: boolean;
  notifOpen: boolean;
  widgetsOpen: boolean;
  powerOpen: boolean;
  quickSettingsOpen: boolean;
  taskViewOpen: boolean;
  wallpaperUrl: string;
  theme: string;

  setBooted: (v: boolean) => void;
  setLocked: (v: boolean) => void;
  toggleStart: () => void;
  setStartOpen: (v: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
  setWidgetsOpen: (v: boolean) => void;
  setPowerOpen: (v: boolean) => void;
  setQuickSettingsOpen: (v: boolean) => void;
  setTaskViewOpen: (v: boolean) => void;
  setWallpaperUrl: (url: string) => void;
  setTheme: (t: string) => void;
}

const getInitialWallpaper = () => {
  try { return localStorage.getItem('webos-wallpaper') || ''; } catch { return ''; }
};

const getInitialTheme = () => {
  try { return localStorage.getItem('webos-theme') || 'light'; } catch { return 'light'; }
};

export const useAppStore = create<AppStore>((set) => ({
  booted: false,
  locked: true,
  startOpen: false,
  searchOpen: false,
  notifOpen: false,
  widgetsOpen: false,
  powerOpen: false,
  quickSettingsOpen: false,
  taskViewOpen: false,
  wallpaperUrl: getInitialWallpaper(),
  theme: getInitialTheme(),

  setBooted: (v) => set({ booted: v }),
  setLocked: (v) => set({ locked: v }),
  toggleStart: () => set(s => ({ startOpen: !s.startOpen })),
  setStartOpen: (v) => set({ startOpen: v }),
  toggleSearch: () => set(s => ({ searchOpen: !s.searchOpen })),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setNotifOpen: (v) => set({ notifOpen: v }),
  setWidgetsOpen: (v) => set({ widgetsOpen: v }),
  setPowerOpen: (v) => set({ powerOpen: v }),
  setQuickSettingsOpen: (v) => set({ quickSettingsOpen: v }),
  setTaskViewOpen: (v) => set({ taskViewOpen: v }),
  setWallpaperUrl: (url) => {
    localStorage.setItem('webos-wallpaper', url);
    set({ wallpaperUrl: url });
  },
  setTheme: (t) => {
    localStorage.setItem('webos-theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    set({ theme: t });
  },
}));
