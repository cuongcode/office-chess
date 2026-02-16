import { prisma } from './prisma';

/**
 * Calculate player rating based on wins, draws, and losses
 * Formula: (wins * 3) + (draws * 1) + (losses * 0)
 */
export function calculateRating(wins: number, draws: number, losses: number): number {
    return (wins * 3) + (draws * 1);
}

/**
 * Update player statistics after a game
 */
export async function updatePlayerStats(
    userId: string,
    gameResult: 'win' | 'loss' | 'draw'
) {
    // Fetch current user stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            wins: true,
            losses: true,
            draws: true,
            totalGames: true,
            currentStreak: true,
            longestStreak: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Calculate new stats based on result
    let newWins = user.wins;
    let newLosses = user.losses;
    let newDraws = user.draws;
    let newCurrentStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    switch (gameResult) {
        case 'win':
            newWins += 1;
            newCurrentStreak += 1;
            // Check if this is a new longest streak
            if (newCurrentStreak > newLongestStreak) {
                newLongestStreak = newCurrentStreak;
            }
            break;
        case 'loss':
            newLosses += 1;
            newCurrentStreak = 0; // Reset streak on loss
            break;
        case 'draw':
            newDraws += 1;
            // Draws don't affect streak
            break;
    }

    // Calculate new rating
    const newRating = calculateRating(newWins, newDraws, newLosses);
    const newTotalGames = user.totalGames + 1;

    // Update user in database
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            wins: newWins,
            losses: newLosses,
            draws: newDraws,
            totalGames: newTotalGames,
            rating: newRating,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastGameAt: new Date(),
        },
    });

    return {
        id: updatedUser.id,
        totalGames: updatedUser.totalGames,
        wins: updatedUser.wins,
        losses: updatedUser.losses,
        draws: updatedUser.draws,
        rating: updatedUser.rating,
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak,
        lastGameAt: updatedUser.lastGameAt,
    };
}

/**
 * Initialize player stats for a new user
 */
export async function initializeStatsForUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalGames: true, rating: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Only initialize if stats haven't been set yet
    if (user.totalGames === 0 && user.rating === 0) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                rating: 0,
                currentStreak: 0,
                longestStreak: 0,
            },
        });
    }

    return true;
}
