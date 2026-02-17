import { ChessClock } from './ChessClock';
import { CapturedPieces } from './CapturedPieces';

interface PlayerInfoProps {
    name: string;
    subLabel: string;
    avatarLabel: string;
    isMe: boolean;
    capturedPieces: string[];
    playerColor: 'white' | 'black';
    opponentCapturedPieces: string[];
    // Clock props
    showClock: boolean;
    timeLeft: number;
    isActive: boolean;
    isPaused: boolean;
    increment: number;
    clockOrientation: 'top' | 'bottom';
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
    timeLeft,
    isActive,
    isPaused,
    increment,
    clockOrientation,
    isReady,
    showReadyStatus
}: PlayerInfoProps) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isMe
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-muted border-border'
                        }`}>
                        <span className={`text-xs font-bold ${isMe ? 'text-blue-500' : 'text-muted-foreground'}`}>
                            {avatarLabel}
                        </span>
                    </div>
                    <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                            {name}
                            {showReadyStatus && (
                                <div
                                    className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-zinc-600'}`}
                                    title={isReady ? 'Ready' : 'Not Ready'}
                                />
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {subLabel}
                        </div>
                    </div>
                </div>
                <CapturedPieces
                    capturedPieces={capturedPieces}
                    playerColor={playerColor}
                    opponentCapturedPieces={opponentCapturedPieces}
                />
            </div>
            {/* Clock */}
            {showClock && (
                <ChessClock
                    timeLeft={timeLeft}
                    playerName={name}
                    isActive={isActive}
                    increment={increment}
                    isPaused={isPaused}
                    orientation={clockOrientation}
                />
            )}
        </div>
    );
}
