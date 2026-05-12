"use client";

import { LogIn, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  variantKids?: boolean;
};

export function NavAccountButton({ variantKids }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [session, setSession] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(Boolean(nextSession));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname === "/login") {
    return null;
  }

  const tone = cn(
    "h-10 shrink-0 gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold shadow-md",
    variantKids
      ? "bg-sky-600 text-white hover:bg-sky-700"
      : "bg-primary text-primary-foreground hover:bg-primary/90",
  );

  if (session) {
    return (
      <Button asChild size="sm" className={tone}>
        <Link href="/profile" prefetch>
          <UserRound className="size-4" aria-hidden />
          {t("profile")}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className={tone}>
      <Link href={`/login?next=${encodeURIComponent(`/${locale}/profile`)}`} prefetch={false}>
        <LogIn className="size-4" aria-hidden />
        {t("login")}
      </Link>
    </Button>
  );
}
