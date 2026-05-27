import { useState } from 'react';

export function NotepadApp() {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-3 py-1 bg-muted text-xs text-muted-foreground border-b border-border">
        <span className="cursor-default hover:bg-secondary px-2 py-0.5 rounded">File</span>
        <span className="cursor-default hover:bg-secondary px-2 py-0.5 rounded">Edit</span>
        <span className="cursor-default hover:bg-secondary px-2 py-0.5 rounded">Format</span>
        <span className="cursor-default hover:bg-secondary px-2 py-0.5 rounded">View</span>
        <span className="cursor-default hover:bg-secondary px-2 py-0.5 rounded">Help</span>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 p-3 bg-background text-foreground text-sm font-mono resize-none outline-none border-none"
        placeholder="Start typing..."
        spellCheck={false}
      />
      <div className="px-3 py-1 bg-muted text-[11px] text-muted-foreground border-t border-border flex justify-between">
        <span>Ln 1, Col {text.length + 1}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
