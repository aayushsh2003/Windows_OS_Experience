import { useState, useEffect, useCallback } from 'react';
import { GameProps, getHighScore, setHighScore } from './types';
import { GameHeader } from './GameHeader';

type Board2048 = number[][];

const SIZE = 4;

const tileColors: Record<number, string> = {
  2: 'bg-amber-100 text-amber-900', 4: 'bg-amber-200 text-amber-900',
  8: 'bg-orange-300 text-white', 16: 'bg-orange-400 text-white',
  32: 'bg-red-400 text-white', 64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white', 1024: 'bg-yellow-700 text-white',
  2048: 'bg-yellow-500 text-white',
};

function emptyBoard(): Board2048 { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }

function addRandom(board: Board2048): Board2048 {
  const b = board.map(r => [...r]);
  const empty: [number, number][] = [];
  b.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]); }));
  if (empty.length === 0) return b;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  b[r][c] = Math.random() < 0.9 ? 2 : 4;
  return b;
}

function initBoard(): Board2048 { return addRandom(addRandom(emptyBoard())); }

function slideRow(row: number[]): { result: number[]; score: number } {
  const filtered = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else { merged.push(filtered[i]); i++; }
  }
  while (merged.length < SIZE) merged.push(0);
  return { result: merged, score };
}

function move(board: Board2048, dir: 'left' | 'right' | 'up' | 'down'): { board: Board2048; score: number; moved: boolean } {
  let totalScore = 0;
  let b = board.map(r => [...r]);

  const slideAll = (rows: number[][]) => {
    return rows.map(row => {
      const { result, score } = slideRow(row);
      totalScore += score;
      return result;
    });
  };

  if (dir === 'left') b = slideAll(b);
  else if (dir === 'right') b = slideAll(b.map(r => [...r].reverse())).map(r => r.reverse());
  else if (dir === 'up') {
    let cols = Array.from({ length: SIZE }, (_, c) => b.map(r => r[c]));
    cols = slideAll(cols);
    b = Array.from({ length: SIZE }, (_, r) => cols.map(col => col[r]));
  } else {
    let cols = Array.from({ length: SIZE }, (_, c) => b.map(r => r[c]).reverse());
    cols = slideAll(cols);
    b = Array.from({ length: SIZE }, (_, r) => cols.map(col => col[SIZE - 1 - r]));
  }

  const moved = JSON.stringify(b) !== JSON.stringify(board);
  return { board: b, score: totalScore, moved };
}

function canMove(board: Board2048): boolean {
  for (const dir of ['left', 'right', 'up', 'down'] as const) {
    if (move(board, dir).moved) return true;
  }
  return false;
}

export function Game2048({ onBack }: GameProps) {
  const [board, setBoard] = useState(initBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => getHighScore('2048'));
  const [gameOver, setGameOver] = useState(false);

  const reset = () => { setBoard(initBoard()); setScore(0); setGameOver(false); };

  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    const result = move(board, dir);
    if (!result.moved) return;
    const newBoard = addRandom(result.board);
    const newScore = score + result.score;
    setBoard(newBoard); setScore(newScore);
    setHighScore('2048', newScore); setBest(Math.max(newScore, getHighScore('2048')));
    if (!canMove(newBoard)) setGameOver(true);
  }, [board, score, gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="🔢 2048" onReset={reset}
        center={
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Best: {best}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{score}</span>
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <div className="relative bg-muted/50 p-2 rounded-xl border border-border/50">
          <div className="grid grid-cols-4 gap-1.5">
            {board.flat().map((val, i) => (
              <div key={i}
                className={`w-[64px] h-[64px] flex items-center justify-center rounded-lg font-bold text-sm transition-all
                  ${val === 0 ? 'bg-muted/50' : tileColors[val] || 'bg-foreground text-background'}
                  ${val >= 1024 ? 'text-xs' : val >= 128 ? 'text-sm' : 'text-lg'}`}>
                {val > 0 ? val : ''}
              </div>
            ))}
          </div>
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm gap-3">
              <span className="text-lg font-bold text-destructive">Game Over!</span>
              <span className="text-sm text-foreground">Score: {score}</span>
              <button onClick={reset} className="px-5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Try Again
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">Use arrow keys to slide tiles</p>
      </div>
    </div>
  );
}
