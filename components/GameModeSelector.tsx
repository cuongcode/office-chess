import { useState } from 'react';
import { Users, Globe, Play, Monitor } from 'lucide-react';

interface GameModeSelectorProps {
    onSelectLocal: () => void;
    onSelectCreateOnline: () => void;
    onSelectJoinOnline: () => void;
    onSelectActiveGames: () => void;
}

export default function GameModeSelector({
    onSelectLocal,
    onSelectCreateOnline,
    onSelectJoinOnline,
    onSelectActiveGames
}: GameModeSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <button
                onClick={onSelectLocal}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <Monitor className="w-12 h-12 mb-4 text-blue-500 group-hover:text-blue-400" />
                <h3 className="text-xl font-bold mb-2 text-card-foreground">Play Locally</h3>
                <p className="text-muted-foreground text-center">Play against a friend on this device</p>
            </button>

            <button
                onClick={onSelectCreateOnline}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <Globe className="w-12 h-12 mb-4 text-emerald-500 group-hover:text-emerald-400" />
                <h3 className="text-xl font-bold mb-2 text-card-foreground">Create Online Game</h3>
                <p className="text-muted-foreground text-center">Start a new room and invite a friend</p>
            </button>

            <button
                onClick={onSelectJoinOnline}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <Users className="w-12 h-12 mb-4 text-purple-500 group-hover:text-purple-400" />
                <h3 className="text-xl font-bold mb-2 text-card-foreground">Join Game</h3>
                <p className="text-muted-foreground text-center">Enter a room code to join a game</p>
            </button>

            <button
                onClick={onSelectActiveGames}
                className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent transition-all hover:scale-105 group"
            >
                <Users className="w-12 h-12 mb-4 text-orange-500 group-hover:text-orange-400" />
                <h3 className="text-xl font-bold mb-2 text-card-foreground">Active Games</h3>
                <p className="text-muted-foreground text-center">Spectate ongoing matches</p>
            </button>
        </div>
    );
}
