"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminAssistanceRequestRow } from "@/lib/prayer/types";

/** Échappe une valeur pour inclusion dans un champ CSV entre guillemets. */
function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Construit un export CSV des demandes d'assistance / prières (table `prayer_requests`).
 * Séparateur point-virgule pour Excel FR ; BOM UTF-8 pour détection d'encodage.
 */
function buildAssistanceCsvSemicolon(rows: AdminAssistanceRequestRow[]): string {
  const header = [
    "id",
    "date_creation",
    "expediteur",
    "categorie",
    "type_assistance",
    "statut_assistance",
    "telephone",
    "contact",
    "message",
    "notes_internes",
    "source",
  ];

  const lines = rows.map((row) =>
    [
      row.id,
      row.created_at,
      row.sender_name ?? "",
      row.category ?? "",
      row.assistance_type ?? "",
      row.assistance_status,
      row.phone_contact ?? "",
      row.contact ?? "",
      row.message,
      row.internal_notes ?? "",
      row.source,
    ]
      .map(escapeCsvCell)
      .join(";"),
  );

  return `\uFEFF${[header.map(escapeCsvCell).join(";"), ...lines].join("\n")}`;
}

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Props = {
  rows: AdminAssistanceRequestRow[];
};

/**
 * Télécharge la liste des demandes d'accompagnement affichées sur le tableau AGAPE Assistance.
 * Distinct de l'export des membres inscrits (`members_registration`).
 */
export function AdminAssistanceExportCsvButton({ rows }: Props) {
  function exportToCSV() {
    if (rows.length === 0) return;
    const day = new Date().toISOString().slice(0, 10);
    downloadBlob(`agape-assistance-${day}.csv`, buildAssistanceCsvSemicolon(rows));
  }

  return (
    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={exportToCSV} disabled={rows.length === 0}>
      <Download className="size-4" aria-hidden />
      Exporter les demandes (CSV)
    </Button>
  );
}
