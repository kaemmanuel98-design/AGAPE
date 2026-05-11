import { AdultsHomeHero, AdultsNewsSection } from "@/components/adults/adults-home-panel";
import { DailyExhortationCard } from "@/components/adults/daily-exhortation-card";
import { ContentCards } from "@/components/discover/content-cards";
import { getContentsByCategory } from "@/lib/contents/queries";
import { getTodayExhortation } from "@/lib/exhortations/queries";

export const dynamic = "force-dynamic";

export default async function AdultsHomePage() {
  const contents = await getContentsByCategory("adult");
  const exhortation = await getTodayExhortation();

  return (
    <div className="space-y-8">
      <AdultsHomeHero />
      <DailyExhortationCard exhortation={exhortation} />
      <ContentCards contents={contents} theme="adult" />
      <AdultsNewsSection />
    </div>
  );
}
