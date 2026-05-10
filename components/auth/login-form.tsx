"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MainTab = "magic_link" | "password";
type PasswordMode = "sign_in" | "sign_up";

async function resolvePostAuthDestination(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  userId: string,
  locale: string,
  nextPath: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return profile?.role === "super-admin" ? `/${locale}/admin` : nextPath;
}

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const kidsMode = searchParams.get("kids") === "1";

  const nextPath = useMemo(() => {
    if (nextRaw && nextRaw.startsWith("/")) return nextRaw;
    if (kidsMode) return `/${locale}/kids`;
    return `/${locale}`;
  }, [nextRaw, locale, kidsMode]);

  const [mainTab, setMainTab] = useState<MainTab>("password");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("sign_up");
  const [origin, setOrigin] = useState("");
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (kidsMode) setMainTab("password");
  }, [kidsMode]);

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
      const dest = await resolvePostAuthDestination(supabase, session.user.id, locale, nextPath);
      router.replace(dest);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [supabase, locale, nextPath, router]);

  const authView = mainTab === "magic_link" ? "magic_link" : passwordMode;

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
        sign_up: {
          email_label: t("email"),
          password_label: t("password"),
          email_input_placeholder: t("emailPlaceholder"),
          password_input_placeholder: t("passwordPlaceholder"),
          button_label: t("submitSignUp"),
          loading_button_label: t("loading"),
          confirmation_text: t("signUpConfirmation"),
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
    <div
      className={cn(
        "mx-auto w-full max-w-[440px] space-y-6",
        kidsMode && "max-w-[480px] space-y-8 pb-4 text-[17px]",
      )}
    >
      {kidsMode ? (
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild className="gap-2 rounded-[14px] text-slate-700 hover:bg-white/80">
            <Link href="/kids">
              <ArrowLeft className="size-4" aria-hidden />
              {t("kidsBackToSpace")}
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/icons/icon-192x192.png"
          alt=""
          width={kidsMode ? 96 : 80}
          height={kidsMode ? 96 : 80}
          priority
          className={cn(
            "rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.25)]",
            kidsMode && "rounded-[26px] shadow-[0_14px_44px_rgba(14,165,233,0.2)]",
          )}
        />
        <div className="space-y-2">
          <h1
            className={cn(
              "font-semibold tracking-tight text-foreground",
              kidsMode ? "text-3xl md:text-4xl" : "text-3xl",
            )}
          >
            {kidsMode ? t("kidsTitle") : t("title")}
          </h1>
          <p className={cn("text-muted-foreground", kidsMode ? "max-w-md text-lg leading-relaxed" : "mt-1 text-sm")}>
            {kidsMode ? t("kidsSubtitle") : t("subtitle")}
          </p>
        </div>
      </div>

      {!kidsMode ? (
        <p className="rounded-[var(--radius)] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm leading-relaxed text-emerald-50">
          {t("firstAccountAdminHint")}
        </p>
      ) : (
        <p className="rounded-[var(--radius)] border border-sky-300/50 bg-sky-50/90 px-4 py-3 text-center text-base leading-relaxed text-slate-800 shadow-sm">
          {t("kidsParentHint")}
        </p>
      )}

      <div
        className={cn(
          "rounded-[var(--radius)] border border-border bg-card/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8",
          kidsMode && "border-sky-200/90 bg-white/95 p-7 shadow-[0_20px_50px_rgba(14,165,233,0.12)] sm:p-9",
        )}
      >
        {!kidsMode ? (
          <div className="mb-6 flex rounded-[18px] border border-border bg-background/40 p-1">
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
                mainTab === "magic_link"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMainTab("magic_link")}
            >
              {t("tabMagicLink")}
            </button>
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
                mainTab === "password"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMainTab("password")}
            >
              {t("tabPassword")}
            </button>
          </div>
        ) : null}

        {mainTab === "magic_link" ? (
          <p className="mb-4 rounded-[14px] border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center text-xs leading-relaxed text-amber-100/95">
            {t("magicLinkEmailHint")}
          </p>
        ) : (
          <div
            className={cn(
              "mb-6 flex rounded-[18px] border border-border bg-background/40 p-1",
              kidsMode && "border-sky-200 bg-sky-50/80 p-1.5",
            )}
          >
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2.5 font-medium transition-colors",
                kidsMode ? "min-h-[48px] text-base" : "py-2 text-sm",
                passwordMode === "sign_in"
                  ? kidsMode
                    ? "bg-white text-slate-900 shadow-md"
                    : "bg-background text-foreground shadow-sm"
                  : kidsMode
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPasswordMode("sign_in")}
            >
              {kidsMode ? t("kidsTabLogin") : t("passwordSubSignIn")}
            </button>
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2.5 font-medium transition-colors",
                kidsMode ? "min-h-[48px] text-base" : "py-2 text-sm",
                passwordMode === "sign_up"
                  ? kidsMode
                    ? "bg-sky-600 text-white shadow-md"
                    : "bg-background text-foreground shadow-sm"
                  : kidsMode
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPasswordMode("sign_up")}
            >
              {kidsMode ? t("kidsTabSignUp") : t("passwordSubSignUp")}
            </button>
          </div>
        )}

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <div className={cn(kidsMode && "[&_label]:text-base [&_input]:h-12 [&_input]:text-base [&_button]:min-h-[52px] [&_button]:text-base")}>
          <Auth
            key={`${mainTab}-${passwordMode}-${kidsMode}`}
            supabaseClient={supabase}
            view={authView}
            providers={[]}
            magicLink={authView === "magic_link"}
            showLinks={false}
            redirectTo={mainTab === "magic_link" ? redirectTo : undefined}
            appearance={{
              extend: true,
              theme: ThemeSupa,
              variables: {
                default: {
                  radii: {
                    borderRadiusButton: kidsMode ? "20px" : "18px",
                    inputBorderRadius: kidsMode ? "16px" : "14px",
                  },
                  colors: {
                    brand: kidsMode ? "rgb(2 132 199)" : "rgb(37 99 235)",
                    brandAccent: kidsMode ? "rgb(3 105 161)" : "rgb(29 78 216)",
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
    </div>
  );
}
