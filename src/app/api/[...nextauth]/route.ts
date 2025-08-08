// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOption"; // ajuste o caminho se necessário

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };