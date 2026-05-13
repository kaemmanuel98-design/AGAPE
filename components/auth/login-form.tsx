"use client";

import { Loader2, MessageSquareMore, Smartphone } from "lucide-react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { mapSupabaseAuthError } from "@/lib/auth/map-auth-error";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/** Best-effort E.164 for Supabase Phone OTP (spaces stripped, 00→+, +digits cleaned, FR 0… → +33…). */
function normalizePhoneForOtp(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let compact = trimmed.replace(/\s/g, "").replace(/[().-]/g, "");
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (compact.startsWith("+")) {
    const rest = compact.slice(1).replace(/\D/g, "");
    return rest ? `+${rest}` : "";
  }
  const digits = compact.replace(/\D/g, "");
  if (/^0[1-9]\d{8}$/.test(digits)) return `+33${digits.slice(1)}`;
  if (/^33\d{9}$/.test(digits)) return `+${digits}`;
  return compact;
}

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
    return `/${locale}/profile`;
  }, [nextRaw, locale]);

  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);
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

  async function requestOtp(phone: string) {
    setFormError(null);
    setFormInfo(null);
    setPending(true);

    if (!phone) {
      setFormError(t("authErrors.missing_fields"));
      setPending(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setFormError(translateAuthError(error.message));
      setPending(false);
      return;
    }

    setPhoneNumber(phone);
    setStep("verify");
    setFormInfo(t("otpSent"));
    setPending(false);
  }

  async function onSubmitPhone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = normalizePhoneForOtp(String(fd.get("phone") ?? ""));
    await requestOtp(phone);
  }

  async function onSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormInfo(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();

    if (!phoneNumber || !code) {
      setFormError(t("authErrors.missing_fields"));
      setPending(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      setFormError(translateAuthError(error.message));
      setPending(false);
      return;
    }

    if (data.user) {
      const dest = await resolvePostAuthDestination(supabase, data.user.id, locale, nextPath);
      router.replace(dest);
      router.refresh();
      setPending(false);
      return;
    }

    setFormError(t("authErrors.invalid_otp"));
    setPending(false);
  }

  return (
    <div className={cn("mx-auto w-full max-w-[440px] space-y-6", embedded && "space-y-5")}>
      {!embedded ? (
        <>
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandLogo
              height={100}
              priority
              className="drop-shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
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
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
            <Smartphone className="size-4 text-primary" />
            {t("phoneStep")}
          </div>
          <div className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
            <MessageSquareMore className="size-4 text-primary" />
            {t("codeStep")}
          </div>
        </div>

        {errorParam ? (
          <p className="mb-4 rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">
            {errorParam}
          </p>
        ) : null}

        <div className="space-y-4">
          {formError ? (
            <p className="rounded-[12px] border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-amber-50">
              {formError}
            </p>
          ) : null}

          {formInfo ? (
            <p className="rounded-[12px] border border-sky-500/35 bg-sky-500/10 px-3 py-2 text-sm leading-relaxed text-sky-50">
              {formInfo}
            </p>
          ) : null}

          {step === "phone" ? (
            <form className="space-y-4" onSubmit={(ev) => void onSubmitPhone(ev)}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="login-phone">
                  {t("phone")}
                </label>
                <input
                  id="login-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  defaultValue={phoneNumber}
                  placeholder={t("phonePlaceholder")}
                  className="h-12 w-full rounded-[16px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
                />
              </div>

              <Button
                type="submit"
                className="h-14 w-full min-h-[52px] rounded-[18px] gap-2 text-base font-semibold"
                disabled={pending}
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {t("submitPhone")}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={(ev) => void onSubmitCode(ev)}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="verify-phone">
                  {t("phone")}
                </label>
                <input
                  id="verify-phone"
                  type="tel"
                  value={phoneNumber}
                  readOnly
                  className="h-12 w-full rounded-[16px] border border-input bg-background/70 px-4 text-foreground outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="login-code">
                  {t("code")}
                </label>
                <input
                  id="login-code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder={t("codePlaceholder")}
                  className="h-12 w-full rounded-[16px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">{t("otpHint")}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="h-14 w-full min-h-[52px] rounded-[18px] gap-2 text-base font-semibold"
                  disabled={pending}
                >
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {t("submitCode")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-full min-h-[52px] rounded-[18px] text-base font-medium"
                  disabled={pending}
                  onClick={() => {
                    void requestOtp(phoneNumber);
                  }}
                >
                  {t("resendCode")}
                </Button>
              </div>

              <button
                type="button"
                className="w-full text-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
                onClick={() => {
                  setStep("phone");
                  setOtpCode("");
                  setFormError(null);
                  setFormInfo(null);
                }}
              >
                {t("backToPhone")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
