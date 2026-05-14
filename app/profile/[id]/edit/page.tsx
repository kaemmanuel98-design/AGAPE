import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMemberPublicProfileById } from "@/lib/members/public-profile";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const profile = await getMemberPublicProfileById(id);
  if (!profile) return { title: t("metaNotFoundTitle") };
  return { title: `${t("editTitle")} · AGAPE` };
}

export default async function MemberProfileEditStubPage({ params }: Props) {
  const { id } = await params;
  const profile = await getMemberPublicProfileById(id);
  if (!profile) notFound();

  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-6 py-16 text-neutral-900 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">{t("editTitle")}</h1>
        <p className="mt-6 text-base leading-relaxed text-neutral-600 md:text-lg">{t("editStubBody")}</p>
        <Button
          asChild
          variant="outline"
          className="mt-10 h-12 rounded-full border-neutral-200 bg-white px-8 text-[15px] font-medium"
        >
          <Link href={`/profile/${id}`} className="inline-flex items-center justify-center gap-2">
            <ArrowLeft className="size-4" aria-hidden />
            {t("backToProfile")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
