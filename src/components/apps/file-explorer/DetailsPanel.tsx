import { VirtualItem, getFileExtension } from './types';
import { FileIcon } from './FileIcon';
import { X } from 'lucide-react';

interface DetailsPanelProps {
  item: VirtualItem;
  onClose: () => void;
}

function getFileType(item: VirtualItem): string {
  if (item.type === 'folder') return 'File Folder';
  const ext = getFileExtension(item.name);
  const map: Record<string, string> = {
    txt: 'Text Document', md: 'Markdown', json: 'JSON File', js: 'JavaScript', ts: 'TypeScript',
    jsx: 'React JSX', tsx: 'React TSX', css: 'Stylesheet', html: 'HTML Document',
    jpg: 'JPEG Image', jpeg: 'JPEG Image', png: 'PNG Image', gif: 'GIF Image', svg: 'SVG Image',
    mp3: 'MP3 Audio', wav: 'WAV Audio', mp4: 'MP4 Video', avi: 'AVI Video',
    py: 'Python Script', java: 'Java File', c: 'C Source', cpp: 'C++ Source',
  };
  return map[ext] || `${ext.toUpperCase()} File`;
}

export function DetailsPanel({ item, onClose }: DetailsPanelProps) {
  return (
    <div className="w-52 bg-muted/50 border-l border-border p-3 overflow-y-auto win-scrollbar shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Details</span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-secondary transition-colors">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 mb-4 py-3 bg-background rounded-lg border border-border">
        <FileIcon item={item} size="lg" />
        <span className="text-xs font-medium text-foreground text-center px-2 break-all">{item.name}</span>
      </div>

      <div className="space-y-2.5">
        <DetailRow label="Type" value={getFileType(item)} />
        {item.size && <DetailRow label="Size" value={item.size} />}
        <DetailRow label="Created" value={new Date(item.createdAt).toLocaleDateString()} />
        <DetailRow label="Modified" value={new Date(item.modifiedAt).toLocaleDateString()} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs text-foreground">{value}</div>
    </div>
  );
}
