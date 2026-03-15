import { CapturedPieces } from "./CapturedPieces";
import { ChessClock } from "./ChessClock";
import { UserAvatar } from "./UserAvatar";

interface PlayerInfoProps {
  name: string;
  subLabel: string;
  avatarUrl?: string | null;
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
  avatarUrl,
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
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            size="h-8 w-8"
            isMe={isMe}
          />
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
