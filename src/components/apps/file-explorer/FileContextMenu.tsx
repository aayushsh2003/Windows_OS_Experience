import { useEffect, useRef } from 'react';
import { FolderPlus, FilePlus, Pencil, Trash2, FolderOpen, FileText } from 'lucide-react';

interface FileContextMenuProps {
  x: number;
  y: number;
  targetName: string | null; // null = background click
  targetType: 'file' | 'folder' | null;
  onClose: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
}

export function FileContextMenu({ x, y, targetName, targetType, onClose, onOpen, onRename, onDelete, onNewFolder, onNewFile }: FileContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 200),
    left: Math.min(x, window.innerWidth - 180),
    zIndex: 99999,
  };

  return (
    <div ref={ref} style={style} className="w-44 rounded-lg overflow-hidden win-glass win-shadow py-1">
      {targetName && (
        <>
          <button onClick={() => { onOpen(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors">
            {targetType === 'folder' ? <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
            Open
          </button>
          <button onClick={() => { onRename(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            Rename
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </>
      )}
      {!targetName && (
        <>
          <button onClick={() => { onNewFolder(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors">
            <FolderPlus className="w-3.5 h-3.5 text-muted-foreground" />
            New Folder
          </button>
          <button onClick={() => { onNewFile(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors">
            <FilePlus className="w-3.5 h-3.5 text-muted-foreground" />
            New File
          </button>
        </>
      )}
    </div>
  );
}
