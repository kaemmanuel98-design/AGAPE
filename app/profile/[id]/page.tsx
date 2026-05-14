import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GraduationCap, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMemberPublicProfileById } from "@/lib/members/public-profile";
import { routing } from "@/i18n/routing";

const TALENT_KEYS = [
  "musique_piano",
  "academie",
  "technique_it",
  "organisation",
  "ecoute_benevole",
] as const;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const profile = await getMemberPublicProfileById(id);
  if (!profile) {
    return { title: t("metaNotFoundTitle") };
  }
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || t("metaFallbackName");
  return {
    title: `${name} · AGAPE`,
    description: t("metaDescription"),
  };
}

function isTalentKey(k: string): k is (typeof TALENT_KEYS)[number] {
  return (TALENT_KEYS as readonly string[]).includes(k);
}

function normalizeTalents(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && isTalentKey(x));
}

/**
 * Affichage de la photo : `avatar_url` pointe vers le CDN Supabase Storage (bucket public `avatars`).
 * Schéma : `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/{memberId}/avatar.webp`.
 */
export default async function MemberPublicProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getMemberPublicProfileById(id);
  if (!profile) notFound();

  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const tReg = await getTranslations({ locale: routing.defaultLocale, namespace: "memberRegistration" });

  const first = profile.first_name?.trim() || "";
  const last = profile.last_name?.trim() || "";
  const displayName = [first, last].filter(Boolean).join(" ").trim() || t("anonymousMember");
  const initials = `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase() || "A";

  const talentLabels = normalizeTalents(profile.talents).map((key) => {
    if (key === "musique_piano") return tReg("talentMusique");
    if (key === "academie") return tReg("talentAcademie");
    if (key === "technique_it") return tReg("talentTech");
    if (key === "organisation") return tReg("talentOrga");
    return tReg("talentEcoute");
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-900">
      <div className="mx-auto max-w-lg px-6 pb-24 pt-16 md:max-w-xl md:pt-24">
        <div className="rounded-[32px] bg-white px-8 py-14 shadow-[0_2px_40px_rgba(0,0,0,0.06)] md:px-12 md:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="relative size-36 shrink-0 md:size-40">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={t("avatarAlt", { name: displayName })}
                  fill
                  sizes="160px"
                  className="rounded-full object-cover ring-1 ring-black/[0.06]"
                  priority
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 text-3xl font-semibold tracking-tight text-neutral-500 ring-1 ring-black/[0.06]"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
            </div>

            <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-neutral-400">{t("badgeMember")}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 md:text-[2rem]">{displayName}</h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-neutral-600 md:text-xl">
              {t("welcomeMessage", { firstName: first || displayName })}
            </p>

            {talentLabels.length > 0 ? (
              <div className="mt-10 w-full max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">{t("talentsHeading")}</p>
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {talentLabels.map((label) => (
                    <li
                      key={label}
                      className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-14 flex w-full max-w-sm flex-col gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-neutral-900 text-[15px] font-medium text-white shadow-sm hover:bg-neutral-800"
              >
                <Link href={`/profile/${id}/edit`} className="inline-flex items-center justify-center gap-2">
                  <PencilLine className="size-4" aria-hidden />
                  {t("editProfile")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 hover:bg-neutral-50"
              >
                <Link href="/academy" className="inline-flex items-center justify-center gap-2">
                  <GraduationCap className="size-4" aria-hidden />
                  {t("openAcademy")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
