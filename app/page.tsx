'use client';

import ChessBoard from '@/components/ChessBoard';
import GameControls from '@/components/GameControls';
import GameStatus from '@/components/GameStatus';
import MoveHistory from '@/components/MoveHistory';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-2 flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center lg:hidden">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Chess</h1>
          </div>

          <GameStatus />

          <ChessBoard />

          <GameControls />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="hidden lg:block mb-4">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Chess</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Play against yourself or a friend.</p>
          </div>

          <MoveHistory />

          <div className="mt-auto text-center text-zinc-400 dark:text-zinc-600 text-sm">
            Built with Next.js, Tailwind, & Chess.js
          </div>
        </div>
      </div>
    </main>
  );
}
