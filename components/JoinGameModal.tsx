import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface JoinGameModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function JoinGameModal({ userId, userName, onClose }: JoinGameModalProps) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const { joinGame } = useGameStore();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomIdInput.trim()) {
            joinGame(roomIdInput.trim().toUpperCase(), userId, userName);
            onClose(); // Ideally wait for success, but store handles error events mostly
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Join Game</h2>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-400 mb-2">
                            Room Code
                        </label>
                        <input
                            type="text"
                            id="roomId"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                            placeholder="Ex: A1B2C3"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-xl tracking-wider uppercase"
                            autoFocus
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!roomIdInput.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Game
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
