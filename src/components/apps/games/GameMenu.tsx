import { GameType } from './types';

const games: { id: GameType; name: string; icon: string; desc: string; color: string }[] = [
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Classic arcade', color: 'from-green-500/20 to-emerald-500/10' },
  { id: 'minesweeper', name: 'Minesweeper', icon: '💣', desc: 'Find the mines', color: 'from-orange-500/20 to-amber-500/10' },
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', desc: 'Play vs AI', color: 'from-blue-500/20 to-cyan-500/10' },
  { id: '2048', name: '2048', icon: '🔢', desc: 'Merge tiles', color: 'from-yellow-500/20 to-orange-500/10' },
  { id: 'memory', name: 'Memory', icon: '🧠', desc: 'Match pairs', color: 'from-purple-500/20 to-pink-500/10' },
  { id: 'typing', name: 'Type Racer', icon: '⌨️', desc: 'Speed typing', color: 'from-red-500/20 to-rose-500/10' },
];

export function GameMenu({ onSelect }: { onSelect: (g: GameType) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center p-6 overflow-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 justify-center">🎮 Game Center</h1>
        <p className="text-xs text-muted-foreground mt-1">Choose a game to play</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {games.map(g => (
          <button key={g.id} onClick={() => onSelect(g.id)}
            className={`group flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${g.color} border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:scale-[1.03] active:scale-95`}>
            <span className="text-3xl group-hover:scale-110 transition-transform">{g.icon}</span>
            <span className="text-xs font-semibold text-foreground">{g.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{g.desc}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 px-4 py-2 rounded-lg bg-muted/50 border border-border/30">
        <p className="text-[10px] text-muted-foreground text-center">🏆 High scores saved locally</p>
      </div>
    </div>
  );
}
