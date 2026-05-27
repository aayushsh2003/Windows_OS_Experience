import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react';

interface Ticker { symbol: string; name: string; price: number; change: number; history: number[]; }

const SEED: Ticker[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 198.42, change: 0, history: [] },
  { symbol: 'MSFT', name: 'Microsoft', price: 421.30, change: 0, history: [] },
  { symbol: 'GOOGL', name: 'Alphabet', price: 175.88, change: 0, history: [] },
  { symbol: 'NVDA', name: 'NVIDIA', price: 920.15, change: 0, history: [] },
  { symbol: 'BTC', name: 'Bitcoin', price: 68420.50, change: 0, history: [] },
  { symbol: 'ETH', name: 'Ethereum', price: 3850.20, change: 0, history: [] },
];

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <div className="h-8 w-24" />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 96},${32 - ((v - min) / range) * 28}`).join(' ');
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={96} height={32} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)'} strokeWidth={1.5} />
    </svg>
  );
}

export function StocksApp() {
  const [tickers, setTickers] = useState<Ticker[]>(() => {
    try { return JSON.parse(localStorage.getItem('stocks') || 'null') || SEED; } catch { return SEED; }
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setTickers(prev => {
        const next = prev.map(t => {
          const pct = (Math.random() - 0.5) * 0.02;
          const newPrice = +(t.price * (1 + pct)).toFixed(2);
          const hist = [...t.history, newPrice].slice(-30);
          return { ...t, price: newPrice, change: ((newPrice - (t.history[0] || newPrice)) / (t.history[0] || newPrice)) * 100, history: hist };
        });
        localStorage.setItem('stocks', JSON.stringify(next));
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const add = () => {
    if (!input.trim()) return;
    const sym = input.toUpperCase().trim();
    if (tickers.find(t => t.symbol === sym)) return;
    setTickers([...tickers, { symbol: sym, name: sym, price: +(Math.random() * 500 + 50).toFixed(2), change: 0, history: [] }]);
    setInput('');
  };

  const remove = (s: string) => setTickers(tickers.filter(t => t.symbol !== s));

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex gap-2">
        <h2 className="text-lg font-semibold flex-1">Stocks & Crypto</h2>
        <Input className="w-40" placeholder="Add symbol..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <Button size="icon" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {tickers.map(t => (
          <div key={t.symbol} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50">
            <div className="w-20">
              <div className="font-bold">{t.symbol}</div>
              <div className="text-xs text-muted-foreground truncate">{t.name}</div>
            </div>
            <Sparkline data={t.history} />
            <div className="flex-1 text-right">
              <div className="font-semibold tabular-nums">${t.price.toLocaleString()}</div>
              <div className={`text-xs flex items-center justify-end gap-1 ${t.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {t.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {t.change.toFixed(2)}%
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => remove(t.symbol)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t text-xs text-muted-foreground">Simulated prices update every 2s</div>
    </div>
  );
}
