// app/reading/plan/[planRef]/page.tsx
import { notFound } from "next/navigation";
import PlanClient from "./plan-client";
import { ScreenSubscription } from "../../../_components/ScreenSubscription";
import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { getBooks } from "@/lib/bible";

type Props = { params: Promise<{ planRef: string }> };

interface ReadingPlan {
  id: string;
  name: string;
  days: { id: string; dayNumber: number; passages: string }[];
  completedDayIds: string[];
}

export default async function PlanPage({ params }: Props) {
  const { planRef } = await params;
  const [result, books] = await Promise.all([
    apiFetch<ReadingPlan>(`/reader/reading-plans/${encodeURIComponent(planRef)}`),
    getBooks(),
  ]);

  if (result.status === 403) {
    const profile = await apiGet<ReaderProfile>("/reader/profile");
    return <ScreenSubscription slug={profile.writer?.slug || ""} />;
  }
  if (!result.ok) notFound();

  return (
    <PlanClient
      planId={result.data.id}
      planName={result.data.name}
      days={result.data.days}
      completedInitial={result.data.completedDayIds}
      books={books.map(({ abbrev, name, order }) => ({ abbrev, name, order }))}
    />
  );
}
