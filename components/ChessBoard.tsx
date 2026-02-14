'use client';

import { useGameStore } from '@/store/gameStore';
import { Chessboard } from 'react-chessboard';
import { useState } from 'react';
import { Chess, Square } from 'chess.js';

export default function ChessBoard() {
    const { fen, makeMove, boardOrientation, lastMove, chess } = useGameStore();
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    function onDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) {
        if (!targetSquare) return false;
        const moveResult = makeMove(sourceSquare, targetSquare);
        if (moveResult) {
            setSelectedSquare(null);
            setOptionSquares({});
        }
        return moveResult;
    }

    function getMoveOptions(square: string) {
        // Validate if square is actually a Square
        if (!isValidSquare(square)) return false;

        const moves = chess.moves({
            square: square as Square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};
        const sourcePiece = chess.get(square as Square);

        moves.map((move) => {
            const targetPiece = chess.get(move.to as Square);
            newSquares[move.to] = {
                background:
                    targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%',
            };
            return move;
        });
        newSquares[square] = {
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
        };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick({ square }: { square: string }) {
        // Click to move logic
        if (selectedSquare === square) {
            setSelectedSquare(null);
            setOptionSquares({});
            return;
        }

        // Attempt to move if a square was already selected
        if (selectedSquare) {
            // Check if clicked square is a valid option
            // Optimistic check: if it's in optionSquares (except self)?
            // Or just try move.
            const moveResult = makeMove(selectedSquare, square);
            if (moveResult) {
                setSelectedSquare(null);
                setOptionSquares({});
                return;
            }
        }

        // Select new piece
        if (!isValidSquare(square)) return;

        const piece = chess.get(square as Square);
        if (piece && piece.color === chess.turn()) {
            setSelectedSquare(square);
            getMoveOptions(square);
            return;
        }

        // Deselect if clicking empty or invalid
        setSelectedSquare(null);
        setOptionSquares({});
    }

    function isValidSquare(square: string): boolean {
        return true;
    }

    // Combine optionSquares with lastMove highlights
    const customSquareStyles = { ...optionSquares };
    if (lastMove) {
        if (!customSquareStyles[lastMove.from]) {
            customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
        }
        if (!customSquareStyles[lastMove.to]) {
            customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
        }
    }

    const options = {
        id: "BasicBoard",
        position: fen,
        boardOrientation: boardOrientation,
        onPieceDrop: onDrop,
        onSquareClick: onSquareClick,
        darkSquareStyle: { backgroundColor: '#71717a' }, // zinc-500
        lightSquareStyle: { backgroundColor: '#f4f4f5' }, // zinc-100
        squareStyles: customSquareStyles,
        animationDurationInMs: 200,
    };

    return (
        <div className="w-full max-w-[600px] aspect-square shadow-xl rounded-lg overflow-hidden border-4 border-zinc-800 bg-zinc-900">
            <Chessboard options={options} />
        </div>
    );
}
