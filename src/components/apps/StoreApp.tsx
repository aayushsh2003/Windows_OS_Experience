import { useState } from 'react';
import { Search, Download, Star, Check } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  rating: number;
  category: string;
  installed: boolean;
}

const storeItems: StoreItem[] = [
  { id: '1', name: 'Spotify', icon: '🎵', desc: 'Music streaming service', rating: 4.5, category: 'Entertainment', installed: false },
  { id: '2', name: 'VS Code', icon: '💻', desc: 'Code editor by Microsoft', rating: 4.8, category: 'Developer Tools', installed: true },
  { id: '3', name: 'Discord', icon: '💬', desc: 'Voice & text chat', rating: 4.3, category: 'Social', installed: false },
  { id: '4', name: 'Netflix', icon: '🎬', desc: 'Streaming movies & shows', rating: 4.4, category: 'Entertainment', installed: false },
  { id: '5', name: 'Notion', icon: '📝', desc: 'All-in-one workspace', rating: 4.6, category: 'Productivity', installed: false },
  { id: '6', name: 'Figma', icon: '🎨', desc: 'Design tool', rating: 4.7, category: 'Developer Tools', installed: false },
  { id: '7', name: 'Slack', icon: '💼', desc: 'Business messaging', rating: 4.2, category: 'Productivity', installed: false },
  { id: '8', name: 'Telegram', icon: '✈️', desc: 'Secure messaging', rating: 4.5, category: 'Social', installed: false },
  { id: '9', name: 'Adobe XD', icon: '🖌️', desc: 'UX design tool', rating: 4.1, category: 'Developer Tools', installed: false },
  { id: '10', name: 'WhatsApp', icon: '📱', desc: 'Cross-platform messaging', rating: 4.3, category: 'Social', installed: false },
  { id: '11', name: 'Zoom', icon: '📹', desc: 'Video conferencing', rating: 4.0, category: 'Productivity', installed: false },
  { id: '12', name: 'Steam', icon: '🎮', desc: 'PC gaming platform', rating: 4.6, category: 'Entertainment', installed: false },
];

const categories = ['All', 'Entertainment', 'Productivity', 'Developer Tools', 'Social'];

export function StoreApp() {
  const [items, setItems] = useState(storeItems);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = items.filter(i =>
    (category === 'All' || i.category === category) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInstall = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, installed: !i.installed } : i));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🏪</span>
          <h1 className="text-lg font-semibold text-foreground">Microsoft Store</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors
              ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto win-scrollbar p-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-secondary/50 transition-colors">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">{item.rating}</span>
                </div>
              </div>
              <button onClick={() => handleInstall(item.id)}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors ${item.installed
                  ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                {item.installed ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Installed</span> : <span className="flex items-center gap-1"><Download className="w-3 h-3" /> Get</span>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
