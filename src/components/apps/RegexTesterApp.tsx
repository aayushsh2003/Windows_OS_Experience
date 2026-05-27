import { useState, useMemo } from 'react';

export function RegexTesterApp() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('Contact us at hello@example.com or support@webos.dev for help.');

  const { matches, error, highlighted } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const m = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
      let html = '';
      let last = 0;
      for (const match of m) {
        const i = match.index!;
        html += escape(text.slice(last, i));
        html += `<mark class="bg-primary/30 text-foreground rounded px-0.5">${escape(match[0])}</mark>`;
        last = i + match[0].length;
      }
      html += escape(text.slice(last));
      return { matches: m, error: null as string | null, highlighted: html };
    } catch (e: any) {
      return { matches: [], error: e.message as string, highlighted: escape(text) };
    }
  }, [pattern, flags, text]);

  const toggleFlag = (f: string) => setFlags(fl => fl.includes(f) ? fl.replace(f, '') : fl + f);

  return (
    <div className="h-full flex flex-col bg-background p-3 gap-3 overflow-auto">
      <div>
        <label className="text-xs text-muted-foreground">Pattern</label>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-muted-foreground font-mono">/</span>
          <input value={pattern} onChange={e => setPattern(e.target.value)} className="flex-1 px-2 py-1.5 bg-muted border border-border rounded font-mono text-sm outline-none focus:ring-1 focus:ring-primary" />
          <span className="text-muted-foreground font-mono">/</span>
          <input value={flags} onChange={e => setFlags(e.target.value)} className="w-16 px-2 py-1.5 bg-muted border border-border rounded font-mono text-sm outline-none" />
        </div>
        <div className="flex gap-1 mt-2">
          {['g', 'i', 'm', 's', 'u', 'y'].map(f => (
            <button key={f} onClick={() => toggleFlag(f)} className={`px-2 py-1 rounded text-xs font-mono ${flags.includes(f) ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-secondary'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <label className="text-xs text-muted-foreground">Test string</label>
        <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 p-2 bg-muted border border-border rounded font-mono text-sm outline-none resize-none" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground">Matches ({matches.length})</label>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
        <div className="p-2 bg-muted border border-border rounded font-mono text-sm max-h-40 overflow-auto"
          dangerouslySetInnerHTML={{ __html: highlighted || '<span class="text-muted-foreground">No text</span>' }} />
        {matches.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs max-h-32 overflow-auto">
            {matches.slice(0, 50).map((m, i) => (
              <li key={i} className="flex gap-2 font-mono">
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="text-primary">{m[0]}</span>
                <span className="text-muted-foreground ml-auto">@{m.index}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
