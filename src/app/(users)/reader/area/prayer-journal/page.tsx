import { apiGet } from "@/lib/api/server";
import { PrayerJournal, type PrayerJournalData } from "./_components/PrayerJournal";

export default async function PrayerJournalPage() {
  const data = await apiGet<PrayerJournalData>("/reader/prayer-journal");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-20 md:pt-10">
      <PrayerJournal initial={data} />
    </div>
  );
}
