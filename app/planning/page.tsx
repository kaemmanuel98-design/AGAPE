import { CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = "Les prochains événements de la communauté arrivent bientôt.";

function ComingSoonShell() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-950 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
        <CalendarDays className="size-8" aria-hidden />
      </div>
      <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-slate-100">{EMPTY_MESSAGE}</p>
    </main>
  );
}

/**
 * Page racine `/planning` : lecture Supabase `planning`.
 * Données absentes ou erreur → message communautaire ; sinon redirection vers le planning localisé.
 */
export default async function PlanningRootPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("planning").select("*");

  if (error) {
    console.error("[AGAPE Planning] Requête Supabase échouée sur `planning` :", error.message, error);
    console.log("[AGAPE Planning] Affichage du message d’attente (pas de données exploitables).");
    return <ComingSoonShell />;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    console.log("[AGAPE Planning] Table vide ou aucun créneau — message d’attente affiché.");
    return <ComingSoonShell />;
  }

  console.log("[AGAPE Planning] Données reçues :", rows.length, "ligne(s) — redirection vers /", routing.defaultLocale, "/planning");
  redirect(`/${routing.defaultLocale}/planning`);
}
