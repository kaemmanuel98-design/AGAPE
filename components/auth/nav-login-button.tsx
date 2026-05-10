"use client";

import { LogIn, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  variantKids?: boolean;
};

export function NavLoginButton({ variantKids }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
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

  const onLoginRoute = pathname === "/login";

  if (onLoginRoute) {
    return null;
  }

  const kidsContext = pathname === "/kids" || pathname.startsWith("/kids/");
  const loginHref = kidsContext ? "/login?kids=1" : "/login";

  async function onSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (session) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-11 shrink-0 gap-2 rounded-[var(--radius)] px-4 font-medium",
          variantKids
            ? "border-sky-300/70 bg-white/70 text-slate-800 hover:bg-white"
            : "border-white/35 bg-white/10 text-foreground hover:bg-white/15",
        )}
        onClick={() => void onSignOut()}
      >
        <LogOut className="size-4" aria-hidden />
        {t("logout")}
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      className={cn(
        "h-11 shrink-0 gap-2 rounded-[var(--radius)] px-5 font-semibold shadow-md",
        variantKids
          ? "bg-sky-600 text-white hover:bg-sky-700"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <Link href={loginHref} prefetch>
        <LogIn className="size-4" aria-hidden />
        {t("login")}
      </Link>
    </Button>
  );
}
