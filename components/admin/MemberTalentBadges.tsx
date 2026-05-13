import { cn } from "@/lib/utils";

/** Clés de talents autorisées côté formulaire d'inscription (alignement avec member-registration). */
const TALENT_META: Record<string, { label: string; dark: string; light: string }> = {
  musique_piano: {
    label: "Musique / Piano",
    dark: "border-sky-500/50 bg-sky-500/15 text-sky-200",
    light: "border-sky-300 bg-sky-50 text-sky-900",
  },
  academie: {
    label: "Académie",
    dark: "border-violet-500/45 bg-violet-500/15 text-violet-100",
    light: "border-violet-300 bg-violet-50 text-violet-900",
  },
  technique_it: {
    label: "Technique / IT",
    dark: "border-emerald-500/45 bg-emerald-500/15 text-emerald-100",
    light: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  organisation: {
    label: "Organisation",
    dark: "border-amber-500/45 bg-amber-500/15 text-amber-100",
    light: "border-amber-300 bg-amber-50 text-amber-900",
  },
  ecoute_benevole: {
    label: "Écoute",
    dark: "border-rose-500/45 bg-rose-500/15 text-rose-100",
    light: "border-rose-300 bg-rose-50 text-rose-900",
  },
};

function parseTalentKeys(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.length > 0);
}

type Props = {
  talents: unknown;
  /** Thème visuel : console sombre vs cartes claires du dashboard secondaire. */
  variant: "dark" | "light";
  className?: string;
};

/**
 * Affiche les talents issus du JSONB `talents` sous forme de badges colorés
 * pour une lecture rapide par l'équipe AGAPE.
 */
export function MemberTalentBadges({ talents, variant, className }: Props) {
  const keys = parseTalentKeys(talents);
  const tone = variant === "dark" ? "dark" : "light";

  if (keys.length === 0) {
    return <span className={cn("text-sm text-muted-foreground", variant === "dark" && "text-zinc-600")}>—</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {keys.map((k) => {
        const meta = TALENT_META[k];
        return (
          <span
            key={k}
            className={cn(
              "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
              meta ? meta[tone] : variant === "dark"
                ? "border-zinc-600 bg-zinc-800 text-zinc-300"
                : "border-slate-200 bg-slate-100 text-slate-700",
            )}
          >
            {meta?.label ?? k}
          </span>
        );
      })}
    </div>
  );
}
