import { useState } from 'react';
import { Mail, Send, Trash2, Star, Inbox, Archive, PenSquare, Search } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  folder: string;
}

const sampleEmails: Email[] = [
  { id: '1', from: 'Microsoft Teams', subject: 'You have a new meeting invitation', preview: 'Join the standup meeting at 10:00 AM...', body: 'Hello,\n\nYou have been invited to a new meeting:\n\nDaily Standup\nTime: 10:00 AM - 10:15 AM\nLocation: Microsoft Teams\n\nPlease join on time.\n\nBest regards,\nMicrosoft Teams', time: '9:30 AM', read: false, starred: false, folder: 'inbox' },
  { id: '2', from: 'GitHub', subject: 'New pull request on WebOS', preview: '[WebOS] feat: Add new features #42...', body: 'A new pull request has been opened:\n\nRepository: WebOS\nPR #42: feat: Add new features\nAuthor: developer123\n\nPlease review the changes at your earliest convenience.', time: '8:15 AM', read: false, starred: true, folder: 'inbox' },
  { id: '3', from: 'System Admin', subject: 'System maintenance scheduled', preview: 'Dear user, we will be performing...', body: 'Dear User,\n\nWe will be performing scheduled maintenance on our servers this weekend.\n\nDate: Saturday, 2:00 AM - 6:00 AM UTC\n\nDuring this time, some services may be temporarily unavailable.\n\nThank you for your patience.', time: 'Yesterday', read: true, starred: false, folder: 'inbox' },
  { id: '4', from: 'Newsletter', subject: 'Weekly Tech Digest', preview: 'Top stories this week: AI advances...', body: 'This Week in Tech:\n\n1. AI Models Getting Smarter\n2. New JavaScript Framework Released\n3. Cloud Computing Trends 2026\n4. Open Source Project Spotlight\n\nRead more on our website.', time: 'Yesterday', read: true, starred: false, folder: 'inbox' },
  { id: '5', from: 'Security Alert', subject: 'New sign-in from Chrome on Windows', preview: 'We noticed a new sign-in to your account...', body: 'New sign-in detected\n\nDevice: Chrome on Windows\nLocation: Your City\nTime: Today at 8:00 AM\n\nIf this was you, you can ignore this message.\nIf not, please secure your account immediately.', time: '2 days ago', read: true, starred: false, folder: 'inbox' },
];

export function MailApp() {
  const [emails, setEmails] = useState(sampleEmails);
  const [selected, setSelected] = useState<Email | null>(null);
  const [folder, setFolder] = useState('inbox');
  const [composing, setComposing] = useState(false);
  const [search, setSearch] = useState('');

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  const filtered = emails.filter(e => {
    if (folder === 'starred') return e.starred;
    if (folder !== 'inbox') return e.folder === folder;
    return e.folder === 'inbox';
  }).filter(e => e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (email: Email) => {
    setSelected(email);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev => prev.map(em => em.id === id ? { ...em, starred: !em.starred } : em));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
    if (selected?.id === id) setSelected(null);
  };

  const unreadCount = emails.filter(e => !e.read && e.folder === 'inbox').length;

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-48 bg-muted border-r border-border py-3 shrink-0 flex flex-col">
        <button onClick={() => setComposing(true)} className="mx-3 mb-3 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-primary/90">
          <PenSquare className="w-3.5 h-3.5" /> Compose
        </button>
        {folders.map(f => (
          <button key={f.id} onClick={() => { setFolder(f.id); setSelected(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs transition-colors ${folder === f.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
            {f.id === 'inbox' && unreadCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Email list */}
      <div className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded bg-background text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto win-scrollbar">
          {filtered.map(email => (
            <button key={email.id} onClick={() => handleSelect(email)}
              className={`w-full text-left p-3 border-b border-border transition-colors hover:bg-secondary/50
                ${selected?.id === email.id ? 'bg-secondary' : ''} ${!email.read ? 'bg-primary/5' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium truncate flex-1 ${!email.read ? 'text-foreground font-semibold' : 'text-foreground'}`}>{email.from}</span>
                <button onClick={e => toggleStar(email.id, e)}>
                  <Star className={`w-3 h-3 ${email.starred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                </button>
              </div>
              <p className={`text-xs truncate mt-0.5 ${!email.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{email.subject}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-muted-foreground truncate flex-1">{email.preview}</p>
                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{email.time}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No emails</p>}
        </div>
      </div>

      {/* Email view */}
      <div className="flex-1 flex flex-col">
        {composing ? (
          <ComposeView onClose={() => setComposing(false)} />
        ) : selected ? (
          <div className="flex-1 p-4 overflow-y-auto win-scrollbar">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{selected.subject}</h2>
                <p className="text-xs text-muted-foreground mt-1">From: {selected.from} • {selected.time}</p>
              </div>
              <button onClick={() => deleteEmail(selected.id)} className="p-1.5 hover:bg-muted rounded">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-[inherit] leading-relaxed">{selected.body}</pre>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComposeView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">New Message</h3>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
      <input placeholder="To:" className="h-8 px-3 mb-2 rounded bg-muted text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none" />
      <input placeholder="Subject:" className="h-8 px-3 mb-2 rounded bg-muted text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none" />
      <textarea placeholder="Write your message..." className="flex-1 px-3 py-2 rounded bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none resize-none" />
      <div className="flex justify-end mt-3">
        <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </div>
    </div>
  );
}
