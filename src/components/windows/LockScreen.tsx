import { useState, useEffect, useRef } from 'react';
import wallpaper from '@/assets/wallpaper.jpg';
import { Lock, ChevronUp } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const [phase, setPhase] = useState<'lock' | 'pin'>('lock');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'lock') return;
    startY.current = e.clientY;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dy = Math.min(0, e.clientY - startY.current);
    setDragY(dy);
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (dragY < -120) {
      setPhase('pin');
    }
    setDragY(0);
  };

  const handlePinKey = (key: string) => {
    if (key === 'back') {
      setPin(p => p.slice(0, -1));
      setError(false);
      return;
    }
    const next = pin + key;
    setPin(next);
    if (next.length >= 4) {
      // Any 4-digit PIN unlocks (it's a simulation)
      setTimeout(() => onUnlock(), 300);
    }
  };

  const opacity = Math.max(0, 1 + dragY / 200);

  return (
    <div className="fixed inset-0 z-[99999] select-none overflow-hidden">
      <img src={wallpaper} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {phase === 'lock' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
          style={{ transform: `translateY(${dragY}px)`, opacity }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <p className="text-7xl font-light text-white tracking-tight mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-lg text-white/80 mb-16">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
            <ChevronUp className="w-6 h-6" />
            <span className="text-xs">Swipe up to unlock</span>
          </div>
        </div>
      )}

      {phase === 'pin' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-sm mb-1">User</p>
          <p className="text-white/50 text-xs mb-6">Enter PIN to sign in</p>

          {/* PIN dots */}
          <div className="flex gap-3 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < pin.length
                    ? error ? 'bg-destructive scale-110' : 'bg-white scale-110'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','','0','back'].map(key => (
              key === '' ? <div key="empty" /> : (
                <button
                  key={key}
                  onClick={() => handlePinKey(key)}
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xl font-light hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center"
                >
                  {key === 'back' ? '⌫' : key}
                </button>
              )
            ))}
          </div>

          <button
            onClick={onUnlock}
            className="mt-6 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Skip →
          </button>
        </div>
      )}
    </div>
  );
}
