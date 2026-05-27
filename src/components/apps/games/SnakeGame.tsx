import { useState, useCallback, useEffect, useRef } from 'react';
import { GameProps, getHighScore, setHighScore } from './types';
import { GameHeader } from './GameHeader';

export function SnakeGame({ onBack }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => getHighScore('snake'));
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const gameRef = useRef<any>({ snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 10 }, running: false });

  const GRID = 20, CELL = 16;

  const resetGame = useCallback(() => {
    gameRef.current = { snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }, running: true };
    setScore(0); setGameOver(false); setStarted(true);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g.running && !gameOver) { g.running = true; setStarted(true); }
      if (e.key === 'ArrowUp' && g.dir.y !== 1) g.dir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && g.dir.y !== -1) g.dir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && g.dir.x !== 1) g.dir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && g.dir.x !== -1) g.dir = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Draw initial state
    ctx.fillStyle = 'hsl(220, 20%, 8%)';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    // Draw grid
    ctx.strokeStyle = 'hsl(220, 15%, 13%)';
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
    }

    const interval = setInterval(() => {
      const g = gameRef.current;
      if (!g.running) return;

      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || g.snake.some((s: any) => s.x === head.x && s.y === head.y)) {
        g.running = false;
        setGameOver(true);
        setScore(prev => { setHighScore('snake', prev); setBest(Math.max(prev, getHighScore('snake'))); return prev; });
        return;
      }

      g.snake.unshift(head);
      if (head.x === g.food.x && head.y === g.food.y) {
        g.food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        setScore(s => s + 10);
      } else { g.snake.pop(); }

      ctx.fillStyle = 'hsl(220, 20%, 8%)';
      ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
      ctx.strokeStyle = 'hsl(220, 15%, 13%)';
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
      }

      g.snake.forEach((s: any, idx: number) => {
        const brightness = Math.max(40, 65 - idx * 2);
        ctx.fillStyle = idx === 0 ? 'hsl(120, 70%, 55%)' : `hsl(120, 55%, ${brightness}%)`;
        ctx.beginPath();
        ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.fill();
      });

      ctx.fillStyle = 'hsl(0, 85%, 60%)';
      ctx.beginPath();
      ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    }, 110);

    return () => clearInterval(interval);
  }, [gameOver, started]);

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="🐍 Snake" onReset={resetGame}
        center={
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Best: {best}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">Score: {score}</span>
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <div className="relative">
          <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="rounded-lg border border-border shadow-lg" />
          {!started && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground animate-pulse">Press any arrow key to start</p>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm gap-3">
              <span className="text-lg font-bold text-destructive">Game Over!</span>
              <span className="text-sm text-foreground">Score: {score}</span>
              <button onClick={resetGame} className="px-5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Play Again
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">Use arrow keys to move</p>
      </div>
    </div>
  );
}
