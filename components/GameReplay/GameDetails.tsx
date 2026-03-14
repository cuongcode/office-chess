import { formatDuration, formatResultMethod } from "./utils";
import type { GameData } from "./types";

export function GameDetails({
  game,
  totalMoves,
}: {
  game: GameData;
  totalMoves: number;
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-card-light p-5 shadow-sm dark:border-border-dark dark:bg-card-dark">
      <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
        Game Details
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {game.opening && (
          <>
            <dt className="col-span-2 text-xs text-muted-fg-light sm:col-span-1 dark:text-muted-fg-dark">
              Opening
            </dt>
            <dd
              className="col-span-2 truncate text-sm font-medium text-fg-light sm:col-span-1 dark:text-fg-dark"
              title={game.opening}
            >
              {game.opening}
            </dd>
          </>
        )}
        <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
          Time Control
        </dt>
        <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
          {game.timeControl === "unlimited" ? "∞ Unlimited" : game.timeControl}
        </dd>
        <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
          Total Moves
        </dt>
        <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
          {totalMoves}
        </dd>
        <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
          Duration
        </dt>
        <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
          {formatDuration(game.duration)}
        </dd>
        <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
          Result
        </dt>
        <dd className="text-sm font-medium text-fg-light capitalize dark:text-fg-dark">
          {formatResultMethod(game.resultMethod)}
        </dd>
      </dl>
    </div>
  );
}
