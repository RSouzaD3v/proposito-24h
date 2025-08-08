// src/lib/authOptions.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db"; // ou "../lib/db" dependendo da estrutura
import { AuthOptions, SessionStrategy } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt" as SessionStrategy,
  },
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
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        return valid ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 