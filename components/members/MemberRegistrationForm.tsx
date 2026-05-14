"use client";

import NextLink from "next/link";
import type { FormEvent } from "react";
import { useActionState, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  GraduationCap,
  HeartHandshake,
  Loader2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  registerMemberFormAction,
  type MemberRegistrationFormState,
} from "@/lib/actions/member-registration";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const TALENT_KEYS = ["musique_piano", "academie", "technique_it", "organisation", "ecoute_benevole"] as const;
const ACCOMP_KEYS = ["soutien_moral", "deuil", "maladie", "urgence"] as const;

const initialFormState: MemberRegistrationFormState = { status: "idle" };

/** Traduit la valeur `message` renvoyée par l’action lorsque `status === "error"`. */
function messageForRegisterError(
  message: string,
  t: ReturnType<typeof useTranslations<"memberRegistration">>,
) {
  if (message === "invalid_phone") return t("errorPhone");
  if (message === "invalid_fields") return t("errorFields");
  return t("errorGeneric");
}

/** Bouton d’envoi : `useFormStatus` pour l’état « en cours » (intégration formulaire natif + Server Action). */
function MemberJoinSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-14 w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-sky-700 to-sky-600 text-base font-semibold text-white shadow-lg hover:from-sky-800 hover:to-sky-700 sm:ml-auto sm:min-w-[280px]"
    >
      {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <HeartHandshake className="size-5" aria-hidden />}
      {label}
    </Button>
  );
}

