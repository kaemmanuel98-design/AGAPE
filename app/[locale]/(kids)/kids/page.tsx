import { ContentCards } from "@/components/discover/content-cards";
import { KidsHomePanel } from "@/components/kids/kids-home-panel";
import { getContentsByCategory } from "@/lib/contents/queries";

export const dynamic = "force-dynamic";

export default async function KidsHomePage() {
  const contents = await getContentsByCategory("child");

  return (
    <div className="space-y-8">
      <KidsHomePanel />
      <ContentCards contents={contents} theme="kids" headingId="kids-discover-heading" />
    </div>
  );
}
