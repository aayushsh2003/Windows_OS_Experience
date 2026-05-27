import { useEffect, lazy, Suspense, createContext, useCallback } from 'react';
import wallpaper from '@/assets/wallpaper.jpg';
import { useWindowStore } from '@/stores/windowStore';
import { useAppStore } from '@/stores/appStore';
import { apps } from '@/data/apps';
import { AppDef } from '@/types/windows';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { DesktopIcons } from './DesktopIcons';
import { ContextMenu } from './ContextMenu';
import { LockScreen } from './LockScreen';
import { NotificationCenter } from './NotificationCenter';
import { WidgetsPanel } from './WidgetsPanel';
import { SearchOverlay } from './SearchOverlay';
import { PowerMenu } from './PowerMenu';
import { BootScreen } from './BootScreen';
import { QuickSettings } from './QuickSettings';
import { TaskView } from './TaskView';
import { NotificationToastProvider, useNotification } from './NotificationToast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useState } from 'react';

// Lazy load all app components
const NotepadApp = lazy(() => import('@/components/apps/NotepadApp').then(m => ({ default: m.NotepadApp })));
const CalculatorApp = lazy(() => import('@/components/apps/CalculatorApp').then(m => ({ default: m.CalculatorApp })));
const FileExplorerApp = lazy(() => import('@/components/apps/FileExplorerApp').then(m => ({ default: m.FileExplorerApp })));
const BrowserApp = lazy(() => import('@/components/apps/BrowserApp').then(m => ({ default: m.BrowserApp })));
const TerminalApp = lazy(() => import('@/components/apps/TerminalApp').then(m => ({ default: m.TerminalApp })));
const SettingsApp = lazy(() => import('@/components/apps/SettingsApp').then(m => ({ default: m.SettingsApp })));
const AboutApp = lazy(() => import('@/components/apps/AboutApp').then(m => ({ default: m.AboutApp })));
const PhotosApp = lazy(() => import('@/components/apps/PhotosApp').then(m => ({ default: m.PhotosApp })));
const RecycleBinApp = lazy(() => import('@/components/apps/RecycleBinApp').then(m => ({ default: m.RecycleBinApp })));
const CameraApp = lazy(() => import('@/components/apps/CameraApp').then(m => ({ default: m.CameraApp })));
const PaintApp = lazy(() => import('@/components/apps/PaintApp').then(m => ({ default: m.PaintApp })));
const MusicPlayerApp = lazy(() => import('@/components/apps/MusicPlayerApp').then(m => ({ default: m.MusicPlayerApp })));
const WeatherApp = lazy(() => import('@/components/apps/WeatherApp').then(m => ({ default: m.WeatherApp })));
const ClockApp = lazy(() => import('@/components/apps/ClockApp').then(m => ({ default: m.ClockApp })));
const TaskManagerApp = lazy(() => import('@/components/apps/TaskManagerApp').then(m => ({ default: m.TaskManagerApp })));
const VideoPlayerApp = lazy(() => import('@/components/apps/VideoPlayerApp').then(m => ({ default: m.VideoPlayerApp })));
const SnippingToolApp = lazy(() => import('@/components/apps/SnippingToolApp').then(m => ({ default: m.SnippingToolApp })));
const CalendarApp = lazy(() => import('@/components/apps/CalendarApp').then(m => ({ default: m.CalendarApp })));
const TextEditorApp = lazy(() => import('@/components/apps/TextEditorApp').then(m => ({ default: m.TextEditorApp })));
const GamesApp = lazy(() => import('@/components/apps/GamesApp').then(m => ({ default: m.GamesApp })));
const StoreApp = lazy(() => import('@/components/apps/StoreApp').then(m => ({ default: m.StoreApp })));
const MailApp = lazy(() => import('@/components/apps/MailApp').then(m => ({ default: m.MailApp })));
const SystemMonitorApp = lazy(() => import('@/components/apps/SystemMonitorApp').then(m => ({ default: m.SystemMonitorApp })));
const ClipboardApp = lazy(() => import('@/components/apps/ClipboardApp').then(m => ({ default: m.ClipboardApp })));
const CodeEditorApp = lazy(() => import('@/components/apps/CodeEditorApp').then(m => ({ default: m.CodeEditorApp })));
const TodoApp = lazy(() => import('@/components/apps/TodoApp').then(m => ({ default: m.TodoApp })));
const VoiceRecorderApp = lazy(() => import('@/components/apps/VoiceRecorderApp').then(m => ({ default: m.VoiceRecorderApp })));
const ChatApp = lazy(() => import('@/components/apps/ChatApp').then(m => ({ default: m.ChatApp })));
const MapsApp = lazy(() => import('@/components/apps/MapsApp').then(m => ({ default: m.MapsApp })));
const StickyNotesApp = lazy(() => import('@/components/apps/StickyNotesApp').then(m => ({ default: m.StickyNotesApp })));
const ContactsApp = lazy(() => import('@/components/apps/ContactsApp').then(m => ({ default: m.ContactsApp })));
const FocusTimerApp = lazy(() => import('@/components/apps/FocusTimerApp').then(m => ({ default: m.FocusTimerApp })));
const NewsApp = lazy(() => import('@/components/apps/NewsApp').then(m => ({ default: m.NewsApp })));
const SpreadsheetApp = lazy(() => import('@/components/apps/SpreadsheetApp').then(m => ({ default: m.SpreadsheetApp })));
const MarkdownNotesApp = lazy(() => import('@/components/apps/MarkdownNotesApp').then(m => ({ default: m.MarkdownNotesApp })));
const WhiteboardApp = lazy(() => import('@/components/apps/WhiteboardApp').then(m => ({ default: m.WhiteboardApp })));
const PdfReaderApp = lazy(() => import('@/components/apps/PdfReaderApp').then(m => ({ default: m.PdfReaderApp })));
const UnitConverterApp = lazy(() => import('@/components/apps/UnitConverterApp').then(m => ({ default: m.UnitConverterApp })));
const QrCodeApp = lazy(() => import('@/components/apps/QrCodeApp').then(m => ({ default: m.QrCodeApp })));
const ColorPickerApp = lazy(() => import('@/components/apps/ColorPickerApp').then(m => ({ default: m.ColorPickerApp })));
const PasswordVaultApp = lazy(() => import('@/components/apps/PasswordVaultApp').then(m => ({ default: m.PasswordVaultApp })));
const StocksApp = lazy(() => import('@/components/apps/StocksApp').then(m => ({ default: m.StocksApp })));
const DictionaryApp = lazy(() => import('@/components/apps/DictionaryApp').then(m => ({ default: m.DictionaryApp })));
const JsonFormatterApp = lazy(() => import('@/components/apps/JsonFormatterApp').then(m => ({ default: m.JsonFormatterApp })));
const RegexTesterApp = lazy(() => import('@/components/apps/RegexTesterApp').then(m => ({ default: m.RegexTesterApp })));
const ExpenseTrackerApp = lazy(() => import('@/components/apps/ExpenseTrackerApp').then(m => ({ default: m.ExpenseTrackerApp })));
const WorldClockApp = lazy(() => import('@/components/apps/WorldClockApp').then(m => ({ default: m.WorldClockApp })));
import { CommandPalette } from './CommandPalette';
import { sfx, soundsEnabled, setSoundsEnabled } from '@/lib/sounds';

