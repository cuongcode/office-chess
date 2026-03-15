export type GameStatus =
  | "playing"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "check"
  | "resignation";

export interface BaseGameState {
  fen: string;
  moveHistory: string[];
  turn: "w" | "b";
  status: GameStatus;
  lastMove: { from: string; to: string } | null;
  capturedPieces: {
    white: string[];
    black: string[];
  };
}
