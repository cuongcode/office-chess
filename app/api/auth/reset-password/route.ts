import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { sendPasswordChangedEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiry: null,
            },
        });

        try {
            await sendPasswordChangedEmail(user.email);
        } catch (error) {
            console.error("Failed to send password changed email:", error);
        }

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
