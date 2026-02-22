import { useState, useEffect } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from "@/components/ui/Button";

interface JoinGameModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export function JoinGameModal({ userId, userName, onClose }: JoinGameModalProps) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const { joinGame, joinError, clearJoinError, isOnline } = useGameStore();

    // Close modal on successful join
    useEffect(() => {
        if (isOnline && isJoining) {
            onClose();
        }
    }, [isOnline, isJoining, onClose]);

    // Clear loading state when error occurs
    useEffect(() => {
        if (joinError) {
            setIsJoining(false);
        }
    }, [joinError]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomIdInput.trim()) {
            setIsJoining(true);
            clearJoinError();
            joinGame(roomIdInput.trim().toUpperCase(), userId, userName);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomIdInput(e.target.value.toUpperCase());
        // Clear error when user starts typing
        if (joinError) {
            clearJoinError();
            setIsJoining(false);
        }
    };

    const handleClose = () => {
        clearJoinError();
        setIsJoining(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-8 max-w-md w-full relative shadow-xl text-card-fg-light dark:text-card-fg-dark">
                <button
                    onClick={handleClose}
                    className="absolute top-4 cursor-pointer right-4 text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Join Game</h2>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label htmlFor="roomId" className="block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark mb-2">
                            Room Code
                        </label>
                        <input
                            type="text"
                            id="roomId"
                            value={roomIdInput}
                            onChange={handleInputChange}
                            placeholder="Ex: A1B2C3"
                            className={`w-full bg-bg-light dark:bg-bg-dark border ${joinError ? 'border-destructive-light dark:border-destructive-dark' : 'border-input-light dark:border-input-dark'
                                } rounded-lg px-4 py-3 text-fg-light dark:text-fg-dark placeholder:text-muted-fg-light dark:placeholder:text-muted-fg-dark focus:outline-none focus:ring-2 ${joinError ? 'focus:ring-destructive-light dark:focus:ring-destructive-dark' : 'focus:ring-blue-500'
                                } font-mono text-center text-xl tracking-wider uppercase`}
                            autoFocus
                            maxLength={6}
                            disabled={isJoining}
                        />
                        {joinError && (
                            <div className="mt-2 flex items-start gap-2 text-destructive-light dark:text-destructive-dark text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{joinError}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={!roomIdInput.trim() || isJoining}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        {isJoining ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Joining...
                            </>
                        ) : (
                            <>
                                Join Game
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
