'use client';

import { useGameStore } from '@/store/gameStore';
import { useRef, useEffect } from 'react';

export default function MoveHistory() {
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
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col h-[400px] md:h-[600px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-t-lg">
                <h2 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Move History</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
                <div className="grid grid-cols-[3rem_1fr_1fr] gap-y-1 text-sm">
                    <div className="font-semibold text-zinc-400 dark:text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">#</div>
                    <div className="font-semibold text-zinc-400 dark:text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">White</div>
                    <div className="font-semibold text-zinc-400 dark:text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Black</div>

                    {moves.map((move) => (
                        <div key={move.number} className="contents group">
                            <div className="text-zinc-500 dark:text-zinc-500 py-1 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50">{move.number}.</div>
                            <div className="text-zinc-800 dark:text-zinc-200 py-1 font-medium group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50">{move.white}</div>
                            <div className="text-zinc-800 dark:text-zinc-200 py-1 font-medium group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50">{move.black}</div>
                        </div>
                    ))}

                    {moves.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-zinc-400 dark:text-zinc-600 italic">
                            Game hasn't started yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
