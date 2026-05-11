"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { mapSupabaseAuthError } from "@/lib/auth/map-auth-error";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

export function LoginForm({ embedded = false }: { embedded?: boolean }) {
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

  const [passwordMode, setPasswordMode] = useState<PasswordMode>("sign_up");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

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

  function translateAuthError(message: string) {
    const key = mapSupabaseAuthError(message);
    return key === "generic" ? message || t("authErrors.generic") : t(`authErrors.${key}`);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    if (!email || !password) {
      setFormError(t("authErrors.missing_fields"));
      setPending(false);
      return;
    }

    if (passwordMode === "sign_in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setFormError(translateAuthError(error.message));
        setPending(false);
        return;
      }
      router.refresh();
      setPending(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` : undefined,
      },
    });

    if (error) {
      const key = mapSupabaseAuthError(error.message);
      if (key === "user_already_exists") {
        setFormError(t("authErrors.user_already_exists"));
        setPasswordMode("sign_in");
      } else {
        setFormError(translateAuthError(error.message));
      }
      setPending(false);
      return;
    }

    if (data.session?.user) {
      router.refresh();
      setPending(false);
      return;
    }

    setFormError(t("authErrors.no_session_after_signup"));
    setPending(false);
  }

  return (
    <div className={cn("mx-auto w-full max-w-[440px] space-y-6", embedded && "space-y-5")}>
      {!embedded ? (
        <>
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src="/icons/icon-192x192.png"
              alt=""
              width={80}
              height={80}
              priority
              className="rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.25)]"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
          <p className="rounded-[var(--radius)] border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-center text-xs leading-relaxed text-sky-50">
            {t("instantSessionHint")}
          </p>
        </>
      ) : (
        <h2 className="text-center text-xl font-semibold tracking-tight text-foreground">{t("adultSpaceHeading")}</h2>
      )}

      <div
        className={cn(
          "rounded-[var(--radius)] border border-border bg-card/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8",
        )}
      >
        <div className="mb-6 flex rounded-[18px] border border-border bg-background/40 p-1">
          <button
            type="button"
            className={cn(
              "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
              passwordMode === "sign_in"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => {
              setPasswordMode("sign_in");
              setFormError(null);
            }}
          >
            {t("passwordSubSignIn")}
          </button>
          <button
            type="button"
            className={cn(
              "relative flex-1 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
              passwordMode === "sign_up"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => {
              setPasswordMode("sign_up");
              setFormError(null);
            }}
          >
            {t("passwordSubSignUp")}
          </button>
        </div>

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <form key={passwordMode} className="space-y-4" onSubmit={(ev) => void onSubmit(ev)}>
          {formError ? (
            <p className="rounded-[12px] border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-amber-50">
              {formError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="login-email">
              {t("email")}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-[14px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="login-password">
              {t("password")}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete={passwordMode === "sign_up" ? "new-password" : "current-password"}
              required
              minLength={6}
              className="h-11 w-full rounded-[14px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
            />
          </div>

          <Button type="submit" className="h-11 w-full rounded-[18px] gap-2 font-semibold" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {passwordMode === "sign_in" ? t("submitPassword") : t("submitSignUp")}
          </Button>

          {passwordMode === "sign_up" ? (
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">{t("signUpConfirmation")}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
