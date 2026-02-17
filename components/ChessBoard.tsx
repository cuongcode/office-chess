'use client';

import { useGameStore } from '@/store/gameStore';
import { Chessboard } from 'react-chessboard';
import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Flag, MessageSquare, LogOut, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { DrawOfferDialog } from "./DrawOfferDialog";
import { GameOverModal } from "./GameOverModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { ChessClock } from './ChessClock';
import { CapturedPieces } from "./CapturedPieces";
import { HeaderInfo } from "./HeaderInfo";
import { PlayerInfo } from "./PlayerInfo";

interface ChessBoardProps {
    onLeave: () => void;
}

export function ChessBoard({ onLeave }: ChessBoardProps) {
    const {
        fen,
        makeMove,
        boardOrientation,
        lastMove,
        chess,
        isOnline,
        roomId,
        playerColor,
        whitePlayerName,
        blackPlayerName,
        isConnected,
        spectatorCount,
        turn,
        status,
        leaveGame,
        resign,
        offerDraw,
        timeControl,
        whiteTimeLeft,
        blackTimeLeft,
        activeTimerColor,
        timerActive,
        whiteReady,
        blackReady,
        setPlayerReady,
        capturedPieces
    } = useGameStore();

    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

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
            if (isOnline) {
                if (playerColor === 'spectator') return;

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
        setConfirmModal({
            isOpen: true,
            title: 'Leave Game',
            message: 'Are you sure you want to leave the game? You will lose your current position.',
            onConfirm: () => {
                leaveGame();
                onLeave();
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => { } });
            },
        });
    };

    const handleResign = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Resign Game',
            message: 'Are you sure you want to resign? This will end the game and count as a loss.',
            onConfirm: () => {
                resign();
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => { } });
            },
        });
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

    // Helper to determine names based on orientation
    const getTopPlayerInfo = () => {
        if (boardOrientation === 'white') {
            // Top is Black
            return {
                name: blackPlayerName || 'Waiting for opponent...',
                colorLabel: 'Black',
                isMe: playerColor === 'black'
            };
        } else {
            // Top is White
            return {
                name: whitePlayerName || 'Waiting for opponent...',
                colorLabel: 'White',
                isMe: playerColor === 'white'
            };
        }
    };

    const getBottomPlayerInfo = () => {
        if (boardOrientation === 'white') {
            // Bottom is White
            return {
                name: whitePlayerName || 'Waiting...',
                colorLabel: 'White',
                isMe: playerColor === 'white'
            };
        } else {
            // Bottom is Black
            return {
                name: blackPlayerName || 'Waiting...',
                colorLabel: 'Black',
                isMe: playerColor === 'black'
            };
        }
    };

    const topPlayer = getTopPlayerInfo();
    const bottomPlayer = getBottomPlayerInfo();

    return (
        <div className="flex flex-col gap-4 w-full max-w-[600px] items-center">
            <DrawOfferDialog />
            <GameOverModal onReturnHome={onLeave} />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirm"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
            />

            {/* Header Info */}
            <HeaderInfo
                roomId={roomId}
                spectatorCount={spectatorCount}
                status={status}
                statusText={getStatusText()}
                isOnline={isOnline}
                isConnected={isConnected}
                onCopyRoomId={copyRoomId}
            />

            {/* Top Player (Opponent) */}
            {/* Top Player (Opponent) */}
            <PlayerInfo
                name={isOnline ? topPlayer.name : 'Black'}
                subLabel={isOnline && topPlayer.colorLabel ? topPlayer.colorLabel : ''}
                avatarLabel={boardOrientation === 'white' ? 'B' : 'W'}
                isMe={topPlayer.isMe}
                capturedPieces={boardOrientation === 'white' ? capturedPieces.black : capturedPieces.white}
                playerColor={boardOrientation === 'white' ? 'black' : 'white'}
                opponentCapturedPieces={boardOrientation === 'white' ? capturedPieces.white : capturedPieces.black}
                showClock={!!(timeControl && timeControl.category !== 'unlimited')}
                timeLeft={boardOrientation === 'white' ? blackTimeLeft : whiteTimeLeft}
                isActive={activeTimerColor === (boardOrientation === 'white' ? 'black' : 'white')}
                isPaused={!timerActive}
                increment={timeControl ? timeControl.increment : 0}
                clockOrientation="top"
            />



            {/* Board */}
            <div className="w-full aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-card bg-card relative group">
                <Chessboard
                    options={{
                        id: "MainBoard",
                        position: fen,
                        boardOrientation: boardOrientation,
                        onPieceDrop: onDrop,
                        onSquareClick: onSquareClick,
                        darkSquareStyle: { backgroundColor: 'var(--board-dark)' },
                        lightSquareStyle: { backgroundColor: 'var(--board-light)' },
                        squareStyles: customSquareStyles,
                        animationDurationInMs: 200,
                        allowDragging: !isOnline || (playerColor !== 'spectator' && ((playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b')))
                    }}
                />

                {/* Connection Overlay */}
                {isOnline && !isConnected && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all">
                        <WifiOff className="w-12 h-12 text-destructive mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Disconnected</h3>
                        <p className="text-muted-foreground">Trying to reconnect...</p>
                    </div>
                )}
            </div>



            {/* Bottom Player (You) */}
            {/* Bottom Player (You) */}
            <PlayerInfo
                name={isOnline ? (bottomPlayer.isMe ? `${bottomPlayer.name} (You)` : bottomPlayer.name) : 'White'}
                subLabel={isOnline && bottomPlayer.colorLabel ? bottomPlayer.colorLabel : ''}
                avatarLabel={boardOrientation === 'white' ? 'W' : 'B'}
                isMe={bottomPlayer.isMe}
                capturedPieces={boardOrientation === 'white' ? capturedPieces.white : capturedPieces.black}
                playerColor={boardOrientation === 'white' ? 'white' : 'black'}
                opponentCapturedPieces={boardOrientation === 'white' ? capturedPieces.black : capturedPieces.white}
                showClock={!!(timeControl && timeControl.category !== 'unlimited')}
                timeLeft={boardOrientation === 'white' ? whiteTimeLeft : blackTimeLeft}
                isActive={activeTimerColor === (boardOrientation === 'white' ? 'white' : 'black')}
                isPaused={!timerActive}
                increment={timeControl ? timeControl.increment : 0}
                clockOrientation="bottom"
            />
            {isOnline && playerColor !== 'spectator' && (
                <div className="flex gap-2">
                    <button
                        onClick={offerDraw}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                        title="Offer Draw"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleResign}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Resign"
                    >
                        <Flag className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Ready Button Section */}
            {isOnline && playerColor !== 'spectator' && timeControl && timeControl.category !== 'unlimited' && whitePlayerName && blackPlayerName && !timerActive && (
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Ready Status</h3>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">White:</span>
                                    {whiteReady ? (
                                        <span className="text-success flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Ready
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Not Ready</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Black:</span>
                                    {blackReady ? (
                                        <span className="text-success flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Ready
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Not Ready</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {((playerColor === 'white' && !whiteReady) || (playerColor === 'black' && !blackReady)) && (
                            <button
                                onClick={setPlayerReady}
                                className="px-6 py-2 bg-success hover:bg-success/90 text-success-foreground font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                            >
                                I'm Ready
                            </button>
                        )}

                        {((playerColor === 'white' && whiteReady) || (playerColor === 'black' && blackReady)) && (
                            <div className="text-sm text-muted-foreground italic">
                                Waiting for opponent...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls */}
            {isOnline && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave Game
                    </button>
                </div>
            )}
        </div>
    );
}