// Wallpaper context (kept for SettingsApp compatibility)
export const WallpaperContext = createContext<{ wallpaperUrl: string; setWallpaperUrl: (url: string) => void }>({ wallpaperUrl: wallpaper, setWallpaperUrl: () => {} });
export const ThemeContext = createContext<{ theme: string; setTheme: (t: string) => void }>({ theme: 'light', setTheme: () => {} });

const appComponents: Record<string, React.FC<any>> = {
  'notepad': NotepadApp,
  'calculator': CalculatorApp,
  'file-explorer': FileExplorerApp,
  'browser': BrowserApp,
  'terminal': TerminalApp,
  'settings': SettingsApp,
  'about': AboutApp,
  'photos': PhotosApp,
  'recycle-bin': RecycleBinApp,
  'camera': CameraApp,
  'paint': PaintApp,
  'music': MusicPlayerApp,
  'weather': WeatherApp,
  'clock': ClockApp,
  'task-manager': TaskManagerApp,
  'video': VideoPlayerApp,
  'snipping': SnippingToolApp,
  'calendar': CalendarApp,
  'text-editor': TextEditorApp,
  'games': GamesApp,
  'store': StoreApp,
  'mail': MailApp,
  'system-monitor': SystemMonitorApp,
  'clipboard': ClipboardApp,
  'code-editor': CodeEditorApp,
  'todo': TodoApp,
  'voice-recorder': VoiceRecorderApp,
  'chat': ChatApp,
  'maps': MapsApp,
  'sticky-notes': StickyNotesApp,
  'contacts': ContactsApp,
  'focus-timer': FocusTimerApp,
  'news': NewsApp,
  'spreadsheet': SpreadsheetApp,
  'markdown-notes': MarkdownNotesApp,
  'whiteboard': WhiteboardApp,
  'pdf-reader': PdfReaderApp,
  'unit-converter': UnitConverterApp,
  'qr-code': QrCodeApp,
  'color-picker': ColorPickerApp,
  'password-vault': PasswordVaultApp,
  'stocks': StocksApp,
  'dictionary': DictionaryApp,
  'json-formatter': JsonFormatterApp,
  'regex-tester': RegexTesterApp,
  'expense-tracker': ExpenseTrackerApp,
  'world-clock': WorldClockApp,
};

