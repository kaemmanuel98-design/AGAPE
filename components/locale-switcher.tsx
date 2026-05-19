"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { isLocalelessPublicPath } from "@/lib/navigation/localeless-public-path";
import { routing } from "@/i18n/routing";
import { usePathname as useIntlPathname, useRouter } from "@/i18n/navigation";
import { usePathname as useNextPathname } from "next/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const intlPathname = useIntlPathname();
  const nextPathname = useNextPathname() ?? "";
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="flex items-center gap-0.5 rounded-[var(--radius)] border border-white/20 bg-white/5 p-1"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          type="button"
          variant={locale === loc ? "secondary" : "ghost"}
          size="sm"
          className="h-8 min-w-[2.25rem] rounded-[18px] px-2 text-xs font-semibold uppercase tracking-wide"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              if (isLocalelessPublicPath(nextPathname)) {
                // /join et /profile/* : pas de préfixe /fr/… (sinon 404). On garde l’URL et on change la locale via cookie.
                if (
                  nextPathname === "/join" ||
                  nextPathname.startsWith("/join/") ||
                  nextPathname.startsWith("/profile")
                ) {
                  document.cookie = `NEXT_LOCALE=${loc};path=/;max-age=31536000;SameSite=Lax`;
                  window.location.assign(nextPathname);
                  return;
                }
                window.location.assign(`/${loc}${nextPathname}`);
                return;
              }
              router.replace(intlPathname, { locale: loc });
            })
          }
        >
          {loc}
        </Button>
      ))}
    </div>
  );
}
