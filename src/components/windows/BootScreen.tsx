import { useState, useEffect } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'loading' | 'fade'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loading'), 500);
    const t2 = setTimeout(() => setPhase('fade'), 2800);
    const t3 = setTimeout(() => onComplete(), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[hsl(220,20%,5%)] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Windows-style logo */}
      <div className="mb-12 animate-[winLogoIn_0.8s_ease-out]">
        <svg width="80" height="80" viewBox="0 0 88 88" className="drop-shadow-[0_0_40px_hsl(207,90%,54%,0.4)]">
          <rect x="2" y="2" width="38" height="38" rx="4" fill="hsl(207, 90%, 54%)" opacity="0.9" />
          <rect x="48" y="2" width="38" height="38" rx="4" fill="hsl(207, 90%, 64%)" opacity="0.85" />
          <rect x="2" y="48" width="38" height="38" rx="4" fill="hsl(207, 90%, 44%)" opacity="0.85" />
          <rect x="48" y="48" width="38" height="38" rx="4" fill="hsl(207, 90%, 54%)" opacity="0.8" />
        </svg>
      </div>

      {/* Loading spinner */}
      {(phase === 'loading' || phase === 'fade') && (
        <div className="flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                animation: 'winDotSpin 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
