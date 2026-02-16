import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { error: 'Username parameter required' },
                { status: 400 }
            );
        }

        // Check if username exists (exclude current user)
        const existingUser = await prisma.user.findFirst({
            where: {
                username,
                email: { not: session.user.email },
            },
        });

        return NextResponse.json({
            available: !existingUser,
        });
    } catch (error) {
        console.error('Error checking username:', error);
        return NextResponse.json(
            { error: 'Failed to check username availability' },
            { status: 500 }
        );
    }
}
