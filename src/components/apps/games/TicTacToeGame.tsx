import { useState, useCallback } from 'react';
import { GameProps } from './types';
import { GameHeader } from './GameHeader';

export function TicTacToeGame({ onBack }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [status, setStatus] = useState('Your turn (X)');
  const [wins, setWins] = useState({ x: 0, o: 0, draw: 0 });
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const checkWin = (b: (string|null)[]) => lines.find(([a,bb,c]) => b[a] && b[a] === b[bb] && b[a] === b[c]);

  const aiMove = useCallback((b: (string | null)[]) => {
    const empty = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
    if (empty.length === 0) return b;
    for (const mark of ['O', 'X']) {
      for (const i of empty) {
        const test = [...b]; test[i] = mark;
        if (checkWin(test)) { const nb = [...b]; nb[i] = 'O'; return nb; }
      }
    }
    if (b[4] === null) { const nb = [...b]; nb[4] = 'O'; return nb; }
    const corners = [0,2,6,8].filter(i => b[i] === null);
    if (corners.length > 0) { const nb = [...b]; nb[corners[Math.floor(Math.random() * corners.length)]] = 'O'; return nb; }
    const nb = [...b]; nb[empty[Math.floor(Math.random() * empty.length)]] = 'O'; return nb;
  }, []);

  const handleClick = (i: number) => {
    if (board[i] || winLine || checkWin(board)) return;
    const nb = [...board]; nb[i] = 'X';

    const win = checkWin(nb);
    if (win) { setBoard(nb); setStatus('You win! 🎉'); setWinLine(win); setWins(w => ({ ...w, x: w.x + 1 })); return; }
    if (nb.every(v => v)) { setBoard(nb); setStatus("It's a draw!"); setWins(w => ({ ...w, draw: w.draw + 1 })); return; }

    const ab = aiMove(nb);
    const aiWin = checkWin(ab);
    if (aiWin) { setBoard(ab); setStatus('Computer wins! 🤖'); setWinLine(aiWin); setWins(w => ({ ...w, o: w.o + 1 })); return; }
    if (ab.every(v => v)) { setBoard(ab); setStatus("It's a draw!"); setWins(w => ({ ...w, draw: w.draw + 1 })); return; }

    setBoard(ab); setStatus('Your turn (X)');
  };

  const reset = () => { setBoard(Array(9).fill(null)); setStatus('Your turn (X)'); setWinLine(null); };

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="❌ Tic Tac Toe" onReset={reset} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>You (X): <strong className="text-primary">{wins.x}</strong></span>
          <span>Draws: <strong className="text-foreground">{wins.draw}</strong></span>
          <span>AI (O): <strong className="text-destructive">{wins.o}</strong></span>
        </div>
        <p className="text-sm font-medium text-foreground">{status}</p>
        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, i) => (
            <button key={i} onClick={() => handleClick(i)}
              className={`w-[72px] h-[72px] text-2xl font-bold flex items-center justify-center rounded-xl border transition-all duration-150 active:scale-90
                ${winLine?.includes(i) ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-muted hover:bg-secondary border-border/50'}`}>
              {cell === 'X' ? <span className="text-primary">✕</span> : cell === 'O' ? <span className="text-destructive">○</span> : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
