'use client';

import { Chess, Square } from 'chess.js';
import { Flag, Handshake,LogOut, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { useEffect,useState } from 'react';
import { Chessboard } from 'react-chessboard';
import toast from 'react-hot-toast';

import { useTheme } from "@/components/ThemeProvider";
import { useGameStore } from '@/store/gameStore';

import { CapturedPieces } from "./CapturedPieces";
import { ChessClock } from './ChessClock';
import { ConfirmationModal } from "./ConfirmationModal";
import { DrawOfferDialog } from "./DrawOfferDialog";
import { GameOverModal } from "./GameOverModal";
import { HeaderInfo } from "./HeaderInfo";
import { PlayerInfo } from "./PlayerInfo";

interface ChessBoardProps {
    onLeave: () => void;
}

export function ChessBoard({ onLeave }: ChessBoardProps) {
    const { theme } = useTheme();
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
                // Check if both players present
                if (!whitePlayerName || !blackPlayerName) return;

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
        <div className="flex flex-col gap-4 w-full max-w-[600px] m-auto px-2">
            <DrawOfferDialog />
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
            <div className="md:hidden">
                <HeaderInfo
                    roomId={roomId}
                    spectatorCount={spectatorCount}
                    status={status}
                    statusText={getStatusText()}
                    isOnline={isOnline}
                    isConnected={isConnected}
                    onCopyRoomId={copyRoomId}
                />
            </div>

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
                isReady={boardOrientation === 'white' ? blackReady : whiteReady}
                showReadyStatus={!!(isOnline && timeControl && timeControl.category !== 'unlimited')}
            />

            {/* Board */}
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark relative group">
                <Chessboard
                    options={{
                        id: "MainBoard",
                        position: fen,
                        boardOrientation: boardOrientation,
                        onPieceDrop: onDrop,
                        onSquareClick: onSquareClick,
                        darkSquareStyle: { backgroundColor: theme === 'dark' ? 'var(--color-board-dark-dark)' : 'var(--color-board-dark-light)' },
                        lightSquareStyle: { backgroundColor: theme === 'dark' ? 'var(--color-board-light-dark)' : 'var(--color-board-light-light)' },
                        squareStyles: customSquareStyles,
                        animationDurationInMs: 200,
                        allowDragging: !isOnline || (
                            !!whitePlayerName && !!blackPlayerName &&
                            playerColor !== 'spectator' &&
                            ((playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b'))
                        )
                    }}
                />

                {/* Ready Button Overlay */}
                {isOnline && playerColor !== 'spectator' && timeControl && timeControl.category !== 'unlimited' && whitePlayerName && blackPlayerName && !timerActive && (
                    ((playerColor === 'white' && !whiteReady) || (playerColor === 'black' && !blackReady)) && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                            <button
                                onClick={setPlayerReady}
                                className="px-8 py-4 bg-success text-success-fg-light font-bold text-xl rounded-xl hover:scale-105 transition-all animate-in fade-in zoom-in duration-300"
                            >
                                Ready
                            </button>
                        </div>
                    )
                )}

                {/* Connection Overlay */}
                {isOnline && !isConnected && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all">
                        <WifiOff className="w-12 h-12 text-destructive dark:text-destructive mb-4" />
                        <h3 className="text-xl font-bold text-fg-light dark:text-fg-dark">Disconnected</h3>
                        <p className="text-muted-fg-light dark:text-muted-fg-dark">Trying to reconnect...</p>
                    </div>
                )}
            </div>

            {/* Bottom Player (You) */}
            <PlayerInfo
                name={isOnline ? bottomPlayer.name : 'White'}
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
                isReady={boardOrientation === 'white' ? whiteReady : blackReady}
                showReadyStatus={!!(isOnline && timeControl && timeControl.category !== 'unlimited')}
            />

            {/* Game Over Banner or Controls */}
            {status !== 'playing' && status !== 'check' ? (
                <GameOverModal onReturnHome={onLeave} />
            ) : (
                <div className="flex items-center justify-end gap-2">
                    {isOnline && playerColor !== 'spectator' && (
                        <div className="flex gap-2">
                            <button
                                onClick={offerDraw}
                                className="flex items-center p-2 cursor-pointer text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark hover:bg-accent-light dark:hover:bg-accent-dark rounded transition-colors"
                                title="Offer Draw"
                            >
                                <Handshake className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleResign}
                                className="p-2 cursor-pointer text-muted-fg-light dark:text-muted-fg-dark hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                title="Resign"
                            >
                                <Flag className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    {/* Controls */}
                    {isOnline && (
                        <button
                            onClick={handleLeave}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-muted-light dark:bg-muted-dark hover:bg-destructive/10 text-muted-fg-light dark:text-muted-fg-dark hover:text-destructive rounded-lg text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave Game
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}