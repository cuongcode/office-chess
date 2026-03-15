import { Button } from "../ui";

export function MoveList({
  moveRows,
  currentMoveIndex,
  goToMove,
}: {
  moveRows: {
    number: number;
    white: string;
    whiteIdx: number;
    black: string;
    blackIdx: number;
  }[];
  currentMoveIndex: number;
  goToMove: (idx: number) => void;
}) {
  return (
    <div className="flex min-h-0 w-full flex-col rounded-2xl border border-border-light bg-card-light shadow-sm dark:border-border-dark dark:bg-card-dark">
      <div className="border-b border-border-light px-5 py-3 dark:border-border-dark">
        <h3 className="text-xs font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
          Move List
        </h3>
      </div>

      {moveRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-fg-light italic dark:text-muted-fg-dark">
          No moves recorded
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto lg:max-h-80">
          <div className="sticky top-0 grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 border-b border-border-light bg-secondary-light/50 px-3 py-2 dark:border-border-dark dark:bg-secondary-dark/30">
            <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
              #
            </span>
            <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
              White
            </span>
            <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
              Black
            </span>
          </div>

          {moveRows.map((row) => {
            const whiteActive = currentMoveIndex === row.whiteIdx;
            const blackActive = currentMoveIndex === row.blackIdx;
            return (
              <div
                key={row.number}
                className="grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 px-3"
              >
                <span className="self-center py-1.5 font-mono text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  {row.number}.
                </span>

                <Button
                  variant="unstyled"
                  size="none"
                  onClick={() => goToMove(row.whiteIdx)}
                  className={`cursor-pointer rounded-lg px-2 py-1.5 text-left font-mono text-sm duration-100 ${
                    whiteActive
                      ? "bg-primary-light font-semibold text-white dark:bg-primary-dark"
                      : "text-fg-light hover:bg-secondary-light dark:text-fg-dark dark:hover:bg-secondary-dark"
                  }`}
                >
                  {row.white}
                </Button>

                {row.black ? (
                  <Button
                    variant="unstyled"
                    size="none"
                    onClick={() => goToMove(row.blackIdx)}
                    className={`cursor-pointer rounded-lg px-2 py-1.5 text-left font-mono text-sm duration-100 ${
                      blackActive
                        ? "bg-primary-light font-semibold text-white dark:bg-primary-dark"
                        : "text-fg-light hover:bg-secondary-light dark:text-fg-dark dark:hover:bg-secondary-dark"
                    }`}
                  >
                    {row.black}
                  </Button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
