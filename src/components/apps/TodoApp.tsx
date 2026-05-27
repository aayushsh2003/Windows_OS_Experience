import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Circle, Star, Search } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  starred: boolean;
  createdAt: string;
  list: string;
}

const LISTS = ['My Day', 'Important', 'Tasks', 'Shopping'];

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('webos-todos');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Welcome to WebOS To-Do!', done: false, starred: true, createdAt: new Date().toISOString(), list: 'My Day' },
      { id: '2', text: 'Try creating a new task', done: false, starred: false, createdAt: new Date().toISOString(), list: 'Tasks' },
      { id: '3', text: 'Explore all WebOS apps', done: true, starred: false, createdAt: new Date().toISOString(), list: 'My Day' },
    ];
  });
  const [activeList, setActiveList] = useState('My Day');
  const [newText, setNewText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('webos-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newText.trim()) return;
    setTodos(prev => [{ id: Date.now().toString(), text: newText.trim(), done: false, starred: false, createdAt: new Date().toISOString(), list: activeList }, ...prev]);
    setNewText('');
  };

  const toggleDone = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleStar = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (activeList === 'Important') return t.starred;
    return t.list === activeList;
  }).filter(t => t.text.toLowerCase().includes(search.toLowerCase()));

  const pending = filtered.filter(t => !t.done);
  const completed = filtered.filter(t => t.done);

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-44 bg-muted border-r border-border py-3 shrink-0">
        {LISTS.map(list => {
          const count = list === 'Important'
            ? todos.filter(t => t.starred && !t.done).length
            : todos.filter(t => t.list === list && !t.done).length;
          return (
            <button
              key={list}
              onClick={() => setActiveList(list)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                activeList === list ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              <span className="flex items-center gap-2">
                {list === 'My Day' ? '☀️' : list === 'Important' ? '⭐' : list === 'Shopping' ? '🛒' : '📋'} {list}
              </span>
              {count > 0 && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded-full">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {activeList === 'My Day' ? '☀️' : activeList === 'Important' ? '⭐' : activeList === 'Shopping' ? '🛒' : '📋'} {activeList}
          </h2>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-muted rounded-md border-none outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Add a task..."
              className="flex-1 h-8 px-3 text-xs bg-muted rounded-md border-none outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <button onClick={addTodo} className="h-8 px-3 bg-primary text-primary-foreground rounded-md text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto win-scrollbar p-2 space-y-0.5">
          {pending.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleDone} onStar={toggleStar} onDelete={deleteTodo} />
          ))}
          {completed.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground px-2 pt-3 pb-1">Completed ({completed.length})</p>
              {completed.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleDone} onStar={toggleStar} onDelete={deleteTodo} />
              ))}
            </>
          )}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p className="text-xs">No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onStar, onDelete }: {
  todo: Todo; onToggle: (id: string) => void; onStar: (id: string) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors">
      <button onClick={() => onToggle(todo.id)} className="shrink-0">
        {todo.done
          ? <Check className="w-4 h-4 text-primary" />
          : <Circle className="w-4 h-4 text-muted-foreground" />}
      </button>
      <span className={`flex-1 text-xs ${todo.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {todo.text}
      </span>
      <button onClick={() => onStar(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Star className={`w-3.5 h-3.5 ${todo.starred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
      </button>
      <button onClick={() => onDelete(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </button>
    </div>
  );
}
