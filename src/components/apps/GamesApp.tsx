import { useState } from 'react';
import { GameType } from './games/types';
import { GameMenu } from './games/GameMenu';
import { SnakeGame } from './games/SnakeGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { TicTacToeGame } from './games/TicTacToeGame';
import { Game2048 } from './games/Game2048';
import { MemoryGame } from './games/MemoryGame';
import { TypingGame } from './games/TypingGame';

export function GamesApp() {
  const [game, setGame] = useState<GameType>('menu');
  const back = () => setGame('menu');

  return (
    <div className="h-full flex flex-col bg-background">
      {game === 'menu' && <GameMenu onSelect={setGame} />}
      {game === 'snake' && <SnakeGame onBack={back} />}
      {game === 'minesweeper' && <MinesweeperGame onBack={back} />}
      {game === 'tictactoe' && <TicTacToeGame onBack={back} />}
      {game === '2048' && <Game2048 onBack={back} />}
      {game === 'memory' && <MemoryGame onBack={back} />}
      {game === 'typing' && <TypingGame onBack={back} />}
    </div>
  );
}
