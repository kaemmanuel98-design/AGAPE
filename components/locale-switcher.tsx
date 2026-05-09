"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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
              router.replace(pathname, { locale: loc });
            })
          }
        >
          {loc}
        </Button>
      ))}
    </div>
  );
}
