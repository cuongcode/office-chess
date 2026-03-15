"use client";

import { useRouter } from "next/navigation";

import { RankBadge } from "./RankBadge";
import { formatRelativeTime } from "@/lib/utils/date";

import { Player } from "@/types/player";
import { UserAvatar } from "./UserAvatar";

interface LeaderboardTableProps {
  players: Player[];
  currentUserId?: string;
  loading?: boolean;
}

export function LeaderboardTable({
  players,
  currentUserId,
  loading,
}: LeaderboardTableProps) {
  const router = useRouter();

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    // if (rating >= 401) return 'text-yellow-600 font-bold';
    // if (rating >= 301) return 'text-purple-600 font-semibold';
    // if (rating >= 201) return 'text-blue-600 font-semibold';
    // if (rating >= 101) return 'text-green-600 font-medium';
    return "text-fg-light dark:text-fg-dark";
  };

  // Get win rate color
  const getWinRateColor = (winRate: number) => {
    // if (winRate >= 70) return 'bg-green-500';
    // if (winRate >= 50) return 'bg-blue-500';
    // if (winRate >= 30) return 'bg-yellow-500';
    return "bg-success";
  };



  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
            <thead className="bg-muted-light/50 dark:bg-muted-dark/50">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg-light dark:text-muted-fg-dark uppercase tracking-wider">Rank</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Record
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Win Rate
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg-light dark:text-muted-fg-dark uppercase tracking-wider">Last Active</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  {/* <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td> */}
                  <td className="px-6 py-4">
                    <div className="bg-muted h-6 w-32 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-muted h-6 w-12 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-muted h-6 w-20 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-muted h-6 w-12 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-muted h-6 w-24 rounded"></div>
                  </td>
                  {/* <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-border-light bg-card-light p-12 text-center shadow dark:border-border-dark dark:bg-card-dark">
        {/* <div className="text-6xl mb-4">🏆</div> */}
        <h3 className="mb-2 text-lg font-medium text-card-fg-light dark:text-card-fg-dark">
          No players found
        </h3>
        <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
          Try switching to a different time filter
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden max-h-[calc(100vh-18rem)] overflow-y-auto rounded-lg border border-border-light bg-card-light md:block dark:border-border-dark dark:bg-card-dark">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="sticky top-0 z-10 bg-muted-light dark:bg-muted-dark">
            <tr>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Record
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Games
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Win Rate
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Active</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
            {players.map((player) => {
              const isCurrentUser = currentUserId === player.id;
              return (
                <tr
                  key={player.id}
                  onClick={() => router.push(`/profile/${player.id}`)}
                  className={`cursor-pointer transition-colors ${
                    isCurrentUser
                      ? "bg-primary-light/10 hover:bg-primary-light/20 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/20"
                      : "hover:bg-accent-light dark:hover:bg-accent-dark"
                  }`}
                >
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <RankBadge rank={player.rank} size="sm" />
                                        </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={player.username || player.name || player.email}
                        avatarUrl={player.avatar}
                        size="h-10 w-10"
                        isMe={isCurrentUser}
                      />
                      <div>
                        <p className="text-sm font-medium text-card-fg-light dark:text-card-fg-dark">
                          {player.username || player.name || player.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs font-semibold text-primary-light dark:text-primary-dark">
                              (You)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-lg ${getRatingColor(player.rating)}`}
                    >
                      {player.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-fg-light dark:text-muted-fg-dark">
                    <span className="font-medium text-success">
                      {player.wins}
                    </span>
                    {" - "}
                    <span className="font-medium text-destructive">
                      {player.losses}
                    </span>
                    {" - "}
                    <span className="text-muted-fg-light dark:text-muted-fg-dark">
                      {player.draws}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-fg-light dark:text-fg-dark">
                    {player.totalGames}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 flex-1 rounded-full bg-muted-light dark:bg-muted-dark">
                        <div
                          className={`h-2 rounded-full ${getWinRateColor(player.winRate)}`}
                          style={{ width: `${Math.min(player.winRate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm font-medium text-card-fg-light dark:text-card-fg-dark">
                        {player.winRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-fg-light dark:text-muted-fg-dark">
                                            {formatRelativeTime(player.lastGameAt, 'short')}
                                        </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {players.map((player) => {
          const isCurrentUser = currentUserId === player.id;
          return (
            <div
              key={player.id}
              onClick={() => router.push(`/profile/${player.id}`)}
              className={`cursor-pointer rounded-lg border border-border-light bg-card-light p-4 shadow transition-colors dark:border-border-dark dark:bg-card-dark ${
                isCurrentUser
                  ? "ring-2 ring-primary-light dark:ring-primary-dark"
                  : ""
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                {/* <RankBadge rank={player.rank} size="sm" /> */}
                <UserAvatar
                  name={player.username || player.name || player.email}
                  avatarUrl={player.avatar}
                  size="h-12 w-12"
                  isMe={isCurrentUser}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-fg-light dark:text-card-fg-dark">
                    {player.username || player.name || player.email}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-semibold text-primary-light dark:text-primary-dark">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className={`text-lg ${getRatingColor(player.rating)}`}>
                    {player.rating}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-fg-light dark:text-muted-fg-dark">
                    Games:
                  </span>
                  <span className="ml-1 font-medium text-card-fg-light dark:text-card-fg-dark">
                    {player.totalGames}
                  </span>
                </div>
                <div>
                  <span className="text-muted-fg-light dark:text-muted-fg-dark">
                    Win Rate:
                  </span>
                  <span className="ml-1 font-medium text-card-fg-light dark:text-card-fg-dark">
                    {player.winRate.toFixed(0)}%
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-fg-light dark:text-muted-fg-dark">
                    Record:
                  </span>
                  <span className="ml-1">
                    <span className="font-medium text-success">
                      {player.wins}
                    </span>
                    {" - "}
                    <span className="font-medium text-destructive">
                      {player.losses}
                    </span>
                    {" - "}
                    <span className="text-muted-fg-light dark:text-muted-fg-dark">
                      {player.draws}
                    </span>
                  </span>
                </div>
                {/* <div className="col-span-2 text-muted-fg-light dark:text-muted-fg-dark">
                                    Last active: {formatRelativeTime(player.lastGameAt, 'short')}
                                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
