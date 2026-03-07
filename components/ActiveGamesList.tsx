import { ArrowRight, Eye, RefreshCw, Users, X } from 'lucide-react';
import { useEffect,useState } from 'react';

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
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-8 max-w-2xl w-full relative shadow-xl max-h-[80vh] flex flex-col text-card-fg-light dark:text-card-fg-dark">
                <button
                    onClick={onClose}
                    className="absolute top-4 cursor-pointer right-4 text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center mb-6 gap-6">
                    <h2 className="text-2xl font-bold">Active Games</h2>
                    <button
                        onClick={fetchGames}
                        className="p-2 bg-muted-light/50 cursor-pointer dark:bg-muted-dark/50 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {games.length === 0 && !loading ? (
                        <div className="text-center py-12 text-muted-fg-light dark:text-muted-fg-dark">
                            No active games found. Create one!
                        </div>
                    ) : (
                        games.map((game) => (
                            <div
                                key={game.roomId}
                                className="flex items-center justify-between bg-muted-light/30 dark:bg-muted-dark/30 p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-muted-fg-light/30 dark:hover:border-muted-fg-dark/30 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <span className="text-card-fg-light dark:text-card-fg-dark">{game.whitePlayer}</span>
                                        <span className="text-muted-fg-light dark:text-muted-fg-dark text-sm">vs</span>
                                        <span className="text-card-fg-light dark:text-card-fg-dark">{game.blackPlayer}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-fg-light dark:text-muted-fg-dark">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> Room: {game.roomId}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" /> {game.spectatorCount}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${game.status === 'playing' ? 'bg-success/20 text-success' : 'bg-muted-light dark:bg-muted-dark text-muted-fg-light dark:text-muted-fg-dark'}`}>
                                            {game.status}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSpectate(game.roomId)}
                                    className="px-4 py-2 bg-primary-light dark:bg-primary-dark hover:opacity-90 text-primary-fg-light dark:text-primary-fg-dark rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
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
