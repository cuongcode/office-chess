'use client';

import { useGameStore } from '@/store/gameStore';
import { Chessboard } from 'react-chessboard';
import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Copy, Users, Flag, MessageSquare, LogOut, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import DrawOfferDialog from './DrawOfferDialog';
import GameOverModal from './GameOverModal';

interface ChessBoardProps {
    onLeave: () => void;
}

export default function ChessBoard({ onLeave }: ChessBoardProps) {
    const {
        fen,
        makeMove,
        boardOrientation,
        lastMove,
        chess,
        isOnline,
        roomId,
        playerColor,
        playerName,
        opponentName,
        isConnected,
        spectatorCount,
        turn,
        status,
        leaveGame,
        resign,
        offerDraw
    } = useGameStore();

    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    // Reset local state when game changes
    useEffect(() => {
        setSelectedSquare(null);
        setOptionSquares({});
    }, [roomId, fen]);

    function onDrop({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string | null }) {
        if (!targetSquare) return false;
        const moveResult = makeMove(sourceSquare, targetSquare);
        if (moveResult) {
            setSelectedSquare(null);
            setOptionSquares({});
        }
        return moveResult;
    }

    // Highlighting logic (same as before)
    function getMoveOptions(square: string) {
        const moves = chess.moves({
            square: square as Square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    chess.get(move.to as Square) && chess.get(move.to as Square)?.color !== chess.get(square as Square)?.color
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
        if (selectedSquare === square) {
            setSelectedSquare(null);
            setOptionSquares({});
            return;
        }

        if (selectedSquare) {
            const moveResult = makeMove(selectedSquare, square);
            if (moveResult) {
                setSelectedSquare(null);
                setOptionSquares({});
                return;
            }
        }

        const piece = chess.get(square as Square);
        if (piece && piece.color === chess.turn()) {
            // Allow selection if it's my turn/color or local game
            if (isOnline && playerColor !== 'spectator') {
                const isMyPiece = (playerColor === 'white' && piece.color === 'w') || (playerColor === 'black' && piece.color === 'b');
                if (!isMyPiece) return;
            }

            setSelectedSquare(square);
            getMoveOptions(square);
            return;
        }

        setSelectedSquare(null);
        setOptionSquares({});
    }

    const customSquareStyles = { ...optionSquares };
    if (lastMove) {
        customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
        customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            toast.success('Room code copied');
        }
    };

    const handleLeave = () => {
        if (window.confirm('Are you sure you want to leave the game?')) {
            leaveGame();
            onLeave();
        }
    };

    const getStatusText = () => {
        if (status === 'checkmate') return 'Checkmate';
        if (status === 'draw') return 'Draw';
        if (status === 'stalemate') return 'Stalemate';
        if (status === 'check') return 'Check!';
        if (isOnline) {
            if (playerColor === 'spectator') return `${turn === 'w' ? "White" : "Black"}'s turn`;
            const isMyTurn = (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
            return isMyTurn ? "Your turn" : "Opponent's turn";
        }
        return `${turn === 'w' ? "White" : "Black"}'s turn`;
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-[600px]">
            <DrawOfferDialog />
            <GameOverModal onReturnHome={onLeave} />

            {/* Header Info */}
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-4">
                    {isOnline && (
                        <div
                            onClick={copyRoomId}
                            className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 transition-colors"
                            title="Copy Room Code"
                        >
                            <span className="text-zinc-400 text-xs uppercase tracking-wider">Room</span>
                            <span className="font-mono font-bold text-blue-400">{roomId}</span>
                            <Copy className="w-3 h-3 text-zinc-500" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{spectatorCount}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'check' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                        {getStatusText()}
                    </div>
                    {isOnline && (
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
                    )}
                </div>
            </div>

            {/* Top Player (Opponent) */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <span className="text-zinc-400 text-xs font-bold">
                            {boardOrientation === 'white' ? 'B' : 'W'}
                        </span>
                    </div>
                    <div>
                        <div className="font-bold text-zinc-200">
                            {isOnline ? (opponentName || 'Waiting for opponent...') : 'Black'}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {isOnline && playerIdToColorMap(boardOrientation === 'white' ? 'black' : 'white')}
                        </div>
                    </div>
                </div>
                {/* Captured pieces could go here */}
            </div>

            {/* Board */}
            <div className="w-full aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-zinc-800 bg-zinc-900 relative group">
                <Chessboard
                    options={{
                        id: "MainBoard",
                        position: fen,
                        boardOrientation: boardOrientation,
                        onPieceDrop: onDrop,
                        onSquareClick: onSquareClick,
                        darkSquareStyle: { backgroundColor: '#71717a' },
                        lightSquareStyle: { backgroundColor: '#f4f4f5' },
                        squareStyles: customSquareStyles,
                        animationDurationInMs: 200,
                        allowDragging: !isOnline || (playerColor !== 'spectator' && ((playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b')))
                    }}
                />

                {/* Connection Overlay */}
                {isOnline && !isConnected && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <WifiOff className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-white">Disconnected</h3>
                        <p className="text-zinc-400">Trying to reconnect...</p>
                    </div>
                )}
            </div>

            {/* Bottom Player (You) */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                        <span className="text-blue-400 text-xs font-bold">
                            {boardOrientation === 'white' ? 'W' : 'B'}
                        </span>
                    </div>
                    <div>
                        <div className="font-bold text-white">
                            {isOnline ? (playerName || 'You') : 'White'}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {isOnline && playerIdToColorMap(boardOrientation)}
                        </div>
                    </div>
                </div>

                {isOnline && playerColor !== 'spectator' && (
                    <div className="flex gap-2">
                        <button
                            onClick={offerDraw}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Offer Draw"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { if (window.confirm('Resign game?')) resign(); }}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                            title="Resign"
                        >
                            <Flag className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            {isOnline && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave Game
                    </button>
                </div>
            )}
        </div>
    );
}

function playerIdToColorMap(color: string) {
    return color === 'white' ? 'White' : 'Black';
}
