export interface Player {
  id: string;
  username: string | null;
  name: string | null;
  email: string;
  avatar: string | null;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  lastGameAt: Date | null;
  rank: number;
  winRate: number;
}

export interface GamePlayer {
  id: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
}
