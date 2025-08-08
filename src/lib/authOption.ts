// src/lib/authOptions.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { AuthOptions, SessionStrategy } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" as SessionStrategy },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { writer: { select: { id: true, slug: true } } },
        });
        if (!user?.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        // Retorna os campos que vamos propagar pro token
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,               // ADMIN | WRITER_ADMIN | CLIENT
          writerId: user.writerId ?? null,
          writerSlug: user.writer?.slug ?? null,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Na primeira chamada após login, "user" existe
      if (user) {
        token.role = (user as any).role;
        token.writerId = (user as any).writerId ?? null;
        token.writerSlug = (user as any).writerSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role ?? null;
        (session.user as any).writerId = token.writerId ?? null;
        (session.user as any).writerSlug = token.writerSlug ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
