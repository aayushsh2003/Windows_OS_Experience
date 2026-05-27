import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus, Trash2, Copy, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Entry { id: string; site: string; user: string; password: string; notes?: string; }

function encode(text: string, key: string) {
  let out = '';
  for (let i = 0; i < text.length; i++) out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  return btoa(unescape(encodeURIComponent(out)));
}
function decode(text: string, key: string) {
  try {
    const raw = decodeURIComponent(escape(atob(text)));
    let out = '';
    for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return out;
  } catch { return ''; }
}

function generatePass(len = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let out = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export function PasswordVaultApp() {
  const [masterKey, setMasterKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Entry>({ id: '', site: '', user: '', password: '' });

  useEffect(() => {
    if (!unlocked) return;
    const raw = localStorage.getItem('vault-data');
    if (!raw) { setEntries([]); return; }
    const dec = decode(raw, masterKey);
    try { setEntries(JSON.parse(dec) || []); } catch { setEntries([]); toast.error('Wrong master password'); setUnlocked(false); }
  }, [unlocked]);

  const persist = (list: Entry[]) => {
    localStorage.setItem('vault-data', encode(JSON.stringify(list), masterKey));
  };

  const unlock = () => {
    if (masterKey.length < 4) return toast.error('Min 4 chars');
    setUnlocked(true);
  };

  const add = () => {
    if (!draft.site) return toast.error('Site required');
    const e = { ...draft, id: crypto.randomUUID() };
    const next = [e, ...entries];
    setEntries(next); persist(next);
    setDraft({ id: '', site: '', user: '', password: '' });
  };

  const remove = (id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next); persist(next);
  };

  if (!unlocked) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-6">
        <div className="w-80 space-y-4 text-center">
          <Lock className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Password Vault</h2>
          <p className="text-xs text-muted-foreground">Enter master password to unlock. Data is encrypted in browser only.</p>
          <Input type="password" placeholder="Master password" value={masterKey} onChange={e => setMasterKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()} />
          <Button onClick={unlock} className="w-full">Unlock</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Password Vault</h2>
          <Button size="sm" variant="ghost" onClick={() => { setUnlocked(false); setMasterKey(''); }}>Lock</Button>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <Input className="col-span-3" placeholder="Site" value={draft.site} onChange={e => setDraft({ ...draft, site: e.target.value })} />
          <Input className="col-span-3" placeholder="Username" value={draft.user} onChange={e => setDraft({ ...draft, user: e.target.value })} />
          <div className="col-span-4 flex gap-1">
            <Input placeholder="Password" value={draft.password} onChange={e => setDraft({ ...draft, password: e.target.value })} />
            <Button size="icon" variant="outline" onClick={() => setDraft({ ...draft, password: generatePass() })}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          <Button className="col-span-2" onClick={add}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No saved passwords yet</p>}
        {entries.map(e => (
          <div key={e.id} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{e.site}</div>
              <div className="text-xs text-muted-foreground truncate">{e.user}</div>
            </div>
            <code className="text-sm font-mono px-2 py-1 bg-muted rounded">{show[e.id] ? e.password : '••••••••'}</code>
            <Button size="icon" variant="ghost" onClick={() => setShow({ ...show, [e.id]: !show[e.id] })}>{show[e.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(e.password); toast.success('Copied'); }}><Copy className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
