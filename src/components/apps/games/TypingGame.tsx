import { useState, useEffect, useRef, useCallback } from 'react';
import { GameProps, getHighScore, setHighScore } from './types';
import { GameHeader } from './GameHeader';

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'code', 'react',
  'windows', 'desktop', 'browser', 'system', 'memory', 'speed', 'hello', 'world',
  'keyboard', 'master', 'thunder', 'galaxy', 'cosmic', 'blazing', 'swift', 'turbo',
  'rocket', 'dragon', 'phoenix', 'crystal', 'shadow', 'legend', 'forest', 'ocean',
  'stream', 'python', 'matrix', 'cyber', 'quantum', 'nebula', 'zenith', 'vertex',
];

function getRandomWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  return result.join(' ');
}

export function TypingGame({ onBack }: GameProps) {
  const [text, setText] = useState(() => getRandomWords(20));
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [bestWpm, setBestWpm] = useState(() => getHighScore('typing'));
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText(getRandomWords(20));
    setInput(''); setStarted(false); setFinished(false); setWpm(0); setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = useCallback((value: string) => {
    if (finished) return;
    if (!started) { setStarted(true); setStartTime(Date.now()); }
    setInput(value);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) correct++;
    }
    setAccuracy(value.length > 0 ? Math.round((correct / value.length) * 100) : 100);

    // Calculate WPM
    const elapsed = (Date.now() - (started ? startTime : Date.now())) / 1000 / 60;
    if (elapsed > 0) {
      const wordCount = value.split(' ').filter(w => w.length > 0).length;
      setWpm(Math.round(wordCount / elapsed));
    }

    if (value.length >= text.length) {
      setFinished(true);
      const finalElapsed = (Date.now() - startTime) / 1000 / 60;
      const finalWpm = Math.round((value.split(' ').length) / finalElapsed);
      setWpm(finalWpm);
      setHighScore('typing', finalWpm);
      setBestWpm(Math.max(finalWpm, getHighScore('typing')));
    }
  }, [text, started, finished, startTime]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex-1 flex flex-col">
      <GameHeader onBack={onBack} title="⌨️ Type Racer" onReset={reset}
        center={
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Best: {bestWpm} WPM</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{wpm} WPM</span>
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-primary tabular-nums">{wpm}</span>
            <span className="text-muted-foreground">WPM</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <span className={`text-2xl font-bold tabular-nums ${accuracy >= 90 ? 'text-green-500' : accuracy >= 70 ? 'text-yellow-500' : 'text-destructive'}`}>{accuracy}%</span>
            <span className="text-muted-foreground">Accuracy</span>
          </div>
        </div>

        <div className="w-full max-w-md p-4 rounded-xl bg-muted/30 border border-border/50 font-mono text-sm leading-relaxed select-none">
          {text.split('').map((char, i) => {
            let cls = 'text-muted-foreground/40';
            if (i < input.length) {
              cls = input[i] === char ? 'text-primary' : 'text-destructive bg-destructive/10 rounded';
            } else if (i === input.length) {
              cls = 'text-foreground bg-primary/20 rounded animate-pulse';
            }
            return <span key={i} className={cls}>{char}</span>;
          })}
        </div>

        <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)}
          disabled={finished}
          className="w-full max-w-md px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          placeholder={finished ? '' : 'Start typing here...'}
          spellCheck={false} autoComplete="off"
        />

        {finished && (
          <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-sm font-medium text-foreground">
              {wpm >= 60 ? '🔥 Blazing fast!' : wpm >= 40 ? '👍 Good speed!' : '💪 Keep practicing!'}
            </p>
            <button onClick={reset} className="px-5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
