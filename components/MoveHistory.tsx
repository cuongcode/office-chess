'use client';

import { useGameStore } from '@/store/gameStore';
import { useRef, useEffect } from 'react';

export function MoveHistory() {
    const { history } = useGameStore();
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [history]);

    const moves = [];
    for (let i = 0; i < history.length; i += 2) {
        moves.push({
            number: Math.floor(i / 2) + 1,
            white: history[i],
            black: history[i + 1] || '',
        });
    }

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark flex flex-col h-[400px] md:h-[600px]">
            <div className="p-4 border-b border-border-light dark:border-border-dark bg-muted-light/50 dark:bg-muted-dark/50 rounded-t-lg">
                <h2 className="font-bold text-lg text-card-fg-light dark:text-card-fg-dark">Move History</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
                <div className="grid grid-cols-[3rem_1fr_1fr] gap-y-1 text-sm">
                    <div className="font-semibold text-muted-fg-light dark:text-muted-fg-dark pb-2 border-b border-border-light dark:border-border-dark">#</div>
                    <div className="font-semibold text-muted-fg-light dark:text-muted-fg-dark pb-2 border-b border-border-light dark:border-border-dark">White</div>
                    <div className="font-semibold text-muted-fg-light dark:text-muted-fg-dark pb-2 border-b border-border-light dark:border-border-dark">Black</div>

                    {moves.map((move) => (
                        <div key={move.number} className="contents group">
                            <div className="text-muted-fg-light dark:text-muted-fg-dark py-1 group-hover:bg-muted-light dark:group-hover:bg-muted-dark">{move.number}.</div>
                            <div className="text-card-fg-light dark:text-card-fg-dark py-1 font-medium group-hover:bg-muted-light dark:group-hover:bg-muted-dark">{move.white}</div>
                            <div className="text-card-fg-light dark:text-card-fg-dark py-1 font-medium group-hover:bg-muted-light dark:group-hover:bg-muted-dark">{move.black}</div>
                        </div>
                    ))}

                    {moves.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-muted-fg-light dark:text-muted-fg-dark italic">
                            Game hasn't started yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
