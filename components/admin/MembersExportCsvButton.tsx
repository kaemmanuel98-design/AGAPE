"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MemberRegistrationRow } from "@/lib/members/types";

/**
 * Formate une cellule CSV : guillemets + échappement des guillemets internes (RFC 4180).
 * Indispensable pour Excel lorsque le texte contient des séparateurs ou retours ligne.
 */
function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

/** Extrait les libellés de talents pour une cellule texte (export). */
function talentsAsText(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  return raw.filter((t): t is string => typeof t === "string").join(", ");
}

/**
 * Construit le contenu CSV complet des membres inscrits.
 * Séparateur : point-virgule (;) — ouverture correcte dans Excel (locale FR).
 * Préfixe BOM UTF-8 pour qu'Excel détecte l'encodage.
 */
function buildMembersCsvSemicolon(rows: MemberRegistrationRow[]): string {
  const header = [
    "date_inscription",
    "prenom",
    "nom",
    "nom_complet",
    "telephone",
    "ville",
    "langue",
    "talents",
    "besoin_accompagnement",
    "categorie",
    "urgence_flag",
    "priorite_legacy",
    "priorite_emergency",
    "situation",
    "message_accompagnement",
    "notes_suivi_admin",
    "archive",
  ];

  const lines = rows.map((row) =>
    [
      row.created_at,
      row.first_name ?? "",
      row.last_name ?? "",
      row.full_name ?? "",
      row.phone,
      row.city ?? "",
      row.preferred_language ?? "",
      talentsAsText(row.talents),
      row.accompaniment_need ?? "",
      row.category ?? "",
      row.needs_urgent_help ? "oui" : "non",
      row.is_priority ? "oui" : "non",
      row.is_priority_emergency ? "oui" : "non",
      row.situation ?? "",
      row.support_message ?? "",
      row.admin_notes ?? "",
      row.archived ? "oui" : "non",
    ]
      .map(escapeCsvCell)
      .join(";"),
  );

  return `\uFEFF${[header.map(escapeCsvCell).join(";"), ...lines].join("\n")}`;
}

/**
 * Déclenche le téléchargement du fichier côté navigateur (blob + lien temporaire).
 */
function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Props = {
  /** Jeu de données à exporter (souvent la liste complète incluant les dossiers archivés). */
  rows: MemberRegistrationRow[];
  /** Libellé du bouton (cohérence AGAPE / accessibilité). */
  label?: string;
  /** Variante visuelle : thème sombre (console secrète) ou clair (dashboard). */
  variant?: "dark" | "light";
};

/**
 * Bouton client « Exporter la liste des membres » : génère un CSV séparé par des points-virgules.
 * Ne remplace pas le contrôle d'accès : les données sensibles ne doivent être passées qu'aux pages super-admin.
 */
export function MembersExportCsvButton({
  rows,
  label = "Exporter la liste des membres",
  variant = "light",
}: Props) {
  function exportToCSV() {
    if (rows.length === 0) return;
    const body = buildMembersCsvSemicolon(rows);
    const day = new Date().toISOString().slice(0, 10);
    downloadBlob(`agape-membres-${day}.csv`, body, "text/csv;charset=utf-8;");
  }

  const dark = variant === "dark";

  return (
    <Button
      type="button"
      variant={dark ? "secondary" : "default"}
      size="sm"
      onClick={exportToCSV}
      disabled={rows.length === 0}
      className={
        dark
          ? "rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          : "rounded-xl"
      }
    >
      <Download className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
