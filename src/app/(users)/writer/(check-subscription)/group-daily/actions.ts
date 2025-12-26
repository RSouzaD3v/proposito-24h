"use server";

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import z from "zod";

async function assertWriter() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.writerId) {
    throw new Error("Não autorizado");
  }
  return session.user.writerId;
}

const updateGroupingSchema = z.object({
  groupId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean()
});

export async function updateGroupingDailyAction(
  data: z.infer<typeof updateGroupingSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.writerId) {
    return { success: false, message: "Não autorizado" };
  }

  const parsed = updateGroupingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos" };
  }

  const { groupId, title, description, imageUrl, active } = parsed.data;

await db.groupingDaily.updateMany({
  where: {
    id: groupId,
    writerId: session.user.writerId,
  },
  data: {
    title,
    description,
    imageUrl,
    active,
  },
});

revalidatePath(
  "/(users)/writer/(check-subscription)/group-daily",
  "page"
);

revalidatePath(
  "/(users)/writer/(check-subscription)/group-daily/[groupId]",
  "page"
);

revalidatePath(
  "/(users)/reader/area/group-daily/[groupId]",
  "page"
);

  return { success: true };
}


/* =========================
 * SCHEMA
 * ========================= */
const createGroupingDailySchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  active: z.boolean()
});

/* =========================
 * ACTION
 * ========================= */
export async function createGroupingDailyAction(
  data: z.infer<typeof createGroupingDailySchema>
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.writerId) {
    return {
      success: false,
      message: "Não autorizado",
    };
  }

  const parsed = createGroupingDailySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await db.groupingDaily.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl,
        writerId: session.user.writerId,
        active: parsed.data.active ?? true,
      },
    });

    // 🔄 Revalida a listagem
    revalidatePath("/writer/group-daily");

    return {
      success: true,
    };
  } catch (error) {
    console.error("createGroupingDailyAction error:", error);

    return {
      success: false,
      message: "Erro ao criar agrupamento",
    };
  }
}

/* ======================
 * DEVOTIONAL
 * ====================== */
export async function addDevotionalToGroupAction(
  groupId: string,
  devotionalId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      devotionals: {
        connect: { id: devotionalId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * QUOTE
 * ====================== */
export async function addQuoteToGroupAction(
  groupId: string,
  quoteId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      quotes: {
        connect: { id: quoteId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * PRAYER
 * ====================== */
export async function addPrayerToGroupAction(
  groupId: string,
  prayerId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      prayers: {
        connect: { id: prayerId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * VERSE
 * ====================== */
export async function addVerseToGroupAction(
  groupId: string,
  verseId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      verses: {
        connect: { id: verseId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * REMOVER DEVOTIONAL
 * ====================== */
export async function removeDevotionalFromGroupAction(
  groupId: string,
  devotionalId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      devotionals: {
        disconnect: { id: devotionalId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * REMOVER QUOTE
 * ====================== */
export async function removeQuoteFromGroupAction(
  groupId: string,
  quoteId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      quotes: {
        disconnect: { id: quoteId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * REMOVER PRAYER
 * ====================== */
export async function removePrayerFromGroupAction(
  groupId: string,
  prayerId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      prayers: {
        disconnect: { id: prayerId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

/* ======================
 * REMOVER VERSE
 * ====================== */
export async function removeVerseFromGroupAction(
  groupId: string,
  verseId: string
) {
  const writerId = await assertWriter();

  await db.groupingDaily.update({
    where: { id: groupId, writerId },
    data: {
      verses: {
        disconnect: { id: verseId },
      },
    },
  });

  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}
