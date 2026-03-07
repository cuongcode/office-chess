'use client';

import { defaultPieces } from 'react-chessboard';

import { useTheme } from '@/components/ThemeProvider';

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
    'k': 0  // King
};

// Map piece letter to react-chessboard uppercase code
const PIECE_CODE: Record<string, string> = {
    'p': 'P',
    'n': 'N',
    'b': 'B',
    'r': 'R',
    'q': 'Q',
    'k': 'K',
};

export function CapturedPieces({ capturedPieces, playerColor, opponentCapturedPieces }: CapturedPiecesProps) {
    const { theme } = useTheme();

    // Uniform fill: light on dark theme, dark on light theme
    const fill = theme === 'dark' ? '#d1d5db' : '#1f2937';

    // Calculate points
    const myPoints = capturedPieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);
    const opponentPoints = opponentCapturedPieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);
    const pointDifference = myPoints - opponentPoints;

    return (
        <div className="flex items-center gap-2">
            {/* Point difference - only show if positive (player is ahead) */}
            {pointDifference > 0 && (
                <div className="text-sm font-bold px-1.5 py-0.5 rounded bg-secondary-light dark:bg-secondary-dark dark:text-fg-dark">
                    +{pointDifference}
                </div>
            )}
            {/* Captured pieces display */}
            <div className="flex items-center flex-wrap min-h-[20px]">
                {[...capturedPieces]
                    .sort((a, b) => {
                        const valueDiff = (PIECE_VALUES[b.toLowerCase()] ?? 0) - (PIECE_VALUES[a.toLowerCase()] ?? 0);
                        if (valueDiff !== 0) return valueDiff;
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    })
                    .map((piece, index) => {
                        const code = PIECE_CODE[piece.toLowerCase()];
                        if (!code) return null;
                        // Use 'w' prefix for shape (same shapes, fill is overridden)
                        const PieceSvg = defaultPieces[`w${code}` as keyof typeof defaultPieces];
                        if (!PieceSvg) return null;
                        return (
                            <span
                                key={index}
                                className="inline-block"
                                style={{ width: 28, height: 28, marginRight: piece.toLowerCase() === 'p' ? -16 : -4 }}
                                title={`Captured ${piece.toLowerCase()}`}
                            >
                                <PieceSvg fill={fill} />
                            </span>
                        );
                    })}
            </div>
        </div>
    );
}
