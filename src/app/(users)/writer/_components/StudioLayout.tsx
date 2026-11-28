import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { apiGetOrNull } from "@/lib/api/server";
import { StudioFrame } from "./StudioFrame";

type Profile = { id: string; slug: string; name: string; logoUrl: string | null };

/** Moldura do estúdio (barra lateral + conteúdo) para as telas do escritor. */
export async function StudioLayout({ children }: { children: React.ReactNode }) {
  const [session, profile] = await Promise.all([
    getServerSession(authOptions),
    apiGetOrNull<Profile>("/writer/profile"),
  ]);

  return (
    <StudioFrame
      writer={{
        id: profile?.id ?? null,
        name: profile?.name?.trim() || session?.user?.name || "",
        email: session?.user?.email ?? "",
        slug: profile?.slug ?? null,
        logoUrl: profile?.logoUrl ?? null,
      }}
    >
      {children}
    </StudioFrame>
  );
}
