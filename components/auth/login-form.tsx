"use client";

import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextPath =
    nextRaw && nextRaw.startsWith("/") ? nextRaw : `/${locale}`;

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signError) {
      setError(signError.message);
      setPending(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-[var(--radius)] border border-border bg-card/60 p-8 shadow-xl backdrop-blur-md">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 w-full rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
          />
        </div>

        {error ? (
          <p className="rounded-[12px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full rounded-[var(--radius)] gap-2" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
