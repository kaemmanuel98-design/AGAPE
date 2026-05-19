import { redirect } from "next/navigation";

/** Ancienne URL → page d'inscription autonome (évite 404 next-intl). */
export default function RejoindreRedirectPage() {
  redirect("/join");
}
