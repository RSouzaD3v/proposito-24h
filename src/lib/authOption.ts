import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions, SessionStrategy } from "next-auth";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" as SessionStrategy },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // A senha é validada pela API; o Next só guarda a sessão no cookie.
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;
        const response = await fetch(`${process.env.API_URL}/v1/auth/web/credentials`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": process.env.INTERNAL_API_KEY ?? "",
          },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          cache: "no-store",
        });
        if (!response.ok) return null;
        return (await response.json()) as any;
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
