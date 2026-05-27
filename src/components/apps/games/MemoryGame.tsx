import { useState, useEffect, useRef } from 'react';
import { GameProps } from './types';
import { GameHeader } from './GameHeader';

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🌸', '⭐', '🎯'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function createCards() {
  return shuffle([...EMOJIS, ...EMOJIS].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
}

export function MemoryGame({ onBack }: GameProps) {
  const [cards, setCards] = useState(createCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const lockRef = useRef(false);

  const won = matches === EMOJIS.length;

  const reset = () => { setCards(createCards()); setSelected([]); setMoves(0); setMatches(0); lockRef.current = false; };

  const handleClick = (idx: number) => {
    if (lockRef.current || cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;

    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newSelected = [...selected, idx];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c));
          setMatches(m => m + 1);
          setSelected([]);
        }, 300);
      } else {
        lockRef.current = true;
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c));
          setSelected([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="🧠 Memory" onReset={reset}
        center={
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Moves: {moves}</span>
            <span className="text-sm font-semibold text-foreground">
              {won ? '🎉 You Win!' : `🧠 ${matches}/${EMOJIS.length}`}
            </span>
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, i) => (
            <button key={card.id} onClick={() => handleClick(i)}
              className={`w-[60px] h-[60px] rounded-xl text-2xl flex items-center justify-center transition-all duration-200
                ${card.matched ? 'bg-primary/15 border border-primary/30 scale-95' 
                  : card.flipped ? 'bg-secondary border border-border rotate-0 scale-105' 
                  : 'bg-muted border border-border/50 hover:border-primary/30 hover:bg-secondary/50 active:scale-90'}`}
            >
              {card.flipped || card.matched ? card.emoji : <span className="text-muted-foreground/30 text-lg">?</span>}
            </button>
          ))}
        </div>
        {won && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-foreground font-medium">Completed in {moves} moves!</p>
            <button onClick={reset} className="px-5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
