import { stripStrongFromBodyText } from "@/lib/bible/strip-strong-text";

type Props = {
  text: string;
  className?: string;
};

/** Texte biblique sans numéros Strong. */
export function BibleVerseBody({ text, className }: Props) {
  return <p className={className}>{stripStrongFromBodyText(text)}</p>;
}
