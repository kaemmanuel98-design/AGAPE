"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SecretAdminLogin() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Accès refusé. Vérifiez vos identifiants administrateur.");
      setPending(false);
      return;
    }

    window.location.reload();
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 space-y-2 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          <LockKeyhole className="size-3.5 text-slate-700" aria-hidden />
          Accès discret AGAPE
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">AGAPE — Administration</h1>
        <p className="text-sm text-slate-600">Connexion réservée à l’équipe d’encadrement AGAPE.</p>
      </div>

      <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Email administrateur</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@agape.org"
            className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-12 rounded-2xl border border-slate-200 px-4 text-slate-900 outline-none ring-sky-200 focus:ring-2"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
        ) : null}

        <Button type="submit" disabled={pending} className="h-12 rounded-2xl text-base font-semibold">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Se connecter
        </Button>
      </form>
    </section>
  );
}
