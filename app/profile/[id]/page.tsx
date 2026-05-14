import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen, Camera } from "lucide-react";

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

function displayNameFromProfile(
  profile: Awaited<ReturnType<typeof getMemberPublicProfileById>>,
  fallback: string,
) {
  if (!profile) return fallback;
  const fn = profile.full_name?.trim();
  if (fn) return fn;
  const a = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return a || fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const profile = await getMemberPublicProfileById(id);
  if (!profile) {
    return { title: t("metaNotFoundTitle") };
  }
  const name = displayNameFromProfile(profile, t("metaFallbackName"));
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

export default async function MemberPublicProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getMemberPublicProfileById(id);
  if (!profile) notFound();

  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const tReg = await getTranslations({ locale: routing.defaultLocale, namespace: "memberRegistration" });

  const displayName = displayNameFromProfile(profile, t("anonymousMember"));
  const first = profile.first_name?.trim() || "";
  const last = profile.last_name?.trim() || "";
  const initials =
    displayName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase() || "A";

  const talentLabels = normalizeTalents(profile.talents).map((key) => {
    if (key === "musique_piano") return tReg("talentMusique");
    if (key === "academie") return tReg("talentAcademie");
    if (key === "technique_it") return tReg("talentTech");
    if (key === "organisation") return tReg("talentOrga");
    return tReg("talentEcoute");
  });

  const needCode = profile.current_need?.trim() || null;
  const needLabel =
    needCode === "soutien_moral"
      ? tReg("needSoutien")
      : needCode === "deuil"
        ? tReg("needDeuil")
        : needCode === "maladie"
          ? tReg("needMaladie")
          : needCode === "urgence"
            ? tReg("needUrgence")
            : null;

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-neutral-900">
      <div className="mx-auto max-w-md px-5 pb-20 pt-12 md:max-w-lg md:pt-16">
        <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_12px_48px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]">
          <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-neutral-100 to-neutral-200">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={t("avatarAlt", { name: displayName })}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 512px"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center text-5xl font-semibold tracking-tight text-neutral-400">
                {initials}
              </div>
            )}
          </div>

          <div className="space-y-6 px-6 pb-10 pt-8 md:px-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{t("badgeMember")}</p>
              <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight text-neutral-950 md:text-3xl">
                {displayName}
              </h1>
            </div>

            {needLabel ? (
              <div
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                  needCode === "urgence"
                    ? "bg-rose-100 text-rose-900 ring-1 ring-rose-200/80"
                    : "bg-sky-50 text-sky-900 ring-1 ring-sky-200/80"
                }`}
              >
                {t("needBadge", { need: needLabel })}
              </div>
            ) : null}

            <p className="text-lg leading-relaxed text-neutral-600">
              {t("welcomeMessage", { firstName: first || displayName })}
            </p>

            {talentLabels.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{t("talentsHeading")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {talentLabels.map((label) => (
                    <li
                      key={label}
                      className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-800"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2">
              <Button
                asChild
                className="h-12 rounded-full bg-neutral-900 text-[15px] font-semibold text-white shadow-sm hover:bg-neutral-800"
              >
                <Link href={`/profile/${id}/edit`} className="inline-flex items-center justify-center gap-2">
                  <Camera className="size-4" aria-hidden />
                  {t("editPhotoButton")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-neutral-200/90 bg-white text-[15px] font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                <Link href="/bible-strong" className="inline-flex items-center justify-center gap-2">
                  <BookOpen className="size-4" aria-hidden />
                  {t("openBibleStrong")}
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
