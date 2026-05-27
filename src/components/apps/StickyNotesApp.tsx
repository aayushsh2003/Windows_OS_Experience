import { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, PinOff, Palette } from 'lucide-react';

interface StickyNote {
  id: string;
  text: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

const noteColors = [
  { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-300 dark:border-yellow-700', value: 'yellow' },
  { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300 dark:border-pink-700', value: 'pink' },
  { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300 dark:border-blue-700', value: 'blue' },
  { name: 'Green', bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-300 dark:border-green-700', value: 'green' },
  { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-300 dark:border-purple-700', value: 'purple' },
  { name: 'Orange', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-700', value: 'orange' },
];

const getColorClasses = (color: string) => noteColors.find(c => c.value === color) || noteColors[0];

export function StickyNotesApp() {
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    try { return JSON.parse(localStorage.getItem('webos-sticky-notes') || '[]'); } catch { return []; }
  });
  const [colorPicker, setColorPicker] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('webos-sticky-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const n: StickyNote = {
      id: Date.now().toString(),
      text: '',
      color: 'yellow',
      pinned: false,
      createdAt: new Date().toLocaleDateString(),
    };
    setNotes(prev => [n, ...prev]);
  };

  const updateNote = (id: string, text: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const changeColor = (id: string, color: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
    setColorPicker(null);
  };

  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">📌 Sticky Notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{notes.length} notes</span>
          <button onClick={addNote} className="flex items-center gap-1 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg hover:opacity-90">
            <Plus className="w-3 h-3" /> New
          </button>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <span className="text-4xl">📝</span>
            <p className="text-sm">No sticky notes yet</p>
            <button onClick={addNote} className="text-xs text-primary hover:underline">Create your first note</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sorted.map(note => {
              const cc = getColorClasses(note.color);
              return (
                <div key={note.id} className={`${cc.bg} ${cc.border} border rounded-xl p-3 flex flex-col min-h-[140px] relative group transition-shadow hover:shadow-md`}>
                  {/* Actions */}
                  <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button onClick={() => togglePin(note.id)} className="p-1 rounded hover:bg-black/10" title={note.pinned ? 'Unpin' : 'Pin'}>
                        {note.pinned ? <PinOff className="w-3 h-3 text-foreground" /> : <Pin className="w-3 h-3 text-foreground" />}
                      </button>
                      <div className="relative">
                        <button onClick={() => setColorPicker(colorPicker === note.id ? null : note.id)} className="p-1 rounded hover:bg-black/10">
                          <Palette className="w-3 h-3 text-foreground" />
                        </button>
                        {colorPicker === note.id && (
                          <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg p-2 flex gap-1 z-10 shadow-lg">
                            {noteColors.map(c => (
                              <button key={c.value} onClick={() => changeColor(note.id, c.value)}
                                className={`w-5 h-5 rounded-full ${c.bg} ${c.border} border ${note.color === c.value ? 'ring-2 ring-primary' : ''}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="p-1 rounded hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                  {note.pinned && <span className="absolute top-2 right-2 text-xs">📌</span>}
                  <textarea
                    value={note.text}
                    onChange={e => updateNote(note.id, e.target.value)}
                    placeholder="Type your note..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none"
                  />
                  <span className="text-[9px] text-muted-foreground mt-2">{note.createdAt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
