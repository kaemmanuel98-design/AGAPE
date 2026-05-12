"use client";

import type { FormEvent } from "react";
import { AlertTriangle, HeartHandshake, Loader2, PhoneCall } from "lucide-react";
import { useState, useTransition } from "react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { createAssistanceRequest } from "@/lib/actions/prayer-requests";

const TYPE_OPTIONS = [
  { value: "urgence_vitale", label: "Urgence vitale / Detresse" },
  { value: "maladie", label: "Maladie" },
  { value: "deuil", label: "Deuil" },
  { value: "accompagnement", label: "Accompagnement" },
] as const;

export function AgapeAssistance() {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createAssistanceRequest(formData);

      if (result.ok) {
        if (result.severity === "critical") {
          setStatus(
            "Votre appel a été entendu. Une notification prioritaire a été envoyée à nos responsables. Restez en ligne, nous arrivons.",
          );
        } else {
          setStatus(
            "Votre message a été reçu. Un responsable d'AGAPE vous contactera très rapidement. Vous n'êtes pas seul(e).",
          );
        }
        form.reset();
      } else if (result.message === "unauthorized") {
        setStatus("Connectez-vous pour demander un accompagnement AGAPE.");
      } else if (result.message === "missing_fields") {
        setStatus("Merci de choisir le type de besoin, d'ecrire votre message et de laisser un contact.");
      } else {
        setStatus("L'envoi est temporairement indisponible. Reessayez dans quelques instants.");
      }
    });
  }

  return (
    <section className="space-y-6 rounded-[34px] border border-rose-100/80 bg-gradient-to-br from-white via-rose-50/60 to-sky-50/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="rounded-[24px] border border-red-200/80 bg-red-50/95 px-5 py-4 text-red-900 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
              Alerte prioritaire
            </p>
            <p className="text-sm leading-6">
              Si votre vie est en danger immediat, appelez les secours (15/112) avant de remplir
              ce formulaire.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
          <HeartHandshake className="size-3.5" />
          AGAPE Assistance
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Nous vous ecoutons avec douceur
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Cet espace est la pour demander un accompagnement fraternel, bienveillant et discret.
          Decrivez simplement votre besoin, nous reviendrons vers vous rapidement.
        </p>
      </div>

      <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Type de besoin</span>
          <select
            name="assistance_type"
            required
            defaultValue=""
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
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
            placeholder="Expliquez ce que vous traversez, a votre rythme..."
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Contact (telephone ou e-mail)</span>
          <div className="relative">
            <PhoneCall className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              name="contact"
              type="text"
              required
              placeholder="Ex. 07 00 00 00 00 ou vous@exemple.com"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" variant="brand" disabled={pending} className="rounded-full border-0 px-6">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <HeartHandshake className="size-4" />}
            Demander un accompagnement
          </Button>
        </div>

        {status ? (
          <div className="space-y-1 rounded-[22px] bg-white/90 px-4 py-3 shadow-sm">
            <p className="max-w-2xl text-sm leading-6 text-slate-700">{status}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
              Équipe d&apos;encadrement AGAPE
            </p>
          </div>
        ) : null}
      </form>
    </section>
  );
}
