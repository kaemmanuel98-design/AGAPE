import { Quote, Volume2 } from "lucide-react";

import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import type { DailyExhortationRow } from "@/lib/exhortations/types";

export function DailyExhortationCard({
  exhortation,
}: {
  exhortation: DailyExhortationRow | null;
}) {
  if (!exhortation) {
    return null;
  }

  return (
    <section className="agape-brand-surface space-y-5 rounded-[var(--radius)] p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="agape-brand-badge w-fit">
            Exhortation du jour
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
            {exhortation.title}
          </h2>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#F4C95D] shadow">
          <Quote className="size-6" />
        </div>
      </div>

      {exhortation.message ? (
        <p className="max-w-3xl text-base leading-8 text-slate-300">{exhortation.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AccessibleAudioPlayer
          audioUrl={exhortation.audio_url}
          ttsText={exhortation.message}
          buttonLabel="Écouter"
          ttsLabel="Écouter l’exhortation"
        />
        <span className="inline-flex items-center gap-2 text-sm text-slate-300">
          <Volume2 className="size-4 text-[#7CC6FF]" />
          Audio chargé ou synthèse vocale si aucun fichier n&apos;est fourni.
        </span>
      </div>
    </section>
  );
}
