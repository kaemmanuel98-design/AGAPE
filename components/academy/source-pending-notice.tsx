import { getTranslations } from "next-intl/server";

type Props = {
  /** Contexte court pour logs ou accessibilité (optionnel). */
  context?: string;
  /** Namespace i18n pour le libellé (Academy ou Bible). */
  namespace?: "academy" | "bibleStrong";
};

/**
 * Affichage lorsque l’URL est valide mais que la ligne Supabase n’existe pas encore.
 */
export async function SourcePendingNotice({ context, namespace = "academy" }: Props) {
  const t = await getTranslations(namespace);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50/90 px-6 py-12 text-center text-amber-950 shadow-sm">
      <p className="text-lg font-semibold tracking-tight">{t("sourceLoading")}</p>
      {context ? <p className="mt-2 text-xs text-amber-800/70">{context}</p> : null}
      <p className="mt-4 text-sm text-amber-900/85">{t("sourceLoadingHint")}</p>
    </div>
  );
}
