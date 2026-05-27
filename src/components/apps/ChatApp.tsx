import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, Plus, Check, CheckCheck } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  read: boolean;
}

const contacts: Contact[] = [
  { id: '1', name: 'Aayush Sharma', avatar: '👨‍💻', lastMessage: 'Check out the new build!', time: '2m', unread: 2, online: true },
  { id: '2', name: 'Team WebOS', avatar: '🖥️', lastMessage: 'Deploy is live 🚀', time: '15m', unread: 0, online: true },
  { id: '3', name: 'Alice Johnson', avatar: '👩', lastMessage: 'Sounds good!', time: '1h', unread: 0, online: false },
  { id: '4', name: 'Bob Smith', avatar: '👨', lastMessage: 'Meeting at 3pm?', time: '2h', unread: 1, online: true },
  { id: '5', name: 'Design Team', avatar: '🎨', lastMessage: 'New mockups ready', time: '3h', unread: 0, online: false },
  { id: '6', name: 'Mom ❤️', avatar: '👩‍🦳', lastMessage: 'Call me when free', time: '5h', unread: 3, online: false },
];

const demoMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hey! How\'s the WebOS project going?', sender: 'them', time: '10:30 AM', read: true },
    { id: '2', text: 'Going great! Just added a bunch of new apps 🎉', sender: 'me', time: '10:32 AM', read: true },
    { id: '3', text: 'Nice! The UI looks amazing', sender: 'them', time: '10:33 AM', read: true },
    { id: '4', text: 'Check out the new build!', sender: 'them', time: '10:35 AM', read: false },
    { id: '5', text: 'Can you add a chat app too? 😄', sender: 'them', time: '10:35 AM', read: false },
  ],
  '2': [
    { id: '1', text: 'Build #42 passed all tests ✅', sender: 'them', time: '9:00 AM', read: true },
    { id: '2', text: 'Deploy is live 🚀', sender: 'them', time: '9:15 AM', read: true },
  ],
};

const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🚀', '💪', '😎', '🤔', '👋', '🎮', '💻', '☕'];

export function ChatApp() {
  const [activeContact, setActiveContact] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(demoMessages);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMsg],
    }));
    setInput('');
    setShowEmoji(false);

    // Simulate reply
    setTimeout(() => {
      const replies = ['Got it! 👍', 'That\'s cool!', 'Sure thing 😊', 'Haha nice!', 'Will check it out', '👀', 'Awesome! 🎉'];
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      setMessages(prev => ({
        ...prev,
        [activeContact]: [...(prev[activeContact] || []), reply],
      }));
    }, 1500 + Math.random() * 2000);
  };

  const contact = contacts.find(c => c.id === activeContact);
  const currentMessages = messages[activeContact] || [];
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="bg-transparent text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveContact(c.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors ${activeContact === c.id ? 'bg-primary/10' : ''}`}
            >
              <div className="relative">
                <span className="text-2xl">{c.avatar}</span>
                {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{contact?.avatar}</span>
            <div>
              <p className="text-xs font-medium text-foreground">{contact?.name}</p>
              <p className="text-[10px] text-muted-foreground">{contact?.online ? '🟢 Online' : '⚫ Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-muted rounded-lg"><Phone className="w-4 h-4 text-muted-foreground" /></button>
            <button className="p-2 hover:bg-muted rounded-lg"><Video className="w-4 h-4 text-muted-foreground" /></button>
            <button className="p-2 hover:bg-muted rounded-lg"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                <p className="text-xs">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-0.5 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                  <span className={`text-[9px] ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</span>
                  {msg.sender === 'me' && (msg.read ? <CheckCheck className="w-3 h-3 text-primary-foreground/70" /> : <Check className="w-3 h-3 text-primary-foreground/70" />)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji picker */}
        {showEmoji && (
          <div className="px-4 pb-2">
            <div className="bg-muted rounded-lg p-2 flex flex-wrap gap-1">
              {emojis.map(e => (
                <button key={e} onClick={() => setInput(prev => prev + e)} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg" onClick={() => setShowEmoji(!showEmoji)}>
            <Smile className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-full px-4 py-2 text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
