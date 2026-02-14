import { Copy, X, Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import toast from 'react-hot-toast';

interface CreateGameModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function CreateGameModal({ userId, userName, onClose }: CreateGameModalProps) {
    const { createGame, roomId, isOnline, isConnected } = useGameStore();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Only create game if we don't have a room yet AND we are connected
        if (!roomId && isConnected) {
            createGame(userId, userName);
        }
    }, [createGame, roomId, userId, userName, isConnected]);

    const copyToClipboard = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setCopied(true);
            toast.success('Room code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyLink = () => {
        if (roomId) {
            const url = `${window.location.origin}?room=${roomId}`;
            navigator.clipboard.writeText(url);
            toast.success('Game link copied!');
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

                <h2 className="text-2xl font-bold mb-6 text-center">Create Game</h2>

                <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-center">
                        <p className="text-gray-400 mb-2">Room Code</p>
                        {roomId ? (
                            <div
                                onClick={copyToClipboard}
                                className="text-4xl font-mono font-bold tracking-wider cursor-pointer hover:scale-105 transition-transform select-all text-blue-400"
                            >
                                {roomId}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-16 gap-2">
                                {!isConnected ? (
                                    <span className="text-yellow-500 text-sm">Connecting to server...</span>
                                ) : (
                                    <div className="animate-pulse h-8 w-32 bg-white/10 rounded"></div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            disabled={!roomId}
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>

                        <button
                            onClick={copyLink}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            disabled={!roomId}
                        >
                            <Share2 className="w-5 h-5" />
                            Share Link
                        </button>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-full text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                            Waiting for opponent...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
