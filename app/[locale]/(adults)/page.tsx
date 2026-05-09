import { AdultsHomeHero, AdultsNewsSection } from "@/components/adults/adults-home-panel";
import { ResourcesGrid } from "@/components/adults/resources-grid";
import { getResourcesForDiscover } from "@/lib/resources/queries";

export const dynamic = "force-dynamic";

export default async function AdultsHomePage() {
  const resources = await getResourcesForDiscover();

  return (
    <div className="space-y-8">
      <AdultsHomeHero />
      <ResourcesGrid resources={resources} />
      <AdultsNewsSection />
    </div>
  );
}
