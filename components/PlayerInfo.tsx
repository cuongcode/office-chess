import { CapturedPieces } from './CapturedPieces';
import { ChessClock } from './ChessClock';

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
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isMe
                        ? 'bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark'
                        : 'bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark'
                        }`}>
                        <span className={`text-xs font-bold ${isMe ? 'text-primary-light dark:text-primary-dark' : 'text-muted-fg-light dark:text-muted-fg-dark'}`}>
                            {avatarLabel}
                        </span>
                    </div>
                    <div>
                        <div className="font-bold text-fg-light dark:text-fg-dark flex items-center gap-2">
                            {name}
                            {showReadyStatus && (
                                <div
                                    className={`w-2 h-2 rounded-full ${isReady ? 'bg-success' : 'bg-muted-fg-light'}`}
                                    title={isReady ? 'Ready' : 'Not Ready'}
                                />
                            )}
                        </div>
                        <div className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                            {subLabel}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-4'>
                <CapturedPieces
                    capturedPieces={capturedPieces}
                    playerColor={playerColor}
                    opponentCapturedPieces={opponentCapturedPieces}
                />
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
        </div>
    );
}
