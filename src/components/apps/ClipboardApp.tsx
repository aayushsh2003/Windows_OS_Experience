import { useState, useEffect } from 'react';
import { Clipboard, Trash2, Copy, Check, Search } from 'lucide-react';

interface ClipItem {
  id: string;
  text: string;
  time: Date;
  pinned: boolean;
}

export function ClipboardApp() {
  const [items, setItems] = useState<ClipItem[]>(() => {
    const saved = localStorage.getItem('webos-clipboard');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Welcome to WebOS Clipboard Manager!', time: new Date().toISOString(), pinned: true },
      { id: '2', text: 'Copy text anywhere and it appears here.', time: new Date().toISOString(), pinned: false },
    ];
  });
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('webos-clipboard', JSON.stringify(items));
  }, [items]);

  // Listen for clipboard paste events
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && !items.some(i => i.text === text)) {
        setItems(prev => [{ id: Date.now().toString(), text, time: new Date().toISOString() as any, pinned: false }, ...prev]);
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [items]);

  const copyToClipboard = async (item: ClipItem) => {
    await navigator.clipboard.writeText(item.text);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const togglePin = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  const clearAll = () => setItems(prev => prev.filter(i => i.pinned));

  const filtered = items.filter(i => i.text.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(i => i.pinned);
  const unpinned = filtered.filter(i => !i.pinned);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clipboard..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-muted rounded-md border-none outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto win-scrollbar p-2 space-y-1">
        {pinned.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground px-2 pt-1">📌 Pinned</p>
            {pinned.map(item => (
              <ClipCard key={item.id} item={item} copied={copied} onCopy={copyToClipboard} onDelete={deleteItem} onPin={togglePin} />
            ))}
          </>
        )}
        {unpinned.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground px-2 pt-2">Recent</p>
            {unpinned.map(item => (
              <ClipCard key={item.id} item={item} copied={copied} onCopy={copyToClipboard} onDelete={deleteItem} onPin={togglePin} />
            ))}
          </>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clipboard className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">No clipboard items</p>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">{items.length} items</span>
        <button onClick={clearAll} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Clear unpinned
        </button>
      </div>
    </div>
  );
}

function ClipCard({ item, copied, onCopy, onDelete, onPin }: {
  item: ClipItem; copied: string | null;
  onCopy: (i: ClipItem) => void; onDelete: (id: string) => void; onPin: (id: string) => void;
}) {
  return (
    <div className="group flex items-start gap-2 p-2 rounded-md bg-muted/60 hover:bg-muted transition-colors">
      <p className="flex-1 text-xs text-foreground line-clamp-3 break-all">{item.text}</p>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPin(item.id)} className="p-1 rounded hover:bg-secondary" title={item.pinned ? 'Unpin' : 'Pin'}>
          <span className="text-[10px]">{item.pinned ? '📌' : '📍'}</span>
        </button>
        <button onClick={() => onCopy(item)} className="p-1 rounded hover:bg-secondary" title="Copy">
          {copied === item.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1 rounded hover:bg-secondary" title="Delete">
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      </div>
    </div>
  );
}
