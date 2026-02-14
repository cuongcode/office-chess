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

export default function ActiveGamesList({ userId, userName, onClose }: ActiveGamesListProps) {
    const [games, setGames] = useState<ActiveGame[]>([]);
    const [loading, setLoading] = useState(true);
    const { joinGame } = useGameStore();

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
        joinGame(roomId, userId, userName);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative shadow-xl max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Active Games</h2>
                    <button
                        onClick={fetchGames}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {games.length === 0 && !loading ? (
                        <div className="text-center py-12 text-gray-500">
                            No active games found. Create one!
                        </div>
                    ) : (
                        games.map((game) => (
                            <div
                                key={game.roomId}
                                className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <div className="font-bold text-lg mb-1">
                                        <span className="text-white">{game.whitePlayer}</span>
                                        <span className="text-gray-500 mx-2">vs</span>
                                        <span className="text-white">{game.blackPlayer}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> Room: {game.roomId}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" /> {game.spectatorCount}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${game.status === 'playing' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {game.status}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSpectate(game.roomId)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
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
