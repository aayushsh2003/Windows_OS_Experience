import { useState, useCallback, useEffect, memo } from 'react';
import { Folder, FileText, FolderOpen, AlertCircle, ArrowLeft, FileCode, Image, Music, Video, Loader2, RefreshCw, FileType, Download, ExternalLink } from 'lucide-react';
import { getFileExtension, getPreviewType, getOfficeFileLabel, type PreviewType } from './types';

interface NativeFileEntry {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
}

function getNativeFileIcon(entry: NativeFileEntry) {
  if (entry.kind === 'directory') return <Folder className="w-4 h-4 text-primary shrink-0" />;
  const ext = getFileExtension(entry.name);
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext))
    return <Image className="w-4 h-4 text-green-600 shrink-0" />;
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext))
    return <Music className="w-4 h-4 text-pink-500 shrink-0" />;
  if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext))
    return <Video className="w-4 h-4 text-orange-500 shrink-0" />;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'css', 'html', 'json'].includes(ext))
    return <FileCode className="w-4 h-4 text-blue-500 shrink-0" />;
  if (ext === 'pdf')
    return <FileType className="w-4 h-4 text-red-500 shrink-0" />;
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext))
    return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
  if (['xls', 'xlsx', 'ods'].includes(ext))
    return <FileText className="w-4 h-4 text-green-600 shrink-0" />;
  if (['ppt', 'pptx', 'odp'].includes(ext))
    return <FileText className="w-4 h-4 text-orange-600 shrink-0" />;
  return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
}