const defaultWallpapers = [
  wallpaper,
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
];

export { defaultWallpapers };

function AppLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    </div>
  );
}

export function Desktop() {
  return (
    <NotificationToastProvider>
      <DesktopInner />
    </NotificationToastProvider>
  );
}

function DesktopInner() {
  // Zustand stores
  const windows = useWindowStore(s => s.windows);
  const openWindow = useWindowStore(s => s.openWindow);
  const closeWindow = useWindowStore(s => s.closeWindow);
  const minimizeWindow = useWindowStore(s => s.minimizeWindow);
  const maximizeWindow = useWindowStore(s => s.maximizeWindow);
  const focusWindow = useWindowStore(s => s.focusWindow);
  const updatePosition = useWindowStore(s => s.updatePosition);
  const updateSize = useWindowStore(s => s.updateSize);
  const snapWindow = useWindowStore(s => s.snapWindow);
  const minimizeAll = useWindowStore(s => s.minimizeAll);

  const booted = useAppStore(s => s.booted);
  const locked = useAppStore(s => s.locked);
  const startOpen = useAppStore(s => s.startOpen);
  const searchOpen = useAppStore(s => s.searchOpen);
  const notifOpen = useAppStore(s => s.notifOpen);
  const widgetsOpen = useAppStore(s => s.widgetsOpen);
  const powerOpen = useAppStore(s => s.powerOpen);
  const quickSettingsOpen = useAppStore(s => s.quickSettingsOpen);
  const taskViewOpen = useAppStore(s => s.taskViewOpen);
  const wallpaperUrl = useAppStore(s => s.wallpaperUrl);
  const theme = useAppStore(s => s.theme);
  const setBooted = useAppStore(s => s.setBooted);
  const setLocked = useAppStore(s => s.setLocked);
  const setStartOpen = useAppStore(s => s.setStartOpen);
  const setSearchOpen = useAppStore(s => s.setSearchOpen);
  const setNotifOpen = useAppStore(s => s.setNotifOpen);
  const setWidgetsOpen = useAppStore(s => s.setWidgetsOpen);
  const setPowerOpen = useAppStore(s => s.setPowerOpen);
  const setQuickSettingsOpen = useAppStore(s => s.setQuickSettingsOpen);
  const setTaskViewOpen = useAppStore(s => s.setTaskViewOpen);
  const setWallpaperUrl = useAppStore(s => s.setWallpaperUrl);
  const setTheme = useAppStore(s => s.setTheme);
  const toggleStart = useAppStore(s => s.toggleStart);
  const toggleSearch = useAppStore(s => s.toggleSearch);

  const { notify } = useNotification();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [soundsOn, setSoundsOn] = useState(() => soundsEnabled());

  // Set initial wallpaper if empty
  useEffect(() => {
    if (!wallpaperUrl) setWallpaperUrl(wallpaper);
  }, []);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Welcome notification after boot
  useEffect(() => {
    if (booted && !locked) {
      const timer = setTimeout(() => {
        notify('Welcome back!', 'WebOS 11 is ready. Enjoy your session.', 'success', '💻');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [booted, locked]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCloseActive: () => {
      const active = windows.find(w => w.isActive && !w.minimized);
      if (active) { sfx.close(); closeWindow(active.id); }
    },
    onOpenApp: (app) => openWindow(app),
    onToggleStart: toggleStart,
    onToggleSearch: toggleSearch,
    onLock: () => setLocked(true),
    onMinimizeAll: minimizeAll,
    onToggleTaskView: () => setTaskViewOpen(!taskViewOpen),
    onToggleCommandPalette: () => setPaletteOpen(p => !p),
  });

  const handleOpenApp = useCallback((app: AppDef) => {
    sfx.open();
    openWindow(app);
    notify(`${app.title}`, 'App opened', 'info', app.icon);
  }, [openWindow, notify]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  if (locked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  const resolvedWallpaper = wallpaperUrl || wallpaper;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
    <WallpaperContext.Provider value={{ wallpaperUrl: resolvedWallpaper, setWallpaperUrl }}>
    <div className="h-screen w-screen overflow-hidden relative select-none" onContextMenu={handleContextMenu}>
      <img src={resolvedWallpaper} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <DesktopIcons onOpenApp={handleOpenApp} />
      {windows.map(win => {
        const AppComponent = appComponents[win.appId];
        const extraProps: Record<string, any> = {};
        if (win.appId === 'task-manager') {
          extraProps.windows = windows;
          extraProps.onEndTask = closeWindow;
        }
        return (
          <Window key={win.id} win={win} onClose={closeWindow} onMinimize={minimizeWindow}
            onMaximize={maximizeWindow} onFocus={focusWindow} onMove={updatePosition} onResize={updateSize}
            onSnap={snapWindow}>
            <Suspense fallback={<AppLoader />}>
              {AppComponent ? <AppComponent {...extraProps} /> : <div className="flex items-center justify-center h-full text-muted-foreground">App not found</div>}
            </Suspense>
          </Window>
        );
      })}
      {startOpen && <StartMenu onOpenApp={handleOpenApp} onClose={() => setStartOpen(false)} onPower={() => { setStartOpen(false); setPowerOpen(true); }} />}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}
          onOpenApp={handleOpenApp} onRefresh={() => window.location.reload()} />
      )}
      {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}
      {widgetsOpen && <WidgetsPanel onClose={() => setWidgetsOpen(false)} />}
      {searchOpen && <SearchOverlay onOpenApp={handleOpenApp} onClose={() => setSearchOpen(false)} />}
      {powerOpen && <PowerMenu onClose={() => setPowerOpen(false)} onLock={() => setLocked(true)} />}
      {quickSettingsOpen && <QuickSettings onClose={() => setQuickSettingsOpen(false)} />}
      {taskViewOpen && <TaskView windows={windows} onFocus={focusWindow} onClose={closeWindow} onDismiss={() => setTaskViewOpen(false)} />}
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onOpenApp={handleOpenApp}
          onLock={() => setLocked(true)}
          onMinimizeAll={minimizeAll}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onToggleSounds={() => { const n = !soundsOn; setSoundsOn(n); setSoundsEnabled(n); }}
          soundsOn={soundsOn}
        />
      )}
      <Taskbar windows={windows} onFocus={focusWindow} onClose={(id) => { sfx.close(); closeWindow(id); }} onOpenApp={handleOpenApp}
        onStartToggle={toggleStart} startOpen={startOpen}
        onNotifToggle={() => setNotifOpen(!notifOpen)} onLock={() => setLocked(true)}
        onWidgetsToggle={() => setWidgetsOpen(!widgetsOpen)}
        onSearchToggle={toggleSearch}
        onQuickSettingsToggle={() => setQuickSettingsOpen(!quickSettingsOpen)}
        onTaskViewToggle={() => setTaskViewOpen(!taskViewOpen)} />
    </div>
    </WallpaperContext.Provider>
    </ThemeContext.Provider>
  );
}
