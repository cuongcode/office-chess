import { X, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function DrawOfferDialog() {
    const { socket, roomId } = useGameStore();
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
        if (socket && roomId) {
            socket.emit('respond_draw', { roomId, accept });
            setShow(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-card border-2 border-yellow-500 rounded-xl shadow-2xl p-4 flex items-center gap-6">
                <div>
                    <h3 className="font-bold text-card-foreground text-lg">Draw Offered</h3>
                    <p className="text-muted-foreground text-sm">Your opponent offers a draw.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleRespond(true)}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                        title="Accept Draw"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleRespond(false)}
                        className="p-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors shadow-sm"
                        title="Decline Draw"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
