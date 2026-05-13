"use client";

import type { FormEvent } from "react";
import { AlertTriangle, HeartHandshake, Loader2, PhoneCall } from "lucide-react";
import { useState, useTransition } from "react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { createAssistanceRequest } from "@/lib/actions/prayer-requests";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "urgence_vitale", label: "Urgence vitale / Détresse" },
  { value: "maladie", label: "Maladie" },
  { value: "deuil", label: "Deuil" },
  { value: "accompagnement", label: "Accompagnement" },
] as const;

export function AgapeAssistance() {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "calm" | "comfort" | "error" } | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setStatusText(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createAssistanceRequest(formData);

      if (result.ok) {
        if (result.severity === "critical") {
          setStatus({ tone: "comfort" });
          setStatusText(
            "Dieu vous voit, vous tient, et vous n’êtes pas seul(e) en ce moment. Votre appel a bien été reçu : une notification prioritaire part vers nos responsables. Respirez lentement ; une voix amie vous contactera très vite.",
          );
        } else {
          setStatus({ tone: "calm" });
          setStatusText(
            "Votre message a été reçu. Un responsable d’AGAPE vous contactera très rapidement. Vous n’êtes pas seul(e).",
          );
        }
        form.reset();
      } else if (result.message === "unauthorized") {
        setStatus({ tone: "error" });
        setStatusText("Connectez-vous pour demander un accompagnement AGAPE.");
      } else if (result.message === "missing_fields") {
        setStatus({ tone: "error" });
        setStatusText("Merci de choisir le type de besoin, d’écrire votre message et de laisser un numéro de téléphone.");
      } else {
        setStatus({ tone: "error" });
        setStatusText("L’envoi est temporairement indisponible. Réessayez dans quelques instants.");
      }
    });
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200/90 bg-slate-50/40 p-6 shadow-sm sm:p-8">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-amber-700 shadow-sm">
            <AlertTriangle className="size-4" aria-hidden />
          </div>
          <p className="text-sm leading-relaxed">
            <span className="font-medium">En cas de danger immédiat pour votre vie,</span> appelez les secours (15 ou 112)
            avant de remplir ce formulaire.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          <HeartHandshake className="size-3.5 text-sky-600" aria-hidden />
          AGAPE Assistance
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Nous vous écoutons avec douceur</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Un espace discret pour demander un accompagnement fraternel. Décrivez votre besoin à votre rythme ; nous vous
          répondrons rapidement.
        </p>
      </div>

      <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Type de besoin</span>
          <select
            name="category"
            required
            defaultValue=""
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-sky-200/60 focus:ring-2"
          >
            <option value="" disabled>
              Choisir un type de besoin
            </option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Message</span>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Expliquez ce que vous traversez, à votre rythme…"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-200/60 focus:ring-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Téléphone de contact</span>
          <div className="relative">
            <PhoneCall className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              name="phone_contact"
              type="tel"
              required
              autoComplete="tel"
              placeholder="Ex. +33 7 00 00 00 00"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none ring-sky-200/60 focus:ring-2"
            />
          </div>
        </label>

        <Button
          type="submit"
          variant="brand"
          disabled={pending}
          className="mt-1 h-14 w-full min-h-[52px] rounded-2xl border-0 text-base font-semibold shadow-sm"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <HeartHandshake className="size-4" aria-hidden />}
          Demander un accompagnement
        </Button>

        {status && statusText ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-4 text-sm leading-relaxed shadow-sm",
              status.tone === "comfort" &&
                "border-sky-200/80 bg-gradient-to-br from-sky-50 to-white text-slate-800",
              status.tone === "calm" && "border-slate-200 bg-white text-slate-700",
              status.tone === "error" && "border-amber-200 bg-amber-50/90 text-amber-950",
            )}
          >
            <p>{statusText}</p>
            {status.tone !== "error" ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-sky-700">Équipe d’encadrement AGAPE</p>
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}
