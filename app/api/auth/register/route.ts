import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        if (!email.endsWith(`@${process.env.COMPANY_EMAIL_DOMAIN}`)) {
            return NextResponse.json({ message: `Email must be from ${process.env.COMPANY_EMAIL_DOMAIN}` }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verificationToken,
            },
        });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (error) {
            // If email fails, we might want to log it but still return success or fail
            console.error("Failed to send verification email:", error);
            // Maybe delete the user if email functionality is critical, or just warn. 
            // For this task, we will proceed.
        }

        return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
