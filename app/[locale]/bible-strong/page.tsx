import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routing, type AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/** `/fr|en|nl/bible-strong` → enregistre la langue puis sert `/bible-strong`. */
export default async function BibleStrongLocaleRedirectPage({ params }: Props) {
  const { locale } = await params;
  if ((routing.locales as readonly string[]).includes(locale)) {
    (await cookies()).set("NEXT_LOCALE", locale as AppLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  redirect("/bible-strong");
}
