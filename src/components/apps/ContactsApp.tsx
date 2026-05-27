import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Phone, Mail, MapPin, Star, StarOff, User, X, Check } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  group: string;
  favorite: boolean;
  avatar: string;
}

const avatarEmojis = ['👤', '👩', '👨', '👩‍💻', '👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍🏫', '🧑‍🚀', '🧑‍⚕️'];
const groups = ['All', 'Family', 'Work', 'Friends', 'Other'];

const defaultContacts: Contact[] = [
  { id: '1', name: 'Aayush Sharma', phone: '+91 98765 43210', email: 'aayush@dev.com', address: 'India', group: 'Work', favorite: true, avatar: '👨‍💻' },
  { id: '2', name: 'Mom', phone: '+91 98765 11111', email: 'mom@family.com', address: 'Home', group: 'Family', favorite: true, avatar: '👩' },
  { id: '3', name: 'Dad', phone: '+91 98765 22222', email: 'dad@family.com', address: 'Home', group: 'Family', favorite: true, avatar: '👨' },
  { id: '4', name: 'Alice Johnson', phone: '+1 555-0101', email: 'alice@work.com', address: 'San Francisco, CA', group: 'Work', favorite: false, avatar: '👩‍💻' },
  { id: '5', name: 'Bob Smith', phone: '+1 555-0202', email: 'bob@work.com', address: 'New York, NY', group: 'Work', favorite: false, avatar: '👨' },
  { id: '6', name: 'Charlie Brown', phone: '+44 7700 900123', email: 'charlie@friends.com', address: 'London, UK', group: 'Friends', favorite: false, avatar: '🧑‍🚀' },
];

export function ContactsApp() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try { return JSON.parse(localStorage.getItem('webos-contacts') || 'null') || defaultContacts; } catch { return defaultContacts; }
  });
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selected, setSelected] = useState<string | null>('1');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});

  useEffect(() => {
    localStorage.setItem('webos-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const filtered = contacts
    .filter(c => activeGroup === 'All' || c.group === activeGroup)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.name.localeCompare(b.name));

  const selectedContact = contacts.find(c => c.id === selected);

  const addContact = () => {
    const c: Contact = { id: Date.now().toString(), name: 'New Contact', phone: '', email: '', address: '', group: 'Other', favorite: false, avatar: avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)] };
    setContacts(prev => [...prev, c]);
    setSelected(c.id);
    setEditing(true);
    setEditData(c);
  };

  const saveEdit = () => {
    if (!selected) return;
    setContacts(prev => prev.map(c => c.id === selected ? { ...c, ...editData } as Contact : c));
    setEditing(false);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelected(null);
  };

  const toggleFav = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 mb-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="bg-transparent text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {groups.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`text-[10px] px-2 py-1 rounded-full ${activeGroup === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => { setSelected(c.id); setEditing(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 transition-colors ${selected === c.id ? 'bg-primary/10' : ''}`}>
              <span className="text-xl">{c.avatar}</span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.phone || c.email}</p>
              </div>
              {c.favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <button onClick={addContact} className="w-full flex items-center justify-center gap-1 bg-primary text-primary-foreground text-xs py-2 rounded-lg hover:opacity-90">
            <Plus className="w-3 h-3" /> Add Contact
          </button>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          editing ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Edit Contact</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Cancel</button>
                  <button onClick={saveEdit} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                </div>
              </div>
              <div className="space-y-3">
                <div><label className="text-[10px] text-muted-foreground">Name</label><input value={editData.name || ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2 text-xs outline-none text-foreground mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground">Phone</label><input value={editData.phone || ''} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2 text-xs outline-none text-foreground mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground">Email</label><input value={editData.email || ''} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2 text-xs outline-none text-foreground mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground">Address</label><input value={editData.address || ''} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2 text-xs outline-none text-foreground mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground">Group</label>
                  <select value={editData.group || 'Other'} onChange={e => setEditData(p => ({ ...p, group: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2 text-xs outline-none text-foreground mt-1">
                    {groups.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <span className="text-5xl mb-3">{selectedContact.avatar}</span>
              <h3 className="text-lg font-semibold text-foreground">{selectedContact.name}</h3>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1">{selectedContact.group}</span>
              <div className="flex gap-3 mt-4">
                <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-secondary"><Phone className="w-4 h-4 text-primary" /><span className="text-[10px] text-muted-foreground">Call</span></button>
                <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-secondary"><Mail className="w-4 h-4 text-primary" /><span className="text-[10px] text-muted-foreground">Email</span></button>
                <button onClick={() => toggleFav(selectedContact.id)} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-secondary">
                  {selectedContact.favorite ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-[10px] text-muted-foreground">{selectedContact.favorite ? 'Unfav' : 'Fav'}</span>
                </button>
              </div>
              <div className="w-full max-w-sm mt-6 space-y-3">
                {selectedContact.phone && <div className="flex items-center gap-3 p-3 bg-muted rounded-xl"><Phone className="w-4 h-4 text-muted-foreground" /><div><p className="text-[10px] text-muted-foreground">Phone</p><p className="text-xs text-foreground">{selectedContact.phone}</p></div></div>}
                {selectedContact.email && <div className="flex items-center gap-3 p-3 bg-muted rounded-xl"><Mail className="w-4 h-4 text-muted-foreground" /><div><p className="text-[10px] text-muted-foreground">Email</p><p className="text-xs text-foreground">{selectedContact.email}</p></div></div>}
                {selectedContact.address && <div className="flex items-center gap-3 p-3 bg-muted rounded-xl"><MapPin className="w-4 h-4 text-muted-foreground" /><div><p className="text-[10px] text-muted-foreground">Address</p><p className="text-xs text-foreground">{selectedContact.address}</p></div></div>}
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => { setEditing(true); setEditData(selectedContact); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary text-foreground"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <User className="w-12 h-12 opacity-30" />
            <p className="text-sm">Select a contact to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
