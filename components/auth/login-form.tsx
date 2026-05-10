"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
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
      },
    }),
    [t],
  );

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
            onClick={() => setPasswordMode("sign_in")}
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
            onClick={() => setPasswordMode("sign_up")}
          >
            {t("passwordSubSignUp")}
          </button>
        </div>

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <Auth
          key={passwordMode}
          supabaseClient={supabase}
          view={passwordMode}
          providers={[]}
          magicLink={false}
          showLinks={false}
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
