/**
 * PGN (Portable Game Notation) utility functions for generating game records
 * and detecting chess openings.
 */

/** Result values accepted by generatePGN */
export type PgnResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export interface GeneratePGNOptions {
    whitePlayerName: string;
    blackPlayerName: string;
    /** Array of SAN move strings, e.g. ["e4", "e5", "Nf3", "Nc6"] */
    moves: string[];
    result: PgnResult;
    /** JavaScript Date object for the game start */
    date?: Date;
    /** Time control string, e.g. "3+2" or "unlimited" */
    timeControl?: string;
}

/**
 * Formats a Date as PGN date (YYYY.MM.DD).
 */
function formatPgnDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}

/**
 * Generates a PGN string from game data.
 *
 * @example
 * generatePGN({
 *   whitePlayerName: 'Alice',
 *   blackPlayerName: 'Bob',
 *   moves: ['e4', 'e5', 'Nf3'],
 *   result: '1-0',
 * })
 */
export function generatePGN(options: GeneratePGNOptions): string {
    const {
        whitePlayerName,
        blackPlayerName,
        moves,
        result,
        date = new Date(),
        timeControl = '?',
    } = options;

    const headers = [
        `[Event "Casual Game"]`,
        `[Site "Chess App"]`,
        `[Date "${formatPgnDate(date)}"]`,
        `[White "${whitePlayerName}"]`,
        `[Black "${blackPlayerName}"]`,
        `[Result "${result}"]`,
        `[TimeControl "${timeControl}"]`,
    ].join('\n');

    // Build move text: "1. e4 e5 2. Nf3 Nc6 ..."
    const movePairs: string[] = [];
    for (let i = 0; i < moves.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = moves[i] ?? '';
        const blackMove = moves[i + 1] ?? '';
        if (blackMove) {
            movePairs.push(`${moveNum}. ${whiteMove} ${blackMove}`);
        } else {
            movePairs.push(`${moveNum}. ${whiteMove}`);
        }
    }

    const moveText = movePairs.join(' ');

    return `${headers}\n\n${moveText} ${result}`.trim();
}

// ---------------------------------------------------------------------------
// Opening detection
// ---------------------------------------------------------------------------

interface OpeningPattern {
    name: string;
    /** Prefix of moves that identify this opening (SAN, lowercase for matching) */
    moves: string[];
}

/**
 * Ordered list of openings — more specific patterns should come first.
 */
const OPENINGS: OpeningPattern[] = [
    // -- Specific variations first --
    { name: "Ruy Lopez", moves: ["e4", "e5", "nf3", "nc6", "bb5"] },
    { name: "Italian Game", moves: ["e4", "e5", "nf3", "nc6", "bc4"] },
    { name: "Scotch Game", moves: ["e4", "e5", "nf3", "nc6", "d4"] },
    { name: "Four Knights Game", moves: ["e4", "e5", "nf3", "nc6", "nc3", "nf6"] },
    { name: "Petrov's Defense", moves: ["e4", "e5", "nf3", "nf6"] },
    { name: "Sicilian Najdorf", moves: ["e4", "c5", "nf3", "d6", "d4", "cxd4", "nxd4", "nf6", "nc3", "a6"] },
    { name: "Sicilian Dragon", moves: ["e4", "c5", "nf3", "d6", "d4", "cxd4", "nxd4", "nf6", "nc3", "g6"] },
    { name: "Sicilian Scheveningen", moves: ["e4", "c5", "nf3", "e6"] },
    { name: "Caro-Kann Defense", moves: ["e4", "c6"] },
    { name: "Pirc Defense", moves: ["e4", "d6"] },
    { name: "Alekhine's Defense", moves: ["e4", "nf6"] },
    { name: "French Defense", moves: ["e4", "e6"] },
    { name: "Sicilian Defense", moves: ["e4", "c5"] },
    { name: "King's Pawn Opening", moves: ["e4", "e5"] },
    { name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"] },
    { name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"] },
    { name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
    { name: "King's Indian Defense", moves: ["d4", "nf6", "c4", "g6"] },
    { name: "Nimzo-Indian Defense", moves: ["d4", "nf6", "c4", "e6", "nc3", "bb4"] },
    { name: "Queen's Indian Defense", moves: ["d4", "nf6", "c4", "e6", "nf3", "b6"] },
    { name: "Grünfeld Defense", moves: ["d4", "nf6", "c4", "g6", "nc3", "d5"] },
    { name: "Catalan Opening", moves: ["d4", "nf6", "c4", "e6", "g3"] },
    { name: "Queen's Gambit", moves: ["d4", "d5", "c4"] },
    { name: "Queen's Pawn Opening", moves: ["d4", "d5"] },
    { name: "English Opening", moves: ["c4"] },
    { name: "Réti Opening", moves: ["nf3", "nf6"] },
    { name: "Réti Opening", moves: ["nf3", "d5"] },
    { name: "King's Indian Attack", moves: ["nf3"] },
    { name: "King's Pawn Opening", moves: ["e4"] },
    { name: "Queen's Pawn Opening", moves: ["d4"] },
];

/**
 * Normalises a SAN move to lowercase and strips check/checkmate symbols for matching.
 */
function normaliseMove(san: string): string {
    return san.replace(/[+#!?]/g, '').toLowerCase();
}

/**
 * Detects the chess opening from the first moves of the game.
 *
 * @param moves - Array of SAN moves (full game or first N moves)
 * @returns Opening name, e.g. "Sicilian Defense" or "Unknown Opening"
 */
export function detectOpening(moves: string[]): string {
    const normMoves = moves.map(normaliseMove);

    // Find the longest matching pattern
    let bestMatch: string | null = null;
    let bestLength = 0;

    for (const opening of OPENINGS) {
        const pattern = opening.moves;
        if (pattern.length > normMoves.length) continue;

        const matches = pattern.every((m, i) => normMoves[i] === m);
        if (matches && pattern.length > bestLength) {
            bestLength = pattern.length;
            bestMatch = opening.name;
        }
    }

    return bestMatch ?? 'Unknown Opening';
}

/**
 * Converts a game result string from our socket events into a PGN result token.
 *
 * @param result - Value like 'white', 'black', 'draw'
 */
export function toPgnResult(result: 'white' | 'black' | 'draw' | string): PgnResult {
    if (result === 'white') return '1-0';
    if (result === 'black') return '0-1';
    if (result === 'draw') return '1/2-1/2';
    return '*';
}

/**
 * Converts game socket result + reason into the DB result & resultMethod strings.
 */
export function toDbResult(
    result: 'white' | 'black' | 'draw' | string,
    reason: string,
    timedOutColor?: 'white' | 'black'
): { result: string; resultMethod: string } {
    let dbResult: string;
    if (result === 'white') {
        dbResult = reason === 'timeout' ? 'timeout_black' : 'white_win';
    } else if (result === 'black') {
        dbResult = reason === 'timeout' ? 'timeout_white' : 'black_win';
    } else {
        dbResult = 'draw';
    }

    let resultMethod: string;
    switch (reason) {
        case 'checkmate':
            resultMethod = 'checkmate';
            break;
        case 'resignation':
            resultMethod = 'resignation';
            break;
        case 'agreement':
            resultMethod = 'draw_agreement';
            break;
        case 'stalemate':
            resultMethod = 'stalemate';
            break;
        case 'timeout':
            resultMethod = 'timeout';
            break;
        default:
            resultMethod = reason;
    }

    return { result: dbResult, resultMethod };
}
