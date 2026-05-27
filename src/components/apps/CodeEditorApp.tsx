// import { useState, useEffect, useCallback } from 'react';

// const SAMPLE_CODE = `// Welcome to WebOS Code Editor
// import React from 'react';

// function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <div className="app">
//       <h1>Hello WebOS!</h1>
//       <p>Count: {count}</p>
//       <button onClick={() => setCount(c => c + 1)}>
//         Increment
//       </button>
//     </div>
//   );
// }

// export default App;`;

// interface FileTab {
//   name: string;
//   content: string;
//   language: string;
// }

// const KEYWORDS = /\b(import|export|from|const|let|var|function|return|if|else|for|while|switch|case|break|default|new|this|class|extends|try|catch|throw|async|await|typeof|instanceof|void|null|undefined|true|false)\b/g;
// const STRINGS = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
// const COMMENTS = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
// const JSX_TAGS = /(<\/?[\w.]+(?:\s[^>]*)?\s*\/?>)/g;
// const NUMBERS = /\b(\d+\.?\d*)\b/g;

// function highlight(code: string): string {
//   let html = code
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;');

//   html = html.replace(COMMENTS, '<span style="color:hsl(var(--muted-foreground));opacity:0.6">$1</span>');
//   html = html.replace(STRINGS, '<span style="color:#e6994a">$&</span>');
//   html = html.replace(KEYWORDS, '<span style="color:#c678dd">$1</span>');
//   html = html.replace(NUMBERS, '<span style="color:#d19a66">$1</span>');
//   html = html.replace(/(&lt;\/?[\w.]+)/g, '<span style="color:#e06c75">$&</span>');

//   return html;
// }

// export function CodeEditorApp() {
//   const [tabs, setTabs] = useState<FileTab[]>([
//     { name: 'App.tsx', content: SAMPLE_CODE, language: 'tsx' },
//     { name: 'styles.css', content: '/* Add your styles here */\n.app {\n  padding: 2rem;\n  font-family: system-ui;\n}\n\nh1 {\n  color: #333;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n  border-radius: 0.25rem;\n  background: #0078d4;\n  color: white;\n  border: none;\n  cursor: pointer;\n}', language: 'css' },
//   ]);
//   const [activeTab, setActiveTab] = useState(0);
//   const [showNewFile, setShowNewFile] = useState(false);
//   const [newFileName, setNewFileName] = useState('');
//   const [fontSize, setFontSize] = useState(13);

//   const current = tabs[activeTab];

//   const updateContent = useCallback((content: string) => {
//     setTabs(prev => prev.map((t, i) => i === activeTab ? { ...t, content } : t));
//   }, [activeTab]);

//   const addFile = () => {
//     if (!newFileName.trim()) return;
//     const ext = newFileName.split('.').pop() || 'txt';
//     setTabs(prev => [...prev, { name: newFileName, content: '', language: ext }]);
//     setActiveTab(tabs.length);
//     setShowNewFile(false);
//     setNewFileName('');
//   };

//   const closeTab = (idx: number) => {
//     if (tabs.length <= 1) return;
//     setTabs(prev => prev.filter((_, i) => i !== idx));
//     if (activeTab >= idx && activeTab > 0) setActiveTab(activeTab - 1);
//   };

//   const lines = current.content.split('\n');

//   return (
//     <div className="flex flex-col h-full bg-[hsl(220,13%,14%)] text-[hsl(220,14%,80%)]">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between px-2 py-1 bg-[hsl(220,13%,18%)] border-b border-[hsl(220,13%,20%)]">
//         <div className="flex items-center gap-1 text-[10px] text-[hsl(220,14%,55%)]">
//           <span>WebOS Code Editor</span>
//           <span className="mx-1">|</span>
//           <span>{current.name}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="px-1.5 py-0.5 text-[10px] rounded hover:bg-[hsl(220,13%,25%)]">A-</button>
//           <span className="text-[10px] tabular-nums w-6 text-center">{fontSize}</span>
//           <button onClick={() => setFontSize(s => Math.min(20, s + 1))} className="px-1.5 py-0.5 text-[10px] rounded hover:bg-[hsl(220,13%,25%)]">A+</button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex items-center bg-[hsl(220,13%,16%)] border-b border-[hsl(220,13%,20%)] overflow-x-auto">
//         {tabs.map((t, i) => (
//           <div
//             key={i}
//             className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] cursor-pointer border-r border-[hsl(220,13%,20%)] shrink-0 ${
//               i === activeTab ? 'bg-[hsl(220,13%,14%)] text-[hsl(220,14%,90%)]' : 'text-[hsl(220,14%,55%)] hover:bg-[hsl(220,13%,18%)]'
//             }`}
//             onClick={() => setActiveTab(i)}
//           >
//             <span className="text-[10px]">{t.language === 'tsx' || t.language === 'ts' ? '⚛️' : t.language === 'css' ? '🎨' : '📄'}</span>
//             {t.name}
//             {tabs.length > 1 && (
//               <button onClick={e => { e.stopPropagation(); closeTab(i); }} className="ml-1 hover:text-[hsl(0,80%,65%)] text-[10px]">×</button>
//             )}
//           </div>
//         ))}
//         <button
//           onClick={() => setShowNewFile(true)}
//           className="px-2 py-1.5 text-[11px] text-[hsl(220,14%,55%)] hover:text-[hsl(220,14%,90%)] hover:bg-[hsl(220,13%,18%)]"
//         >+</button>
//       </div>

