import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    try {
        const { gameId } = await params;

        if (!gameId) {
            return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
        }

        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                blackPlayer: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error('Game fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
    }
}
