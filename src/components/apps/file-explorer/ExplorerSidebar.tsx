import { Folder, HardDrive, Database, ChevronDown, ChevronRight, Monitor } from 'lucide-react';
import { useState } from 'react';
import { ExplorerMode } from './types';

interface ExplorerSidebarProps {
  currentPath: string;
  mode: ExplorerMode;
  onNavigate: (path: string) => void;
  onModeChange: (mode: ExplorerMode) => void;
}

const quickAccessFolders = ['Documents', 'Pictures', 'Music', 'Videos', 'Downloads', 'Desktop'];

export function ExplorerSidebar({ currentPath, mode, onNavigate, onModeChange }: ExplorerSidebarProps) {
  const [quickOpen, setQuickOpen] = useState(true);
  const [pcOpen, setPcOpen] = useState(true);
  const [myFilesOpen, setMyFilesOpen] = useState(true);

  return (
    <div className="w-44 bg-muted border-r border-border py-1.5 px-1 overflow-y-auto win-scrollbar shrink-0">
      {/* Quick Access */}
      <button onClick={() => setQuickOpen(!quickOpen)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hover:bg-secondary/50 rounded transition-colors">
        {quickOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Quick Access
      </button>
      {quickOpen && mode === 'virtual' && quickAccessFolders.map(folder => (
        <button key={folder}
          onClick={() => onNavigate(`/${folder}`)}
          className={`w-full flex items-center gap-2 px-4 py-1 text-xs rounded transition-colors ${
            currentPath === `/${folder}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
          }`}>
          <Folder className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{folder}</span>
        </button>
      ))}
      {quickOpen && mode === 'native' && (
        <p className="px-4 py-1 text-[10px] text-muted-foreground italic">Browse local files below</p>
      )}

      <div className="h-px bg-border mx-2 my-1.5" />

      {/* This PC (Native File System Access API) */}
      <button onClick={() => { setPcOpen(!pcOpen); }}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hover:bg-secondary/50 rounded transition-colors">
        {pcOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Monitor className="w-3 h-3" />
        This PC
      </button>
      {pcOpen && (
        <button
          onClick={() => onModeChange('native')}
          className={`w-full flex items-center gap-2 px-4 py-1 text-xs rounded transition-colors ${
            mode === 'native' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
          }`}>
          <HardDrive className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Local Files</span>
        </button>
      )}

      <div className="h-px bg-border mx-2 my-1.5" />

      {/* My Files (Virtual localStorage) */}
      <button onClick={() => setMyFilesOpen(!myFilesOpen)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hover:bg-secondary/50 rounded transition-colors">
        {myFilesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Database className="w-3 h-3" />
        My Files
      </button>
      {myFilesOpen && (
        <button
          onClick={() => { onModeChange('virtual'); onNavigate('/'); }}
          className={`w-full flex items-center gap-2 px-4 py-1 text-xs rounded transition-colors ${
            mode === 'virtual' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
          }`}>
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Virtual Drive</span>
        </button>
      )}
    </div>
  );
}
