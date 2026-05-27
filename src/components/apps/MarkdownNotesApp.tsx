import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface Note { id: string; title: string; body: string; updated: number; }

const KEY = 'webos-md-notes';

function render(md: string): string {
  let h = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded my-2 text-xs overflow-x-auto"><code>$1</code></pre>');
  h = h.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>');
  h = h.replace(/^### (.*)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
  h = h.replace(/^## (.*)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>');
  h = h.replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  h = h.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary underline">$1</a>');
  h = h.replace(/^- \[x\] (.*)$/gim, '<div>☑ $1</div>');
  h = h.replace(/^- \[ \] (.*)$/gim, '<div>☐ $1</div>');
  h = h.replace(/^[-*] (.*)$/gm, '<li class="ml-5 list-disc">$1</li>');
  h = h.replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-primary pl-3 italic text-muted-foreground my-2">$1</blockquote>');
  h = h.replace(/^---$/gm, '<hr class="my-3 border-border" />');
  h = h.replace(/\n\n/g, '<br/><br/>');
  return h;
}

export function MarkdownNotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id || null);
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  const active = useMemo(() => notes.find(n => n.id === activeId), [notes, activeId]);

  const add = () => {
    const n: Note = { id: crypto.randomUUID(), title: 'Untitled', body: '# New note\n\nStart writing...', updated: Date.now() };
    setNotes(p => [n, ...p]);
    setActiveId(n.id);
  };
  const del = (id: string) => {
    setNotes(p => p.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  };
  const update = (patch: Partial<Note>) => {
    if (!active) return;
    setNotes(p => p.map(n => n.id === active.id ? { ...n, ...patch, updated: Date.now() } : n));
  };

  return (
    <div className="flex h-full bg-background text-foreground">
      <aside className="w-56 border-r border-border flex flex-col bg-muted/30">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold">Notes</span>
          <button onClick={add} className="p-1 hover:bg-secondary rounded"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 && <div className="p-3 text-xs text-muted-foreground text-center">No notes yet</div>}
          {notes.map(n => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`group px-2 py-2 cursor-pointer border-b border-border/50 hover:bg-secondary/50 ${activeId === n.id ? 'bg-primary/10' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate">{n.title || 'Untitled'}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); del(n.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 rounded">
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">{new Date(n.updated).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
              <input
                value={active.title}
                onChange={e => update({ title: e.target.value })}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
              />
              <div className="flex gap-0.5 bg-secondary rounded p-0.5">
                {(['edit', 'split', 'preview'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} className={`px-2 py-0.5 rounded text-[11px] capitalize ${mode === m ? 'bg-background shadow-sm' : ''}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {mode !== 'preview' && (
                <textarea
                  value={active.body}
                  onChange={e => update({ body: e.target.value })}
                  spellCheck={false}
                  className={`${mode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'} p-3 bg-background text-sm font-mono resize-none outline-none`}
                />
              )}
              {mode !== 'edit' && (
                <div
                  className={`${mode === 'split' ? 'w-1/2' : 'w-full'} p-4 overflow-y-auto prose prose-sm max-w-none text-sm`}
                  dangerouslySetInnerHTML={{ __html: render(active.body) }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">Select a note or create a new one</p>
            <button onClick={add} className="mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs">New note</button>
          </div>
        )}
      </div>
    </div>
  );
}
