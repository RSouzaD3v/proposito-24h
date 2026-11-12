"use server";

import { revalidatePath } from "next/cache";
import { apiSend } from "@/lib/api/server";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; message: string };

const fail = (message: string | undefined, fallback: string): ActionResult<never> => ({ ok: false, message: message ?? fallback });

export async function createGameAction(input: { title: string; description: string }): Promise<ActionResult<{ id: string }>> {
  const result = await apiSend("POST", "/admin/games", { ...input, type: "WORD_CONNECT" });
  if (!result.ok) return fail(result.message, "Não foi possível criar o jogo.");
  revalidatePath("/admin/game");
  return { ok: true, data: result.data as { id: string } };
}

export async function updateGameAction(
  id: string,
  input: { title?: string; description?: string; active?: boolean },
): Promise<ActionResult> {
  const result = await apiSend("PUT", `/admin/games/${id}`, input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar o jogo.");
  revalidatePath("/admin/game");
  revalidatePath(`/admin/game/${id}`);
  return { ok: true };
}

export async function createLevelAction(gameId: string): Promise<ActionResult<{ id: string }>> {
  const result = await apiSend("POST", `/admin/games/${gameId}/levels`);
  if (!result.ok) return fail(result.message, "Não foi possível criar o nível.");
  revalidatePath(`/admin/game/${gameId}`);
  return { ok: true, data: result.data as { id: string } };
}

export async function updateLevelAction(
  gameId: string,
  levelId: string,
  input: { order: number; letters: string[] },
): Promise<ActionResult> {
  const result = await apiSend("PUT", `/admin/levels/${levelId}`, input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar o nível.");
  revalidatePath(`/admin/game/${gameId}`);
  revalidatePath(`/admin/game/${gameId}/level/${levelId}`);
  return { ok: true };
}

export async function applyDefaultLayoutAction(gameId: string, levelId: string): Promise<ActionResult> {
  const result = await apiSend("POST", `/admin/levels/${levelId}/default-layout`);
  if (!result.ok) return fail(result.message, "Não foi possível aplicar o layout.");
  revalidatePath(`/admin/game/${gameId}/level/${levelId}`);
  return { ok: true };
}

export async function addWordAction(
  gameId: string,
  levelId: string,
  input: { word: string; bonus: boolean },
): Promise<ActionResult> {
  const result = await apiSend("POST", `/admin/levels/${levelId}/words`, input);
  if (!result.ok) return fail(result.message, "Não foi possível adicionar a palavra.");
  revalidatePath(`/admin/game/${gameId}`);
  revalidatePath(`/admin/game/${gameId}/level/${levelId}`);
  return { ok: true };
}

export async function deleteWordAction(gameId: string, levelId: string, wordId: string): Promise<ActionResult> {
  const result = await apiSend("DELETE", `/admin/words/${wordId}`);
  if (!result.ok) return fail(result.message, "Não foi possível remover a palavra.");
  revalidatePath(`/admin/game/${gameId}`);
  revalidatePath(`/admin/game/${gameId}/level/${levelId}`);
  return { ok: true };
}
