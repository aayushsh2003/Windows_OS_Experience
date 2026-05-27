import { useState, useEffect } from 'react';
import { motion } from "framer-motion";

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<'basic' | 'scientific'>('basic');

  // 🔊 Sound
  const playSound = () => {
    const audio = new Audio('/click.mp3');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  // 💾 Load history
  useEffect(() => {
    const saved = localStorage.getItem('calc-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // 💾 Save history
  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  // ⌨️ Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key;

      if ('0123456789.'.includes(key)) handleBtn(key);
      else if (['+', '-', '*', '/'].includes(key)) {
        const map: any = { '*': '×', '/': '÷' };
        handleBtn(map[key] || key);
      }
      else if (key === 'Enter') handleBtn('=');
      else if (key === 'Backspace') handleBtn('⌫');
      else if (key === 'Escape') handleBtn('C');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const calc = (a: number, b: number, o: string): number => {
    switch (o) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleBtn = (b: string) => {
    playSound();

    if ('0123456789.'.includes(b)) {
      if (reset) { setDisplay(b); setReset(false); return; }
      setDisplay(display === '0' ? b : display + b);
    }

    else if (['+', '-', '×', '÷'].includes(b)) {
      if (prev && op && !reset) {
        const result = calc(parseFloat(prev), parseFloat(display), op);
        setDisplay(String(result));
        setPrev(String(result));
      } else {
        setPrev(display);
      }
      setOp(b);
      setReset(true);
    }

    else if (b === '=') {
      if (!prev || !op) return;
      const result = calc(parseFloat(prev), parseFloat(display), op);

      setHistory(h => [`${prev} ${op} ${display} = ${result}`, ...h]);

      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setReset(true);
    }

    else if (b === 'C') {
      setDisplay('0');
      setPrev(null);
      setOp(null);
      setReset(false);
    }

    else if (b === '⌫') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }

    else if (b === '±') setDisplay(String(-parseFloat(display)));
    else if (b === 'x²') { setDisplay(String(Math.pow(parseFloat(display), 2))); setReset(true); }
    else if (b === '√') { setDisplay(String(Math.sqrt(parseFloat(display)))); setReset(true); }
    else if (b === '1/x') { setDisplay(String(1 / parseFloat(display))); setReset(true); }
    else if (b === '%') { setDisplay(String(parseFloat(display) / 100)); setReset(true); }

    // 🧠 Scientific
    else if (b === 'sin') setDisplay(String(Math.sin(parseFloat(display))));
    else if (b === 'cos') setDisplay(String(Math.cos(parseFloat(display))));
    else if (b === 'tan') setDisplay(String(Math.tan(parseFloat(display))));
    else if (b === 'log') setDisplay(String(Math.log10(parseFloat(display))));
    else if (b === 'ln') setDisplay(String(Math.log(parseFloat(display))));
    else if (b === 'π') setDisplay(String(Math.PI));
    else if (b === 'e') setDisplay(String(Math.E));
  };

  const basicButtons = [
    ['%', 'C', '⌫', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['±', '0', '.', '='],
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'log'],
    ['ln', 'π', 'e', 'x²'],
  ];

  return (
    <div className="relative flex h-full text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]" />
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-purple-500/20 blur-[140px]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-blue-500/20 blur-[140px]" />

      {/* Calculator */}
      <div className="relative flex flex-col flex-1 p-6 gap-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Calculator</h1>

          <button
            onClick={() => setMode(mode === 'basic' ? 'scientific' : 'basic')}
            className="px-4 py-1 text-xs rounded-full 
            bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20"
          >
            {mode === 'basic' ? 'Scientific' : 'Basic'}
          </button>
        </div>

        {/* Display */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="p-5 rounded-2xl bg-black/60 backdrop-blur-2xl">
            <div className="text-xs text-gray-400">{prev} {op}</div>
            <div className="text-5xl text-right truncate">{display}</div>
          </div>
        </div>

        {/* Scientific */}
        {mode === 'scientific' && (
          <div className="grid grid-cols-4 gap-2">
            {scientificButtons.flat().map((b, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-xs rounded-xl 
                bg-gradient-to-br from-purple-500/20 to-blue-500/20 
                border border-white/10 hover:scale-105"
                onClick={() => handleBtn(b)}
              >
                {b}
              </motion.button>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3 flex-1">
          {basicButtons.flat().map((b, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleBtn(b)}
              className={`rounded-xl text-sm 
              ${b === '='
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : 'bg-white/5 hover:bg-white/15'
              }`}
            >
              {b}
            </motion.button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="w-72 p-4 border-l border-white/10 bg-black/30 backdrop-blur-2xl">
        <h2 className="text-sm mb-4">History</h2>

        {history.length === 0 && (
          <p className="text-xs text-gray-400">No history</p>
        )}

        <div className="flex flex-col gap-2 overflow-y-auto">
          {history.map((h, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-2 text-xs bg-white/10 rounded-lg cursor-pointer"
              onClick={() => setDisplay(h.split('=')[1].trim())}
            >
              {h}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}