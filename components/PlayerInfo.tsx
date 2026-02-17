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
    clockOrientation
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
                        <div className="font-bold text-foreground">
                            {name}
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
