"use client";

import type { FormEvent } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, HeartHandshake, Loader2, Siren } from "lucide-react";
import { useState, useTransition } from "react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { createMemberRegistration } from "@/lib/actions/member-registration";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Identité", "Contexte", "Accompagnement"] as const;

const CATEGORIES = [
  { value: "accompagnement", label: "Accompagnement général" },
  { value: "sante", label: "Santé / maladie" },
  { value: "deuil", label: "Deuil" },
  { value: "urgence_vitale", label: "Urgence vitale" },
] as const;

export function MemberForm() {
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "critical" | "error"; text: string } | null>(null);

  function nextStep() {
    setStep((value) => Math.min(value + 1, STEP_LABELS.length - 1));
  }

  function prevStep() {
    setStep((value) => Math.max(value - 1, 0));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createMemberRegistration(formData);
      if (!result.ok) {
        setStatus({
          tone: "error",
          text:
            result.message === "invalid_phone"
              ? "Merci de renseigner un numéro de téléphone valide."
              : "Impossible d'envoyer le formulaire pour le moment. Réessayez dans quelques instants.",
        });
        return;
      }

      if (result.severity === "critical") {
        setStatus({
          tone: "critical",
          text: "Votre demande urgente est bien reçue. Une alerte a été envoyée immédiatement à l'équipe AGAPE.",
        });
      } else {
        setStatus({
          tone: "success",
          text: "Merci. Votre inscription a bien été transmise. Nous revenons vers vous rapidement.",
        });
      }

      form.reset();
      setStep(0);
    });
  }

  return (
    <section id="member-form" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          <HeartHandshake className="size-3.5 text-sky-600" aria-hidden />
          Rejoindre AGAPE
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Parlez-nous de vous</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Quelques étapes simples pour mieux vous accompagner, sans écran surchargé sur smartphone.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {STEP_LABELS.map((label, idx) => (
          <div
            key={label}
            className={cn(
              "rounded-xl border px-3 py-2 text-center text-xs font-medium sm:text-sm",
              idx === step ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            {idx + 1}. {label}
          </div>
        ))}
      </div>

      <form className="mt-5 grid gap-4" onSubmit={(event) => void onSubmit(event)}>
        <input type="hidden" name="locale" value={locale} />

        {step === 0 ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Nom complet</span>
              <input
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Ex. Marie Dupont"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Téléphone (obligatoire)</span>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Ex. +33 7 00 00 00 00"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Ville</span>
              <input
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Ex. Lyon"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              />
            </label>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Situation</span>
              <input
                name="situation"
                type="text"
                placeholder="Ex. Nouveau dans la ville, parent solo, besoin de soutien"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Catégorie de besoin</span>
              <select
                name="category"
                defaultValue="accompagnement"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label
              id="member-form-urgent"
              className="flex scroll-mt-32 items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
            >
              <input name="needs_urgent_help" type="checkbox" className="mt-0.5 size-4 accent-red-600" />
              <span className="text-sm text-amber-900">
                <span className="font-semibold">Besoin d'aide urgente</span> (déclenche une alerte immédiate côté admin).
              </span>
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Comment pouvons-nous vous accompagner ?</span>
              <textarea
                name="support_message"
                rows={5}
                placeholder="Partagez votre besoin, votre contexte, et la meilleure façon de vous aider..."
                className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none ring-sky-200 focus:ring-2"
              />
            </label>
            <p className="inline-flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 size-4 text-slate-500" aria-hidden />
              En cas de danger vital immédiat, appelez d'abord les secours (15 ou 112).
            </p>
          </>
        ) : null}

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={pending || step === 0}
            className="h-12 w-full rounded-2xl sm:w-auto"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Précédent
          </Button>

          {step < STEP_LABELS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="h-12 w-full rounded-2xl sm:w-auto">
              Suivant
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="brand"
              disabled={pending}
              className="h-14 w-full min-h-[52px] rounded-2xl text-base font-semibold sm:w-auto sm:min-w-[240px]"
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
              Envoyer mon inscription
            </Button>
          )}
        </div>

        {status ? (
          <div
            className={cn(
              "mt-1 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
              status.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
              status.tone === "critical" && "border-red-200 bg-red-50 text-red-900",
              status.tone === "error" && "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            <p className="inline-flex items-center gap-2">
              {status.tone === "critical" ? <Siren className="size-4" aria-hidden /> : null}
              {status.text}
            </p>
          </div>
        ) : null}
      </form>
    </section>
  );
}
