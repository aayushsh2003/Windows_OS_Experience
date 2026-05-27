// import { useState } from 'react';
// import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Lock } from 'lucide-react';

// export function BrowserApp() {
//   const [url, setUrl] = useState('https://www.example.com');
//   const [iframeSrc, setIframeSrc] = useState('');

//   const navigate = () => {
//     let src = url;
//     if (!src.startsWith('http')) src = 'https://' + src;
//     setIframeSrc(src);
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Tab bar */}
//       <div className="flex items-center bg-muted px-2 pt-1">
//         <div className="flex items-center bg-background rounded-t-md px-3 py-1.5 text-xs text-foreground max-w-[200px] truncate border border-b-0 border-border">
//           <span className="truncate">New Tab</span>
//           <span className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer">×</span>
//         </div>
//         <button className="ml-1 text-muted-foreground text-xs px-2">+</button>
//       </div>
//       {/* Address bar */}
//       <div className="flex items-center gap-2 px-2 py-1.5 bg-muted border-b border-border">
//         <button className="p-1 rounded hover:bg-secondary"><ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" /></button>
//         <button className="p-1 rounded hover:bg-secondary"><ArrowRight className="w-3.5 h-3.5 text-muted-foreground" /></button>
//         <button className="p-1 rounded hover:bg-secondary"><RotateCw className="w-3.5 h-3.5 text-muted-foreground" /></button>
//         <button className="p-1 rounded hover:bg-secondary"><Home className="w-3.5 h-3.5 text-muted-foreground" /></button>
//         <div className="flex-1 flex items-center bg-background rounded-full px-3 py-1 border border-border">
//           <Lock className="w-3 h-3 text-muted-foreground mr-2" />
//           <input
//             value={url}
//             onChange={e => setUrl(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && navigate()}
//             className="flex-1 bg-transparent text-xs outline-none text-foreground"
//           />
//         </div>
//         <button className="p-1 rounded hover:bg-secondary"><Star className="w-3.5 h-3.5 text-muted-foreground" /></button>
//       </div>
//       {/* Content */}
//       <div className="flex-1 bg-background flex items-center justify-center">
//         {iframeSrc ? (
//           <iframe src={iframeSrc} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" title="browser" />
//         ) : (
//           <div className="text-center">
//             <div className="text-5xl mb-4">🌐</div>
//             <h2 className="text-lg font-medium text-foreground mb-2">Edge Browser</h2>
//             <p className="text-sm text-muted-foreground">Enter a URL and press Enter to navigate</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

