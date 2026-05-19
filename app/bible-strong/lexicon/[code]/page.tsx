import { redirect } from "next/navigation";

/** Lexique Strong retiré — redirection vers l’accueil Bible. */
export default function StrongLexiconRedirectPage() {
  redirect("/bible-strong");
}