//       {/* New file input */}
//       {showNewFile && (
//         <div className="flex items-center gap-1 px-2 py-1 bg-[hsl(220,13%,18%)] border-b border-[hsl(220,13%,20%)]">
//           <input
//             value={newFileName}
//             onChange={e => setNewFileName(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && addFile()}
//             placeholder="filename.tsx"
//             className="flex-1 bg-[hsl(220,13%,12%)] text-[11px] px-2 py-1 rounded border border-[hsl(220,13%,25%)] outline-none text-[hsl(220,14%,80%)]"
//             autoFocus
//           />
//           <button onClick={addFile} className="px-2 py-1 text-[10px] bg-[hsl(207,90%,54%)] text-white rounded">Create</button>
//           <button onClick={() => setShowNewFile(false)} className="px-2 py-1 text-[10px] text-[hsl(220,14%,55%)] hover:text-[hsl(220,14%,90%)]">Cancel</button>
//         </div>
//       )}

//       {/* Editor */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Line numbers */}
//         <div className="py-2 pr-2 pl-3 text-right select-none bg-[hsl(220,13%,14%)] border-r border-[hsl(220,13%,20%)] overflow-hidden"
//           style={{ fontSize }}>
//           {lines.map((_, i) => (
//             <div key={i} className="text-[hsl(220,14%,35%)] leading-[1.6]">{i + 1}</div>
//           ))}
//         </div>

//         {/* Code area */}
//         <div className="flex-1 relative overflow-auto">
//           <textarea
//             value={current.content}
//             onChange={e => updateContent(e.target.value)}
//             spellCheck={false}
//             className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-[hsl(220,14%,90%)] p-2 outline-none font-mono leading-[1.6] z-10"
//             style={{ fontSize, tabSize: 2 }}
//           />
//           <pre
//             className="p-2 font-mono leading-[1.6] pointer-events-none whitespace-pre-wrap break-all"
//             style={{ fontSize }}
//             dangerouslySetInnerHTML={{ __html: highlight(current.content) }}
//           />
//         </div>
//       </div>

//       {/* Status bar */}
//       <div className="flex items-center justify-between px-3 py-1 bg-[hsl(207,90%,54%)] text-white text-[10px]">
//         <span>Ln {lines.length}, Col {(current.content.split('\n').pop()?.length || 0) + 1}</span>
//         <span>{current.language.toUpperCase()} • UTF-8</span>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FileCode2, FilePlus2, Save, Download, Upload, Search, Replace, Settings2,
  Play, X, Sun, Moon, Palette, WrapText, Indent, Files, Trash2, Pencil,
  ChevronRight, ChevronDown, Terminal as TermIcon, Eye, EyeOff, Command,
} from 'lucide-react';

/* ----------------------------- Types & Storage ---------------------------- */

interface FileTab {
  id: string;
  name: string;
  content: string;
  language: string;
  dirty?: boolean;
}

const LS_KEY = 'webos-code-editor-v2';

const SAMPLE_TSX = `// Welcome to WebOS Code Editor
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="app">
      <h1>Hello WebOS!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default App;
`;

const SAMPLE_CSS = `.app { padding: 2rem; font-family: system-ui; }
h1 { color: #4f46e5; }
button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  cursor: pointer;
}
button:hover { background: #4338ca; }
`;

