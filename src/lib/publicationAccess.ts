import type { Visibility } from "@prisma/client";
import { readerSubscriptionIsActive, type ReaderSubRecord } from "@/lib/readerSubscription";

/** PAID sem preço (ou 0) = somente assinantes; PAID com preço = compra ou assinatura. */
export type PublicationAccessMode = "FREE" | "PAID" | "SUBSCRIPTION";

export function publicationAccessMode(
  visibility: Visibility | string,
  price: number | null | undefined
): PublicationAccessMode {
  if (visibility !== "PAID") return "FREE";
  if (price != null && price >= 1) return "PAID";
  return "SUBSCRIPTION";
}

export function canAccessPublication(input: {
  visibility: Visibility | string;
  price: number | null | undefined;
  hasPurchase: boolean;
  subscription: ReaderSubRecord;
  platformFreePlan?: boolean;
}): { allowed: boolean; mode: PublicationAccessMode; reason?: string } {
  const mode = publicationAccessMode(input.visibility, input.price);
  if (input.platformFreePlan) return { allowed: true, mode };
  if (mode === "FREE") return { allowed: true, mode };

  const hasSub = readerSubscriptionIsActive(input.subscription);

  if (mode === "SUBSCRIPTION") {
    return hasSub
      ? { allowed: true, mode }
      : { allowed: false, mode, reason: "Assinatura necessária para ler este conteúdo." };
  }

  if (input.hasPurchase || hasSub) {
    return { allowed: true, mode };
  }
  return {
    allowed: false,
    mode,
    reason: "Compre este ebook ou assine o escritor para acessar.",
  };
}
