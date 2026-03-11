import crypto from "crypto";
import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const resetToken = crypto.randomUUID();
      const resetPasswordExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry,
        },
      });

      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (error) {
        console.error("Failed to send reset email:", error);
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: "If this email is registered, a reset link has been sent." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
