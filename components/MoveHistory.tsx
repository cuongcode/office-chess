"use client";

import { useEffect, useRef } from "react";

import { useGameStore } from "@/store/gameStore";

export function MoveHistory() {
  const moveHistory = useGameStore((state) => state.moveHistory);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const moves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    moves.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || "",
    });
  }

  return (
    <div className="flex h-[400px] flex-col rounded-lg border border-border-light bg-card-light shadow-lg md:h-[600px] dark:border-border-dark dark:bg-card-dark">
      <div className="rounded-t-lg border-b border-border-light bg-muted-light/50 p-4 dark:border-border-dark dark:bg-muted-dark/50">
        <h2 className="text-lg font-bold text-card-fg-light dark:text-card-fg-dark">
          Move History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
        <div className="grid grid-cols-[3rem_1fr_1fr] gap-y-1 text-sm">
          <div className="border-b border-border-light pb-2 font-semibold text-muted-fg-light dark:border-border-dark dark:text-muted-fg-dark">
            #
          </div>
          <div className="border-b border-border-light pb-2 font-semibold text-muted-fg-light dark:border-border-dark dark:text-muted-fg-dark">
            White
          </div>
          <div className="border-b border-border-light pb-2 font-semibold text-muted-fg-light dark:border-border-dark dark:text-muted-fg-dark">
            Black
          </div>

          {moves.map((move) => (
            <div key={move.number} className="group contents">
              <div className="py-1 text-muted-fg-light group-hover:bg-muted-light dark:text-muted-fg-dark dark:group-hover:bg-muted-dark">
                {move.number}.
              </div>
              <div className="py-1 font-medium text-card-fg-light group-hover:bg-muted-light dark:text-card-fg-dark dark:group-hover:bg-muted-dark">
                {move.white}
              </div>
              <div className="py-1 font-medium text-card-fg-light group-hover:bg-muted-light dark:text-card-fg-dark dark:group-hover:bg-muted-dark">
                {move.black}
              </div>
            </div>
          ))}

          {moves.length === 0 && (
            <div className="col-span-3 py-8 text-center text-muted-fg-light italic dark:text-muted-fg-dark">
              Game hasn't started yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
