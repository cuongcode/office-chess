export interface GamePlayer {
  id: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
}

export interface GameData {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whitePlayer: GamePlayer;
  blackPlayer: GamePlayer;
  result: string;
  resultMethod: string;
  movesArray: string[];
  movesPGN: string;
  finalPosition: string;
  moveCount: number;
  timeControl: string;
  duration: number;
  opening: string | null;
  createdAt: string;
  endedAt: string;
}
