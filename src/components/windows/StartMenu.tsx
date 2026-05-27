import { AppDef } from '@/types/windows';
import { apps } from '@/data/apps';
import { Power, User, Search } from 'lucide-react';
import { useState } from 'react';

interface StartMenuProps {
  onOpenApp: (app: AppDef) => void;
  onClose: () => void;
  onPower?: () => void;
}

export function StartMenu({ onOpenApp, onClose, onPower }: StartMenuProps) {
  const [search, setSearch] = useState('');
  const menuApps = apps.filter(a => a.startMenu !== false);
  const filtered = search
    ? menuApps.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : menuApps;

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[580px] h-[520px] rounded-lg overflow-hidden z-[9999] start-menu-animate"
        style={{ background: 'hsl(var(--win-start-bg) / 0.92)', backdropFilter: 'blur(40px) saturate(180%)' }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type here to search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-full bg-[hsl(0,0%,100%,0.08)] text-win-start-fg text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Pinned label */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-win-start-fg">
              {search ? 'Search Results' : 'Pinned'}
            </span>
          </div>

          {/* App grid */}
          <div className="grid grid-cols-5 gap-1 flex-1 overflow-y-auto win-scrollbar">
            {filtered.map(app => (
              <button
                key={app.id}
                onClick={() => { onOpenApp(app); onClose(); }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-[hsl(0,0%,100%,0.06)] transition-colors"
              >
                <span className="text-2xl">{app.icon}</span>
                <span className="text-[11px] text-win-start-fg truncate w-full text-center">{app.title}</span>
              </button>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[hsl(0,0%,100%,0.08)] mt-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[hsl(0,0%,100%,0.06)] transition-colors">
              <User className="w-4 h-4 text-win-start-fg" />
              <span className="text-sm text-win-start-fg">User</span>
            </button>
            <button onClick={onPower} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[hsl(0,0%,100%,0.06)] transition-colors">
              <Power className="w-4 h-4 text-win-start-fg" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
