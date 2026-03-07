import { Globe, Monitor, Play, Users } from "lucide-react";
import { useState } from "react";

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
      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-border-light bg-card-light p-4 hover:scale-105 hover:bg-accent-light dark:border-border-dark dark:bg-card-dark dark:hover:bg-accent-dark"
    >
      <h3 className="text-xl font-bold text-card-fg-light dark:text-card-fg-dark">
        {label}
      </h3>
    </button>
  );
}

export function GameModeSelector({
  onSelectLocal,
  onSelectCreateOnline,
  onSelectJoinOnline,
  onSelectActiveGames,
}: GameModeSelectorProps) {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:w-1/2">
      <GameModeButton onClick={onSelectCreateOnline} label="Create Game" />
      <GameModeButton onClick={onSelectJoinOnline} label="Join Game" />
      <GameModeButton onClick={onSelectActiveGames} label="Watch Games" />
      <GameModeButton onClick={onSelectLocal} label="Chess Board" />
    </div>
  );
}
