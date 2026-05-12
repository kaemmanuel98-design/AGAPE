"use client";

import type { FormEvent } from "react";
import { HeartHandshake, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createPrayerRequest } from "@/lib/actions/prayer-requests";

export function PrayerForm() {
  const [pending, startTransition] = useTransition();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createPrayerRequest(formData);

      if (result.ok) {
        setStatus("Votre prière a bien ete deposee.");
        form.reset();
        setIsAnonymous(false);
      } else if (result.message === "missing_fields") {
        setStatus("Ajoutez votre message et votre nom si vous ne souhaitez pas rester anonyme.");
      } else {
        setStatus("Impossible d'envoyer la priere pour le moment. Reessayez dans un instant.");
      }
    });
  }

  return (
    <section className="space-y-5 rounded-[32px] border border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-slate-50 p-8 shadow-[0_18px_54px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          <HeartHandshake className="size-3.5" />
          Priere
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Deposer une priere
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Ecrivez simplement ce que vous portez sur le coeur. Vous pouvez signer votre message
          ou choisir de rester anonyme.
        </p>
      </div>

      <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Votre nom</span>
          <input
            name="sender_name"
            disabled={isAnonymous}
            placeholder="Ex. Emmanuel"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-sky-300/40 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Votre message</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Seigneur, je te confie..."
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
          />
        </label>

        <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="is_anonymous"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="size-4 rounded border-slate-300 text-sky-600"
          />
          Rester anonyme
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="brand" disabled={pending} className="rounded-full border-0 px-6">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Deposer ma priere
          </Button>
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}
