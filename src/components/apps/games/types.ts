export type GameType = 'menu' | 'snake' | 'minesweeper' | 'tictactoe' | '2048' | 'memory' | 'typing';

export interface GameProps {
  onBack: () => void;
}

export function getHighScore(game: string): number {
  return parseInt(localStorage.getItem(`game_hs_${game}`) || '0', 10);
}

export function setHighScore(game: string, score: number) {
  const prev = getHighScore(game);
  if (score > prev) localStorage.setItem(`game_hs_${game}`, String(score));
}
