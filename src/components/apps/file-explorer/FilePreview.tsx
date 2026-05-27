import { useState, useEffect } from 'react';
import { VirtualItem, getPreviewType, getOfficeFileLabel } from './types';
import { FileIcon } from './FileIcon';
import { Save, Image, Music, Video, FileText, Loader2, Download, ExternalLink } from 'lucide-react';

interface FilePreviewProps {
  item: VirtualItem;
  onClose: () => void;
  onSave: (content: string) => void;
}

export function FilePreview({ item, onClose, onSave }: FilePreviewProps) {
  const [content, setContent] = useState(item.content || '');
  const [loading, setLoading] = useState(false);
  const previewType = getPreviewType(item.name);

  // Reset content when item changes
  useEffect(() => {
    setContent(item.content || '');
  }, [item.name, item.content]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (item.content && (previewType === 'image' || previewType === 'audio' || previewType === 'video' || previewType === 'pdf' || previewType === 'office')) {
        try { URL.revokeObjectURL(item.content); } catch {}
      }
    };
  }, [item.content, previewType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border-b border-border shrink-0">
        <button onClick={onClose} className="text-xs text-primary hover:underline">← Back</button>
        <FileIcon item={item} />
        <span className="text-xs text-foreground font-medium truncate">{item.name}</span>
        {previewType === 'text' && (
          <button onClick={() => onSave(content)}
            className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
            <Save className="w-3 h-3" /> Save
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto win-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin opacity-40" />
            <p className="text-xs">Loading preview...</p>
          </div>
        ) : previewType === 'text' ? (
          <textarea
            className="w-full h-full p-3 text-xs font-mono text-foreground bg-background resize-none outline-none"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        ) : previewType === 'image' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4 bg-background">
            {item.content ? (
              <img src={item.content} alt={item.name} className="max-w-full max-h-full object-contain rounded shadow-md" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Image className="w-16 h-16 opacity-30" />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs">Image preview (no data available)</p>
              </div>
            )}
          </div>
        ) : previewType === 'pdf' ? (
          <div className="flex flex-col items-center justify-center h-full p-4 bg-background">
            {item.content ? (
              <iframe
                src={item.content}
                title={item.name}
                className="w-full h-full border-0 rounded"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="w-16 h-16 opacity-30" />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs">PDF preview (no data available)</p>
              </div>
            )}
          </div>
        ) : previewType === 'video' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4 bg-background">
            {item.content ? (
              <video controls className="max-w-full max-h-full rounded shadow-md">
                <source src={item.content} />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Video className="w-16 h-16 opacity-30" />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs">Video preview (no data available)</p>
              </div>
            )}
          </div>
        ) : previewType === 'audio' ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4 bg-background">
            <Music className="w-16 h-16 text-pink-500 opacity-60" />
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            {item.content ? (
              <audio controls className="w-64">
                <source src={item.content} />
                Your browser does not support audio playback.
              </audio>
            ) : (
              <p className="text-xs text-muted-foreground">Audio preview (no data available)</p>
            )}
          </div>
        ) : previewType === 'office' ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4 bg-background">
            <FileIcon item={item} size="lg" />
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{getOfficeFileLabel(item.name)}</p>
            {item.content ? (
              <div className="flex gap-2">
                <a href={item.content} download={item.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button onClick={() => { const w = window.open(item.content!, '_blank'); w?.focus(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No data available for this file</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <FileIcon item={item} size="lg" />
            <p className="text-sm font-medium">Preview not available for this file type</p>
            <p className="text-xs">{item.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
