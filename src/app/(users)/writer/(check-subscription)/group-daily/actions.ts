"use server";

import { apiSend } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

type ContentKind = "devotional" | "quote" | "prayer" | "verse";

interface GroupingForm {
  title: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

export async function updateGroupingDailyAction(data: GroupingForm & { groupId: string }) {
  const { groupId, ...form } = data;
  const result = await apiSend("PUT", `/writer/groupings/${groupId}`, form);
  if (!result.ok) return { success: false, message: result.message ?? "Não autorizado" };

  revalidatePath("/writer/group-daily");
  revalidatePath(`/writer/group-daily/${groupId}`);
  revalidatePath(`/reader/area/group-daily/${groupId}`);
  return { success: true };
}

export async function createGroupingDailyAction(data: GroupingForm) {
  const result = await apiSend("POST", "/writer/groupings", data);
  if (!result.ok) return { success: false, message: result.message ?? "Erro ao criar agrupamento" };

  revalidatePath("/writer/group-daily");
  return { success: true };
}

async function setContent(method: "PUT" | "DELETE", groupId: string, kind: ContentKind, contentId: string) {
  const result = await apiSend(method, `/writer/groupings/${groupId}/${kind}/${contentId}`);
  if (!result.ok) throw new Error(result.message ?? "Não autorizado");
  revalidatePath(`/writer/group-daily/${groupId}`);
  return { success: true };
}

export async function addDevotionalToGroupAction(groupId: string, id: string) {
  return setContent("PUT", groupId, "devotional", id);
}
export async function addQuoteToGroupAction(groupId: string, id: string) {
  return setContent("PUT", groupId, "quote", id);
}
export async function addPrayerToGroupAction(groupId: string, id: string) {
  return setContent("PUT", groupId, "prayer", id);
}
export async function addVerseToGroupAction(groupId: string, id: string) {
  return setContent("PUT", groupId, "verse", id);
}
export async function removeDevotionalFromGroupAction(groupId: string, id: string) {
  return setContent("DELETE", groupId, "devotional", id);
}
export async function removeQuoteFromGroupAction(groupId: string, id: string) {
  return setContent("DELETE", groupId, "quote", id);
}
export async function removePrayerFromGroupAction(groupId: string, id: string) {
  return setContent("DELETE", groupId, "prayer", id);
}
export async function removeVerseFromGroupAction(groupId: string, id: string) {
  return setContent("DELETE", groupId, "verse", id);
}
