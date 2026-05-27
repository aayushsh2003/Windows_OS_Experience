import { useState, useEffect, useCallback } from 'react';
import { WindowState } from '@/types/windows';

interface TaskViewProps {
  windows: WindowState[];
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onDismiss: () => void;
}

export function TaskView({ windows, onFocus, onClose, onDismiss }: TaskViewProps) {
  const visibleWindows = windows.filter(w => !w.minimized);
  const allWindows = windows;

  const handleSelect = (id: string) => {
    onFocus(id);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col" onClick={onDismiss}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
      
      <div className="relative flex-1 flex flex-col items-center justify-center p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-medium text-muted-foreground mb-6 tracking-wide uppercase">Task View</h2>
        
        {allWindows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No open windows</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center max-w-[900px]">
            {allWindows.map(win => (
              <button
                key={win.id}
                onClick={() => handleSelect(win.id)}
                className="group relative w-[220px] h-[140px] rounded-lg overflow-hidden border border-border bg-card hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {/* Window preview */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-6 bg-muted flex items-center px-2 shrink-0">
                    <span className="text-[9px] text-foreground truncate">{win.title}</span>
                  </div>
                  <div className="flex-1 bg-background flex items-center justify-center">
                    <span className="text-3xl opacity-40">{getAppIcon(win.appId)}</span>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                
                {/* Active indicator */}
                {win.isActive && !win.minimized && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
                
                {/* Minimized badge */}
                {win.minimized && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-muted text-[8px] text-muted-foreground">
                    Minimized
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">Click a window to switch, or press Escape to close</p>
      </div>
    </div>
  );
}

function getAppIcon(appId: string): string {
  const icons: Record<string, string> = {
    'notepad': '📝', 'calculator': '🧮', 'file-explorer': '📁', 'browser': '🌐',
    'terminal': '💻', 'settings': '⚙️', 'about': 'ℹ️', 'photos': '🖼️',
    'recycle-bin': '🗑️', 'camera': '📷', 'paint': '🎨', 'music': '🎵',
    'weather': '🌤️', 'clock': '⏰', 'task-manager': '📊', 'video': '🎬',
    'snipping': '✂️', 'calendar': '📅', 'text-editor': '📄', 'games': '🎮',
    'store': '🏪', 'mail': '📧', 'system-monitor': '📈', 'clipboard': '📋',
    'code-editor': '👨‍💻', 'todo': '✅', 'voice-recorder': '🎙️', 'chat': '💬',
    'maps': '🗺️', 'sticky-notes': '📌', 'contacts': '👥', 'focus-timer': '⏱️',
    'news': '📰',
  };
  return icons[appId] || '📱';
}
