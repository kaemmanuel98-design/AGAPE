"use client";

import NextLink from "next/link";
import { UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  variantKids?: boolean;
  /** Classes additionnelles (ex. `w-full` sur mobile depuis la nav pour éviter le chevauchement). */
  className?: string;
};

export function NavAccountButton({ variantKids, className }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  if (
    pathname.includes("admin-portal-agape") ||
    pathname.includes("admin-secret-dashboard") ||
    pathname.includes("management-agape-secret")
  )
    return null;

  /* gap-2 (via variante Button) + texte text-sm : lisible sans empiéter sur les icônes une fois le CTA en pleine largeur sur mobile */
  const tone = cn(
    "h-10 w-full gap-2 rounded-[var(--radius)] px-3 text-sm font-semibold shadow-md sm:w-auto sm:shrink-0 sm:px-4",
    variantKids ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-primary text-primary-foreground hover:bg-primary/90",
    className,
  );

  return (
    <Button asChild size="sm" className={tone}>
      <NextLink href="/join" prefetch={false} className="inline-flex items-center gap-2">
        <UserPlus className="size-4 shrink-0" aria-hidden />
        {t("joinCommunity")}
      </NextLink>
    </Button>
  );
}
