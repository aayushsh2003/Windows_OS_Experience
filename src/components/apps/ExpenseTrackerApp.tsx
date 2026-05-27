import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: 'income' | 'expense';
}

const CATS = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Salary', 'Other'];

export function ExpenseTrackerApp() {
  const [items, setItems] = useState<Expense[]>(() => {
    try { return JSON.parse(localStorage.getItem('webos-expenses') || '[]'); } catch { return []; }
  });
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => { localStorage.setItem('webos-expenses', JSON.stringify(items)); }, [items]);

  const add = () => {
    const n = parseFloat(amount);
    if (!n) return;
    setItems(i => [{ id: crypto.randomUUID(), amount: n, category, note, date: new Date().toISOString(), type }, ...i]);
    setAmount(''); setNote('');
  };

  const totals = useMemo(() => {
    const income = items.filter(i => i.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = items.filter(i => i.type === 'expense').reduce((a, b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [items]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    items.filter(i => i.type === 'expense').forEach(i => map.set(i.category, (map.get(i.category) || 0) + i.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const max = Math.max(...byCategory.map(c => c[1]), 1);

  return (
    <div className="h-full flex flex-col bg-background overflow-auto">
      <div className="grid grid-cols-3 gap-3 p-4 bg-muted border-b border-border">
        <div className="bg-background rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Income</div>
          <div className="text-xl font-bold text-green-600">${totals.income.toFixed(2)}</div>
        </div>
        <div className="bg-background rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Expenses</div>
          <div className="text-xl font-bold text-destructive">${totals.expense.toFixed(2)}</div>
        </div>
        <div className="bg-background rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className={`text-xl font-bold ${totals.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>${totals.balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="p-3 border-b border-border flex gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button onClick={() => setType('expense')} className={`px-3 py-2 text-xs ${type === 'expense' ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>− Expense</button>
          <button onClick={() => setType('income')} className={`px-3 py-2 text-xs ${type === 'income' ? 'bg-green-600 text-white' : 'bg-muted'}`}>+ Income</button>
        </div>
        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-28" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-2 py-1 bg-muted border border-border rounded text-sm">
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <Input placeholder="Note" value={note} onChange={e => setNote(e.target.value)} className="flex-1 min-w-[120px]" />
        <Button onClick={add}>Add</Button>
      </div>

      {byCategory.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Spending by Category</div>
          <div className="space-y-1.5">
            {byCategory.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate">{cat}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(amt / max) * 100}%` }} />
                </div>
                <span className="w-16 text-right font-mono">${amt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {items.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">No transactions yet</div>}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 px-3 py-2 border-b border-border hover:bg-muted/50">
            <div className={`w-1 h-8 rounded ${item.type === 'income' ? 'bg-green-600' : 'bg-destructive'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.note || item.category}</div>
              <div className="text-[11px] text-muted-foreground">{item.category} · {new Date(item.date).toLocaleDateString()}</div>
            </div>
            <div className={`font-mono font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
              {item.type === 'income' ? '+' : '−'}${item.amount.toFixed(2)}
            </div>
            <button onClick={() => setItems(i => i.filter(x => x.id !== item.id))} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
