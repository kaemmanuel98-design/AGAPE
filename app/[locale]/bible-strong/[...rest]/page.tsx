import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routing, type AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; rest: string[] }>;
};

/** Préfixe `/fr|en|nl/bible-strong/...` → cookie de langue puis même chemin sans préfixe. */
export default async function BibleStrongLocaleNestedRedirectPage({ params }: Props) {
  const { locale, rest } = await params;
  if ((routing.locales as readonly string[]).includes(locale)) {
    (await cookies()).set("NEXT_LOCALE", locale as AppLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";
  redirect(`/bible-strong${suffix}`);
}
