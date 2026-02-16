import { Copy, X, Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import toast from 'react-hot-toast';
import { TimeControlSelector } from './TimeControlSelector';
import { TimeControlPreset, timeControlPresets } from '@/lib/timeControls';

interface CreateGameModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function CreateGameModal({ userId, userName, onClose }: CreateGameModalProps) {
    const { createGame, roomId, isOnline, isConnected } = useGameStore();
    const [copied, setCopied] = useState(false);
    const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('random');
    const [gameCreated, setGameCreated] = useState(false);
    const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlPreset | null>(
        timeControlPresets.find(p => p.id === 'blitz-3-2') || null
    );

    useEffect(() => {
        // Only create game if we don't have a room yet AND we are connected AND user hasn't created yet
        if (!roomId && isConnected && gameCreated) {
            createGame(userId, userName, selectedColor, selectedTimeControl);
        }
    }, [createGame, roomId, userId, userName, isConnected, gameCreated, selectedColor, selectedTimeControl]);

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
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative shadow-xl text-card-foreground">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Create Game</h2>

                {!roomId ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-muted-foreground mb-3 text-center">Choose your color</p>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setSelectedColor('white')}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedColor === 'white'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 mx-auto mb-2 shadow-sm"></div>
                                    <p className="text-sm font-semibold">White</p>
                                </button>
                                <button
                                    onClick={() => setSelectedColor('black')}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedColor === 'black'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 mx-auto mb-2 shadow-sm"></div>
                                    <p className="text-sm font-semibold">Black</p>
                                </button>
                                <button
                                    onClick={() => setSelectedColor('random')}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedColor === 'random'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-800 border border-border mx-auto mb-2 shadow-sm"></div>
                                    <p className="text-sm font-semibold">Random</p>
                                </button>
                            </div>
                        </div>

                        {/* Time Control Selector */}
                        <div>
                            <TimeControlSelector
                                selectedPreset={selectedTimeControl}
                                onSelect={setSelectedTimeControl}
                            />
                        </div>

                        <button
                            onClick={() => setGameCreated(true)}
                            disabled={!isConnected}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {!isConnected ? 'Connecting...' : 'Create Game'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-muted p-6 rounded-xl border border-border text-center">
                            <p className="text-muted-foreground mb-2">Room Code</p>
                            <div
                                onClick={copyToClipboard}
                                className="text-4xl font-mono font-bold tracking-wider cursor-pointer hover:scale-105 transition-transform select-all text-blue-500"
                            >
                                {roomId}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied' : 'Copy Code'}
                            </button>

                            <button
                                onClick={copyLink}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Link
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full text-sm font-medium">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                                Waiting for opponent...
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
