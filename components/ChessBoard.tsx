'use client';

import { useGameStore } from '@/store/gameStore';
import { Chessboard } from 'react-chessboard';

export default function ChessBoard() {
    const { fen, makeMove, boardOrientation } = useGameStore();

    const options = {
        position: fen,
        boardOrientation: boardOrientation,
        onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string | null }) => {
            if (!targetSquare) return false;
            return makeMove(sourceSquare, targetSquare);
        },
        customDarkSquareStyle: { backgroundColor: '#71717a' }, // zinc-500
        customLightSquareStyle: { backgroundColor: '#f4f4f5' }, // zinc-100
        animationDurationInMs: 200,
    };

    return (
        <div className="w-full max-w-[600px] aspect-square shadow-xl rounded-lg overflow-hidden border-4 border-zinc-800 bg-zinc-900">
            <Chessboard options={options} />
        </div>
    );
}
