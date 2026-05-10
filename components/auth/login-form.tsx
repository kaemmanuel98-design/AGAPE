"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
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

  const nextPath = useMemo(() => {
    if (nextRaw && nextRaw.startsWith("/")) return nextRaw;
    return `/${locale}`;
  }, [nextRaw, locale]);

  const [mainTab, setMainTab] = useState<MainTab>("password");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("sign_in");
  const [origin, setOrigin] = useState("");
  const redirectedRef = useRef(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPending, setAdminPending] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

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

  async function onAdminSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdminError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("admin_email") ?? "").trim();
    const password = String(fd.get("admin_password") ?? "");

    if (!email || !password) {
      setAdminError(t("signupMissingFields"));
      return;
    }

    setAdminPending(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setAdminPending(false);

    if (error) {
      setAdminError(error.message);
      return;
    }

    if (data.session?.user) {
      router.refresh();
      return;
    }

    setAdminError(t("signupNoSession"));
  }

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

        {mainTab === "magic_link" ? (
          <p className="mb-4 rounded-[14px] border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center text-xs leading-relaxed text-amber-100/95">
            {t("magicLinkEmailHint")}
          </p>
        ) : (
          <div className="mb-4 flex rounded-[18px] border border-border bg-background/40 p-1">
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2 text-sm font-medium transition-colors",
                passwordMode === "sign_in"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPasswordMode("sign_in")}
            >
              {t("passwordSubSignIn")}
            </button>
            <button
              type="button"
              className={cn(
                "relative flex-1 rounded-[14px] py-2 text-sm font-medium transition-colors",
                passwordMode === "sign_up"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPasswordMode("sign_up")}
            >
              {t("passwordSubSignUp")}
            </button>
          </div>
        )}

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <Auth
          key={`${mainTab}-${passwordMode}`}
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

      <div className="rounded-[var(--radius)] border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{t("adminSignupTitle")}</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("adminSignupDescription")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 gap-2 rounded-[18px] border-primary/40 bg-primary/10 font-medium text-foreground hover:bg-primary/15"
            onClick={() => {
              setAdminOpen((v) => !v);
              setAdminError(null);
            }}
          >
            <ShieldPlus className="size-4" aria-hidden />
            {t("adminSignupToggle")}
          </Button>
        </div>

        {adminOpen ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => void onAdminSignUp(e)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_email">
                {t("email")}
              </label>
              <input
                id="admin_email"
                name="admin_email"
                type="email"
                autoComplete="email"
                required
                className="h-11 w-full rounded-[14px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_password">
                {t("password")}
              </label>
              <input
                id="admin_password"
                name="admin_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="h-11 w-full rounded-[14px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              />
              <p className="text-xs text-muted-foreground">{t("signupPasswordHint")}</p>
            </div>

            {adminError ? (
              <p className="rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {adminError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-[18px] gap-2 font-semibold"
              disabled={adminPending}
            >
              {adminPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {t("adminSignupSubmit")}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">{t("signupSupabaseHint")}</p>
          </form>
        ) : null}
      </div>
    </div>
  );
}
