import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Fetch user with stats from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                totalGames: true,
                wins: true,
                losses: true,
                draws: true,
                rating: true,
                currentStreak: true,
                longestStreak: true,
                lastGameAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate additional stats
        const winRate = user.totalGames > 0
            ? (user.wins / user.totalGames * 100).toFixed(1)
            : '0.0';

        // Return profile data
        return NextResponse.json({
            id: user.id,
            username: user.username || user.name || user.email.split('@')[0],
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            totalGames: user.totalGames,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            rating: user.rating,
            winRate: parseFloat(winRate),
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastGameAt: user.lastGameAt,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
