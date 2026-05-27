import { useState, useCallback, useRef, useEffect } from 'react';

const COLS = 16;
const ROWS = 50;
const colLetter = (i: number) => {
  let s = '';
  let n = i;
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
};
const colIndex = (s: string) => {
  let n = 0;
  for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

type CellMeta = { bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right'; color?: string; bg?: string };
type Cells = Record<string, string>;
type Meta = Record<string, CellMeta>;

const FN_RE = /(SUM|AVG|AVERAGE|MIN|MAX|COUNT|COUNTA|MEDIAN|PRODUCT|STDEV)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/gi;
const SINGLE_FN_RE = /(ROUND|ABS|SQRT|POWER|MOD|INT|FLOOR|CEILING|LEN|UPPER|LOWER|IF|CONCAT|CONCATENATE|TRIM|EXP|LOG|SIN|COS|TAN|PI|NOW|TODAY|RAND)\(([^()]*)\)/gi;

function evalFormula(expr: string, cells: Cells, seen = new Set<string>()): string {
  try {
    let body = expr.trim();
    if (!body.startsWith('=')) return body;
    body = body.slice(1);

    // Range functions
    body = body.replace(FN_RE, (_, fn, c1, r1, c2, r2) => {
      const ci1 = colIndex(c1), ci2 = colIndex(c2);
      const ri1 = +r1, ri2 = +r2;
      const vals: number[] = [];
      let count = 0;
      for (let c = Math.min(ci1, ci2); c <= Math.max(ci1, ci2); c++) {
        for (let r = Math.min(ri1, ri2); r <= Math.max(ri1, ri2); r++) {
          const raw = resolve(`${colLetter(c)}${r}`, cells, seen);
          if (raw !== '') count++;
          const v = parseFloat(raw);
          if (!isNaN(v)) vals.push(v);
        }
      }
      const F = fn.toUpperCase();
      if (F === 'SUM') return String(vals.reduce((a, b) => a + b, 0));
      if (F === 'AVG' || F === 'AVERAGE') return String(vals.reduce((a, b) => a + b, 0) / (vals.length || 1));
      if (F === 'MIN') return String(vals.length ? Math.min(...vals) : 0);
      if (F === 'MAX') return String(vals.length ? Math.max(...vals) : 0);
      if (F === 'COUNT') return String(vals.length);
      if (F === 'COUNTA') return String(count);
      if (F === 'PRODUCT') return String(vals.reduce((a, b) => a * b, 1));
      if (F === 'MEDIAN') {
        const s = [...vals].sort((a, b) => a - b);
        const m = Math.floor(s.length / 2);
        return String(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
      }
      if (F === 'STDEV') {
        const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
        const v = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, vals.length - 1);
        return String(Math.sqrt(v));
      }
      return '0';
    });

    // Replace cell refs with values (string-aware: keep quoted strings)
    body = body.replace(/"([^"]*)"/g, (_, s) => `__STR_${btoa(s)}__`);
    body = body.replace(/([A-Z]+)(\d+)/g, (_, c, r) => {
      const v = resolve(`${c}${r}`, cells, seen);
      const n = parseFloat(v);
      return isNaN(n) ? `"${v.replace(/"/g, '\\"')}"` : String(n);
    });
    body = body.replace(/__STR_([A-Za-z0-9+/=]+)__/g, (_, b) => `"${atob(b).replace(/"/g, '\\"')}"`);

    // Single-arg / multi-arg builtins (run a couple passes for nesting)
    for (let i = 0; i < 4; i++) {
      const before = body;
      body = body.replace(SINGLE_FN_RE, (_, fn, args) => {
        const F = fn.toUpperCase();
        const parts = args.split(',').map((p: string) => p.trim());
        const num = (s: string) => parseFloat(s.replace(/^"|"$/g, '')) || 0;
        const str = (s: string) => s.replace(/^"|"$/g, '');
        try {
          if (F === 'PI') return String(Math.PI);
          if (F === 'NOW') return JSON.stringify(new Date().toLocaleString());
          if (F === 'TODAY') return JSON.stringify(new Date().toLocaleDateString());
          if (F === 'RAND') return String(Math.random());
          if (F === 'ROUND') return String(parts[1] != null ? +num(parts[0]).toFixed(num(parts[1])) : Math.round(num(parts[0])));
          if (F === 'ABS') return String(Math.abs(num(parts[0])));
          if (F === 'SQRT') return String(Math.sqrt(num(parts[0])));
          if (F === 'POWER') return String(Math.pow(num(parts[0]), num(parts[1])));
          if (F === 'MOD') return String(num(parts[0]) % num(parts[1]));
          if (F === 'INT' || F === 'FLOOR') return String(Math.floor(num(parts[0])));
          if (F === 'CEILING') return String(Math.ceil(num(parts[0])));
          if (F === 'EXP') return String(Math.exp(num(parts[0])));
          if (F === 'LOG') return String(Math.log(num(parts[0])));
          if (F === 'SIN') return String(Math.sin(num(parts[0])));
          if (F === 'COS') return String(Math.cos(num(parts[0])));
          if (F === 'TAN') return String(Math.tan(num(parts[0])));
          if (F === 'LEN') return String(str(parts[0]).length);
          if (F === 'UPPER') return JSON.stringify(str(parts[0]).toUpperCase());
          if (F === 'LOWER') return JSON.stringify(str(parts[0]).toLowerCase());
          if (F === 'TRIM') return JSON.stringify(str(parts[0]).trim());
          if (F === 'CONCAT' || F === 'CONCATENATE') return JSON.stringify(parts.map(str).join(''));
          if (F === 'IF') {
            // eslint-disable-next-line no-new-func
            const cond = Function(`"use strict";return (${parts[0]})`)();
            return cond ? parts[1] : (parts[2] ?? '""');
          }
        } catch { return '#ERR'; }
        return '#ERR';
      });
      if (before === body) break;
    }

    // Logical/comparison operators are valid JS; evaluate
    if (/[a-zA-Z_]/.test(body.replace(/"[^"]*"/g, ''))) return '#ERR';
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict";return (${body || '0'})`)();
    return String(result);
  } catch {
    return '#ERR';
  }
}

function resolve(key: string, cells: Cells, seen: Set<string>): string {
  if (seen.has(key)) return '#CYCLE';
  const v = cells[key] || '';
  if (!v.startsWith('=')) return v;
  const next = new Set(seen);
  next.add(key);
  return evalFormula(v, cells, next);
}

export function SpreadsheetApp() {
  const [cells, setCells] = useState<Cells>(() => {
    try { return JSON.parse(localStorage.getItem('webos-sheet') || '{}'); } catch { return {}; }
  });
  const [meta, setMeta] = useState<Meta>(() => {
    try { return JSON.parse(localStorage.getItem('webos-sheet-meta') || '{}'); } catch { return {}; }
  });
  const [active, setActive] = useState('A1');
  const [editing, setEditing] = useState<string | null>(null);
  const [selStart, setSelStart] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ cells: Cells; meta: Meta; origin: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { localStorage.setItem('webos-sheet', JSON.stringify(cells)); } catch {} }, [cells]);
  useEffect(() => { try { localStorage.setItem('webos-sheet-meta', JSON.stringify(meta)); } catch {} }, [meta]);

  const display = useCallback((key: string) => {
    const raw = cells[key] || '';
    if (raw.startsWith('=')) return evalFormula(raw, cells);
    return raw;
  }, [cells]);

  const setCell = (key: string, val: string) => setCells(c => ({ ...c, [key]: val }));
  const updateMeta = (key: string, patch: Partial<CellMeta>) =>
    setMeta(m => ({ ...m, [key]: { ...m[key], ...patch } }));

  const parseKey = (k: string) => {
    const m = k.match(/^([A-Z]+)(\d+)$/)!;
    return { col: colIndex(m[1]), row: +m[2] };
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    const { col, row } = parseKey(active);
    let nc = col, nr = row;
    if (e.key === 'ArrowRight' || e.key === 'Tab') nc = Math.min(COLS - 1, col + 1);
    else if (e.key === 'ArrowLeft') nc = Math.max(0, col - 1);
    else if (e.key === 'ArrowDown' || e.key === 'Enter') nr = Math.min(ROWS, row + 1);
    else if (e.key === 'ArrowUp') nr = Math.max(1, row - 1);
    else if (e.key === 'Delete' || e.key === 'Backspace') { setCell(active, ''); return; }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'c') { setClipboard({ cells: { [active]: cells[active] || '' }, meta: { [active]: meta[active] || {} }, origin: active }); return; }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'v') { if (clipboard) { Object.entries(clipboard.cells).forEach(([_, v]) => setCell(active, v)); updateMeta(active, clipboard.meta[clipboard.origin] || {}); } return; }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'b') { updateMeta(active, { bold: !meta[active]?.bold }); return; }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') { updateMeta(active, { italic: !meta[active]?.italic }); return; }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { setEditing(active); setCell(active, ''); setTimeout(() => inputRef.current?.focus(), 0); return; }
    else return;
    e.preventDefault();
    setActive(`${colLetter(nc)}${nr}`);
  };

  const exportCsv = () => {
    const rows: string[] = [];
    for (let r = 1; r <= ROWS; r++) {
      const row: string[] = [];
      for (let c = 0; c < COLS; c++) {
        const v = display(`${colLetter(c)}${r}`);
        row.push(/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
      }
      rows.push(row.join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sheet.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const next: Cells = {};
      text.split(/\r?\n/).forEach((line, ri) => {
        // simple CSV split (handles basic quotes)
        const parts: string[] = [];
        let cur = '', q = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
          else if (ch === ',' && !q) { parts.push(cur); cur = ''; }
          else cur += ch;
        }
        parts.push(cur);
        parts.forEach((v, ci) => { if (v !== '') next[`${colLetter(ci)}${ri + 1}`] = v; });
      });
      setCells(next);
      setMeta({});
    };
    reader.readAsText(file);
  };

  const insertRow = () => {
    const { row } = parseKey(active);
    const next: Cells = {};
    Object.entries(cells).forEach(([k, v]) => {
      const { col, row: r } = parseKey(k);
      next[`${colLetter(col)}${r >= row ? r + 1 : r}`] = v;
    });
    setCells(next);
  };
  const deleteRow = () => {
    const { row } = parseKey(active);
    const next: Cells = {};
    Object.entries(cells).forEach(([k, v]) => {
      const { col, row: r } = parseKey(k);
      if (r === row) return;
      next[`${colLetter(col)}${r > row ? r - 1 : r}`] = v;
    });
    setCells(next);
  };

  const m = meta[active] || {};

  return (
    <div className="flex flex-col h-full bg-background" onKeyDown={onKey} tabIndex={0}>
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted text-xs flex-wrap">
        <span className="font-mono font-semibold w-14 text-center bg-background border border-border rounded px-1 py-0.5">{active}</span>
        <input
          ref={inputRef}
          className="flex-1 min-w-[200px] px-2 py-1 bg-background border border-border rounded text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
          value={cells[active] || ''}
          onChange={e => setCell(active, e.target.value)}
          onFocus={() => setEditing(active)}
          onBlur={() => setEditing(null)}
          placeholder="Value or formula (=SUM, =IF, =ROUND, =CONCAT...)"
        />
        <button onClick={() => updateMeta(active, { bold: !m.bold })} className={`px-2 py-1 rounded font-bold ${m.bold ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>B</button>
        <button onClick={() => updateMeta(active, { italic: !m.italic })} className={`px-2 py-1 rounded italic ${m.italic ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>I</button>
        <button onClick={() => updateMeta(active, { align: 'left' })} className="px-2 py-1 rounded hover:bg-secondary">⬅</button>
        <button onClick={() => updateMeta(active, { align: 'center' })} className="px-2 py-1 rounded hover:bg-secondary">⬌</button>
        <button onClick={() => updateMeta(active, { align: 'right' })} className="px-2 py-1 rounded hover:bg-secondary">➡</button>
        <input type="color" value={m.bg || '#ffffff'} onChange={e => updateMeta(active, { bg: e.target.value })} className="w-6 h-6 rounded cursor-pointer" title="Background" />
        <input type="color" value={m.color || '#000000'} onChange={e => updateMeta(active, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer" title="Text color" />
        <button onClick={insertRow} className="px-2 py-1 rounded hover:bg-secondary">+ Row</button>
        <button onClick={deleteRow} className="px-2 py-1 rounded hover:bg-secondary">− Row</button>
        <button onClick={() => fileRef.current?.click()} className="px-2 py-1 rounded hover:bg-secondary">Import</button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])} />
        <button onClick={exportCsv} className="px-2 py-1 rounded hover:bg-secondary">Export</button>
        <button onClick={() => { if (confirm('Clear all?')) { setCells({}); setMeta({}); } }} className="px-2 py-1 rounded hover:bg-secondary">Clear</button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10 bg-muted border border-border" />
              {Array.from({ length: COLS }).map((_, i) => (
                <th key={i} className="min-w-[90px] bg-muted border border-border font-medium text-muted-foreground py-1">{colLetter(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, r) => (
              <tr key={r}>
                <td className="bg-muted border border-border text-center text-muted-foreground sticky left-0 px-2">{r + 1}</td>
                {Array.from({ length: COLS }).map((_, c) => {
                  const key = `${colLetter(c)}${r + 1}`;
                  const isActive = key === active;
                  const cm = meta[key] || {};
                  const style: React.CSSProperties = {
                    fontWeight: cm.bold ? 700 : undefined,
                    fontStyle: cm.italic ? 'italic' : undefined,
                    textAlign: cm.align,
                    color: cm.color,
                    background: cm.bg,
                  };
                  return (
                    <td
                      key={c}
                      onClick={() => { setActive(key); setEditing(null); }}
                      onDoubleClick={() => { setActive(key); setEditing(key); setTimeout(() => inputRef.current?.focus(), 0); }}
                      style={style}
                      className={`border border-border px-1.5 py-1 cursor-cell ${isActive ? 'ring-2 ring-primary ring-inset' : ''} ${!cm.bg ? 'bg-background' : ''}`}
                    >
                      <span className="block truncate font-mono">{display(key)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1 bg-muted text-[11px] text-muted-foreground border-t border-border">
        Math: SUM AVG MIN MAX COUNT COUNTA MEDIAN PRODUCT STDEV · ROUND ABS SQRT POWER MOD INT CEILING · Text: LEN UPPER LOWER TRIM CONCAT · Logic: IF · Date: NOW TODAY · Ctrl+B/I bold·italic, Ctrl+C/V copy·paste
      </div>
    </div>
  );
}
