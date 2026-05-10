"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthView = "magic_link" | "sign_in";

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const errorParam = searchParams.get("error");

  const nextPath = useMemo(() => {
    if (nextRaw && nextRaw.startsWith("/")) return nextRaw;
    return `/${locale}`;
  }, [nextRaw, locale]);

  const [view, setView] = useState<AuthView>("magic_link");
  const [origin, setOrigin] = useState("");
  const redirectedRef = useRef(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const redirectTo = useMemo(() => {
    if (!origin) return undefined;
    const next = encodeURIComponent(nextPath);
    return `${origin}/auth/callback?next=${next}`;
  }, [origin, nextPath]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" || !session?.user || redirectedRef.current) return;
      redirectedRef.current = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      const dest = profile?.role === "super-admin" ? `/${locale}/admin` : nextPath;
      router.replace(dest);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [supabase, locale, nextPath, router]);

  const localization = useMemo(
    () => ({
      variables: {
        sign_in: {
          email_label: t("email"),
          password_label: t("password"),
          email_input_placeholder: t("emailPlaceholder"),
          password_input_placeholder: t("passwordPlaceholder"),
          button_label: t("submitPassword"),
          loading_button_label: t("loading"),
        },
        magic_link: {
          email_input_label: t("email"),
          email_input_placeholder: t("emailPlaceholder"),
          button_label: t("sendMagicLink"),
          loading_button_label: t("loading"),
          confirmation_text: t("magicLinkSent"),
        },
      },
    }),
    [t],
  );

  return (
    <div className="mx-auto w-full max-w-[420px] space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/icons/icon-192x192.png"
          alt=""
          width={80}
          height={80}
          priority
          className="rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.25)]"
        />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-card/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex rounded-[18px] border border-border bg-background/40 p-1">
          <button
            type="button"
            className={cn(
              "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
              view === "magic_link"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setView("magic_link")}
          >
            {t("tabMagicLink")}
          </button>
          <button
            type="button"
            className={cn(
              "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
              view === "sign_in"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setView("sign_in")}
          >
            {t("tabPassword")}
          </button>
        </div>

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <Auth
          key={view}
          supabaseClient={supabase}
          view={view}
          providers={[]}
          magicLink={view === "magic_link"}
          showLinks={false}
          redirectTo={redirectTo}
          appearance={{
            extend: true,
            theme: ThemeSupa,
            variables: {
              default: {
                radii: {
                  borderRadiusButton: "18px",
                  inputBorderRadius: "14px",
                },
                colors: {
                  brand: "rgb(37 99 235)",
                  brandAccent: "rgb(29 78 216)",
                  inputBackground: "rgb(255 255 255)",
                  inputBorder: "rgb(226 232 240)",
                  inputText: "rgb(15 23 42)",
                  messageText: "rgb(51 65 85)",
                },
              },
            },
          }}
          localization={localization}
        />
      </div>
    </div>
  );
}
