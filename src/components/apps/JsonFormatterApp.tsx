import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

export function JsonFormatterApp() {
  const [input, setInput] = useState('{\n  "name": "WebOS",\n  "version": 11,\n  "apps": ["Notes", "Paint"]\n}');
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      return { ok: true as const, text: JSON.stringify(parsed, null, indent), parsed };
    } catch (e: any) {
      return { ok: false as const, text: e.message };
    }
  }, [input, indent]);

  const minify = () => {
    try { setInput(JSON.stringify(JSON.parse(input))); } catch {}
  };
  const beautify = () => {
    try { setInput(JSON.stringify(JSON.parse(input), null, indent)); } catch {}
  };
  const copy = () => result.ok && navigator.clipboard.writeText(result.text);

  const stats = result.ok ? {
    size: new Blob([result.text]).size,
    keys: countKeys(result.parsed),
    depth: depth(result.parsed),
  } : null;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted text-xs flex-wrap">
        <Button size="sm" variant="outline" onClick={beautify}>Beautify</Button>
        <Button size="sm" variant="outline" onClick={minify}>Minify</Button>
        <Button size="sm" variant="outline" onClick={copy} disabled={!result.ok}>Copy</Button>
        <label className="flex items-center gap-1 ml-2">Indent
          <select value={indent} onChange={e => setIndent(+e.target.value)} className="bg-background border border-border rounded px-1 py-0.5">
            <option value={2}>2</option><option value={4}>4</option><option value={0}>0 (tab)</option>
          </select>
        </label>
        <span className={`ml-auto px-2 py-0.5 rounded ${result.ok ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-destructive/20 text-destructive'}`}>
          {result.ok ? '✓ Valid JSON' : '✕ Invalid'}
        </span>
      </div>
      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
          className="p-3 font-mono text-xs bg-background border-r border-border outline-none resize-none"
        />
        <pre className="p-3 font-mono text-xs overflow-auto bg-muted/30 whitespace-pre-wrap break-all">
          {result.ok ? result.text : <span className="text-destructive">{result.text}</span>}
        </pre>
      </div>
      {stats && (
        <div className="px-3 py-1.5 border-t border-border bg-muted text-[11px] text-muted-foreground flex gap-4">
          <span>Size: {stats.size}B</span>
          <span>Keys: {stats.keys}</span>
          <span>Depth: {stats.depth}</span>
        </div>
      )}
    </div>
  );
}

function countKeys(v: any): number {
  if (Array.isArray(v)) return v.reduce((a, b) => a + countKeys(b), 0);
  if (v && typeof v === 'object') return Object.keys(v).length + Object.values(v).reduce<number>((a, b) => a + countKeys(b), 0);
  return 0;
}
function depth(v: any): number {
  if (Array.isArray(v)) return 1 + (v.length ? Math.max(...v.map(depth)) : 0);
  if (v && typeof v === 'object') {
    const vals = Object.values(v);
    return 1 + (vals.length ? Math.max(...vals.map(depth)) : 0);
  }
  return 0;
}