export const NativeFileBrowser = memo(function NativeFileBrowser() {
  const [entries, setEntries] = useState<NativeFileEntry[]>([]);
  const [dirStack, setDirStack] = useState<FileSystemDirectoryHandle[]>([]);
  const [currentDir, setCurrentDir] = useState<FileSystemDirectoryHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [filePreviewType, setFilePreviewType] = useState<PreviewType | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Cleanup object URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (fileContent && (filePreviewType === 'image' || filePreviewType === 'audio' || filePreviewType === 'video' || filePreviewType === 'pdf' || filePreviewType === 'office' || filePreviewType === 'unsupported')) {
        URL.revokeObjectURL(fileContent);
      }
    };
  }, [fileContent, filePreviewType]);

  const listDirectory = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setLoading(true);
    setError(null);
    try {
      const items: NativeFileEntry[] = [];
      for await (const entry of (handle as any).values()) {
        items.push({ name: entry.name, kind: entry.kind, handle: entry });
      }
      items.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(items);
      setSelectedFile(null);
      setFileContent(null);
      setFilePreviewType(null);
    } catch (err: any) {
      setError('Failed to read directory. Please select folder again.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openRootDirectory = useCallback(async () => {
    try {
      setError(null);
      const handle = await (window as any).showDirectoryPicker();
      setCurrentDir(handle);
      setDirStack([]);
      await listDirectory(handle);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Please select folder again. Make sure your browser supports the File System Access API.');
      }
    }
  }, [listDirectory]);

  const openSubDirectory = useCallback(async (entry: NativeFileEntry) => {
    if (entry.kind !== 'directory' || !currentDir) return;
    setLoading(true);
    try {
      const subHandle = entry.handle as FileSystemDirectoryHandle;
      setDirStack(prev => [...prev, currentDir]);
      setCurrentDir(subHandle);
      await listDirectory(subHandle);
    } catch {
      setError(`Could not open folder: ${entry.name}. Please select folder again.`);
      setLoading(false);
    }
  }, [currentDir, listDirectory]);

  const goBack = useCallback(async () => {
    if (dirStack.length === 0) return;
    const parentHandle = dirStack[dirStack.length - 1];
    setDirStack(prev => prev.slice(0, -1));
    setCurrentDir(parentHandle);
    await listDirectory(parentHandle);
  }, [dirStack, listDirectory]);

  const revokeCurrentPreview = useCallback(() => {
    if (fileContent && (filePreviewType === 'image' || filePreviewType === 'audio' || filePreviewType === 'video' || filePreviewType === 'pdf' || filePreviewType === 'office' || filePreviewType === 'unsupported')) {
      URL.revokeObjectURL(fileContent);
    }
  }, [fileContent, filePreviewType]);

  const readFile = useCallback(async (entry: NativeFileEntry) => {
    if (entry.kind !== 'file') return;
    setPreviewLoading(true);
    setError(null);
    revokeCurrentPreview();
    try {
      const fileHandle = entry.handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const pType = getPreviewType(entry.name);

      if (pType === 'image' || pType === 'audio' || pType === 'video' || pType === 'pdf' || pType === 'office') {
        const url = URL.createObjectURL(file);
        setSelectedFile(entry.name);
        setFileContent(url);
        setFilePreviewType(pType);
      } else if (pType === 'text') {
        if (file.size > 5 * 1024 * 1024) {
          setSelectedFile(entry.name);
          setFileContent('File too large to preview (>5MB)');
          setFilePreviewType('text');
        } else {
          const text = await file.text();
          setSelectedFile(entry.name);
          setFileContent(text);
          setFilePreviewType('text');
        }
      } else {
        const url = URL.createObjectURL(file);
        setSelectedFile(entry.name);
        setFileContent(url);
        setFilePreviewType('unsupported');
      }
    } catch {
      setError(`Could not read file: ${entry.name}`);
    } finally {
      setPreviewLoading(false);
    }
  }, [revokeCurrentPreview]);

  const handleEntryClick = useCallback((entry: NativeFileEntry) => {
    if (entry.kind === 'directory') {
      openSubDirectory(entry);
    } else {
      readFile(entry);
    }
  }, [openSubDirectory, readFile]);

  const closePreview = useCallback(() => {
    revokeCurrentPreview();
    setSelectedFile(null);
    setFileContent(null);
    setFilePreviewType(null);
  }, [revokeCurrentPreview]);

  const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const pathDisplay = currentDir
    ? [...dirStack.map(h => h.name), currentDir.name].join(' > ')
    : '';

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-4">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-sm font-medium">File System Access API not supported</p>
        <p className="text-xs text-center">Your browser doesn't support native file access. Try Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!currentDir ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
          <FolderOpen className="w-12 h-12 text-primary opacity-40" />
          <p className="text-sm text-foreground font-medium">Browse Local Files</p>
          <p className="text-xs text-muted-foreground text-center">Open a folder from your computer to browse files</p>
          <button
            onClick={openRootDirectory}
            className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Open Folder
          </button>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Native toolbar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border-b border-border shrink-0">
            <button onClick={goBack} disabled={dirStack.length === 0 || loading}
              className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 text-[11px] text-muted-foreground truncate">{pathDisplay}</div>
            <button onClick={() => currentDir && listDirectory(currentDir)} disabled={loading}
              className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openRootDirectory} className="text-[11px] text-primary hover:underline">Change</button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* File list */}
            <div className={`overflow-y-auto win-scrollbar p-1 ${selectedFile ? 'w-1/2' : 'flex-1'}`}>
              {loading && entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin opacity-40" />
                  <p className="text-xs">Loading files...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <FolderOpen className="w-8 h-8 opacity-30" />
                  <p className="text-xs">This folder is empty</p>
                </div>
              ) : (
                entries.map(entry => (
                  <button key={entry.name}
                    onClick={() => handleEntryClick(entry)}
                    disabled={loading}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 ${
                      selectedFile === entry.name ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                    }`}>
                    {getNativeFileIcon(entry)}
                    <span className="truncate">{entry.name}</span>
                    {entry.kind === 'directory' && (
                      <span className="ml-auto text-[10px] text-muted-foreground">→</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* File preview pane */}
            {selectedFile && (
              <div className="w-1/2 border-l border-border flex flex-col">
                <div className="px-3 py-1.5 bg-muted border-b border-border text-xs font-medium text-foreground truncate flex items-center justify-between shrink-0">
                  <span className="truncate">{selectedFile}</span>
                  <button onClick={closePreview}
                    className="text-[10px] text-muted-foreground hover:text-foreground ml-2 shrink-0">✕</button>
                </div>

                {previewLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-40" />
                    <p className="text-xs">Loading preview...</p>
                  </div>
                ) : filePreviewType === 'image' && fileContent ? (
                  <div className="flex-1 flex items-center justify-center p-4 bg-background overflow-auto">
                    <img src={fileContent} alt={selectedFile} className="max-w-full max-h-full object-contain rounded" />
                  </div>
                ) : filePreviewType === 'pdf' && fileContent ? (
                  <iframe
                    src={fileContent}
                    title={selectedFile}
                    className="flex-1 w-full border-0"
                  />
                ) : filePreviewType === 'video' && fileContent ? (
                  <div className="flex-1 flex items-center justify-center p-4 bg-background">
                    <video controls className="max-w-full max-h-full rounded">
                      <source src={fileContent} />
                      Your browser does not support video playback.
                    </video>
                  </div>
                ) : filePreviewType === 'audio' && fileContent ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 bg-background">
                    <Music className="w-12 h-12 text-pink-500 opacity-50" />
                    <p className="text-xs text-foreground font-medium">{selectedFile}</p>
                    <audio controls className="w-56">
                      <source src={fileContent} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : filePreviewType === 'text' && fileContent !== null ? (
                  <pre className="flex-1 p-3 text-[11px] font-mono text-foreground bg-background overflow-auto win-scrollbar whitespace-pre-wrap">
                    {fileContent}
                  </pre>
                ) : filePreviewType === 'office' && fileContent ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 bg-background">
                    <FileType className="w-12 h-12 text-primary opacity-50" />
                    <p className="text-sm font-medium text-foreground">{selectedFile}</p>
                    <p className="text-xs text-muted-foreground">{getOfficeFileLabel(selectedFile!)}</p>
                    <div className="flex gap-2">
                      <a href={fileContent} download={selectedFile!}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                      <button onClick={() => { const w = window.open(fileContent!, '_blank'); w?.focus(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                      </button>
                    </div>
                  </div>
                ) : fileContent && filePreviewType === 'unsupported' ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 text-muted-foreground">
                    <FileText className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-medium">Preview not available</p>
                    <p className="text-xs">{selectedFile}</p>
                    <div className="flex gap-2">
                      <a href={fileContent} download={selectedFile!}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                      <button onClick={() => { const w = window.open(fileContent!, '_blank'); w?.focus(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-4">
                    <FileText className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-medium">Preview not available</p>
                    <p className="text-xs">{selectedFile}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && currentDir && (
        <div className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs border-t border-border flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] hover:underline">Dismiss</button>
        </div>
      )}
    </div>
  );
});
