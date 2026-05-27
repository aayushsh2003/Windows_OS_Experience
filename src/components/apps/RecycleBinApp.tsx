import { useState } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';

interface RecycledItem {
  id: string;
  name: string;
  icon: string;
  deletedAt: Date;
  size: string;
}

const mockItems: RecycledItem[] = [
  { id: '1', name: 'old_notes.txt', icon: '📝', deletedAt: new Date(Date.now() - 3600000), size: '2 KB' },
  { id: '2', name: 'screenshot.png', icon: '🖼️', deletedAt: new Date(Date.now() - 86400000), size: '1.2 MB' },
  { id: '3', name: 'backup.zip', icon: '📦', deletedAt: new Date(Date.now() - 172800000), size: '45 MB' },
  { id: '4', name: 'draft_report.docx', icon: '📄', deletedAt: new Date(Date.now() - 7200000), size: '128 KB' },
];

export function RecycleBinApp() {
  const [items, setItems] = useState<RecycledItem[]>(mockItems);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const restore = (ids: string[]) => {
    setItems(prev => prev.filter(item => !ids.includes(item.id)));
    setSelected(new Set());
  };

  const deletePermanent = (ids: string[]) => {
    setItems(prev => prev.filter(item => !ids.includes(item.id)));
    setSelected(new Set());
  };

  const emptyBin = () => {
    setItems([]);
    setSelected(new Set());
  };

  const formatDate = (d: Date) => {
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗑️</span>
          <span className="text-sm font-medium text-foreground">Recycle Bin</span>
          <span className="text-xs text-muted-foreground">({items.length} items)</span>
        </div>
        <div className="flex items-center gap-1">
          {selected.size > 0 && (
            <>
              <button onClick={() => restore(Array.from(selected))} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-foreground hover:bg-secondary">
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
              <button onClick={() => deletePermanent(Array.from(selected))} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10">
                <X className="w-3 h-3" /> Delete
              </button>
            </>
          )}
          {items.length > 0 && (
            <button onClick={emptyBin} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10">
              <Trash2 className="w-3 h-3" /> Empty Bin
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto win-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <span className="text-5xl mb-4 opacity-30">🗑️</span>
            <p className="text-sm text-muted-foreground">Recycle Bin is empty</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">Deleted</th>
                <th className="px-4 py-2 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${
                    selected.has(item.id) ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-foreground">{item.name}</span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{item.size}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDate(item.deletedAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); restore([item.id]); }} className="p-1 rounded hover:bg-secondary" title="Restore">
                        <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deletePermanent([item.id]); }} className="p-1 rounded hover:bg-destructive/10" title="Delete permanently">
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
