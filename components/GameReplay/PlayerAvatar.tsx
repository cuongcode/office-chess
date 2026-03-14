import type { GamePlayer } from "./types";

export function PlayerAvatar({ player }: { player: GamePlayer }) {
  const name = player.username || player.name || "Unknown";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-light text-base font-bold ring-2 ring-border-light dark:bg-secondary-dark dark:ring-border-dark">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-fg-light dark:text-fg-dark">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="max-w-[80px] truncate text-center text-sm font-semibold text-fg-light dark:text-fg-dark">
        {name}
      </span>
    </div>
  );
}
