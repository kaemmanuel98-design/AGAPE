"use client";

import { UserPlus } from "lucide-react";
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

  if (pathname.includes("admin-portal-agape") || pathname.includes("admin-secret-dashboard")) return null;

  const tone = cn(
    "h-10 shrink-0 gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold shadow-md",
    variantKids ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-primary text-primary-foreground hover:bg-primary/90",
  );

  return (
    <Button asChild size="sm" className={tone}>
      <Link href="/#member-registration" prefetch={false}>
        <UserPlus className="size-4 shrink-0" aria-hidden />
        {t("joinCommunity")}
      </Link>
    </Button>
  );
}