const SAMPLE_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"/><title>Preview</title></head>
  <body>
    <h1>Hello, world</h1>
    <p>Edit the HTML, CSS, or JS tab and click Run.</p>
    <button id="b">Click me</button>
    <script>
      document.getElementById('b').onclick = () => alert('Hi from preview!');
    </script>
  </body>
</html>
`;

const DEFAULT_TABS: FileTab[] = [
  { id: 'f1', name: 'App.tsx', content: SAMPLE_TSX, language: 'tsx' },
  { id: 'f2', name: 'styles.css', content: SAMPLE_CSS, language: 'css' },
  { id: 'f3', name: 'index.html', content: SAMPLE_HTML, language: 'html' },
];

/* ------------------------------- Highlighter ------------------------------ */

const THEMES = {
  'dark-plus': {
    bg: '#1e1e2e', panel: '#181825', border: '#313244', text: '#cdd6f4',
    muted: '#7f849c', sel: 'rgba(88,166,255,0.18)', gutter: '#45475a',
    accent: '#89b4fa',
    keyword: '#cba6f7', string: '#a6e3a1', number: '#fab387',
    comment: '#6c7086', tag: '#f38ba8', attr: '#f9e2af', func: '#89b4fa',
  },
  'monokai': {
    bg: '#272822', panel: '#1e1f1c', border: '#3e3d32', text: '#f8f8f2',
    muted: '#75715e', sel: 'rgba(253,151,31,0.18)', gutter: '#49483e',
    accent: '#a6e22e',
    keyword: '#f92672', string: '#e6db74', number: '#ae81ff',
    comment: '#75715e', tag: '#f92672', attr: '#a6e22e', func: '#66d9ef',
  },
  'light': {
    bg: '#ffffff', panel: '#f6f8fa', border: '#d0d7de', text: '#1f2328',
    muted: '#6e7781', sel: 'rgba(9,105,218,0.12)', gutter: '#8c959f',
    accent: '#0969da',
    keyword: '#cf222e', string: '#0a3069', number: '#0550ae',
    comment: '#6e7781', tag: '#116329', attr: '#953800', func: '#8250df',
  },
} as const;

type ThemeKey = keyof typeof THEMES;

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const KW = /\b(import|export|from|const|let|var|function|return|if|else|for|while|switch|case|break|default|new|this|class|extends|try|catch|finally|throw|async|await|typeof|instanceof|void|null|undefined|true|false|in|of|do|delete|yield|static|public|private|protected|interface|type|enum|as)\b/g;

function highlight(code: string, lang: string, t: typeof THEMES[ThemeKey]): string {
  let html = escapeHtml(code);

  if (lang === 'css') {
    html = html
      .replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${t.comment};font-style:italic">$1</span>`)
      .replace(/([a-zA-Z-]+)(\s*:)/g, `<span style="color:${t.attr}">$1</span>$2`)
      .replace(/(#[0-9a-fA-F]{3,8}|\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)?\b)/g, `<span style="color:${t.number}">$1</span>`)
      .replace(/("[^"]*"|'[^']*')/g, `<span style="color:${t.string}">$1</span>`);
    return html;
  }

  if (lang === 'html' || lang === 'xml') {
    html = html
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span style="color:${t.comment}">$1</span>`)
      .replace(/(&lt;\/?)([\w-]+)/g, `$1<span style="color:${t.tag}">$2</span>`)
      .replace(/([\w-]+)=(&quot;[^&]*&quot;|"[^"]*")/g, `<span style="color:${t.attr}">$1</span>=<span style="color:${t.string}">$2</span>`);
    return html;
  }

  if (lang === 'json') {
    html = html
      .replace(/("(?:\\.|[^"\\])*")(\s*:)/g, `<span style="color:${t.attr}">$1</span>$2`)
      .replace(/:\s*("(?:\\.|[^"\\])*")/g, `: <span style="color:${t.string}">$1</span>`)
      .replace(/\b(true|false|null)\b/g, `<span style="color:${t.keyword}">$1</span>`)
      .replace(/\b(-?\d+\.?\d*)\b/g, `<span style="color:${t.number}">$1</span>`);
    return html;
  }

  if (lang === 'md' || lang === 'markdown') {
    html = html
      .replace(/^(#{1,6}\s.*)$/gm, `<span style="color:${t.keyword};font-weight:600">$1</span>`)
      .replace(/(\*\*[^*]+\*\*)/g, `<span style="color:${t.attr};font-weight:600">$1</span>`)
      .replace(/(`[^`]+`)/g, `<span style="color:${t.string}">$1</span>`);
    return html;
  }

  // js/ts/tsx/jsx default
  html = html
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, `<span style="color:${t.comment};font-style:italic">$1</span>`)
    .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, m => `<span style="color:${t.string}">${m}</span>`)
    .replace(KW, `<span style="color:${t.keyword}">$1</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, `<span style="color:${t.number}">$1</span>`)
    .replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, `<span style="color:${t.func}">$1</span>`)
    .replace(/(&lt;\/?[\w.]+)/g, `<span style="color:${t.tag}">$&</span>`);
  return html;
}

/* --------------------------------- App ----------------------------------- */

const LANG_BY_EXT: Record<string, string> = {
  ts: 'ts', tsx: 'tsx', js: 'js', jsx: 'jsx',
  css: 'css', html: 'html', htm: 'html', xml: 'xml',
  json: 'json', md: 'md', markdown: 'md', txt: 'txt',
};

const FILE_ICON = (lang: string) => {
  if (['tsx', 'jsx', 'ts', 'js'].includes(lang)) return '⚛️';
  if (lang === 'css') return '🎨';
  if (lang === 'html') return '🌐';
  if (lang === 'json') return '📦';
  if (lang === 'md') return '📝';
  return '📄';
};

export function CodeEditorApp() {
  const [tabs, setTabs] = useState<FileTab[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.tabs) && parsed.tabs.length) return parsed.tabs;
      }
    } catch {}
    return DEFAULT_TABS;
  });
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? 'f1');
  const [theme, setTheme] = useState<ThemeKey>('dark-plus');
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState(false);
  const [tabSize, setTabSize] = useState(2);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFind, setShowFind] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [findQ, setFindQ] = useState('');
  const [replaceQ, setReplaceQ] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [previewSrc, setPreviewSrc] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = THEMES[theme];
  const active = tabs.find(x => x.id === activeId) ?? tabs[0];
  const lines = useMemo(() => active.content.split('\n'), [active.content]);

  /* persist */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ tabs }));
  }, [tabs]);

  /* update content */
  const updateContent = useCallback((content: string) => {
    setTabs(prev => prev.map(x => x.id === activeId ? { ...x, content, dirty: true } : x));
  }, [activeId]);

  /* sync scrolling */
  const onScroll = () => {
    if (textareaRef.current && preRef.current && gutterRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  /* cursor position */
  const updateCursor = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = ta.value.slice(0, pos);
    const line = before.split('\n').length;
    const col = pos - before.lastIndexOf('\n');
    setCursor({ line, col });
  };

  /* keyboard: tab indent, auto-pair, find, save, palette */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const meta = e.ctrlKey || e.metaKey;

    if (meta && e.key.toLowerCase() === 'f') { e.preventDefault(); setShowFind(true); return; }
    if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); markSaved(); return; }
    if (meta && e.key.toLowerCase() === 'p') { e.preventDefault(); setShowPalette(true); return; }

    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      const ins = ' '.repeat(tabSize);
      const next = ta.value.slice(0, s) + ins + ta.value.slice(en);
      updateContent(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + ins.length; });
      return;
    }

    // auto-pair
    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
    if (pairs[e.key] && ta.selectionStart === ta.selectionEnd) {
      e.preventDefault();
      const s = ta.selectionStart;
      const next = ta.value.slice(0, s) + e.key + pairs[e.key] + ta.value.slice(s);
      updateContent(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 1; });
      return;
    }

    if (e.key === 'Enter') {
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
      const curLine = ta.value.slice(lineStart, s);
      const indent = curLine.match(/^\s*/)?.[0] ?? '';
      const extra = /[{[(]\s*$/.test(curLine) ? ' '.repeat(tabSize) : '';
      if (indent || extra) {
        e.preventDefault();
        const ins = '\n' + indent + extra;
        const next = ta.value.slice(0, s) + ins + ta.value.slice(ta.selectionEnd);
        updateContent(next);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + ins.length; });
      }
    }
  };

  /* tab management */
  const markSaved = () => setTabs(prev => prev.map(x => x.id === activeId ? { ...x, dirty: false } : x));

  const addFile = (name = 'untitled.txt', content = '') => {
    const ext = (name.split('.').pop() || 'txt').toLowerCase();
    const id = 'f' + Date.now();
    const tab: FileTab = { id, name, content, language: LANG_BY_EXT[ext] || 'txt' };
    setTabs(prev => [...prev, tab]);
    setActiveId(id);
  };

  const closeTab = (id: string) => {
    setTabs(prev => {
      const next = prev.filter(x => x.id !== id);
      if (next.length === 0) return DEFAULT_TABS;
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const deleteTab = closeTab;

  const renameTab = (id: string, name: string) => {
    const ext = (name.split('.').pop() || 'txt').toLowerCase();
    setTabs(prev => prev.map(x => x.id === id ? { ...x, name, language: LANG_BY_EXT[ext] || 'txt' } : x));
  };

  /* find & replace */
  const doReplaceAll = () => {
    if (!findQ) return;
    const re = new RegExp(findQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    updateContent(active.content.replace(re, replaceQ));
  };

  /* file IO */
  const downloadActive = () => {
    const blob = new Blob([active.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = active.name; a.click();
    URL.revokeObjectURL(url);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    for (const f of Array.from(files)) {
      const text = await f.text();
      addFile(f.name, text);
    }
    e.target.value = '';
  };

  /* run preview (HTML/CSS/JS bundle) */
  const runPreview = () => {
    const html = tabs.find(x => x.language === 'html')?.content || '<!doctype html><body></body>';
    const css = tabs.filter(x => x.language === 'css').map(x => x.content).join('\n');
    const js = tabs.filter(x => ['js', 'jsx'].includes(x.language)).map(x => x.content).join('\n');
    const doc = html.replace('</head>', `<style>${css}</style></head>`)
      .replace('</body>', `<script>try{${js}}catch(e){document.body.insertAdjacentHTML('beforeend','<pre style=color:red>'+e+'</pre>')}</script></body>`);
    setPreviewSrc(doc);
    setShowPreview(true);
  };

  /* palette items */
  const paletteItems = [
    { label: 'New File', action: () => addFile(`file${tabs.length + 1}.txt`) },
    { label: 'Save', action: markSaved },
    { label: 'Download', action: downloadActive },
    { label: 'Find / Replace', action: () => setShowFind(true) },
    { label: 'Run Preview', action: runPreview },
    { label: 'Toggle Sidebar', action: () => setShowSidebar(s => !s) },
    { label: 'Toggle Word Wrap', action: () => setWordWrap(w => !w) },
    { label: 'Theme: Dark+', action: () => setTheme('dark-plus') },
    { label: 'Theme: Monokai', action: () => setTheme('monokai') },
    { label: 'Theme: Light', action: () => setTheme('light') },
  ];
  const [paletteQ, setPaletteQ] = useState('');
  const paletteFiltered = paletteItems.filter(i => i.label.toLowerCase().includes(paletteQ.toLowerCase()));

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg, color: t.text, fontFamily: 'ui-monospace, Menlo, monospace' }}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b text-[11px]"
        style={{ background: t.panel, borderColor: t.border }}>
        <div className="flex items-center gap-1">
          <button title="Toggle sidebar" onClick={() => setShowSidebar(s => !s)} className="p-1 rounded hover:bg-black/20"><Files className="w-3.5 h-3.5" /></button>
          <button title="New file" onClick={() => addFile(`file${tabs.length + 1}.txt`)} className="p-1 rounded hover:bg-black/20"><FilePlus2 className="w-3.5 h-3.5" /></button>
          <button title="Upload" onClick={() => fileInputRef.current?.click()} className="p-1 rounded hover:bg-black/20"><Upload className="w-3.5 h-3.5" /></button>
          <input ref={fileInputRef} type="file" multiple hidden onChange={onUpload} />
          <button title="Download" onClick={downloadActive} className="p-1 rounded hover:bg-black/20"><Download className="w-3.5 h-3.5" /></button>
          <button title="Save (Ctrl+S)" onClick={markSaved} className="p-1 rounded hover:bg-black/20"><Save className="w-3.5 h-3.5" /></button>
          <div className="w-px h-4 mx-1" style={{ background: t.border }} />
          <button title="Find (Ctrl+F)" onClick={() => setShowFind(s => !s)} className="p-1 rounded hover:bg-black/20"><Search className="w-3.5 h-3.5" /></button>
          <button title="Command Palette (Ctrl+P)" onClick={() => setShowPalette(true)} className="p-1 rounded hover:bg-black/20"><Command className="w-3.5 h-3.5" /></button>
          <button title="Run Preview" onClick={runPreview} className="p-1 rounded hover:bg-black/20 flex items-center gap-1" style={{ color: t.accent }}>
            <Play className="w-3.5 h-3.5" /> Run
          </button>
        </div>
        <div className="flex items-center gap-1">
          <select value={theme} onChange={e => setTheme(e.target.value as ThemeKey)}
            className="text-[10px] px-1 py-0.5 rounded outline-none border"
            style={{ background: t.bg, color: t.text, borderColor: t.border }}>
            <option value="dark-plus">Dark+</option>
            <option value="monokai">Monokai</option>
            <option value="light">Light</option>
          </select>
          <button title="Word wrap" onClick={() => setWordWrap(w => !w)} className="p-1 rounded hover:bg-black/20"
            style={{ color: wordWrap ? t.accent : undefined }}><WrapText className="w-3.5 h-3.5" /></button>
          <button title="Toggle preview" onClick={() => setShowPreview(s => !s)} className="p-1 rounded hover:bg-black/20">
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <div className="w-px h-4 mx-1" style={{ background: t.border }} />
          <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="px-1.5 text-[10px] rounded hover:bg-black/20">A-</button>
          <span className="text-[10px] tabular-nums w-5 text-center">{fontSize}</span>
          <button onClick={() => setFontSize(s => Math.min(22, s + 1))} className="px-1.5 text-[10px] rounded hover:bg-black/20">A+</button>
          <select value={tabSize} onChange={e => setTabSize(+e.target.value)}
            className="text-[10px] px-1 py-0.5 rounded outline-none border"
            style={{ background: t.bg, color: t.text, borderColor: t.border }}>
            <option value={2}>2 sp</option>
            <option value={4}>4 sp</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto border-b" style={{ background: t.panel, borderColor: t.border }}>
        {tabs.map(tab => (
          <div key={tab.id}
            onClick={() => setActiveId(tab.id)}
            onDoubleClick={() => { setRenameId(tab.id); setRenameVal(tab.name); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] cursor-pointer border-r shrink-0"
            style={{
              borderColor: t.border,
              background: tab.id === activeId ? t.bg : 'transparent',
              color: tab.id === activeId ? t.text : t.muted,
            }}>
            <span className="text-[10px]">{FILE_ICON(tab.language)}</span>
            {renameId === tab.id ? (
              <input
                value={renameVal}
                autoFocus
                onChange={e => setRenameVal(e.target.value)}
                onBlur={() => { if (renameVal.trim()) renameTab(tab.id, renameVal.trim()); setRenameId(null); }}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenameId(null); }}
                className="bg-transparent outline-none border-b text-[11px] w-24"
                style={{ borderColor: t.border, color: t.text }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span>{tab.name}{tab.dirty ? ' •' : ''}</span>
            )}
            <button onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
              className="ml-1 text-[10px] opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
          </div>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-44 shrink-0 border-r flex flex-col text-[11px]"
            style={{ background: t.panel, borderColor: t.border }}>
            <div className="px-2 py-1.5 uppercase tracking-wider opacity-60 flex items-center justify-between">
              <span>Explorer</span>
              <button onClick={() => addFile(`file${tabs.length + 1}.txt`)} title="New" className="hover:opacity-100 opacity-60">
                <FilePlus2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-1 flex items-center gap-1 opacity-70 text-[10px]">
              <ChevronDown className="w-3 h-3" /> WORKSPACE
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {tabs.map(tab => (
                <div key={tab.id}
                  onClick={() => setActiveId(tab.id)}
                  className="group flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:bg-black/20"
                  style={{ background: tab.id === activeId ? 'rgba(127,127,127,0.18)' : undefined }}>
                  <span className="text-[10px]">{FILE_ICON(tab.language)}</span>
                  <span className="flex-1 truncate">{tab.name}</span>
                  <button onClick={e => { e.stopPropagation(); setRenameId(tab.id); setRenameVal(tab.name); }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100"><Pencil className="w-3 h-3" /></button>
                  <button onClick={e => { e.stopPropagation(); deleteTab(tab.id); }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="px-2 py-1.5 border-t text-[10px] opacity-60" style={{ borderColor: t.border }}>
              {tabs.length} file{tabs.length === 1 ? '' : 's'}
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Find bar */}
          {showFind && (
            <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ background: t.panel, borderColor: t.border }}>
              <Search className="w-3 h-3 opacity-60" />
              <input value={findQ} onChange={e => setFindQ(e.target.value)} placeholder="Find"
                className="flex-1 bg-transparent outline-none text-[11px] px-1 py-0.5 rounded border"
                style={{ borderColor: t.border, color: t.text }} />
              <Replace className="w-3 h-3 opacity-60 ml-1" />
              <input value={replaceQ} onChange={e => setReplaceQ(e.target.value)} placeholder="Replace"
                className="flex-1 bg-transparent outline-none text-[11px] px-1 py-0.5 rounded border"
                style={{ borderColor: t.border, color: t.text }} />
              <button onClick={doReplaceAll} className="text-[10px] px-2 py-0.5 rounded" style={{ background: t.accent, color: t.bg }}>Replace All</button>
              <button onClick={() => setShowFind(false)} className="p-1 hover:opacity-100 opacity-60"><X className="w-3 h-3" /></button>
            </div>
          )}

          <div className="flex flex-1 min-h-0">
            <div className="flex flex-1 min-w-0 overflow-hidden">
              {/* gutter */}
              <div ref={gutterRef} className="py-2 pr-2 pl-3 text-right select-none overflow-hidden border-r"
                style={{ background: t.bg, borderColor: t.border, fontSize, color: t.gutter, lineHeight: 1.6 }}>
                {lines.map((_, i) => (
                  <div key={i} style={{ color: i + 1 === cursor.line ? t.text : t.gutter }}>{i + 1}</div>
                ))}
              </div>
              {/* code */}
              <div className="flex-1 relative overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={active.content}
                  onChange={e => updateContent(e.target.value)}
                  onScroll={onScroll}
                  onKeyDown={onKeyDown}
                  onKeyUp={updateCursor}
                  onClick={updateCursor}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full resize-none bg-transparent caret-current p-2 outline-none font-mono z-10"
                  style={{
                    color: 'transparent',
                    fontSize, lineHeight: 1.6, tabSize,
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                    WebkitTextFillColor: 'transparent',
                    caretColor: t.text,
                  }}
                />
                <pre ref={preRef}
                  className="absolute inset-0 p-2 font-mono pointer-events-none overflow-auto"
                  style={{
                    fontSize, lineHeight: 1.6, tabSize,
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                    color: t.text,
                  }}
                  dangerouslySetInnerHTML={{ __html: highlight(active.content, active.language, t) + '\n' }}
                />
              </div>
            </div>

            {/* Preview pane */}
            {showPreview && (
              <div className="w-1/2 border-l flex flex-col min-w-0" style={{ borderColor: t.border, background: '#fff' }}>
                <div className="px-2 py-1 text-[10px] flex items-center justify-between border-b" style={{ borderColor: t.border, background: t.panel, color: t.text }}>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Live Preview</span>
                  <button onClick={runPreview} className="flex items-center gap-1 hover:opacity-80" style={{ color: t.accent }}>
                    <Play className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <iframe title="preview" srcDoc={previewSrc} className="flex-1 w-full bg-white" sandbox="allow-scripts" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 text-[10px]"
        style={{ background: t.accent, color: theme === 'light' ? '#fff' : t.bg }}>
        <div className="flex items-center gap-3">
          <span>Ln {cursor.line}, Col {cursor.col}</span>
          <span>{active.content.length} chars</span>
          <span>{lines.length} lines</span>
          {active.dirty && <span>● Unsaved</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>Spaces: {tabSize}</span>
          <span>UTF-8</span>
          <span>{active.language.toUpperCase()}</span>
        </div>
      </div>

      {/* Command palette */}
      {showPalette && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/40" onClick={() => setShowPalette(false)}>
          <div onClick={e => e.stopPropagation()} className="w-[420px] max-w-[90%] rounded-lg shadow-2xl border overflow-hidden"
            style={{ background: t.panel, borderColor: t.border, color: t.text }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: t.border }}>
              <Command className="w-4 h-4 opacity-60" />
              <input autoFocus value={paletteQ} onChange={e => setPaletteQ(e.target.value)}
                placeholder="Type a command…"
                className="flex-1 bg-transparent outline-none text-[12px]" />
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {paletteFiltered.length === 0 && <div className="px-3 py-4 text-[11px] opacity-60">No commands</div>}
              {paletteFiltered.map((it, i) => (
                <button key={i} onClick={() => { it.action(); setShowPalette(false); setPaletteQ(''); }}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-black/20">
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}