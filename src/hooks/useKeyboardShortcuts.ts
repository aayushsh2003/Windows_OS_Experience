import { useEffect } from 'react';
import { AppDef } from '@/types/windows';
import { apps } from '@/data/apps';

interface ShortcutActions {
  onCloseActive: () => void;
  onOpenApp: (app: AppDef) => void;
  onToggleStart: () => void;
  onToggleSearch: () => void;
  onLock: () => void;
  onMinimizeAll: () => void;
  onToggleTaskView?: () => void;
  onToggleCommandPalette?: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+F4 — close active window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        actions.onCloseActive();
      }

      // Ctrl+Shift+Esc — open Task Manager
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        const tm = apps.find(a => a.id === 'task-manager');
        if (tm) actions.onOpenApp(tm);
      }

      // Meta (Win key) — toggle Start Menu
      if (e.key === 'Meta') {
        e.preventDefault();
        actions.onToggleStart();
      }

      // Ctrl+E or Ctrl+S — toggle Search (Windows style)
      if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        actions.onToggleSearch();
      }

      // Ctrl+L — lock screen  
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        actions.onLock();
      }

      // Ctrl+D — show desktop (minimize all)
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        actions.onMinimizeAll();
      }

      // Alt+Tab — toggle Task View
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        actions.onToggleTaskView?.();
      }

      // Ctrl+K or Win+K — Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        actions.onToggleCommandPalette?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