const BOOKMARKS = [
  { label: 'Portfolio', url: 'https://aayush-ki-pehchan.vercel.app/', icon: '🧑‍💻' },
  { label: 'GitHub', url: 'https://github.com/aayushsh2003', icon: '🐙' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aayush-sharma-a44062299/', icon: '💼' },
  { label: 'LeetCode', url: 'https://leetcode.com/u/aayushsh2003/', icon: '🧩' },
];

const QUICK_LINKS = [
  { label: 'Portfolio', url: 'https://aayush-ki-pehchan.vercel.app/', bg: '#7c3aed', initial: 'P' },
  { label: 'Linktree', url: 'https://aayush-linktree.vercel.app/', bg: '#059669', initial: 'L' },
  { label: 'AIClass26', url: 'https://aiclassof26.vercel.app/', bg: '#2563eb', initial: 'AI' },
  { label: 'Library', url: 'https://library-poornima-college-of-engineering.vercel.app/', bg: '#b45309', initial: 'Lib' },
  { label: 'Nexus', url: 'https://poornima-nexus-poornima-college-of-engineering.vercel.app/', bg: '#0e7490', initial: 'N' },
  { label: 'TPO', url: 'https://tpo-poornima-college-of-engineering.vercel.app/', bg: '#be185d', initial: 'T' },
  { label: 'ACE Dept', url: 'https://advance-computing-poornima-college-of-engineering.vercel.app/', bg: '#15803d', initial: 'ACE' },
  { label: 'Handwriting', url: 'https://handwriting-converter.vercel.app/', bg: '#9333ea', initial: 'HW' },
  { label: 'FinSmart', url: 'https://fin-smart-accounting-aayushkimehnat.vercel.app/', bg: '#0891b2', initial: 'FS' },
  { label: 'Council', url: 'https://student-council-poornima-college-of-engineering.vercel.app/', bg: '#dc2626', initial: 'SC' },
  { label: 'Mehnat', url: 'https://aayushkimehnat.vercel.app', bg: '#d97706', initial: 'M' },
  { label: 'HackerRank', url: 'https://www.hackerrank.com/profile/aayushsharma4437', bg: '#22c55e', initial: 'HR' },
];

interface Tab {
  id: string;
  title: string;
  url: string;
  src: string;
  loading: boolean;
  blocked: boolean;
  history: string[];
  historyIdx: number;
}

function makeTab(url = '', src = ''): Tab {
  return {
    id: Math.random().toString(36).slice(2),
    title: src ? url : 'New Tab',
    url, src,
    loading: false,
    blocked: false,
    history: src ? [src] : [],
    historyIdx: src ? 0 : -1,
  };
}

function shortTitle(url: string) {
  if (!url) return 'New Tab';
  return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'New Tab';
}

export function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([makeTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [inputUrl, setInputUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showBookmarkBar, setShowBookmarkBar] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

  useEffect(() => { setInputUrl(activeTab.url); }, [activeTabId]);

  function patchTab(id: string, patch: Partial<Tab>) {
    setTabs(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function navigate(rawUrl: string, tabId = activeTabId) {
    let url = rawUrl.trim();
    if (!url) return;
    if (!url.match(/^https?:\/\//)) {
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    setInputUrl(url);
    setTabs(ts => ts.map(t => {
      if (t.id !== tabId) return t;
      const newHistory = [...t.history.slice(0, t.historyIdx + 1), url];
      return { ...t, url, src: url, title: url, loading: true, blocked: false, history: newHistory, historyIdx: newHistory.length - 1 };
    }));
  }

  function goBack() {
    setTabs(ts => ts.map(t => {
      if (t.id !== activeTabId || t.historyIdx <= 0) return t;
      const idx = t.historyIdx - 1;
      const url = t.history[idx];
      setInputUrl(url);
      return { ...t, historyIdx: idx, url, src: url, loading: true, blocked: false };
    }));
  }

  function goForward() {
    setTabs(ts => ts.map(t => {
      if (t.id !== activeTabId || t.historyIdx >= t.history.length - 1) return t;
      const idx = t.historyIdx + 1;
      const url = t.history[idx];
      setInputUrl(url);
      return { ...t, historyIdx: idx, url, src: url, loading: true, blocked: false };
    }));
  }

  function refresh() {
    if (!activeTab.src) return;
    const url = activeTab.url;
    patchTab(activeTabId, { loading: true, blocked: false, src: '' });
    setTimeout(() => patchTab(activeTabId, { src: url }), 80);
  }

  function goHome() {
    patchTab(activeTabId, { src: '', url: '', title: 'New Tab', loading: false, blocked: false });
    setInputUrl('');
  }

  function addTab() {
    const t = makeTab();
    setTabs(ts => [...ts, t]);
    setActiveTabId(t.id);
    setInputUrl('');
    setTimeout(() => inputRef.current?.focus(), 60);
  }

  function closeTab(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (tabs.length === 1) { const fresh = makeTab(); setTabs([fresh]); setActiveTabId(fresh.id); setInputUrl(''); return; }
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (id === activeTabId) {
      const next = newTabs[Math.min(idx, newTabs.length - 1)];
      setActiveTabId(next.id);
      setInputUrl(next.url);
    }
  }

  function switchTab(id: string) {
    setActiveTabId(id);
    const t = tabs.find(t => t.id === id);
    if (t) setInputUrl(t.url);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') navigate(inputUrl);
    if (e.key === 'Escape') { setInputUrl(activeTab.url); inputRef.current?.blur(); }
  }

  const canBack = activeTab.historyIdx > 0;
  const canFwd = activeTab.historyIdx < activeTab.history.length - 1;

  const NavBtn = ({ icon, onClick, enabled, tip }: { icon: string; onClick: () => void; enabled: boolean; tip: string }) => (
    <button onClick={onClick} disabled={!enabled} title={tip}
      style={{ background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'default', color: enabled ? '#c0c0d8' : '#444', fontSize: 15, padding: '4px 8px', borderRadius: 6, fontFamily: 'monospace', lineHeight: 1 }}
      onMouseEnter={e => enabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >{icon}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'system-ui,sans-serif', background: '#0f0f1a' }}>

      {/* Tab Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: '6px 8px 0', background: '#13131f', gap: 2, overflowX: 'auto', flexShrink: 0 }}>
        {tabs.map(tab => {
          const active = tab.id === activeTabId;
          return (
            <div key={tab.id} onClick={() => switchTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: '8px 8px 0 0', background: active ? '#1e1e30' : 'transparent', border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent', borderBottom: active ? '1px solid #1e1e30' : 'none', cursor: 'pointer', minWidth: 120, maxWidth: 190, flexShrink: 0 }}>
              <span style={{ fontSize: 11 }}>🌐</span>
              <span style={{ fontSize: 12, color: active ? '#e0e0f0' : '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortTitle(tab.url)}</span>
              <button onClick={e => closeTab(tab.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, padding: '0 2px', lineHeight: 1, borderRadius: 3 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#bbb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#555'; }}>✕</button>
            </div>
          );
        })}
        <button onClick={addTab} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '5px 10px', fontSize: 17, borderRadius: '8px 8px 0 0' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#ccc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666'; }}>+</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#1e1e30', flexShrink: 0 }}>
        <NavBtn icon="←" onClick={goBack} enabled={canBack} tip="Back" />
        <NavBtn icon="→" onClick={goForward} enabled={canFwd} tip="Forward" />
        <NavBtn icon="↻" onClick={refresh} enabled={!!activeTab.src} tip="Refresh" />
        <NavBtn icon="⌂" onClick={goHome} enabled={true} tip="Home" />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: isFocused ? '#12121e' : '#16162a', border: `1px solid ${isFocused ? '#7c7cff' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '5px 14px', boxShadow: isFocused ? '0 0 0 3px rgba(124,124,255,0.18)' : 'none', transition: 'all 0.18s' }}>
          <span style={{ fontSize: 11, color: activeTab.src && !activeTab.blocked ? '#34d399' : '#555', flexShrink: 0 }}>
            {activeTab.blocked ? '⚠' : activeTab.src ? '🔒' : '🔍'}
          </span>
          <input ref={inputRef} value={inputUrl} onChange={e => setInputUrl(e.target.value)}
            onFocus={() => { setIsFocused(true); setTimeout(() => inputRef.current?.select(), 0); }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter URL…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e0f0', fontSize: 13, fontFamily: 'monospace' }} />
          {inputUrl && (
            <button onClick={() => { setInputUrl(''); inputRef.current?.focus(); }}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>

        <button onClick={() => setShowBookmarkBar(b => !b)} title="Toggle bookmarks"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: showBookmarkBar ? '#7c7cff' : '#555', fontSize: 15, padding: '4px 8px', borderRadius: 6 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>☆</button>
      </div>

      {/* Bookmark Bar */}
      {showBookmarkBar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '3px 10px 4px', background: '#191928', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', flexShrink: 0 }}>
          {BOOKMARKS.map(bm => (
            <button key={bm.url} onClick={() => navigate(bm.url)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#999', fontSize: 12, padding: '3px 9px', borderRadius: 5, whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#ddd'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#999'; }}>
              <span style={{ fontSize: 11 }}>{bm.icon}</span>{bm.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab.loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 10, overflow: 'hidden', background: 'rgba(124,124,255,0.1)' }}>
            <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg,#7c7cff,#a78bfa)', animation: 'prog 1.2s ease infinite' }} />
          </div>
        )}

        {activeTab.src && !activeTab.blocked ? (
          <iframe
            key={activeTab.src}
            src={activeTab.src}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="browser"
            onLoad={() => patchTab(activeTabId, { loading: false })}
            onError={() => patchTab(activeTabId, { loading: false, blocked: true })}
          />
        ) : activeTab.blocked ? (
          <BlockedPage url={activeTab.url} />
        ) : (
          <NewTabPage onNavigate={navigate} />
        )}
      </div>

      <style>{`@keyframes prog{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    </div>
  );
}

function BlockedPage({ url }: { url: string }) {
  return (
    <div style={{ height: '100%', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 44 }}>🚫</div>
      <h2 style={{ color: '#e0e0f0', margin: 0, fontSize: 19, fontWeight: 500 }}>This site blocks embedding</h2>
      <p style={{ color: '#666', fontSize: 13, margin: 0, maxWidth: 380, lineHeight: 1.6 }}>
        <strong style={{ color: '#aaa' }}>{url.replace(/^https?:\/\//, '')}</strong> uses security headers that prevent it from being shown inside another page. This affects GitHub, LinkedIn, Google, and most major sites.
      </p>
      <button onClick={() => window.open(url, '_blank')}
        style={{ background: '#7c7cff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '9px 22px', marginTop: 4 }}
        onMouseEnter={e => (e.currentTarget.style.background = '#6060e0')}
        onMouseLeave={e => (e.currentTarget.style.background = '#7c7cff')}>
        Open in new tab ↗
      </button>
    </div>
  );
}

function NewTabPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'radial-gradient(ellipse at 30% 20%,#1a1040 0%,#0f0f1a 55%,#0a1628 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px 40px' }}>
      <Clock />
      <div style={{ width: '100%', maxWidth: 540, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 16px' }}>
          <span style={{ fontSize: 15, color: '#7c7cff' }}>🔍</span>
          <input placeholder="Search or enter URL…"
            onKeyDown={e => { if (e.key === 'Enter') onNavigate((e.target as HTMLInputElement).value); }}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e0f0', fontSize: 14 }} />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 540, marginBottom: 32 }}>
        <p style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Aayush's Projects & Profiles</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(78px,1fr))', gap: 10 }}>
          {QUICK_LINKS.map(link => (
            <button key={link.url} onClick={() => onNavigate(link.url)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 6px 9px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{link.initial}</div>
              <span style={{ color: '#888', fontSize: 10, textAlign: 'center', lineHeight: 1.3 }}>{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 540, marginBottom: 24 }}>
        <p style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Bookmarks</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BOOKMARKS.map(bm => (
            <button key={bm.url} onClick={() => onNavigate(bm.url)}
              style={{ background: 'rgba(124,124,255,0.08)', border: '1px solid rgba(124,124,255,0.22)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#a0a0d0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,124,255,0.18)'; e.currentTarget.style.color = '#c8c8ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,124,255,0.08)'; e.currentTarget.style.color = '#a0a0d0'; }}>
              {bm.icon} {bm.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 540, width: '100%', background: 'rgba(255,200,80,0.06)', border: '1px solid rgba(255,200,80,0.15)', borderRadius: 10, padding: '10px 16px' }}>
        <p style={{ color: '#a08040', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#c8a050' }}>ℹ Note:</strong> Sites like GitHub, LinkedIn, and Google block embedding for security. The Vercel-hosted projects above load fine. For blocked sites, click <em>"Open in new tab ↗"</em>.
        </p>
      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const h = time.getHours(), m = time.getMinutes();
  const timeStr = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      <div style={{ fontSize: 52, fontWeight: 200, color: '#e0e0f0', letterSpacing: '-2px', lineHeight: 1 }}>{timeStr}</div>
      <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{dateStr}</div>
    </div>
  );
}