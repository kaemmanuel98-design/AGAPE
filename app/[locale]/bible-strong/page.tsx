import { redirect } from "next/navigation";

/** Ancienne route localisée : tout le contenu biblique est servi sur `/bible-strong` (hub sans préfixe). */
export default function BibleStrongLocaleRedirectPage() {
  redirect("/bible-strong");
}
