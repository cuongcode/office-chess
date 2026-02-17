import { useState } from 'react';
import { Users, Globe, Play, Monitor } from 'lucide-react';

interface GameModeSelectorProps {
    onSelectLocal: () => void;
    onSelectCreateOnline: () => void;
    onSelectJoinOnline: () => void;
    onSelectActiveGames: () => void;
}

export function GameModeSelector({
    onSelectLocal,
    onSelectCreateOnline,
    onSelectJoinOnline,
    onSelectActiveGames
}: GameModeSelectorProps) {
    return (
        <div className="grid grid-cols-1 gap-6 w-full md:w-1/2 max-w-4xl">
            <button
                onClick={onSelectCreateOnline}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <h3 className="text-xl font-bold text-card-foreground">Create Game</h3>
            </button>

            <button
                onClick={onSelectJoinOnline}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <h3 className="text-xl font-bold text-card-foreground">Join Game</h3>
            </button>

            <button
                onClick={onSelectActiveGames}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <h3 className="text-xl font-bold text-card-foreground">Watch Games</h3>
            </button>
            <button
                onClick={onSelectLocal}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <h3 className="text-xl font-bold text-card-foreground">Chess Board</h3>
            </button>
        </div>
    );
}
