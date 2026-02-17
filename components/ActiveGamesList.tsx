import { useState, useEffect } from 'react';
import { Users, Eye, ArrowRight, RefreshCw, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface ActiveGame {
    roomId: string;
    whitePlayer: string;
    blackPlayer: string;
    spectatorCount: number;
    status: string;
}

interface ActiveGamesListProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export function ActiveGamesList({ userId, userName, onClose }: ActiveGamesListProps) {
    const [games, setGames] = useState<ActiveGame[]>([]);
    const [loading, setLoading] = useState(true);
    const { spectateGame } = useGameStore();

    const fetchGames = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/games/active');
            const data = await res.json();
            setGames(data);
        } catch (error) {
            console.error('Failed to fetch active games:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSpectate = (roomId: string) => {
        spectateGame(roomId, userId, userName);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full relative shadow-xl max-h-[80vh] flex flex-col text-card-foreground">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Active Games</h2>
                    <button
                        onClick={fetchGames}
                        className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {games.length === 0 && !loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No active games found. Create one!
                        </div>
                    ) : (
                        games.map((game) => (
                            <div
                                key={game.roomId}
                                className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border hover:border-muted-foreground/30 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <span className="text-card-foreground">{game.whitePlayer}</span>
                                        <span className="text-muted-foreground text-sm">vs</span>
                                        <span className="text-card-foreground">{game.blackPlayer}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> Room: {game.roomId}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" /> {game.spectatorCount}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${game.status === 'playing' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                            {game.status}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSpectate(game.roomId)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    Watch <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
