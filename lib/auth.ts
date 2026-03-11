import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "./prisma";
import { initializeStatsForUser } from "./rating";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("No account found with that email.");
        }

        if (!user.emailVerified) {
          throw new Error("Email not verified. Please check your inbox.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        // Initialize player stats if not already done
        await initializeStatsForUser(user.id).catch(console.error);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Fetch fresh user data on every request to get updated username
      if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatar: true,
          },
        });

        if (freshUser) {
          token.username = freshUser.username;
          token.name = freshUser.name;
          token.avatar = freshUser.avatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
        // Use username if available, otherwise fall back to name
        session.user.name =
          (token.username as string) || (token.name as string);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
