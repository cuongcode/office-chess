import { PlayerAvatar } from "./PlayerAvatar";
import { formatDate } from "./utils";
import type { GameData } from "./types";

export function GameHeader({
  game,
  resultInfo,
}: {
  game: GameData;
  resultInfo: { text: string; colorClass: string };
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-card-light p-5 shadow-sm dark:border-border-dark dark:bg-card-dark">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="mb-1 text-[10px] font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
            White
          </span>
          <PlayerAvatar player={game.whitePlayer} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${resultInfo.colorClass}`}
          >
            {resultInfo.text}
          </span>
          <span className="text-xl font-bold text-muted-fg-light dark:text-muted-fg-dark">
            vs
          </span>
          <span className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
            {formatDate(game.createdAt)}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="mb-1 text-[10px] font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
            Black
          </span>
          <PlayerAvatar player={game.blackPlayer} />
        </div>
      </div>
    </div>
  );
}
