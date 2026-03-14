import { NavButton } from "./NavButton";

export function NavigationControls({
  currentMoveIndex,
  totalMoves,
  goToStart,
  goToPrev,
  goToNext,
  goToEnd,
}: {
  currentMoveIndex: number;
  totalMoves: number;
  goToStart: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToEnd: () => void;
}) {
  const atStart = currentMoveIndex === 0;
  const atEnd = currentMoveIndex === totalMoves;
  return (
    <div className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2 rounded-2xl border border-border-light bg-card-light px-4 py-3 shadow-sm lg:mx-0 dark:border-border-dark dark:bg-card-dark">
      <NavButton onClick={goToStart} disabled={atStart} title="Go to start (Home)">
        ⏮
      </NavButton>
      <NavButton onClick={goToPrev} disabled={atStart} title="Previous move (←)">
        ◀
      </NavButton>

      <div className="flex-1 text-center text-sm text-muted-fg-light select-none dark:text-muted-fg-dark">
        <span className="font-semibold text-fg-light dark:text-fg-dark">
          {currentMoveIndex}
        </span>
        <span className="mx-1">/</span>
        <span>{totalMoves}</span>
      </div>

      <NavButton onClick={goToNext} disabled={atEnd} title="Next move (→)">
        ▶
      </NavButton>
      <NavButton onClick={goToEnd} disabled={atEnd} title="Go to end (End)">
        ⏭
      </NavButton>
    </div>
  );
}
