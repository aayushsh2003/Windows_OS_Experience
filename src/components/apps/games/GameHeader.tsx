import { ArrowLeft, RotateCcw } from 'lucide-react';

interface GameHeaderProps {
  onBack: () => void;
  title: string;
  onReset?: () => void;
  center?: React.ReactNode;
}

export function GameHeader({ onBack, title, onReset, center }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30 shrink-0">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="flex items-center gap-2">
        {center || <span className="text-sm font-semibold text-foreground">{title}</span>}
      </div>
      {onReset ? (
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          <RotateCcw className="w-3 h-3" /> New
        </button>
      ) : <span className="w-12" />}
    </div>
  );
}
