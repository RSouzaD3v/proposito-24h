"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiSend } from "@/lib/api/server";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; message: string };

export type WidgetSource = { versionCode: string; bookAbbrev: string; chapter: number; verseStart: number; verseEnd: number };

export type WidgetVerseInput = {
  shortText: string;
  inlineText: string | null;
  reference: string;
  fullText: string | null;
  source: WidgetSource | null;
  active: boolean;
};

const fail = (message: string | undefined, fallback: string): ActionResult<never> => ({ ok: false, message: message ?? fallback });

export async function createWidgetVerseAction(input: WidgetVerseInput): Promise<ActionResult> {
  const result = await apiSend("POST", "/admin/widget-verses", input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar o item.");
  revalidatePath("/admin/widget");
  return { ok: true };
}

export async function updateWidgetVerseAction(id: string, input: Partial<WidgetVerseInput>): Promise<ActionResult> {
  const result = await apiSend("PUT", `/admin/widget-verses/${id}`, input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar o item.");
  revalidatePath("/admin/widget");
  return { ok: true };
}

export async function deleteWidgetVerseAction(id: string): Promise<ActionResult> {
  const result = await apiSend("DELETE", `/admin/widget-verses/${id}`);
  if (!result.ok) return fail(result.message, "Não foi possível excluir o item.");
  revalidatePath("/admin/widget");
  return { ok: true };
}

/** Capítulos de um livro na versão escolhida (para o seletor da Bíblia). */
export async function bibleChaptersAction(version: string, abbrev: string): Promise<number[]> {
  const result = await apiFetch<number[]>(`/bible/${encodeURIComponent(version)}/${encodeURIComponent(abbrev)}`);
  return result.ok ? result.data : [];
}

export async function bibleChapterAction(version: string, abbrev: string, chapter: number): Promise<{ verse: number; text: string }[]> {
  const result = await apiFetch<{ verses: { verse: number; text: string }[] }>(
    `/bible/${encodeURIComponent(version)}/${encodeURIComponent(abbrev)}/${chapter}`,
  );
  return result.ok ? result.data.verses : [];
}
