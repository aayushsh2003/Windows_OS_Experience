import { useState } from 'react';
import { GameProps } from './types';
import { GameHeader } from './GameHeader';
import { Timer, Flag } from 'lucide-react';

const ROWS = 9, COLS = 9, MINES = 10;
type MCell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };

function createBoard(): MCell[][] {
  const board: MCell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
      }
      board[r][c].adj = count;
    }
  return board;
}

export function MinesweeperGame({ onBack }: GameProps) {
  const [board, setBoard] = useState(createBoard);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const flagCount = board.flat().filter(c => c.flagged).length;

  const reveal = (r: number, c: number) => {
    if (status !== 'playing') return;
    const b = board.map(row => row.map(cell => ({ ...cell })));
    if (b[r][c].flagged || b[r][c].revealed) return;
    if (b[r][c].mine) { 
      b.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setBoard(b); setStatus('lost'); return; 
    }
    const flood = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || b[r][c].revealed || b[r][c].mine) return;
      b[r][c].revealed = true;
      if (b[r][c].adj === 0) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(r + dr, c + dc);
    };
    flood(r, c);
    setBoard(b);
    if (b.flat().filter(c => !c.revealed && !c.mine).length === 0) setStatus('won');
  };

  const flag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status !== 'playing' || board[r][c].revealed) return;
    const b = board.map(row => row.map(cell => ({ ...cell })));
    b[r][c].flagged = !b[r][c].flagged;
    setBoard(b);
  };

  const reset = () => { setBoard(createBoard()); setStatus('playing'); };

  const adjColors: Record<number, string> = {
    1: 'text-blue-500', 2: 'text-green-500', 3: 'text-red-500', 4: 'text-purple-500',
    5: 'text-amber-600', 6: 'text-cyan-500', 7: 'text-foreground', 8: 'text-muted-foreground',
  };

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="💣 Minesweeper" onReset={reset}
        center={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Flag className="w-3 h-3" /> {MINES - flagCount}</span>
            <span className="text-sm font-semibold text-foreground">
              {status === 'won' ? '🎉 You Win!' : status === 'lost' ? '💥 Boom!' : '💣 Minesweeper'}
            </span>
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <div className="grid gap-[2px] bg-border/30 p-1 rounded-lg" style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}>
          {board.map((row, r) => row.map((cell, c) => (
            <button key={`${r}-${c}`} onClick={() => reveal(r, c)} onContextMenu={e => flag(e, r, c)}
              className={`w-[30px] h-[30px] text-xs font-bold flex items-center justify-center rounded transition-all duration-100
                ${cell.revealed 
                  ? cell.mine 
                    ? 'bg-destructive/20 border border-destructive/30' 
                    : 'bg-background/80 border border-border/30' 
                  : 'bg-secondary hover:bg-secondary/60 border border-border/40 hover:border-primary/30 active:scale-90'
                }`}
            >
              {cell.revealed 
                ? cell.mine ? '💣' : cell.adj > 0 ? <span className={adjColors[cell.adj]}>{cell.adj}</span> : '' 
                : cell.flagged ? '🚩' : ''
              }
            </button>
          )))}
        </div>
        <p className="text-[10px] text-muted-foreground">Left click to reveal • Right click to flag</p>
      </div>
    </div>
  );
}
