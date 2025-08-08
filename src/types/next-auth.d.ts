import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: "ADMIN" | "WRITER_ADMIN" | "CLIENT" | null;
      writerId?: string | null;
      writerSlug?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "WRITER_ADMIN" | "CLIENT" | null;
    writerId?: string | null;
    writerSlug?: string | null;
  }
}
