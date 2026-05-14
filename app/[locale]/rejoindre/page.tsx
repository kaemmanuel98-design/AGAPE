import { redirect } from "next/navigation";

/**
 * Redirection vers la route unique `/rejoindre` (formulaire et messages sur une seule URL).
 */
export default function RejoindreLocaleAliasPage() {
  redirect("/rejoindre");
}
