import { useState } from 'react';
import { Users, Globe, Play, Monitor } from 'lucide-react';

interface GameModeSelectorProps {
    onSelectLocal: () => void;
    onSelectCreateOnline: () => void;
    onSelectJoinOnline: () => void;
    onSelectActiveGames: () => void;
}

interface GameModeButtonProps {
    onClick: () => void;
    label: string;
}

function GameModeButton({ onClick, label }: GameModeButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl hover:bg-accent-light dark:hover:bg-accent-dark hover:scale-105 group"
        >
            <h3 className="text-xl font-bold text-card-fg-light dark:text-card-fg-dark">{label}</h3>
        </button>
    );
}

export function GameModeSelector({
    onSelectLocal,
    onSelectCreateOnline,
    onSelectJoinOnline,
    onSelectActiveGames
}: GameModeSelectorProps) {
    return (
        <div className="grid grid-cols-1 gap-6 w-full md:w-1/2 max-w-4xl">
            <GameModeButton onClick={onSelectCreateOnline} label="Create Game" />
            <GameModeButton onClick={onSelectJoinOnline} label="Join Game" />
            <GameModeButton onClick={onSelectActiveGames} label="Watch Games" />
            <GameModeButton onClick={onSelectLocal} label="Chess Board" />
        </div>
    );
}
