import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, FolderOpen, Save, List, ListOrdered } from 'lucide-react';

export function TextEditorApp() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState('Untitled Document');

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const openFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Text', accept: { 'text/*': ['.txt', '.html', '.md'] } }],
        });
        const file = await handle.getFile();
        const text = await file.text();
        if (editorRef.current) editorRef.current.innerHTML = text;
        setFileName(file.name);
      }
    } catch {}
  };

  const saveFile = async () => {
    if (!editorRef.current) return;
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(editorRef.current.innerHTML);
        await writable.close();
        setFileName(handle.name);
      }
    } catch {}
  };

  const [fontSize, setFontSize] = useState('3');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Menu bar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted text-xs">
        <button onClick={openFile} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary text-foreground">
          <FolderOpen className="w-3 h-3" /> Open
        </button>
        <button onClick={saveFile} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary text-foreground">
          <Save className="w-3 h-3" /> Save
        </button>
        <div className="mx-1 w-px h-4 bg-border" />
        <span className="text-muted-foreground truncate">{fileName}</span>
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-card flex-wrap">
        <select
          value={fontSize}
          onChange={e => { setFontSize(e.target.value); exec('fontSize', e.target.value); }}
          className="text-xs px-1 py-0.5 rounded border border-input bg-background text-foreground mr-1"
        >
          {[1,2,3,4,5,6,7].map(s => (
            <option key={s} value={s}>{['8','10','12','14','18','24','36'][s-1]}pt</option>
          ))}
        </select>
        <ToolBtn icon={<Bold className="w-3.5 h-3.5" />} onClick={() => exec('bold')} />
        <ToolBtn icon={<Italic className="w-3.5 h-3.5" />} onClick={() => exec('italic')} />
        <ToolBtn icon={<Underline className="w-3.5 h-3.5" />} onClick={() => exec('underline')} />
        <div className="mx-1 w-px h-4 bg-border" />
        <ToolBtn icon={<AlignLeft className="w-3.5 h-3.5" />} onClick={() => exec('justifyLeft')} />
        <ToolBtn icon={<AlignCenter className="w-3.5 h-3.5" />} onClick={() => exec('justifyCenter')} />
        <ToolBtn icon={<AlignRight className="w-3.5 h-3.5" />} onClick={() => exec('justifyRight')} />
        <div className="mx-1 w-px h-4 bg-border" />
        <ToolBtn icon={<List className="w-3.5 h-3.5" />} onClick={() => exec('insertUnorderedList')} />
        <ToolBtn icon={<ListOrdered className="w-3.5 h-3.5" />} onClick={() => exec('insertOrderedList')} />
        <div className="mx-1 w-px h-4 bg-border" />
        <input type="color" className="w-6 h-6 border-0 p-0 cursor-pointer rounded" onChange={e => exec('foreColor', e.target.value)} title="Text color" />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="flex-1 p-4 overflow-y-auto win-scrollbar text-sm text-foreground outline-none leading-relaxed"
        style={{ minHeight: 0 }}
      >
        <p>Start typing your document here...</p>
      </div>
    </div>
  );
}

function ToolBtn({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
    >
      {icon}
    </button>
  );
}
