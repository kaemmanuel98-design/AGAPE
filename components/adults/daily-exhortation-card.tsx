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
    <section className="space-y-5 rounded-[var(--radius)] border border-primary/15 bg-gradient-to-br from-primary/10 to-card/60 p-8 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Exhortation du jour
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {exhortation.title}
          </h2>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
          <Quote className="size-6" />
        </div>
      </div>

      {exhortation.message ? (
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">{exhortation.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AccessibleAudioPlayer
          audioUrl={exhortation.audio_url}
          ttsText={exhortation.message}
          buttonLabel="Écouter"
          ttsLabel="Écouter l’exhortation"
        />
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="size-4 text-primary" />
          Audio chargé ou synthèse vocale si aucun fichier n&apos;est fourni.
        </span>
      </div>
    </section>
  );
}
