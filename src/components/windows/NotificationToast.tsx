import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, Info, CheckCircle, AlertTriangle, Bell } from 'lucide-react';

export interface WinNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'default';
  timestamp: Date;
  appIcon?: string;
}

interface NotificationContextType {
  notify: (title: string, message: string, type?: WinNotification['type'], appIcon?: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({ notify: () => {} });

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<WinNotification[]>([]);

  const notify = useCallback((title: string, message: string, type: WinNotification['type'] = 'default', appIcon?: string) => {
    const id = `notif-${Date.now()}`;
    const notif: WinNotification = { id, title, message, type, timestamp: new Date(), appIcon };
    setToasts(prev => [...prev, notif]);
    setTimeout(() => {
      setToasts(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  };

  const typeIcon = (type: WinNotification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-primary" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-14 right-3 z-[99998] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast, i) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-[340px] win-glass win-shadow rounded-lg p-3 flex gap-3 items-start animate-[slideInRight_0.3s_ease-out]"
          >
            <div className="shrink-0 mt-0.5">
              {toast.appIcon ? <span className="text-lg">{toast.appIcon}</span> : typeIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{toast.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button onClick={() => dismiss(toast.id)} className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
