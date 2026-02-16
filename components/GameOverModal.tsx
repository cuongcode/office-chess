import { Trophy, RefreshCw, Home } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface GameOverModalProps {
    onReturnHome: () => void;
}

export default function GameOverModal({ onReturnHome }: GameOverModalProps) {
    const { status, winner, playerColor, isOnline, leaveGame } = useGameStore();

    if (status === 'playing' || status === 'check') return null;

    const isWinner = winner && playerColor && (
        (winner === 'w' && playerColor === 'white') ||
        (winner === 'b' && playerColor === 'black')
    );

    const getTitle = () => {
        const isSpectator = playerColor === 'spectator';

        if (status === 'checkmate') {
            if (isOnline && !isSpectator) {
                return isWinner ? 'You Won!' : 'You Lost';
            }
            return winner === 'w' ? 'White Wins!' : 'Black Wins!';
        }
        if (status === 'draw') return 'Draw';
        if (status === 'stalemate') return 'Stalemate';
        if (status === 'resignation') {
            if (isOnline && !isSpectator) {
                return isWinner ? 'Opponent Resigned' : 'You Resigned';
            }
            return winner === 'w' ? 'White Wins (Resignation)' : 'Black Wins (Resignation)';
        }
        return 'Game Over';
    };

    const handleReturn = () => {
        if (isOnline) {
            leaveGame();
        }
        onReturnHome();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 text-card-foreground">
                <div className="flex justify-center mb-6">
                    {status === 'checkmate' || status === 'resignation' ? (
                        <Trophy className={`w-16 h-16 ${(isWinner || playerColor === 'spectator' || !isOnline) && winner ? 'text-yellow-500 drop-shadow-md' : 'text-muted-foreground'}`} />
                    ) : (
                        <div className="text-4xl">🤝</div>
                    )}
                </div>

                <h2 className="text-3xl font-black text-card-foreground mb-2 tracking-tight">{getTitle()}</h2>
                <p className="text-muted-foreground mb-8 font-medium uppercase tracking-widest text-sm">
                    {status === 'checkmate' ? 'Checkmate' : status}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleReturn}
                        className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Return to Lobby
                    </button>
                </div>
            </div>
        </div>
    );
}
