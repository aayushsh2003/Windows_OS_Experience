import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { AppDef } from '@/types/windows';
import { apps } from '@/data/apps';

interface SearchOverlayProps {
  onOpenApp: (app: AppDef) => void;
  onClose: () => void;
}

export function SearchOverlay({ onOpenApp, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [recent] = useState<string[]>(() => {
    const saved = localStorage.getItem('webos-recent-searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? apps.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.id.includes(query.toLowerCase()))
    : [];

  const handleOpen = (app: AppDef) => {
    const updated = [app.title, ...recent.filter(r => r !== app.title)].slice(0, 5);
    localStorage.setItem('webos-recent-searches', JSON.stringify(updated));
    onOpenApp(app);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[540px] z-[9999] win-glass win-shadow rounded-xl overflow-hidden start-menu-animate">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps, settings, and more..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-muted">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto win-scrollbar p-2">
          {/* Results */}
          {query.trim() && results.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground px-2 py-1">Apps</p>
              {results.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleOpen(app)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="text-xl">{app.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{app.title}</p>
                    <p className="text-[10px] text-muted-foreground">App</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No results for "{query}"</p>
            </div>
          )}

          {/* Recent / Quick launch when no query */}
          {!query.trim() && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground px-2 py-1">Quick Launch</p>
              <div className="grid grid-cols-4 gap-1 p-1">
                {apps.filter(a => a.startMenu).slice(0, 8).map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleOpen(app)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-xl">{app.icon}</span>
                    <span className="text-[10px] text-foreground truncate w-full text-center">{app.title}</span>
                  </button>
                ))}
              </div>
              {recent.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground px-2 py-1 mt-2">Recent</p>
                  {recent.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {r}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
