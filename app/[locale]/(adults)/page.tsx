import { AdultsHomeHero, AdultsNewsSection } from "@/components/adults/adults-home-panel";
import { TodayBirthdayBanner } from "@/components/adults/today-birthday-banner";
import { DailyExhortationCard } from "@/components/adults/daily-exhortation-card";
import { ContentCards } from "@/components/discover/content-cards";
import { MemberForm } from "@/components/members/MemberForm";
import { listTodayBirthdays } from "@/lib/calendar/queries";
import { getContentsByCategory } from "@/lib/contents/queries";
import { getTodayExhortation } from "@/lib/exhortations/queries";

export const dynamic = "force-dynamic";

export default async function AdultsHomePage() {
  const contents = await getContentsByCategory("adult");
  const exhortation = await getTodayExhortation();
  const todayBirthdays = await listTodayBirthdays();

  return (
    <div className="space-y-8">
      <AdultsHomeHero />
      <MemberForm />
      <TodayBirthdayBanner birthdays={todayBirthdays} />
      <DailyExhortationCard exhortation={exhortation} />
      <ContentCards contents={contents} theme="adult" />
      <AdultsNewsSection />
    </div>
  );
}
