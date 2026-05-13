"use client";

import { Download, LogOut, Siren } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MemberRegistrationRow } from "@/lib/members/types";
import { cn } from "@/lib/utils";

type Props = {
  rows: MemberRegistrationRow[];
};

function isCriticalRow(row: MemberRegistrationRow) {
  return (
    row.needs_urgent_help ||
    row.category === "urgence_vitale" ||
    row.category === "danger_immediat"
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function toCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(rows: MemberRegistrationRow[]) {
  const header = [
    "date_inscription",
    "nom_complet",
    "telephone",
    "ville",
    "situation",
    "categorie",
    "besoin_urgent",
    "message_accompagnement",
  ];
  const lines = rows.map((row) =>
    [
      row.created_at,
      row.full_name ?? "",
      row.phone,
      row.city ?? "",
      row.situation ?? "",
      row.category ?? "",
      row.needs_urgent_help ? "oui" : "non",
      row.support_message ?? "",
    ]
      .map(toCsvValue)
      .join(","),
  );
  return `\uFEFF${[header.join(","), ...lines].join("\n")}`;
}

function downloadCsv(rows: MemberRegistrationRow[], suffix: string) {
  const csv = buildCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agape-members-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MembersRegistrationDashboard({ rows }: Props) {
  const [filter, setFilter] = useState<"all" | "critical">("all");
  const [signingOut, setSigningOut] = useState(false);

  const sortedRows = useMemo(() => {
    const weight = (row: MemberRegistrationRow) => (isCriticalRow(row) ? 0 : 1);

    const base = [...rows].sort((a, b) => {
      const w = weight(a) - weight(b);
      if (w !== 0) return w;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (filter === "critical") {
      return base.filter((row) => isCriticalRow(row));
    }

    return base;
  }, [rows, filter]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = window.location.pathname;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AGAPE</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inscriptions membres</h2>
          <p className="text-sm text-slate-600">
            {sortedRows.length} entrée(s) affichée(s) · les urgences vitales restent en tête de liste.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={signingOut}
          onClick={() => void signOut()}
          className="rounded-xl"
        >
          <LogOut className="size-4" aria-hidden />
          Déconnexion
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="rounded-xl"
        >
          Toutes
        </Button>
        <Button
          type="button"
          variant={filter === "critical" ? "default" : "outline"}
          onClick={() => setFilter("critical")}
          className="rounded-xl"
        >
          Urgences vitales
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadCsv(sortedRows, "filtre")} className="rounded-xl">
          <Download className="size-4" aria-hidden />
          Export CSV (vue)
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadCsv(rows, "complet")} className="rounded-xl">
          <Download className="size-4" aria-hidden />
          Export CSV (tout)
        </Button>
      </div>

      {sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Aucune inscription pour le moment.
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedRows.map((row) => {
            const isCritical = isCriticalRow(row);
            return (
              <article
                key={row.id}
                className={cn(
                  "rounded-2xl border p-4",
                  isCritical ? "border-red-200 bg-red-50/70" : "border-slate-200 bg-slate-50/70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.full_name || "Membre AGAPE"}</p>
                    <p className="text-xs text-slate-500">{formatDate(row.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {row.category ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{row.category}</span>
                    ) : null}
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                        <Siren className="size-3.5" aria-hidden />
                        Urgence
                      </span>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Téléphone</dt>
                    <dd>{row.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Ville</dt>
                    <dd>{row.city || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Situation</dt>
                    <dd>{row.situation || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Aide urgente</dt>
                    <dd>{row.needs_urgent_help ? "Oui" : "Non"}</dd>
                  </div>
                </dl>

                {row.support_message ? (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/80 px-3 py-2 text-sm leading-relaxed text-slate-700">
                    {row.support_message}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
