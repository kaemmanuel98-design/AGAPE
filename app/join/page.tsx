import type { Metadata } from "next";
import NextLink from "next/link";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";
import { routing, type AppLocale } from "@/i18n/routing";

async function resolveJoinLocale(): Promise<AppLocale> {
  const requested = (await cookies()).get("NEXT_LOCALE")?.value;
  if (requested && (routing.locales as readonly string[]).includes(requested)) {
    return requested as AppLocale;
  }
  return routing.defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveJoinLocale();
  const t = await getTranslations({ locale, namespace: "memberRegistration" });
  return {
    title: `${t("title")} · AGAPE`,
    description: t("subtitle"),
  };
}

/** Inscription autonome — hors layout `[locale]` (évite 404 client). URL : `/join` */
export default async function JoinPage() {
  const locale = await resolveJoinLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <NextLink href={`/${locale}`} className="text-sm font-semibold text-sky-800 hover:underline">
              ← AGAPE
            </NextLink>
            <p className="text-sm font-medium text-slate-600">Inscription membre</p>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 pb-16">
          <MemberRegistrationForm />
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
