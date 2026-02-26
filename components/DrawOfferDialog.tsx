import { X, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function DrawOfferDialog() {
    const { socket, roomId, acceptDraw } = useGameStore();
    const [show, setShow] = useState(false);
    const [opponentColor, setOpponentColor] = useState<string>('');

    useEffect(() => {
        if (!socket) return;

        const handleDrawOffer = ({ color }: { color: string }) => {
            setOpponentColor(color);
            setShow(true);
        };

        const handleDrawDeclined = () => {
            toast.error('Draw offer declined');
            setShow(false);
        };

        socket.on('draw_offered', handleDrawOffer);
        socket.on('draw_declined', handleDrawDeclined);

        return () => {
            socket.off('draw_offered', handleDrawOffer);
            socket.off('draw_declined', handleDrawDeclined);
        };
    }, [socket]);

    const handleRespond = (accept: boolean) => {
        if (accept) {
            // Use store action so status is frozen immediately on both clients
            acceptDraw();
        } else if (socket && roomId) {
            socket.emit('respond_draw', { roomId, accept: false });
        }
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-card-light dark:bg-card-dark border-2 border-yellow-500 rounded-xl p-4 flex items-center gap-6 flex flex-col">
                <div>
                    <h3 className="font-bold text-card-fg-light dark:text-card-fg-dark text-lg">Draw Offered</h3>
                    <p className="text-muted-fg-light dark:text-muted-fg-dark text-sm">Your opponent offers a draw.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleRespond(true)}
                        className="p-2 bg-success hover:bg-success/80 text-white rounded-lg transition-colors cursor-pointer"
                        title="Accept Draw"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleRespond(false)}
                        className="p-2 bg-destructive dark:bg-destructive/80 hover:opacity-90 text-destructive-fg-light dark:text-destructive-fg-dark rounded-lg transition-colors cursor-pointer"
                        title="Decline Draw"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
