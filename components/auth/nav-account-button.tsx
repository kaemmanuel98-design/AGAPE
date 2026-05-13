"use client";

import { HeartHandshake, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  variantKids?: boolean;
};

export function NavAccountButton({ variantKids }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (pathname.includes("management-agape-secret")) return null;

  const outlineTone = cn(
    "h-10 shrink-0 gap-1.5 rounded-[var(--radius)] px-3 text-xs font-semibold shadow-md sm:gap-2 sm:px-4 sm:text-sm",
    variantKids
      ? "border border-sky-400/60 bg-white/80 text-slate-900 hover:bg-white"
      : "border border-white/25 bg-white/10 text-primary-foreground hover:bg-white/15",
  );

  const primaryTone = cn(
    "h-10 shrink-0 gap-1.5 rounded-[var(--radius)] px-3 text-xs font-semibold shadow-md sm:gap-2 sm:px-4 sm:text-sm",
    variantKids ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-primary text-primary-foreground hover:bg-primary/90",
  );

  return (
    <div className="flex max-w-[11rem] flex-col gap-2 min-[420px]:max-w-none min-[420px]:flex-row min-[420px]:items-center">
      <Button asChild size="sm" className={primaryTone}>
        <Link href="/#member-form" prefetch={false}>
          <UserPlus className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{t("signupAgape")}</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className={outlineTone}>
        <Link href="/#member-form-urgent" prefetch={false}>
          <HeartHandshake className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{t("needHelp")}</span>
        </Link>
      </Button>
    </div>
  );
}
