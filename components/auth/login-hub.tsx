"use client";

import { ArrowLeft, Baby, Users } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";

import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function LoginFallback() {
  return (
    <div className="mx-auto max-w-md animate-pulse rounded-[var(--radius)] border border-border bg-card/40 p-8">
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="mt-6 h-10 w-full rounded bg-muted" />
      <div className="mt-4 h-10 w-full rounded bg-muted" />
    </div>
  );
}

export function LoginHub() {
  const t = useTranslations("login");
  const [step, setStep] = useState<"choose" | "adult">("choose");

  if (step === "adult") {
    return (
      <div className="mx-auto w-full max-w-[440px] space-y-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 rounded-[14px] text-muted-foreground hover:text-foreground"
          onClick={() => setStep("choose")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToSpaces")}
        </Button>
        <Suspense fallback={<LoginFallback />}>
          <LoginForm embedded />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-8 pb-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/icons/icon-192x192.png"
          alt=""
          width={88}
          height={88}
          priority
          className="rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.25)]"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t("hubTitle")}</h1>
          <p className="text-base text-muted-foreground">{t("hubSubtitle")}</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Button
          type="button"
          size="lg"
          className={cn(
            "min-h-[5.75rem] w-full flex-col gap-2 rounded-[var(--radius)] py-6 text-lg font-semibold shadow-lg sm:flex-row sm:gap-3",
          )}
          onClick={() => setStep("adult")}
        >
          <Users className="size-10 shrink-0" aria-hidden />
          <span>{t("spaceAdult")}</span>
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className="min-h-[5.75rem] w-full flex-col gap-2 rounded-[var(--radius)] border-2 border-sky-400/50 bg-gradient-to-br from-sky-500 to-sky-600 py-6 text-lg font-semibold text-white shadow-[0_14px_40px_rgba(2,132,199,0.35)] hover:from-sky-600 hover:to-sky-700 sm:flex-row sm:gap-3"
          asChild
        >
          <Link href="/kids/login" prefetch className="gap-2">
            <Baby className="size-10 shrink-0" aria-hidden />
            <span>{t("spaceChild")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