export function MemberRegistrationForm() {
  const t = useTranslations("memberRegistration");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(registerMemberFormAction, initialFormState);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("fr");

  const [talentPick, setTalentPick] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TALENT_KEYS.map((k) => [k, false])),
  );

  const [accompanimentNeed, setAccompanimentNeed] = useState<(typeof ACCOMP_KEYS)[number] | "">("");
  const [supportMessage, setSupportMessage] = useState("");

  const stepMeta = useMemo(
    () => [
      { label: t("stepContact"), icon: UserRound },
      { label: t("stepTalents"), icon: Sparkles },
      { label: t("stepSupport"), icon: HeartHandshake },
    ],
    [t],
  );

  const talentDefs = useMemo(
    () =>
      TALENT_KEYS.map((key) => ({
        key,
        label:
          key === "musique_piano"
            ? t("talentMusique")
            : key === "academie"
              ? t("talentAcademie")
              : key === "technique_it"
                ? t("talentTech")
                : key === "organisation"
                  ? t("talentOrga")
                  : t("talentEcoute"),
      })),
    [t],
  );

  function validateStep0() {
    return (
      lastName.trim().length >= 1 &&
      lastName.length <= 120 &&
      firstName.trim().length >= 1 &&
      firstName.length <= 120 &&
      phone.trim().length >= 5 &&
      phone.length <= 160 &&
      city.trim().length >= 1 &&
      city.length <= 160 &&
      ["fr", "en", "nl", "autre"].includes(preferredLanguage)
    );
  }

  function validateStep1() {
    return TALENT_KEYS.some((k) => talentPick[k]);
  }

  function validateStep2() {
    return ACCOMP_KEYS.includes(accompanimentNeed as (typeof ACCOMP_KEYS)[number]);
  }

  function goNext() {
    setStepError(null);
    if (step === 0 && !validateStep0()) {
      setStepError(t("errorFields"));
      return;
    }
    if (step === 1 && !validateStep1()) {
      setStepError(t("errorTalents"));
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }

  function goPrev() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const serverActionError = state.status === "error" ? messageForRegisterError(state.message, t) : null;
  /** Succès explicite (évite toute confusion avec une réponse JSON brute côté navigateur). */
  const isSuccess = state.status === "success";

  if (isSuccess) {
    return (
      <section
        id="member-registration"
        className="scroll-mt-28 overflow-hidden rounded-[28px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/40 p-1 shadow-[0_20px_50px_rgba(16,185,129,0.12)] sm:p-1.5"
      >
        <motion.div
          className="rounded-[24px] bg-white/85 px-6 py-12 text-center backdrop-blur-sm sm:px-10 sm:py-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner ring-4 ring-emerald-200/60">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.08 }}
              aria-hidden
            >
              <CircleCheck className="size-14" strokeWidth={1.75} />
            </motion.div>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-2xl font-semibold tracking-tight text-emerald-900 sm:text-3xl">
            {t("successJoinedAgape")}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-base font-medium text-emerald-800/90 sm:text-lg">{t("successThankYou")}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-sky-900/90 sm:text-base">{t("successRegistered")}</p>

          {state.severity === "critical" ? (
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-rose-800/90">{t("successUrgentAddon")}</p>
          ) : null}

          <div className="mt-10 flex flex-col flex-wrap items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-sky-200 bg-white px-8 text-sky-900 hover:bg-sky-50">
              <NextLink href={`/${routing.defaultLocale}`}>{t("backToHome")}</NextLink>
            </Button>
            <Button asChild size="lg" className="h-12 rounded-2xl bg-sky-700 px-8 text-white hover:bg-sky-800">
              <NextLink href="/academy" className="inline-flex items-center justify-center gap-2">
                <GraduationCap className="size-5 shrink-0" aria-hidden />
                {t("exploreAcademy")}
              </NextLink>
            </Button>
          </div>
        </motion.div>
      </section>
    );
  }

  const errorBanner = step === 2 ? stepError ?? serverActionError : stepError;

  return (
    <section
      id="member-registration"
      className="scroll-mt-28 overflow-hidden rounded-[28px] border border-sky-100/80 bg-gradient-to-br from-sky-50 via-white to-sky-100/30 p-1 shadow-[0_20px_50px_rgba(30,64,175,0.08)] sm:p-1.5"
    >
      <div className="rounded-[24px] bg-white/70 px-4 py-6 backdrop-blur-sm sm:px-8 sm:py-8">
        <div className="text-center">
          <p className="text-xl font-bold tracking-[0.22em] text-sky-950 sm:text-2xl">{t("brandTitle")}</p>

          <div className="mx-auto mt-8 flex max-w-md justify-center gap-3 sm:gap-6">
            {stepMeta.map((meta, idx) => {
              const Icon = meta.icon;
              const active = idx === step;
              const done = idx < step;
              return (
                <div key={meta.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border-2 text-sky-700 transition-all",
                      active && "border-sky-500 bg-sky-500 text-white shadow-lg",
                      done && !active && "border-sky-300 bg-sky-100 text-sky-800",
                      !active && !done && "border-sky-100 bg-white text-sky-400",
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                  </div>
                  <span
                    className={cn(
                      "text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-sky-700/85 sm:text-xs",
                      active && "text-sky-950",
                    )}
                  >
                    {idx + 1}. {meta.label}
                  </span>
                </div>
              );
            })}
          </div>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">{t("title")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sky-800/90">{t("subtitle")}</p>
        </div>

        <form
          className="mt-8 space-y-6"
          action={formAction}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            if (step < 2) {
              e.preventDefault();
              return;
            }
            if (!validateStep2()) {
              e.preventDefault();
              setStepError(t("errorFields"));
            }
          }}
        >
          {/* Données postées vers la Server Action (évite une navigation « page JSON »). */}
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="last_name" value={lastName} />
          <input type="hidden" name="first_name" value={firstName} />
          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="preferred_language" value={preferredLanguage} />
          <input type="hidden" name="accompaniment_need" value={accompanimentNeed} />
          <input type="hidden" name="support_message" value={supportMessage} />
          {TALENT_KEYS.filter((k) => talentPick[k]).map((k) => (
            <input key={k} type="hidden" name="talents" value={k} />
          ))}

          {step === 0 ? (
            <div className="grid gap-4 rounded-2xl border border-sky-100/90 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-inner sm:grid-cols-2 sm:p-6">
              <label className="grid gap-2 sm:col-span-1">
                <span className="text-sm font-medium text-sky-950">{t("lastName")}</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  maxLength={120}
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                />
              </label>
              <label className="grid gap-2 sm:col-span-1">
                <span className="text-sm font-medium text-sky-950">{t("firstName")}</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  maxLength={120}
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-sky-950">{t("phone")}</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  maxLength={160}
                  placeholder={t("phonePlaceholder")}
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                />
              </label>
              <label className="grid gap-2 sm:col-span-1">
                <span className="text-sm font-medium text-sky-950">{t("city")}</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  maxLength={160}
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                />
              </label>
              <label className="grid gap-2 sm:col-span-1">
                <span className="text-sm font-medium text-sky-950">{t("languageLabel")}</span>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                >
                  <option value="fr">{t("langFr")}</option>
                  <option value="en">{t("langEn")}</option>
                  <option value="nl">{t("langNl")}</option>
                  <option value="autre">{t("langAutre")}</option>
                </select>
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3 rounded-2xl border border-sky-100/90 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-inner sm:p-6">
              <div>
                <p className="text-base font-semibold text-sky-950">{t("talentsHeading")}</p>
                <p className="mt-1 text-sm text-sky-800/85">{t("talentsHint")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {talentDefs.map(({ key, label }) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors",
                      talentPick[key]
                        ? "border-sky-400 bg-sky-50/90 text-sky-950"
                        : "border-sky-100 bg-white/90 text-slate-800 hover:border-sky-200",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={talentPick[key]}
                      onChange={() =>
                        setTalentPick((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="size-4 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5 rounded-2xl border border-sky-100/90 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-inner sm:p-6">
              <p className="text-base font-semibold text-sky-950">{t("needLabel")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["soutien_moral", t("needSoutien")],
                    ["deuil", t("needDeuil")],
                    ["maladie", t("needMaladie")],
                    ["urgence", t("needUrgence")],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors",
                      accompanimentNeed === value
                        ? value === "urgence"
                          ? "border-rose-400 bg-rose-50 text-rose-950"
                          : "border-sky-400 bg-sky-50 text-sky-950"
                        : "border-sky-100 bg-white/90 hover:border-sky-200",
                    )}
                  >
                    <input
                      type="radio"
                      name="accomp"
                      checked={accompanimentNeed === value}
                      onChange={() => setAccompanimentNeed(value)}
                      className="size-4 border-sky-300 text-sky-600 focus:ring-sky-400"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-sky-950">{t("optionalMessageHeading")}</span>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder={t("optionalMessagePlaceholder")}
                  className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-200/70 focus:ring-2"
                />
              </label>
            </div>
          ) : null}

          {errorBanner ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 shadow-sm"
            >
              {errorBanner}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={isPending || step === 0}
              className="h-12 w-full rounded-2xl border-sky-200 bg-white/95 text-sky-900 hover:bg-sky-50 sm:w-auto"
            >
              <ChevronLeft className="size-4" aria-hidden />
              {t("prev")}
            </Button>

            {step < 2 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={isPending}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 px-6 text-white shadow-md hover:from-sky-700 hover:to-sky-600 sm:w-auto sm:min-w-[10rem]"
              >
                {t("next")}
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <MemberJoinSubmitButton label={t("submitJoinCommunity")} />
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
