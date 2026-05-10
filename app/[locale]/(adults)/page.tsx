import { AdultsHomeHero, AdultsNewsSection } from "@/components/adults/adults-home-panel";
import { ContentCards } from "@/components/discover/content-cards";
import { getContentsByCategory } from "@/lib/contents/queries";

export const dynamic = "force-dynamic";

export default async function AdultsHomePage() {
  const contents = await getContentsByCategory("adult");

  return (
    <div className="space-y-8">
      <AdultsHomeHero />
      <ContentCards contents={contents} theme="adult" />
      <AdultsNewsSection />
    </div>
  );
}
