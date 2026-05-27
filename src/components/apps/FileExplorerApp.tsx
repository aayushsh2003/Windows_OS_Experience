import { useState, useMemo, useRef, useCallback, memo } from 'react';
import { ChevronRight, Monitor, ArrowLeft, Home, FolderPlus, FilePlus, Trash2, Search, LayoutGrid, List, FolderOpen, Info, Database } from 'lucide-react';
import { useFileSystemStore } from '@/stores/fileSystemStore';
import { ExplorerSidebar } from './file-explorer/ExplorerSidebar';
import { FileIcon } from './file-explorer/FileIcon';
import { FileContextMenu } from './file-explorer/FileContextMenu';
import { DetailsPanel } from './file-explorer/DetailsPanel';
import { FilePreview } from './file-explorer/FilePreview';
import { NativeFileBrowser } from './file-explorer/NativeFileBrowser';
import { VirtualItem, ViewMode, ExplorerMode } from './file-explorer/types';
import { useNotification } from '@/components/windows/NotificationToast';

export const FileExplorerApp = memo(function FileExplorerApp() {
  const { getItems, navigate, createFolder, createFile, deleteItem, renameItem, saveFile, moveItem } = useFileSystemStore();
  const [currentPath, setCurrentPath] = useState('/');
  const [selected, setSelected] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<VirtualItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewInput, setShowNewInput] = useState<'folder' | 'file' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; name: string | null; type: 'file' | 'folder' | null } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>('virtual');
  const renameRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  let notify: ((title: string, message: string, type?: any, icon?: string) => void) | null = null;
  try {
    const n = useNotification();
    notify = n.notify;
  } catch {}

  const items = getItems(currentPath);
  const sortedItems = useMemo(() =>
    [...items]
      .filter(i => !debouncedSearch || i.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [items, debouncedSearch]
  );

  const selectedItem = useMemo(() => items.find(i => i.name === selected) || null, [items, selected]);

  const pathParts = currentPath === '/'
    ? [{ label: 'My Files', path: '/' }]
    : [
        { label: 'My Files', path: '/' },
        ...currentPath.split('/').filter(Boolean).map((seg, i, arr) => ({
          label: seg,
          path: '/' + arr.slice(0, i + 1).join('/'),
        })),
      ];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 200);
  }, []);

  const handleNavigate = useCallback((folderName: string) => {
    const newPath = navigate(currentPath, folderName);
    setCurrentPath(newPath);
    resetSelection();
  }, [currentPath, navigate]);

  const handleSidebarNavigate = useCallback((path: string) => {
    setCurrentPath(path);
    resetSelection();
  }, []);

  const handleModeChange = useCallback((mode: ExplorerMode) => {
    setExplorerMode(mode);
    if (mode === 'virtual') {
      setCurrentPath('/');
    }
    resetSelection();
  }, []);

  const goBack = useCallback(() => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || '/');
    resetSelection();
  }, [currentPath]);

  const goHome = useCallback(() => { setCurrentPath('/'); resetSelection(); }, []);

  const resetSelection = useCallback(() => {
    setSelected(null);
    setViewingFile(null);
    setSearchQuery('');
    setDebouncedSearch('');
    setRenamingItem(null);
    setShowNewInput(null);
    setContextMenu(null);
  }, []);

  const handleCreateFolder = useCallback(() => { setShowNewInput('folder'); setNewItemName(''); }, []);
  const handleCreateFile = useCallback(() => { setShowNewInput('file'); setNewItemName(''); }, []);

  const confirmNewItem = useCallback(() => {
    if (!newItemName.trim()) { setShowNewInput(null); return; }
    if (showNewInput === 'folder') {
      const ok = createFolder(currentPath, newItemName);
      if (ok) notify?.('Folder created', `Created "${newItemName}"`, 'success', '📁');
    } else {
      const ok = createFile(currentPath, newItemName);
      if (ok) notify?.('File created', `Created "${newItemName}"`, 'success', '📄');
    }
    setShowNewInput(null);
    setNewItemName('');
  }, [newItemName, showNewInput, currentPath, createFolder, createFile, notify]);

  const handleDelete = useCallback((name: string) => {
    deleteItem(currentPath, name);
    if (selected === name) setSelected(null);
    notify?.('Item deleted', `Deleted "${name}"`, 'warning', '🗑️');
  }, [currentPath, deleteItem, selected, notify]);

  const startRename = useCallback((name: string) => {
    setRenamingItem(name);
    setRenameValue(name);
    setTimeout(() => renameRef.current?.select(), 50);
  }, []);

  const confirmRename = useCallback(() => {
    if (renamingItem && renameValue.trim()) {
      const ok = renameItem(currentPath, renamingItem, renameValue);
      if (ok) {
        notify?.('Item renamed', `"${renamingItem}" → "${renameValue.trim()}"`, 'info', '✏️');
        if (selected === renamingItem) setSelected(renameValue.trim());
      }
    }
    setRenamingItem(null);
  }, [renamingItem, renameValue, currentPath, renameItem, selected, notify]);

  const openItem = useCallback((item: VirtualItem) => {
    if (item.type === 'folder') handleNavigate(item.name);
    else setViewingFile(item);
  }, [handleNavigate]);

  const handleContextMenu = useCallback((e: React.MouseEvent, name: string | null, type: 'file' | 'folder' | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, name, type });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, itemName: string) => {
    e.dataTransfer.setData('text/plain', itemName);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(folderName);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    setDragOver(null);
    const itemName = e.dataTransfer.getData('text/plain');
    if (!itemName || itemName === targetFolder) return;
    const targetPath = currentPath === '/' ? `/${targetFolder}` : `${currentPath}/${targetFolder}`;
    const ok = moveItem(currentPath, targetPath, itemName);
    if (ok) notify?.('Item moved', `Moved "${itemName}" to "${targetFolder}"`, 'info', '📦');
  }, [currentPath, moveItem, notify]);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-muted border-b border-border shrink-0">
        <button onClick={goBack} disabled={currentPath === '/' || explorerMode === 'native'} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={goHome} disabled={explorerMode === 'native'} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
          <Home className="w-3.5 h-3.5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center bg-background rounded px-2 py-1 text-xs text-muted-foreground border border-border overflow-hidden mx-1 min-w-0">
          {explorerMode === 'native' ? (
            <>
              <Monitor className="w-3 h-3 mr-1.5 shrink-0" />
              <span className="text-foreground">This PC</span>
              <ChevronRight className="w-3 h-3 mx-0.5" />
              <span className="text-foreground">Local Files</span>
            </>
          ) : (
            <>
              <Database className="w-3 h-3 mr-1.5 shrink-0" />
              {pathParts.map((p, i) => (
                <span key={i} className="flex items-center shrink-0">
                  {i > 0 && <ChevronRight className="w-3 h-3 mx-0.5 text-muted-foreground" />}
                  <button
                    onClick={() => handleSidebarNavigate(p.path)}
                    className="text-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {p.label}
                  </button>
                </span>
              ))}
            </>
          )}
        </div>

        {/* Search with debounce */}
        {explorerMode === 'virtual' && (
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search..."
              className="h-6 w-28 pl-6 pr-2 text-[11px] bg-background border border-border rounded outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>
        )}

        {explorerMode === 'virtual' && (
          <>
            <div className="h-4 w-px bg-border mx-0.5" />
            <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-1.5 rounded hover:bg-secondary transition-colors" title={viewMode === 'list' ? 'Grid view' : 'List view'}>
              {viewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowDetails(!showDetails)}
              className={`p-1.5 rounded transition-colors ${showDetails ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`} title="Details">
              <Info className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-border mx-0.5" />
            <button onClick={handleCreateFolder} className="p-1.5 rounded hover:bg-secondary transition-colors" title="New Folder">
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCreateFile} className="p-1.5 rounded hover:bg-secondary transition-colors" title="New File">
              <FilePlus className="w-3.5 h-3.5" />
            </button>
            {selected && (
              <button onClick={() => handleDelete(selected)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ExplorerSidebar currentPath={currentPath} mode={explorerMode} onNavigate={handleSidebarNavigate} onModeChange={handleModeChange} />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex">
          {explorerMode === 'native' ? (
            <div className="flex-1 overflow-y-auto win-scrollbar">
              <NativeFileBrowser />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto win-scrollbar"
                onContextMenu={e => handleContextMenu(e, null, null)}
                onDragOver={e => e.preventDefault()}
              >
                {viewingFile ? (
                  <FilePreview
                    item={viewingFile}
                    onClose={() => setViewingFile(null)}
                    onSave={(content) => {
                      saveFile(currentPath, viewingFile.name, content);
                      notify?.('File saved', `Saved "${viewingFile.name}"`, 'success', '💾');
                    }}
                  />
                ) : (
                  <>
                    {showNewInput && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border-b border-border animate-[fadeIn_0.15s_ease-out]">
                        {showNewInput === 'folder' ? <FolderPlus className="w-4 h-4 text-primary" /> : <FilePlus className="w-4 h-4 text-primary" />}
                        <input autoFocus
                          value={newItemName}
                          onChange={e => setNewItemName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmNewItem(); if (e.key === 'Escape') setShowNewInput(null); }}
                          onBlur={confirmNewItem}
                          placeholder={showNewInput === 'folder' ? 'New folder name...' : 'New file name (e.g. notes.txt)...'}
                          className="flex-1 h-6 px-2 text-xs bg-background border border-primary rounded outline-none text-foreground"
                        />
                      </div>
                    )}

                    {sortedItems.length === 0 && !showNewInput ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <FolderOpen className="w-10 h-10 opacity-30" />
                        <p className="text-sm">{debouncedSearch ? 'No results found' : 'This folder is empty'}</p>
                        <p className="text-xs">Right-click or use toolbar to create files and folders</p>
                      </div>
                    ) : viewMode === 'list' ? (
                      <div className="p-1">
                        <div className="grid grid-cols-[1fr,70px,90px] gap-2 px-3 py-1 text-[10px] text-muted-foreground font-medium border-b border-border">
                          <span>Name</span><span>Size</span><span>Modified</span>
                        </div>
                        {sortedItems.map(item => (
                          <div key={item.name}
                            draggable={true}
                            onDragStart={e => handleDragStart(e, item.name)}
                            onDragOver={item.type === 'folder' ? e => handleDragOver(e, item.name) : undefined}
                            onDrop={item.type === 'folder' ? e => handleDrop(e, item.name) : undefined}
                            onDragLeave={handleDragLeave}
                            onClick={() => { setSelected(item.name); setShowDetails(true); }}
                            onDoubleClick={() => openItem(item)}
                            onContextMenu={e => handleContextMenu(e, item.name, item.type)}
                            className={`w-full grid grid-cols-[1fr,70px,90px] gap-2 px-3 py-1.5 rounded text-xs transition-all cursor-default ${
                              selected === item.name ? 'bg-primary/10 text-foreground' :
                              dragOver === item.name ? 'bg-primary/20 ring-1 ring-primary' :
                              'hover:bg-muted text-foreground'
                            }`}>
                            <span className="flex items-center gap-2 truncate">
                              <FileIcon item={item} />
                              {renamingItem === item.name ? (
                                <input ref={renameRef} autoFocus
                                  value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingItem(null); }}
                                  onBlur={confirmRename}
                                  className="flex-1 h-5 px-1 text-xs bg-background border border-primary rounded outline-none text-foreground"
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <span className="truncate">{item.name}</span>
                              )}
                            </span>
                            <span className="text-muted-foreground">{item.size || '—'}</span>
                            <span className="text-muted-foreground">{new Date(item.modifiedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1 p-2">
                        {sortedItems.map(item => (
                          <div key={item.name}
                            draggable={true}
                            onDragStart={e => handleDragStart(e, item.name)}
                            onDragOver={item.type === 'folder' ? e => handleDragOver(e, item.name) : undefined}
                            onDrop={item.type === 'folder' ? e => handleDrop(e, item.name) : undefined}
                            onDragLeave={handleDragLeave}
                            onClick={() => { setSelected(item.name); setShowDetails(true); }}
                            onDoubleClick={() => openItem(item)}
                            onContextMenu={e => handleContextMenu(e, item.name, item.type)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-default transition-all ${
                              selected === item.name ? 'bg-primary/10' :
                              dragOver === item.name ? 'bg-primary/20 ring-1 ring-primary' :
                              'hover:bg-muted'
                            }`}>
                            <FileIcon item={item} size="lg" />
                            {renamingItem === item.name ? (
                              <input ref={renameRef} autoFocus
                                value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingItem(null); }}
                                onBlur={confirmRename}
                                className="w-full h-5 px-1 text-[10px] bg-background border border-primary rounded outline-none text-foreground text-center"
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-[10px] text-foreground text-center leading-tight w-full truncate">{item.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {showDetails && selectedItem && !viewingFile && (
                <DetailsPanel item={selectedItem} onClose={() => setShowDetails(false)} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 bg-muted border-t border-border text-[11px] text-muted-foreground flex justify-between shrink-0">
        {explorerMode === 'virtual' ? (
          <>
            <span>{sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}{selected ? ` • ${selected}` : ''}{debouncedSearch ? ` • Filtered` : ''}</span>
            <span>My Files (Virtual)</span>
          </>
        ) : (
          <>
            <span>Browsing local files</span>
            <span>This PC (Native)</span>
          </>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && explorerMode === 'virtual' && (
        <FileContextMenu
          x={contextMenu.x} y={contextMenu.y}
          targetName={contextMenu.name} targetType={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            const item = items.find(i => i.name === contextMenu.name);
            if (item) openItem(item);
          }}
          onRename={() => { if (contextMenu.name) startRename(contextMenu.name); }}
          onDelete={() => { if (contextMenu.name) handleDelete(contextMenu.name); }}
          onNewFolder={handleCreateFolder}
          onNewFile={handleCreateFile}
        />
      )}
    </div>
  );
});
