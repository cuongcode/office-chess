'use client';

interface CapturedPiecesProps {
    capturedPieces: string[];
    playerColor: 'white' | 'black';
    opponentCapturedPieces: string[];
}

// Piece values for point calculation
const PIECE_VALUES: Record<string, number> = {
    'p': 1, // Pawn
    'n': 3, // Knight
    'b': 3, // Bishop
    'r': 5, // Rook
    'q': 9, // Queen
    'k': 0  // King (shouldn't be captured but just in case)
};

// Unicode symbols for chess pieces
const PIECE_SYMBOLS: Record<string, string> = {
    'p': '♟', // Black pawn
    'n': '♞', // Black knight
    'b': '♝', // Black bishop
    'r': '♜', // Black rook
    'q': '♛', // Black queen
    'k': '♚'  // Black king
};

const WHITE_PIECE_SYMBOLS: Record<string, string> = {
    'p': '♙', // White pawn
    'n': '♘', // White knight
    'b': '♗', // White bishop
    'r': '♖', // White rook
    'q': '♕', // White queen
    'k': '♔'  // White king
};

export default function CapturedPieces({ capturedPieces, playerColor, opponentCapturedPieces }: CapturedPiecesProps) {
    // Calculate points
    const myPoints = capturedPieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);
    const opponentPoints = opponentCapturedPieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);
    const pointDifference = myPoints - opponentPoints;

    // Get the correct symbols based on what was captured
    // If I'm white and I captured pieces, I captured black pieces
    const symbols = playerColor === 'white' ? PIECE_SYMBOLS : WHITE_PIECE_SYMBOLS;

    return (
        <div className="flex items-center gap-2">
            {/* Captured pieces display */}
            <div className="flex items-center gap-0.5 min-h-[20px]">
                {capturedPieces.length > 0 ? (
                    capturedPieces.map((piece, index) => (
                        <span
                            key={index}
                            className="text-zinc-400 text-sm"
                            title={`Captured ${piece.toLowerCase()}`}
                        >
                            {symbols[piece.toLowerCase()]}
                        </span>
                    ))
                ) : (
                    <span className="text-zinc-600 text-xs italic">None</span>
                )}
            </div>

            {/* Point difference - only show if positive (player is ahead) */}
            {pointDifference > 0 && (
                <div className="text-xs font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    +{pointDifference}
                </div>
            )}
        </div>
    );
}
