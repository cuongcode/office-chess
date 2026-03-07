import { Check,Copy, Share2, X } from 'lucide-react';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/Button";
import { TimeControlPreset, timeControlPresets } from '@/lib/timeControls';
import { useGameStore } from '@/store/gameStore';

import { ColorPickerButton } from './ColorPickerButton';
import { TimeControlSelector } from './TimeControlSelector';

interface CreateGameModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export function CreateGameModal({ userId, userName, onClose }: CreateGameModalProps) {
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
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-8 max-w-md w-full relative text-card-fg-light dark:text-card-fg-dark">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-fg-light cursor-pointer dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">Create Game</h2>

                {!roomId ? (
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-muted-fg-light dark:text-muted-fg-dark mb-3 text-center">Choose your color</p>
                            <div className="grid grid-cols-3 gap-3">
                                {(['white', 'black', 'random'] as const).map((color) => (
                                    <ColorPickerButton
                                        key={color}
                                        color={color}
                                        isSelected={selectedColor === color}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Time Control Selector */}
                        <div>
                            <TimeControlSelector
                                selectedPreset={selectedTimeControl}
                                onSelect={setSelectedTimeControl}
                            />
                        </div>

                        <Button
                            onClick={() => setGameCreated(true)}
                            disabled={!isConnected}
                            className="w-full"
                        >
                            {!isConnected ? 'Connecting...' : 'Create Game'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-muted-light dark:bg-muted-dark p-6 rounded-xl border border-border-light dark:border-border-dark text-center">
                            <p className="text-muted-fg-light dark:text-muted-fg-dark mb-2">Room Code</p>
                            <div
                                onClick={copyToClipboard}
                                className="text-4xl font-mono font-bold tracking-wider cursor-pointer hover:scale-105 transition-transform select-all text-card-fg-light dark:text-card-fg-dark"
                            >
                                {roomId}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={copyToClipboard}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied' : 'Copy Code'}
                            </Button>

                            <Button
                                onClick={copyLink}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 !border-0 text-white"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Link
                            </Button>
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
