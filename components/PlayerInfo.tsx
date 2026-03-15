import { CapturedPieces } from "./CapturedPieces";
import { ChessClock } from "./ChessClock";

interface PlayerInfoProps {
  name: string;
  subLabel: string;
  avatarLabel: string;
  isMe: boolean;
  capturedPieces: string[];
  playerColor: "white" | "black";
  opponentCapturedPieces: string[];
  // Clock state
  showClock: boolean;
  clockOrientation: "top" | "bottom";
  // Ready state
  isReady?: boolean;
  showReadyStatus?: boolean;
}

export function PlayerInfo({
  name,
  subLabel,
  avatarLabel,
  isMe,
  capturedPieces,
  playerColor,
  opponentCapturedPieces,
  showClock,
  clockOrientation,
  isReady,
  showReadyStatus,
}: PlayerInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border ${
              isMe
                ? "border-primary-light bg-primary-light/10 dark:border-primary-dark dark:bg-primary-dark/10"
                : "border-border-light bg-muted-light dark:border-border-dark dark:bg-muted-dark"
            }`}
          >
            <span
              className={`text-xs font-bold ${isMe ? "text-primary-light dark:text-primary-dark" : "text-muted-fg-light dark:text-muted-fg-dark"}`}
            >
              {avatarLabel}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-fg-light dark:text-fg-dark">
              {name}
              {showReadyStatus && (
                <div
                  className={`h-2 w-2 rounded-full ${isReady ? "bg-success" : "bg-muted-fg-light"}`}
                  title={isReady ? "Ready" : "Not Ready"}
                />
              )}
            </div>
            <div className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
              {subLabel}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <CapturedPieces
          capturedPieces={capturedPieces}
          playerColor={playerColor}
          opponentCapturedPieces={opponentCapturedPieces}
        />
        {showClock && (
          <ChessClock
            playerColor={playerColor}
            playerName={name}
            orientation={clockOrientation}
          />
        )}
      </div>
    </div>
  );
}
