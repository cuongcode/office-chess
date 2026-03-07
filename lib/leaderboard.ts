import { prisma } from "./prisma";

export type TimeFilter = "all-time" | "monthly" | "weekly";

export interface LeaderboardPlayer {
  id: string;
  username: string | null;
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

export interface LeaderboardResult {
  players: LeaderboardPlayer[];
  totalPlayers: number;
  hasMore: boolean;
}

export interface UserRankResult {
  rank: number;
  totalPlayers: number;
  percentile: number;
  nearbyPlayers: LeaderboardPlayer[];
}

export interface LeaderboardStats {
  totalPlayers: number;
  totalGames: number;
  averageRating: number;
  mostActivePlayer: {
    username: string | null;
    totalGames: number;
  } | null;
  highestRatedPlayer: {
    username: string | null;
    rating: number;
  } | null;
}

/**
 * Get date filter based on time filter type
 */
function getDateFilter(timeFilter: TimeFilter): Date | null {
  const now = new Date();

  switch (timeFilter) {
    case "weekly":
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case "monthly":
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return monthAgo;
    case "all-time":
    default:
      return null;
  }
}

/**
 * Get leaderboard with filtering and pagination
 */
export async function getLeaderboard(
  timeFilter: TimeFilter = "all-time",
  limit: number = 50,
  offset: number = 0,
): Promise<LeaderboardResult> {
  const dateFilter = getDateFilter(timeFilter);

  // Build where clause
  const whereClause = dateFilter
    ? {
        lastGameAt: {
          gte: dateFilter,
        },
        totalGames: {
          gt: 0, // Only show players who have played at least one game
        },
      }
    : {
        totalGames: {
          gt: 0,
        },
      };

  // Get total count
  const totalPlayers = await prisma.user.count({
    where: whereClause,
  });

  // Get players with pagination
  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      rating: true,
      wins: true,
      losses: true,
      draws: true,
      totalGames: true,
      lastGameAt: true,
    },
    orderBy: [
      { rating: "desc" },
      { wins: "desc" }, // Tiebreaker
    ],
    skip: offset,
    take: limit,
  });

  // Calculate ranks and win rates
  const players: LeaderboardPlayer[] = users.map((user, index) => ({
    ...user,
    rank: offset + index + 1,
    winRate: user.totalGames > 0 ? (user.wins / user.totalGames) * 100 : 0,
  }));

  return {
    players,
    totalPlayers,
    hasMore: offset + limit < totalPlayers,
  };
}

/**
 * Get a specific user's rank in the leaderboard
 */
export async function getUserRank(
  userId: string,
  timeFilter: TimeFilter = "all-time",
): Promise<UserRankResult | null> {
  const dateFilter = getDateFilter(timeFilter);

  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      rating: true,
      wins: true,
      losses: true,
      draws: true,
      totalGames: true,
      lastGameAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Build where clause
  const whereClause = dateFilter
    ? {
        lastGameAt: {
          gte: dateFilter,
        },
        totalGames: {
          gt: 0,
        },
      }
    : {
        totalGames: {
          gt: 0,
        },
      };

  // Count users with higher rating (or same rating but more wins)
  const usersAbove = await prisma.user.count({
    where: {
      ...whereClause,
      OR: [
        { rating: { gt: user.rating } },
        {
          rating: user.rating,
          wins: { gt: user.wins },
        },
      ],
    },
  });

  const rank = usersAbove + 1;

  // Get total players in this filter
  const totalPlayers = await prisma.user.count({
    where: whereClause,
  });

  // Calculate percentile
  const percentile =
    totalPlayers > 0 ? ((totalPlayers - rank) / totalPlayers) * 100 : 0;

  // Get nearby players (2 above and 2 below)
  const nearbyOffset = Math.max(0, rank - 3);
  const nearbyResult = await getLeaderboard(timeFilter, 5, nearbyOffset);

  return {
    rank,
    totalPlayers,
    percentile,
    nearbyPlayers: nearbyResult.players,
  };
}

/**
 * Get top players (for widgets and quick display)
 */
export async function getTopPlayers(
  limit: number = 10,
): Promise<LeaderboardPlayer[]> {
  const result = await getLeaderboard("all-time", limit, 0);
  return result.players;
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  // Get total players with at least one game
  const totalPlayers = await prisma.user.count({
    where: {
      totalGames: {
        gt: 0,
      },
    },
  });

  // Get aggregate stats
  const aggregateResult = await prisma.user.aggregate({
    where: {
      totalGames: {
        gt: 0,
      },
    },
    _sum: {
      totalGames: true,
    },
    _avg: {
      rating: true,
    },
  });

  const totalGames = aggregateResult._sum.totalGames || 0;
  const averageRating = Math.round(aggregateResult._avg.rating || 0);

  // Get most active player
  const mostActive = await prisma.user.findFirst({
    where: {
      totalGames: {
        gt: 0,
      },
    },
    select: {
      username: true,
      totalGames: true,
    },
    orderBy: {
      totalGames: "desc",
    },
  });

  // Get highest rated player
  const highestRated = await prisma.user.findFirst({
    where: {
      totalGames: {
        gt: 0,
      },
    },
    select: {
      username: true,
      rating: true,
    },
    orderBy: {
      rating: "desc",
    },
  });

  return {
    totalPlayers,
    totalGames,
    averageRating,
    mostActivePlayer: mostActive,
    highestRatedPlayer: highestRated,
  };
}

/**
 * Search players by username or email
 */
export async function searchPlayers(
  query: string,
  limit: number = 10,
): Promise<LeaderboardPlayer[]> {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          totalGames: {
            gt: 0,
          },
        },
        {
          OR: [
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      rating: true,
      wins: true,
      losses: true,
      draws: true,
      totalGames: true,
      lastGameAt: true,
    },
    orderBy: [{ rating: "desc" }, { wins: "desc" }],
    take: limit,
  });

  // Calculate ranks (approximate - based on rating)
  const players: LeaderboardPlayer[] = await Promise.all(
    users.map(async (user, index) => {
      // Count users with higher rating for accurate rank
      const usersAbove = await prisma.user.count({
        where: {
          totalGames: { gt: 0 },
          OR: [
            { rating: { gt: user.rating } },
            {
              rating: user.rating,
              wins: { gt: user.wins },
            },
          ],
        },
      });

      return {
        ...user,
        rank: usersAbove + 1,
        winRate: user.totalGames > 0 ? (user.wins / user.totalGames) * 100 : 0,
      };
    }),
  );

  return players;
}
